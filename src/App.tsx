import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { tmdbService, getImageUrl } from './services/tmdbService';
import { Movie } from './types';
import { Sidebar } from './components/Sidebar';
import { Hero } from './components/Hero';
import { MovieRow } from './components/MovieRow';
import { StudiosRow } from './components/StudiosRow';
import { NetworksRow } from './components/NetworksRow';
import { SearchPage } from './components/SearchPage';
import { MovieDetails } from './components/MovieDetails';
import { StudioDetails } from './components/StudioDetails';
import { NetworkDetails } from './components/NetworkDetails';
import { LanguageDetails } from './components/LanguageDetails';
import { GenreDetails } from './components/GenreDetails';
import { PersonDetails } from './components/PersonDetails';
import { ProfilePage } from './components/ProfilePage';
import { MoviesPage } from './components/MoviesPage';
import { TVPage } from './components/TVPage';
import { GenresPage } from './components/GenresPage';
import { LanguagesPage } from './components/LanguagesPage';
import { RandomPage } from './components/RandomPage';
import { LatestTrailers } from './components/LatestTrailers';
import { WatchPage } from './components/WatchPage';
import { motion } from 'motion/react';
import { TMDB_CONFIG } from './config/tmdbConfig';

import { CategoryCard, CategoryRow } from './components/CategoryCard';
import { MobileNav } from './components/MobileNav';
import { storageService } from './services/storageService';
import { recommendationService } from './services/recommendationService';
import { deduplicateRows } from './utils/deduplicate';

import { FadeSection } from './components/FadeSection';
import { Footer } from './components/Footer';
import { GithubPopup } from './components/GithubPopup';
import { DisclaimerPage, TermsPage, PrivacyPage, CookiePolicyPage } from './components/LegalPages';

import { LoadingSpinner } from './components/LoadingSpinner';
import { SplashScreen } from './components/SplashScreen';

const HomePage = () => {
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
          tmdbService.getMoviesByGenre(99, 2), 
        ]);

        const [
          recommendationsData,
          trendingData,
          popularMoviesData,
          popularTVData,
          nowPlayingData,
          onTheAirData,
          topRatedData,
          kidsData,
          actionData,
          comedyData,
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
          dedupedDoc
        ] = deduplicateRows([
          recommendationsData,
          trendingData,
          popularMoviesData,
          popularTVData,
          nowPlayingData,
          onTheAirData,
          topRatedData,
          kidsData,
          actionData,
          comedyData,
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
        setDocumentaries(dedupedDoc);

        const [movieGenres, tvGenres] = await Promise.all([
          tmdbService.getGenres('movie'),
          tmdbService.getGenres('tv')
        ]);
        
        const allGenresMap = new Map();
        [...movieGenres, ...tvGenres].forEach(g => {
          if (!allGenresMap.has(g.id)) {
            allGenresMap.set(g.id, g);
          }
        });
        const genres = Array.from(allGenresMap.values()).slice(0, 10);
        setGenresList(genres);

        const genreResults = await Promise.all(genres.map((g: any) => 
          tmdbService.getMoviesByGenre(g.id).catch(() => tmdbService.getTVByGenre(g.id).catch(() => []))
        ));

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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Hero movies={trending} />

      <div className="relative mt-0 md:mt-4 z-10 pb-20 space-y-6 md:space-y-8">
        {continueWatching.length > 0 && (
          <FadeSection>
            <MovieRow
              title="Continue Watching"
              movies={continueWatching}
              isLandscape={true}
            />
          </FadeSection>
        )}

        {recommendations.length > 0 && (
          <FadeSection>
            <MovieRow
              title="Recommended for You"
              movies={recommendations}
              isLandscape={false}
            />
          </FadeSection>
        )}

        <FadeSection>
          <MovieRow
            title="Trending Now"
            movies={trending.slice(1)}
            fetchNextPage={(page) => tmdbService.getTrending('all', page)}
          />
        </FadeSection>

        <FadeSection>
          <LatestTrailers />
        </FadeSection>

        <FadeSection>
          <MovieRow
            title="Popular Movies"
            movies={popularMovies}
            fetchNextPage={(page) => tmdbService.getPopularMovies(page)}
          />
        </FadeSection>

        <FadeSection>
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
        </FadeSection>

        <FadeSection>
          <MovieRow
            title="Kids & Animation"
            movies={kidsShows}
            fetchNextPage={(page) => tmdbService.getTVByGenre(16, page + 1)}
          />
        </FadeSection>

        <FadeSection>
          <StudiosRow />
        </FadeSection>

        <FadeSection>
          <NetworksRow />
        </FadeSection>

        <FadeSection>
          <MovieRow
            title="Action Movies"
            movies={actionMovies}
            fetchNextPage={(page) => tmdbService.getMoviesByGenre(28, page + 1)}
          />
        </FadeSection>

        <FadeSection>
          <MovieRow
            title="Comedy"
            movies={comedyMovies}
            fetchNextPage={(page) => tmdbService.getMoviesByGenre(35, page + 1)}
          />
        </FadeSection>

        <FadeSection>
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
        </FadeSection>

        <FadeSection>
          <MovieRow
            title="Documentaries"
            movies={documentaries}
            fetchNextPage={(page) => tmdbService.getMoviesByGenre(99, page)}
          />
        </FadeSection>

        <FadeSection>
          <MovieRow
            title="Popular TV Shows"
            movies={popularTV}
            fetchNextPage={(page) => tmdbService.getPopularTV(page)}
          />
        </FadeSection>
      </div>
    </motion.div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

export default function App() {
  const location = useLocation();
  const isWatchPage = location.pathname.startsWith('/watch/');
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <div className={`min-h-screen bg-bg text-white selection:bg-accent/30 flex justify-center ${isWatchPage ? '' : 'pb-28 md:pb-0'}`}>
        <ScrollToTop />
        <div className="max-w-[2000px] w-full flex relative">
          {!isWatchPage && <Sidebar />}

          <main className={isWatchPage ? 'w-full h-screen' : 'flex-1 w-full overflow-x-clip min-w-0'}>
            <Routes>
              <Route path="/" element={<HomePage />} />
            <Route path="/movie" element={<MoviesPage />} />
            <Route path="/tv" element={<TVPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/watch/:type/:id" element={<WatchPage />} />
            <Route path="/watch/:type/:id/:season/:episode" element={<WatchPage />} />
            <Route path="/:type/:id" element={<MovieDetails />} />
            <Route path="/studio/:id" element={<StudioDetails />} />
            <Route path="/network/:id" element={<NetworkDetails />} />
            <Route path="/language/:code" element={<LanguageDetails />} />
            <Route path="/languages" element={<LanguagesPage />} />
            <Route path="/genre/:id" element={<GenreDetails />} />
            <Route path="/genres" element={<GenresPage />} />
            <Route path="/person/:id" element={<PersonDetails />} />
            <Route path="/random" element={<RandomPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
          </Routes>
          {!isWatchPage && <Footer />}
          <GithubPopup />
        </main>
      </div>

      {!isWatchPage && <MobileNav />}
    </div>
    </>
  );
}
