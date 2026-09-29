import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { Movie } from '../types';
import { MovieCard } from './MovieRow';
import { SEO } from './SeoComponent';
import { LoadingSpinner } from './LoadingSpinner';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft01Icon as ChevronLeftRegular } from 'hugeicons-react';
import { TMDB_CONFIG } from '../config/tmdbConfig';

import { LazyImage } from './LazyImage';
import { storageService } from '../services/storageService';

export const GenreDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [backdrop, setBackdrop] = useState('');
  const [landscapeSetting, setLandscapeSetting] = useState(() => storageService.isLandscapePosterEnabled());
  const [genreName, setGenreName] = useState('');
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');
  const [moviePage, setMoviePage] = useState(1);
  const [tvPage, setTvPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(async () => {
    if (!id || loadingMore) return;
    setLoadingMore(true);
    try {
      if (activeTab === 'movies') {
        const next = moviePage + 1;
        const newMovies = await tmdbService.getMoviesByGenre(parseInt(id), next);
        setMovies(prev => {
          const seen = new Set(prev.map(p => p.id));
          const added = newMovies.filter(m => !seen.has(m.id));
          return [...prev, ...added];
        });
        setMoviePage(next);
      } else {
        const next = tvPage + 1;
        const newTv = await tmdbService.getTVByGenre(parseInt(id), next);
        setTvShows(prev => {
          const seen = new Set(prev.map(p => p.id));
          const added = newTv.filter(t => !seen.has(t.id));
          return [...prev, ...added];
        });
        setTvPage(next);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [id, loadingMore, activeTab, moviePage, tvPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleLandscape = () => setLandscapeSetting(storageService.isLandscapePosterEnabled());
    window.addEventListener('landscapePosterSettingUpdated', handleLandscape);

    const fetchData = async () => {
      if (!id) return;
      const genreId = parseInt(id);
      setLoading(true);
      try {
        const [movieData, tvData, apiMovieGenres, apiTvGenres] = await Promise.all([
          tmdbService.getMoviesByGenre(genreId),
          tmdbService.getTVByGenre(genreId),
          tmdbService.getGenres('movie'),
          tmdbService.getGenres('tv')
        ]);

        setMovies(movieData);
        setTvShows(tvData);

        const genre = [...apiMovieGenres, ...apiTvGenres].find((g: any) => g.id === genreId);
        if (genre) setGenreName(genre.name);
        else setGenreName('');

        if (movieData.length > 0) {
          setBackdrop(getImageUrl(movieData[0].backdrop_path || movieData[0].poster_path, 'original'));
        } else if (tvData.length > 0) {
          setBackdrop(getImageUrl(tvData[0].backdrop_path || tvData[0].poster_path, 'original'));
        }

        if (movieData.length === 0 && tvData.length > 0) {
          setActiveTab('tv');
        } else if (movieData.length > 0 && tvData.length === 0) {
          setActiveTab('movies');
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => {
      window.removeEventListener('landscapePosterSettingUpdated', handleLandscape);
    };
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-black">
      <SEO
        title={genreName ? `${genreName} Movies & TV Shows` : 'Genre Details'}
        description={genreName ? `Explore the best of ${genreName} cinema and television.` : 'Explore movies and TV shows by genre.'}
      />
      <div className="relative h-[45vh] md:h-[60vh] w-full overflow-hidden">
        <motion.div
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <LazyImage
            src={backdrop}
            alt={genreName}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
        </motion.div>

        <div className="absolute top-0 left-0 w-full px-4 md:px-6 pt-6 md:pt-8 z-20">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -4 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group w-fit btn-glass-beveled px-4 py-2 rounded-full cursor-pointer"
            aria-label="Go back"
          >
            <ChevronLeftRegular className="w-5 h-5 text-white" />
            <span className="text-xs font-bold uppercase tracking-wider">Back</span>
          </motion.button>
        </div>

        <div className="absolute bottom-0 left-0 px-4 md:px-8 pb-16 md:pb-28 w-full max-w-5xl">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-2 md:mb-4 drop-shadow-2xl text-balance"
          >
            {genreName}
          </motion.h1>
          {genreName && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-xs sm:text-sm md:text-lg text-white/70 max-w-2xl font-medium line-clamp-2 md:line-clamp-none leading-relaxed drop-shadow text-pretty"
            >
              Explore the best of {genreName} cinema and television, from blockbuster movies to trending series.
            </motion.p>
          )}
        </div>
      </div>

      <div className="relative z-10 -mt-8 md:-mt-20 pb-20 px-4 md:px-8">
        {movies.length > 0 && tvShows.length > 0 && (
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-1.5 glass-debossed p-1.5 rounded-full shadow-2xl">
              <button
                onClick={() => setActiveTab('movies')}
                className={`px-7 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
                  activeTab === 'movies' ? 'btn-beveled-solid shadow-lg scale-100' : 'text-white/60 hover:text-white scale-95'
                }`}
              >
                Movies
              </button>
              <button
                onClick={() => setActiveTab('tv')}
                className={`px-7 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
                  activeTab === 'tv' ? 'btn-beveled-solid shadow-lg scale-100' : 'text-white/60 hover:text-white scale-95'
                }`}
              >
                TV Shows
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className={`grid ${landscapeSetting ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-5 md:gap-6' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2.5 md:gap-4'}`}
          >
            {(activeTab === 'movies' ? movies : tvShows).map((item, index) => (
              <motion.div
                key={`${item.id}-${index}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.3), duration: 0.25 }}
              >
                <MovieCard movie={item} className="w-full" />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div ref={sentinelRef} className="h-10 w-full pointer-events-none" />

        {((activeTab === 'movies' && movies.length > 0) || (activeTab === 'tv' && tvShows.length > 0)) && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="btn-glass-beveled px-10 py-3 rounded-full font-bold text-xs md:text-sm shadow-lg disabled:opacity-50"
            >
              {loadingMore ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Loading...
                </div>
              ) : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
