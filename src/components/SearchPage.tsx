import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search01Icon as SearchIcon, 
  Cancel01Icon as X, 
  ArrowDown01Icon as ChevronDown, 
  FilterIcon as FilterIcon 
} from 'hugeicons-react';
import { tmdbService } from '../services/tmdbService';
import { Movie } from '../types';
import { MovieCard } from './MovieRow';
import { motion, AnimatePresence } from 'motion/react';
import { getImageUrl } from '../services/tmdbService';
import { CategoryCard } from './CategoryCard';
import { SEO } from './SeoComponent';
import { LoadingSpinner } from './LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { LazyImage } from './LazyImage';

export const SearchPage = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [recentSearches, setRecentSearches] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<{id: number, name: string}[]>([]);
  
  // Filter States
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterGenre, setFilterGenre] = useState<string>('');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
      }
    }
  }, []);

  const handleResultClick = (movie: Movie) => {
    const newRecent = [movie, ...recentSearches.filter(m => m.id !== movie.id)].slice(0, 10);
    setRecentSearches(newRecent);
    localStorage.setItem('recent_searches', JSON.stringify(newRecent));
    const type = movie.media_type || (movie.title ? 'movie' : 'tv');
    navigate(`/${type}/${movie.id}`);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [trendingData, movieGenres, tvGenres] = await Promise.all([
          tmdbService.getTrending(),
          tmdbService.getGenres('movie'),
          tmdbService.getGenres('tv')
        ]);
        setTrending(trendingData);

        const allGenres = [...movieGenres, ...tvGenres];
        const uniqueGenres = Array.from(new Map(allGenres.map(item => [item.id, item])).values());
        setGenres(uniqueGenres.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (e) {
        console.error(e);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const search = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await tmdbService.deepSearch(debouncedQuery, 3);
        setResults(data.filter((item: any) => item.poster_path));
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const filteredResults = useMemo(() => {
    return results.filter(movie => {
      const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');
      if (filterType !== 'all' && mediaType !== filterType) return false;

      if (filterYear) {
        const releaseStr = movie.release_date || movie.first_air_date;
        if (!releaseStr || !releaseStr.startsWith(filterYear)) return false;
      }

      if (filterGenre) {
        if (!movie.genre_ids || !movie.genre_ids.includes(parseInt(filterGenre))) return false;
      }

      return true;
    });
  }, [results, filterType, filterYear, filterGenre]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString());

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const isFiltered = filterType !== 'all' || filterYear !== '' || filterGenre !== '';

  const resetFilters = () => {
    setFilterType('all');
    setFilterYear('');
    setFilterGenre('');
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-[100dvh] bg-[#0a0b0d] pb-24 lg:pb-8 flex flex-col font-sans"
    >
      <SEO 
        title={query ? `Search: ${query}` : "Search Movies & TV"} 
        description="Search for your favorite movies and TV shows."
      />
      {}
      <div className="sticky top-0 z-40 bg-[#0a0b0d] border-b border-white/10 shadow-xl px-4 md:px-8 py-3">
        <div className="flex items-center gap-2.5 w-full relative">
          {}
          <div className="relative flex-1 group">
            <SearchIcon className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors w-4.5 h-4.5 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, TV shows, actors..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 sm:py-3 pl-10 sm:pl-11 pr-10 text-sm sm:text-base font-medium text-white placeholder:text-white/30 focus:border-white/25 focus:ring-1 focus:ring-white/10 transition-all outline-none"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white rounded-full transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Trigger Button — Same Line */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`relative flex items-center justify-center h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl border transition-all cursor-pointer ${
                isFiltered
                  ? 'bg-white text-black border-white shadow-lg font-bold'
                  : showFilterDropdown
                    ? 'bg-white/15 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20'
              }`}
              title="Filter"
              aria-label="Open search filters"
            >
              <FilterIcon className="w-4.5 h-4.5" />
              {isFiltered && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-[#0a0b0d]" />
              )}
            </button>

            {/* Filter Popover Dropdown */}
            <AnimatePresence>
              {showFilterDropdown && (
                <>
                  {/* Backdrop for closing on outside click */}
                  <div
                    className="fixed inset-0 z-40 bg-black/50 md:bg-transparent"
                    onClick={() => setShowFilterDropdown(false)}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className="fixed sm:absolute right-4 sm:right-0 top-16 sm:top-full sm:mt-2.5 z-50 w-[calc(100vw-32px)] sm:w-80 bg-[#13151c] border border-white/15 rounded-2xl p-4 shadow-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <div className="flex items-center gap-2">
                        <FilterIcon className="w-4 h-4 text-white/60" />
                        <span className="text-sm font-bold text-white">Filter Search</span>
                      </div>
                      {isFiltered && (
                        <button
                          onClick={resetFilters}
                          className="text-xs font-bold text-white/50 hover:text-white transition-colors"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    {/* Content Type */}
                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Type</label>
                      <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                        <button
                          onClick={() => setFilterType('all')}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'all' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'}`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setFilterType('movie')}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'movie' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'}`}
                        >
                          Movies
                        </button>
                        <button
                          onClick={() => setFilterType('tv')}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'tv' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'}`}
                        >
                          TV Shows
                        </button>
                      </div>
                    </div>

                    {/* Release Year */}
                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Year</label>
                      <div className="relative">
                        <select
                          value={filterYear}
                          onChange={(e) => setFilterYear(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 pr-8 text-xs font-semibold text-white appearance-none outline-none cursor-pointer hover:border-white/20 transition-all"
                        >
                          <option value="" className="bg-[#13151c] text-white">All Years</option>
                          {years.map(y => (
                            <option key={y} value={y} className="bg-[#13151c] text-white">{y}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
                      </div>
                    </div>

                    {/* Genre */}
                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Genre</label>
                      <div className="relative">
                        <select
                          value={filterGenre}
                          onChange={(e) => setFilterGenre(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 pr-8 text-xs font-semibold text-white appearance-none outline-none cursor-pointer hover:border-white/20 transition-all"
                        >
                          <option value="" className="bg-[#13151c] text-white">All Genres</option>
                          {genres.map(g => (
                            <option key={g.id} value={g.id} className="bg-[#13151c] text-white">{g.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
                      </div>
                    </div>

                    <button
                      onClick={() => setShowFilterDropdown(false)}
                      className="w-full py-2 bg-white text-black font-bold text-xs rounded-xl shadow-lg hover:bg-white/90 transition-colors"
                    >
                      Done
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Active Filter Chips (if any active) */}
        {isFiltered && (
          <div className="flex items-center gap-2 pt-2.5 overflow-x-auto no-scrollbar">
            {filterType !== 'all' && (
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white">
                {filterType === 'movie' ? 'Movies' : 'TV Shows'}
                <button onClick={() => setFilterType('all')} className="hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filterYear && (
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white">
                Year: {filterYear}
                <button onClick={() => setFilterYear('')} className="hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filterGenre && (
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white">
                {genres.find(g => g.id === parseInt(filterGenre))?.name || 'Genre'}
                <button onClick={() => setFilterGenre('')} className="hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-[11px] font-bold text-white/40 hover:text-white underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="space-y-8 px-4 md:px-8 pt-6 pb-16 w-full">
        {query ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs sm:text-sm font-bold text-white/60 tracking-wider uppercase">
                {loading ? 'Searching...' : `${filteredResults.length} results for "${query}"`}
              </h2>
            </div>
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 md:gap-3">
                  {filteredResults.length > 0 ? (
                    filteredResults.map((movie, idx) => (
                      <motion.div
                        key={movie.id}
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: Math.min(idx * 0.02, 0.3), duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <MovieCard 
                          movie={movie} 
                          className="w-full" 
                          onClick={() => handleResultClick(movie)}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="col-span-full py-16 text-center text-white/40"
                    >
                      {!loading && (
                        <div className="space-y-2">
                          <SearchIcon className="w-10 h-10 mx-auto text-white/20" />
                          <p className="font-medium text-sm">No results found for these filters.</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Recent Searches — Single Horizontal Scrollable Row */}
              {recentSearches.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">Recent Searches</h2>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs font-semibold text-white/40 hover:text-accent transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar overscroll-x-contain pb-2 -mx-4 px-4 md:-mx-8 md:px-8">
                    {recentSearches.map((movie, idx) => {
                      const type = movie.media_type || (movie.title ? 'movie' : 'tv');
                      return (
                        <motion.div 
                          key={movie.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ y: -3, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                          className="relative w-44 sm:w-52 md:w-60 aspect-video rounded-xl overflow-hidden cursor-pointer group shadow-lg border border-white/5 hover:border-white/20 transition-all shrink-0"
                          onClick={() => navigate(`/${type}/${movie.id}`)}
                        >
                          <LazyImage 
                            src={getImageUrl(movie.backdrop_path || movie.poster_path, 'w500')} 
                            alt={movie.title || movie.name}
                            className="w-full h-full object-cover transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                          <div className="absolute bottom-2.5 left-3 right-3">
                            <h3 className="text-white font-bold text-xs sm:text-sm truncate drop-shadow-md group-hover:text-accent transition-colors">
                              {movie.title || movie.name}
                            </h3>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {}
              <div className="space-y-3">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">Trending Now</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 md:gap-3">
                  {trending.map((movie, idx) => (
                    <motion.div
                      key={movie.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.35) }}
                    >
                      <MovieCard movie={movie} className="w-full" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
    </motion.div>
  );
};
