import axios from 'axios';
import { Movie } from '../types';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const tmdb = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    include_adult: false,
  },
});

const apiCache = new Map<string, { data: any; timestamp: number }>();
const pendingRequests = new Map<string, Promise<any>>();
const CACHE_TTL = 10 * 60 * 1000; 

const cachedGet = async (url: string, params: Record<string, any> = {}, ttl = CACHE_TTL) => {
  const cacheKey = `${url}?${JSON.stringify(params)}`;
  const now = Date.now();

  const cached = apiCache.get(cacheKey);
  if (cached && now - cached.timestamp < ttl) {
    return cached.data;
  }

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const promise = tmdb.get(url, { params })
    .then(res => {
      apiCache.set(cacheKey, { data: res.data, timestamp: Date.now() });
      pendingRequests.delete(cacheKey);
      return res.data;
    })
    .catch(err => {
      pendingRequests.delete(cacheKey);
      throw err;
    });

  pendingRequests.set(cacheKey, promise);
  return promise;
};

export const getImageUrl = (path: string, size: 'w500' | 'original' | 'w780' | 'w1280' = 'w500') => {
  if (!path) return '';
  const tmdbUrl = `${IMAGE_BASE_URL}/${size}${path}`;
  return `https://wsrv.nl/?url=${encodeURIComponent(tmdbUrl)}&output=webp&q=80`;
};

const filterUnreleased = (results: any[]) => {
  if (!Array.isArray(results)) return [];
  const now = new Date();
  return results.filter(item => {
    const dateStr = item.release_date || item.first_air_date;
    if (!dateStr) return false;
    const releaseDate = new Date(dateStr);
    return releaseDate <= now;
  });
};

export const tmdbService = {
  getTrending: async (type: 'all' | 'movie' | 'tv' = 'all', page = 1) => {
    const data = await cachedGet(`/trending/${type}/day`, { page });
    return filterUnreleased(data.results);
  },
  getPopularMovies: async (page = 1) => {
    const data = await cachedGet('/movie/popular', { page });
    return filterUnreleased(data.results);
  },
  getPopularTV: async (page = 1) => {
    const data = await cachedGet('/discover/tv', { 
      page,
      sort_by: 'popularity.desc',
      without_genres: '10763,10767', 
      'vote_count.gte': 100 
    });
    return filterUnreleased(data.results);
  },
  getNowPlayingMovies: async (page = 1) => {
    const data = await cachedGet('/movie/now_playing', { page });
    return filterUnreleased(data.results);
  },
  getOnTheAirTV: async (page = 1) => {
    const data = await cachedGet('/discover/tv', {
      page,
      sort_by: 'popularity.desc',
      without_genres: '10763,10767', 
      'vote_count.gte': 100
    });
    return filterUnreleased(data.results);
  },
  getTopRated: async (page = 1) => {
    const data = await cachedGet('/movie/top_rated', { page });
    return filterUnreleased(data.results);
  },
  getTopRatedTV: async (page = 1) => {
    const data = await cachedGet('/tv/top_rated', { page });
    return filterUnreleased(data.results);
  },
  getMovieRecommendations: async (id: number, page = 1) => {
    const data = await cachedGet(`/movie/${id}/recommendations`, { page });
    return filterUnreleased(data.results);
  },
  getTVRecommendations: async (id: number, page = 1) => {
    const data = await cachedGet(`/tv/${id}/recommendations`, { page });
    return filterUnreleased(data.results);
  },
  getMovieDetails: async (id: number) => {
    const data = await cachedGet(`/movie/${id}`, {
      append_to_response: 'videos,credits,similar,images,release_dates'
    });
    if (data.similar) {
      data.similar.results = filterUnreleased(data.similar.results);
    }
    return data;
  },
  getTVDetails: async (id: number) => {
    const data = await cachedGet(`/tv/${id}`, {
      append_to_response: 'videos,credits,similar,images,content_ratings'
    });
    if (data.similar) {
      data.similar.results = filterUnreleased(data.similar.results);
    }
    return data;
  },
  getTVSeasonDetails: async (tvId: number, seasonNumber: number) => {
    const data = await cachedGet(`/tv/${tvId}/season/${seasonNumber}`, {});
    const now = new Date();
    if (data?.episodes) {
      data.episodes = data.episodes.filter((ep: any) => {
        if (!ep.air_date) return false;
        return new Date(ep.air_date) <= now;
      });
    }
    return data;
  },
  getStudioDetails: async (id: number) => {
    return cachedGet(`/company/${id}`, {});
  },
  getMoviesByStudio: async (studioId: number, genreId?: number, page = 1): Promise<Movie[]> => {
    const data = await cachedGet('/discover/movie', {
      with_companies: studioId,
      with_genres: genreId,
      page,
      sort_by: 'popularity.desc',
      'vote_count.gte': 100
    });
    return filterUnreleased(data.results);
  },
  getTVByStudio: async (studioId: number, genreId?: number, page = 1): Promise<Movie[]> => {
    const data = await cachedGet('/discover/tv', {
      with_companies: studioId,
      with_genres: genreId,
      page,
      sort_by: 'popularity.desc',
      'vote_count.gte': 100
    });
    return filterUnreleased(data.results);
  },
  search: async (query: string, page = 1) => {
    const data = await cachedGet('/search/multi', { query, page }, 2 * 60 * 1000);
    return filterUnreleased(data.results);
  },
  deepSearch: async (query: string, maxPages = 3) => {
    const pagesToFetch = Array.from({ length: maxPages }, (_, i) => i + 1);
    const results = await Promise.all(
      pagesToFetch.map(page => 
        cachedGet('/search/multi', { query, page }, 2 * 60 * 1000)
          .then(res => filterUnreleased(res.results))
          .catch(() => [])
      )
    );
    const allResults = results.flat();
    const uniqueIds = new Set();
    return allResults.filter((item: any) => {
      if (!uniqueIds.has(item.id)) {
        uniqueIds.add(item.id);
        return true;
      }
      return false;
    });
  },
  getGenres: async (type: 'movie' | 'tv' = 'movie') => {
    const data = await cachedGet(`/genre/${type}/list`, {}, 60 * 60 * 1000);
    return data.genres;
  },
  getMoviesByGenre: async (genreId: number, page = 1) => {
    const data = await cachedGet('/discover/movie', { 
      with_genres: genreId, 
      page,
      sort_by: 'popularity.desc',
      'vote_count.gte': 100
    });
    return filterUnreleased(data.results);
  },
  getTVByGenre: async (genreId: number, page = 1) => {
    const data = await cachedGet('/discover/tv', { 
      with_genres: genreId, 
      page,
      sort_by: 'popularity.desc',
      'vote_count.gte': 100
    });
    return filterUnreleased(data.results);
  },
  getMoviesByLanguage: async (languageCode: string, genreId?: number, page = 1) => {
    const data = await cachedGet('/discover/movie', { 
      with_original_language: languageCode, 
      with_genres: genreId,
      page, 
      sort_by: 'popularity.desc',
      'vote_count.gte': 100
    });
    return filterUnreleased(data.results);
  },
  getTVByLanguage: async (languageCode: string, genreId?: number, page = 1) => {
    const data = await cachedGet('/discover/tv', { 
      with_original_language: languageCode, 
      with_genres: genreId,
      page, 
      sort_by: 'popularity.desc',
      'vote_count.gte': 100
    });
    return filterUnreleased(data.results);
  },
  getMoviesByNetwork: async (networkId: number, genreId?: number, page = 1) => {
    const data = await cachedGet('/discover/movie', { 
      with_networks: networkId, 
      with_genres: genreId, 
      page,
      sort_by: 'popularity.desc',
      'vote_count.gte': 100
    });
    return filterUnreleased(data.results);
  },
  getTVByNetwork: async (networkId: number, genreId?: number, page = 1) => {
    const data = await cachedGet('/discover/tv', { 
      with_networks: networkId, 
      with_genres: genreId, 
      page,
      sort_by: 'popularity.desc',
      'vote_count.gte': 100
    });
    return filterUnreleased(data.results);
  },
  getNetworkDetails: async (id: number) => {
    return cachedGet(`/network/${id}`, {});
  },
  getLanguages: async () => {
    return cachedGet('/configuration/languages', {}, 24 * 60 * 60 * 1000);
  },
  getPersonDetails: async (id: number) => {
    return cachedGet(`/person/${id}`, {
      append_to_response: 'combined_credits,images'
    });
  }
};
