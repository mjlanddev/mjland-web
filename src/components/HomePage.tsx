import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { Movie } from '../types';
import { Hero } from './Hero';
import { MovieRow } from './MovieRow';
import { SEO } from './SeoComponent';
import { StudiosRow } from './StudiosRow';
import { NetworksRow } from './NetworksRow';
import { LatestTrailers } from './LatestTrailers';
import { CategoryCard, CategoryRow } from './CategoryCard';
import { motion } from 'motion/react';
import { TMDB_CONFIG } from '../config/tmdbConfig';
import { LoadingSpinner } from './LoadingSpinner';
import { storageService } from '../services/storageService';
import { recommendationService } from '../services/recommendationService';
import { deduplicateRows } from '../utils/deduplicate';

export const HomePage = () => {
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [onTheAir, setOnTheAir] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [kidsShows, setKidsShows] = useState<Movie[]>([]);
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [comedyMovies, setComedyMovies] = useState<Movie[]>([]);
  const [sciFiMovies, setSciFiMovies] = useState<Movie[]>([]);
  const [documentaries, setDocumentaries] = useState<Movie[]>([]);

  const [genreBackdrops, setGenreBackdrops] = useState<Record<string, string>>({});
  const [languageBackdrops, setLanguageBackdrops] = useState<Record<string, string>>({});

  const [genresList, setGenresList] = useState<any[]>([]);
  const [languagesList, setLanguagesList] = useState<any[]>([]);

  const [continueWatching, setContinueWatching] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContinueWatching = () => {
      setContinueWatching(storageService.getContinueWatching());
    };
    loadContinueWatching();
    window.addEventListener('continueWatchingUpdated', loadContinueWatching);
    return () => window.removeEventListener('continueWatchingUpdated', loadContinueWatching);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          recommendationService.getPersonalizedRecommendations('all'),
          tmdbService.getTrending(),
          tmdbService.getPopularMovies(),
          tmdbService.getPopularTV(),
          tmdbService.getNowPlayingMovies(),
          tmdbService.getOnTheAirTV(),
          tmdbService.getTopRated(),
          tmdbService.getTVByGenre(16, 2),
          tmdbService.getMoviesByGenre(28, 2),
          tmdbService.getMoviesByGenre(35, 2),
          tmdbService.getMoviesByGenre(878, 3),
          tmdbService.getMoviesByGenre(99, 2),
        ]);

        const [
          recommendationData,
          trendingData,
          popularMoviesData,
          popularTVData,
          nowPlayingData,
          onTheAirData,
          topRatedData,
          kidsData,
          actionData,
          comedyData,
          sciFiData,
          docData
        ] = results.map(r => r.status === 'fulfilled' ? r.value : []);

        const [
          dedupedRecs,
          dedupedTrending,
          dedupedPopularMovies,
          dedupedPopularTV,
          dedupedNowPlaying,
          dedupedOnTheAir,
          dedupedTopRated,
          dedupedKids,
          dedupedAction,
          dedupedComedy,
          dedupedSciFi,
          dedupedDoc
        ] = deduplicateRows([
          recommendationData,
          trendingData,
          popularMoviesData,
          popularTVData,
          nowPlayingData,
          onTheAirData,
          topRatedData,
          kidsData,
          actionData,
          comedyData,
          sciFiData,
          docData
        ]);

        setRecommendations(dedupedRecs);
        setTrending(dedupedTrending);
        setPopularMovies(dedupedPopularMovies);
        setPopularTV(dedupedPopularTV);
        setNowPlaying(dedupedNowPlaying);
        setOnTheAir(dedupedOnTheAir);
        setTopRated(dedupedTopRated);
        setKidsShows(dedupedKids);
        setActionMovies(dedupedAction);
        setComedyMovies(dedupedComedy);
        setSciFiMovies(dedupedSciFi);
        setDocumentaries(dedupedDoc);

        const apiGenres = await tmdbService.getGenres('movie').catch(() => []);
        const genres = apiGenres.slice(0, 10);
        setGenresList(genres);
        const genreResultsRaw = await Promise.allSettled(genres.map((g: any) => tmdbService.getMoviesByGenre(g.id)));
        const genreResults = genreResultsRaw.map(r => r.status === 'fulfilled' ? r.value : []);
        const genreMap: Record<string, string> = {};
        const usedMovieIds = new Set<number>();

        genres.forEach((g: any, i: number) => {
          const movies = genreResults[i];
          const uniqueMovie = movies.find((m: any) => !usedMovieIds.has(m.id)) || movies[0];
          if (uniqueMovie) {
            usedMovieIds.add(uniqueMovie.id);
            genreMap[g.name] = getImageUrl(uniqueMovie.backdrop_path || uniqueMovie.poster_path, 'w500');
          }
        });
        setGenreBackdrops(genreMap);

        const allLangs = await tmdbService.getLanguages();
        const languages = TMDB_CONFIG.POPULAR_LANGUAGE_CODES
          .map(code => allLangs.find((l: any) => l.iso_639_1 === code))
          .filter(Boolean);
        setLanguagesList(languages);

        const langResults = await Promise.all(languages.map((l: any) => tmdbService.getMoviesByLanguage(l.iso_639_1)));
        const langMap: Record<string, string> = {};
        languages.forEach((l: any, i: number) => {
          langMap[l.english_name] = getImageUrl(langResults[i][0]?.backdrop_path || langResults[i][0]?.poster_path, 'w500');
        });
        setLanguageBackdrops(langMap);

      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const navigate = useNavigate();

  const fetchTrendingPage = useCallback((page: number) => tmdbService.getTrending('all', page), []);
  const fetchPopularMoviesPage = useCallback((page: number) => tmdbService.getPopularMovies(page), []);
  const fetchKidsShowsPage = useCallback((page: number) => tmdbService.getTVByGenre(16, page + 1), []);
  const fetchSciFiMoviesPage = useCallback((page: number) => tmdbService.getMoviesByGenre(878, page + 1), []);
  const fetchActionMoviesPage = useCallback((page: number) => tmdbService.getMoviesByGenre(28, page + 1), []);
  const fetchComedyMoviesPage = useCallback((page: number) => tmdbService.getMoviesByGenre(35, page + 1), []);
  const fetchDocumentariesPage = useCallback((page: number) => tmdbService.getMoviesByGenre(99, page), []);
  const fetchPopularTVPage = useCallback((page: number) => tmdbService.getPopularTV(page), []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <SEO 
        title="Discover Movies & TV Shows" 
        description="Explore thousands of movies and TV shows in HD."
      />
      <Hero movies={trending} />
      
      <div className="relative mt-8 md:mt-14 z-10 pb-28 space-y-8 md:space-y-10">
        {continueWatching.length > 0 && (
          <MovieRow
            title="Continue Watching"
            movies={continueWatching}
            isLandscape={true}
          />
        )}

        {recommendations.length > 0 && (
          <MovieRow
            title="Recommended for You"
            movies={recommendations}
            isLandscape={false}
          />
        )}

        <MovieRow
          title="Trending Now"
          movies={trending.slice(1)}
          fetchNextPage={fetchTrendingPage}
        />

        <LatestTrailers />

        <MovieRow
          title="Popular Movies"
          movies={popularMovies}
          fetchNextPage={fetchPopularMoviesPage}
        />

        <CategoryRow title="Popular Languages" onTitleClick={() => navigate('/languages')}>
          {languagesList.map(lang => (
            <CategoryCard
              key={lang.iso_639_1}
              title={lang.english_name}
              subtitle={lang.name}
              image={languageBackdrops[lang.english_name]}
              onClick={() => navigate(`/language/${lang.iso_639_1}`)}
            />
          ))}
        </CategoryRow>

        <MovieRow
          title="Kids & Animation"
          movies={kidsShows}
          fetchNextPage={fetchKidsShowsPage}
        />

        <StudiosRow />

        <NetworksRow />

        <MovieRow
          title="Sci-Fi Movies"
          movies={sciFiMovies}
          fetchNextPage={fetchSciFiMoviesPage}
        />

        <MovieRow
          title="Action Movies"
          movies={actionMovies}
          fetchNextPage={fetchActionMoviesPage}
        />

        <MovieRow
          title="Comedy"
          movies={comedyMovies}
          fetchNextPage={fetchComedyMoviesPage}
        />

        <CategoryRow title="Popular Genres" onTitleClick={() => navigate('/genres')}>
          {genresList.map(genre => (
            <CategoryCard
              key={genre.id}
              title={genre.name}
              image={genreBackdrops[genre.name]}
              onClick={() => navigate(`/genre/${genre.id}`)}
            />
          ))}
        </CategoryRow>

        <MovieRow
          title="Documentaries"
          movies={documentaries}
          fetchNextPage={fetchDocumentariesPage}
        />

        <MovieRow
          title="Popular TV Shows"
          movies={popularTV}
          fetchNextPage={fetchPopularTVPage}
        />
      </div>
    </div>
  );
};
