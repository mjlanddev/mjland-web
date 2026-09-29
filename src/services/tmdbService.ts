import axios from 'axios';
import { Movie } from '../types';
import { THEME_DEFINITIONS, findThemeMatch } from '../config/tmdbConfig';

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
const enBackdropCache = new Map<string, string | null>();
const enLandscapeCache = new Map<string, { backdrop: string | null; logo: string | null }>();
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
      append_to_response: 'videos,credits,similar,images,release_dates,keywords'
    });
    if (data.similar) {
      data.similar.results = filterUnreleased(data.similar.results);
    }
    return data;
  },
  getTVDetails: async (id: number) => {
    const data = await cachedGet(`/tv/${id}`, {
      append_to_response: 'videos,credits,similar,images,content_ratings,keywords'
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
  getThemeContent: async (themeIdOrQuery: string, page = 1): Promise<Movie[]> => {
    const theme = findThemeMatch(themeIdOrQuery);
    if (!theme) return [];

    const moviePage1 = (page - 1) * 2 + 1;
    const moviePage2 = (page - 1) * 2 + 2;
    const tvPage1 = (page - 1) * 2 + 1;
    const tvPage2 = (page - 1) * 2 + 2;

    const [movieP1, movieP2, tvP1, tvP2] = await Promise.allSettled([
      cachedGet('/discover/movie', {
        sort_by: 'popularity.desc',
        'vote_count.gte': 40,
        page: moviePage1,
        ...theme.movieParams
      }),
      cachedGet('/discover/movie', {
        sort_by: 'popularity.desc',
        'vote_count.gte': 40,
        page: moviePage2,
        ...theme.movieParams
      }),
      cachedGet('/discover/tv', {
        sort_by: 'popularity.desc',
        'vote_count.gte': 30,
        page: tvPage1,
        ...theme.tvParams
      }),
      cachedGet('/discover/tv', {
        sort_by: 'popularity.desc',
        'vote_count.gte': 30,
        page: tvPage2,
        ...theme.tvParams
      })
    ]);

    const moviesRaw = [
      ...(movieP1.status === 'fulfilled' ? movieP1.value.results || [] : []),
      ...(movieP2.status === 'fulfilled' ? movieP2.value.results || [] : [])
    ];
    const tvRaw = [
      ...(tvP1.status === 'fulfilled' ? tvP1.value.results || [] : []),
      ...(tvP2.status === 'fulfilled' ? tvP2.value.results || [] : [])
    ];

    const movies = filterUnreleased(moviesRaw).map((m: any) => ({ ...m, media_type: 'movie' as const }));
    const tvs = filterUnreleased(tvRaw).map((t: any) => ({ ...t, media_type: 'tv' as const }));

    const combined = [...movies, ...tvs]
      .filter((item: any) => item.poster_path && (item.vote_count || 0) >= 10)
      .sort((a: any, b: any) => {
        const scoreA = Math.log10(Math.max(1, a.popularity || 0)) * 2500 + Math.log10(Math.max(1, a.vote_count || 0)) * 3500 + (a.vote_average || 0) * 500;
        const scoreB = Math.log10(Math.max(1, b.popularity || 0)) * 2500 + Math.log10(Math.max(1, b.vote_count || 0)) * 3500 + (b.vote_average || 0) * 500;
        return scoreB - scoreA;
      });

    const unique = new Map<string, Movie>();
    combined.forEach((item: any) => {
      const key = `${item.media_type || (item.title ? 'movie' : 'tv')}-${item.id}`;
      if (!unique.has(key)) {
        unique.set(key, item);
      }
    });
    return Array.from(unique.values());
  },
  deepSearch: async (query: string, page = 1): Promise<Movie[]> => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const themeMatch = findThemeMatch(trimmed);
    if (themeMatch) {
      const themeResults = await tmdbService.getThemeContent(themeMatch.id, page);
      if (themeResults.length > 0) return themeResults;
    }

    const startPage = (page - 1) * 2 + 1;
    const pagesToFetch = [startPage, startPage + 1];
    const results = await Promise.all(
      pagesToFetch.map(p =>
        cachedGet('/search/multi', { query: trimmed, page: p }, 2 * 60 * 1000)
          .then(res => filterUnreleased(res.results || []))
          .catch(() => [])
      )
    );

    const allRaw = results.flat();
    const mediaItems: (Movie & { isPersonCredit?: boolean })[] = [];
    const seenIds = new Set<string>();

    for (const item of allRaw) {
      if (!item) continue;

      if (item.media_type === 'person') {
        if (Array.isArray(item.known_for)) {
          for (const credit of item.known_for) {
            if (credit && credit.poster_path) {
              const key = `${credit.media_type || (credit.title ? 'movie' : 'tv')}-${credit.id}`;
              if (!seenIds.has(key)) {
                seenIds.add(key);
                mediaItems.push({ ...credit, isPersonCredit: true });
              }
            }
          }
        }
        continue;
      }

      if (!item.poster_path) continue;

      const key = `${item.media_type || (item.title ? 'movie' : 'tv')}-${item.id}`;
      if (!seenIds.has(key)) {
        seenIds.add(key);
        mediaItems.push(item);
      }
    }

    const normalize = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const normQuery = normalize(trimmed);
    const queryWords = normQuery.split(' ').filter(w => w.length > 1);

    const scored = mediaItems.map(item => {
      const title = normalize(item.title || item.name || '');
      const origTitle = normalize(item.original_title || item.original_name || '');
      const votes = item.vote_count || 0;
      const pop = item.popularity || 0;
      const rating = item.vote_average || 0;

      let score = 0;
      const isExact = title === normQuery || origTitle === normQuery;
      const isStart = title.startsWith(normQuery) || origTitle.startsWith(normQuery);
      const isWordMatch = new RegExp(`(^|\\s)${normQuery}(\\s|$)`, 'i').test(title) || new RegExp(`(^|\\s)${normQuery}(\\s|$)`, 'i').test(origTitle);
      const isSubstring = title.includes(normQuery) || origTitle.includes(normQuery);

      const titleWords = title.split(' ');
      const matchingWords = queryWords.filter(w => titleWords.includes(w));
      const allWordsMatch = queryWords.length > 1 && matchingWords.length === queryWords.length;

      if (item.isPersonCredit) {
        score += 20000;
      } else if (isExact) {
        if (votes >= 500) score += 40000;
        else if (votes >= 50) score += 25000;
        else if (votes >= 5) score += 12000;
        else score += 3000;
      } else if (isStart) {
        score += 18000;
      } else if (isWordMatch) {
        score += 12000;
      } else if (allWordsMatch) {
        score += 15000;
      } else if (isSubstring) {
        score += 6000;
      } else if (matchingWords.length > 0) {
        score += 3000 * (matchingWords.length / queryWords.length);
      } else if (item.overview && normalize(item.overview).includes(normQuery)) {
        if (votes >= 100 && pop >= 10) {
          score += 500;
        } else {
          return { item, score: -99999 };
        }
      } else {
        return { item, score: -99999 };
      }

      if (votes >= 10000) score += 25000;
      else if (votes >= 5000) score += 18000;
      else if (votes >= 1000) score += 12000;
      else if (votes >= 300) score += 6000;
      else if (votes >= 50) score += 2500;

      score += Math.log10(pop + 1) * 2500;
      score += Math.log10(votes + 1) * 3500;

      if (votes >= 100) {
        if (rating >= 7.5) score += (rating - 7) * 2000;
        else if (rating < 5.0) score -= (5 - rating) * 2000;
      }

      if (votes === 0) {
        if (isExact && pop >= 5) score -= 15000;
        else return { item, score: -99999 };
      } else if (votes < 5 && !isExact && !item.isPersonCredit) {
        return { item, score: -99999 };
      } else if (votes < 20 && !isStart && !isWordMatch && !item.isPersonCredit) {
        score -= 10000;
      }

      return { item, score };
    });

    return scored
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item as Movie);
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
  },
  getMovieImages: async (id: number, type: 'movie' | 'tv' = 'movie') => {
    return cachedGet(`/${type}/${id}/images`, { include_image_language: 'en,null' }, 24 * 60 * 60 * 1000);
  },
  getEnglishLandscapeAssets: async (id: number, type: 'movie' | 'tv' = 'movie'): Promise<{ backdrop: string | null; logo: string | null }> => {
    const cacheKey = `${type}_${id}`;
    if (enLandscapeCache.has(cacheKey)) {
      return enLandscapeCache.get(cacheKey)!;
    }
    try {
      const data = await tmdbService.getMovieImages(id, type);
      const enBackdrop = data?.backdrops?.find((b: any) => b.iso_639_1 === 'en')?.file_path || null;

      const enLogo = data?.logos?.find((l: any) => l.iso_639_1 === 'en')?.file_path || data?.logos?.[0]?.file_path || null;
      const result = { backdrop: enBackdrop, logo: enLogo };
      enLandscapeCache.set(cacheKey, result);
      return result;
    } catch {
      const fallback = { backdrop: null, logo: null };
      enLandscapeCache.set(cacheKey, fallback);
      return fallback;
    }
  },
  getEnglishBackdrop: async (id: number, type: 'movie' | 'tv' = 'movie'): Promise<string | null> => {
    const assets = await tmdbService.getEnglishLandscapeAssets(id, type);
    return assets.backdrop;
  }
};
