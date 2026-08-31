import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { Helmet } from 'react-helmet-async';
import { LoadingSpinner } from './LoadingSpinner';
import { CategoryCard } from './CategoryCard';
import { motion, AnimatePresence } from 'motion/react';
import { Search01Icon as SearchIcon, Cancel01Icon as X } from 'hugeicons-react';

export const GenresPage = () => {
  const [genres, setGenres] = useState<any[]>([]);
  const [backdrops, setBackdrops] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllGenres = async () => {
      try {
        const movieGenres = await tmdbService.getGenres('movie');
        const tvGenres = await tmdbService.getGenres('tv');
        
        const allGenresMap = new Map();
        [...movieGenres, ...tvGenres].forEach(g => {
          if (!allGenresMap.has(g.id)) {
            allGenresMap.set(g.id, g);
          }
        });
        
        const apiGenres = Array.from(allGenresMap.values()).sort((a: any, b: any) => a.name.localeCompare(b.name));
        setGenres(apiGenres);

        const fetchGenreMedia = async (g: any) => {
          let media = await tmdbService.getMoviesByGenre(g.id).catch(() => []);
          if (media.length === 0) {
            media = await tmdbService.getTVByGenre(g.id).catch(() => []);
          }
          return media;
        };

        const genreResults = await Promise.all(apiGenres.map(fetchGenreMedia));
        const genreMap: Record<string, string> = {};
        const usedMovieIds = new Set<number>();

        apiGenres.forEach((g: any, i: number) => {
          const movies = genreResults[i];
          const uniqueMovie = movies.find(m => !usedMovieIds.has(m.id)) || movies[0];
          if (uniqueMovie) {
            usedMovieIds.add(uniqueMovie.id);
            genreMap[g.name] = getImageUrl(uniqueMovie.backdrop_path || uniqueMovie.poster_path, 'w500');
          }
        });
        setBackdrops(genreMap);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchAllGenres();
  }, []);

  const filteredGenres = useMemo(() => {
    if (!searchQuery.trim()) return genres;
    return genres.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [genres, searchQuery]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen pt-16 md:pt-20 px-4 md:px-8 pb-20 max-w-7xl mx-auto"
    >
      {}
      <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">Explore Genres</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white/80 border border-white/10">
              {genres.length}
            </span>
          </div>
          <p className="text-white/60 text-sm md:text-base font-medium">Discover movies and TV series across every category.</p>
        </div>

        {}
        <div className="relative w-full md:w-72">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter genres..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-9 text-xs md:text-sm font-medium text-white placeholder:text-white/30 focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      
      {}
      <AnimatePresence mode="popLayout">
        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4"
        >
          {filteredGenres.map((genre, idx) => (
            <motion.div
              key={genre.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: Math.min(idx * 0.02, 0.4), duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <CategoryCard 
                title={genre.name} 
                image={backdrops[genre.name]} 
                className="w-full"
                onClick={() => navigate(`/genre/${genre.id}`)} 
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredGenres.length === 0 && (
        <div className="py-16 text-center text-white/40">
          <p className="font-semibold text-sm">No genres match "{searchQuery}"</p>
        </div>
      )}
    </motion.div>
  );
};

