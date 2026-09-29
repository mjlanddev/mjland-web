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
  const [horrorMovies, setHorrorMovies] = useState<Movie[]>([]);
  const [thrillerMovies, setThrillerMovies] = useState<Movie[]>([]);
  const [romanceMovies, setRomanceMovies] = useState<Movie[]>([]);
  const [crimeMovies, setCrimeMovies] = useState<Movie[]>([]);
  const [fantasyMovies, setFantasyMovies] = useState<Movie[]>([]);
  const [animeShows, setAnimeShows] = useState<Movie[]>([]);

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
          tmdbService.getMoviesByGenre(27, 2),
          tmdbService.getMoviesByGenre(53, 2),
          tmdbService.getMoviesByGenre(10749, 2),
          tmdbService.getMoviesByGenre(80, 2),
          tmdbService.getMoviesByGenre(14, 2),
          tmdbService.getMoviesByLanguage('ja', 16, 2),
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
          docData,
          horrorData,
          thrillerData,
          romanceData,
          crimeData,
          fantasyData,
          animeData
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
          dedupedDoc,
          dedupedHorror,
          dedupedThriller,
          dedupedRomance,
          dedupedCrime,
          dedupedFantasy,
          dedupedAnime
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
          docData,
          horrorData,
          thrillerData,
          romanceData,
          crimeData,
          fantasyData,
          animeData
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
        setHorrorMovies(dedupedHorror);
        setThrillerMovies(dedupedThriller);
        setRomanceMovies(dedupedRomance);
        setCrimeMovies(dedupedCrime);
        setFantasyMovies(dedupedFantasy);
        setAnimeShows(dedupedAnime);

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
  const fetchNowPlayingPage = useCallback((page: number) => tmdbService.getNowPlayingMovies(page), []);
  const fetchTopRatedPage = useCallback((page: number) => tmdbService.getTopRated(page), []);
  const fetchOnTheAirPage = useCallback((page: number) => tmdbService.getOnTheAirTV(page), []);
  const fetchKidsShowsPage = useCallback((page: number) => tmdbService.getTVByGenre(16, page + 1), []);
  const fetchSciFiMoviesPage = useCallback((page: number) => tmdbService.getMoviesByGenre(878, page + 1), []);
  const fetchActionMoviesPage = useCallback((page: number) => tmdbService.getMoviesByGenre(28, page + 1), []);
  const fetchComedyMoviesPage = useCallback((page: number) => tmdbService.getMoviesByGenre(35, page + 1), []);
  const fetchDocumentariesPage = useCallback((page: number) => tmdbService.getMoviesByGenre(99, page), []);
  const fetchHorrorMoviesPage = useCallback((page: number) => tmdbService.getMoviesByGenre(27, page + 1), []);
  const fetchThrillerMoviesPage = useCallback((page: number) => tmdbService.getMoviesByGenre(53, page + 1), []);
  const fetchRomanceMoviesPage = useCallback((page: number) => tmdbService.getMoviesByGenre(10749, page + 1), []);
  const fetchCrimeMoviesPage = useCallback((page: number) => tmdbService.getMoviesByGenre(80, page + 1), []);
  const fetchFantasyMoviesPage = useCallback((page: number) => tmdbService.getMoviesByGenre(14, page + 1), []);
  const fetchAnimePage = useCallback((page: number) => tmdbService.getMoviesByLanguage('ja', 16, page + 1), []);
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

      <div className="relative mt-4 md:mt-8 z-10 pb-20 space-y-3.5 md:space-y-5">
        {continueWatching.length > 0 && (
          <MovieRow
            title="Continue Watching"
            movies={continueWatching}
            isLandscape={true}
          />
        )}

        <MovieRow
          title="Trending Now"
          movies={trending.slice(1)}
          fetchNextPage={fetchTrendingPage}
        />

        {recommendations.length > 0 && (
          <MovieRow
            title="Recommended for You"
            movies={recommendations}
          />
        )}

        <LatestTrailers />

        {nowPlaying.length > 0 && (
          <MovieRow
            title="Now in Theaters & Fresh Releases"
            movies={nowPlaying}
            fetchNextPage={fetchNowPlayingPage}
          />
        )}

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

        {thrillerMovies.length > 0 && (
          <MovieRow
            title="Edge-of-Your-Seat Thrillers"
            movies={thrillerMovies}
            fetchNextPage={fetchThrillerMoviesPage}
          />
        )}

        {topRated.length > 0 && (
          <MovieRow
            title="Critically Acclaimed Masterpieces"
            movies={topRated}
            fetchNextPage={fetchTopRatedPage}
          />
        )}

        <MovieRow
          title="Comedy"
          movies={comedyMovies}
          fetchNextPage={fetchComedyMoviesPage}
        />

        {horrorMovies.length > 0 && (
          <MovieRow
            title="Chilling Horror"
            movies={horrorMovies}
            fetchNextPage={fetchHorrorMoviesPage}
          />
        )}

        {animeShows.length > 0 && (
          <MovieRow
            title="Anime & Japanese Hits"
            movies={animeShows}
            fetchNextPage={fetchAnimePage}
          />
        )}

        {crimeMovies.length > 0 && (
          <MovieRow
            title="Crime, Mob & Heists"
            movies={crimeMovies}
            fetchNextPage={fetchCrimeMoviesPage}
          />
        )}

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

        {romanceMovies.length > 0 && (
          <MovieRow
            title="Romantic Favorites & Drama"
            movies={romanceMovies}
            fetchNextPage={fetchRomanceMoviesPage}
          />
        )}

        {fantasyMovies.length > 0 && (
          <MovieRow
            title="Epic Fantasy & Myths"
            movies={fantasyMovies}
            fetchNextPage={fetchFantasyMoviesPage}
          />
        )}

        <MovieRow
          title="Documentaries"
          movies={documentaries}
          fetchNextPage={fetchDocumentariesPage}
        />

        {onTheAir.length > 0 && (
          <MovieRow
            title="Currently Airing TV Hits"
            movies={onTheAir}
            fetchNextPage={fetchOnTheAirPage}
          />
        )}

        <MovieRow
          title="Popular TV Shows"
          movies={popularTV}
          fetchNextPage={fetchPopularTVPage}
        />
      </div>
    </div>
  );
};
