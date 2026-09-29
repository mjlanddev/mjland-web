import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search01Icon as SearchIcon,
  Cancel01Icon as X,
  ArrowDown01Icon as ChevronDown,
  FilterIcon as FilterIcon
} from 'hugeicons-react';
import { tmdbService } from '../services/tmdbService';
import { storageService } from '../services/storageService';
import { Movie } from '../types';
import { MovieCard } from './MovieRow';
import { motion, AnimatePresence } from 'motion/react';
import { getImageUrl } from '../services/tmdbService';
import { CategoryCard } from './CategoryCard';
import { SEO } from './SeoComponent';
import { LoadingSpinner } from './LoadingSpinner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { LazyImage } from './LazyImage';
import { TMDB_CONFIG, findThemeMatch } from '../config/tmdbConfig';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [recentSearches, setRecentSearches] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<{id: number, name: string}[]>([]);

  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreSearch, setHasMoreSearch] = useState(true);
  const [loadingMoreSearch, setLoadingMoreSearch] = useState(false);

  const [trendingPage, setTrendingPage] = useState(1);
  const [hasMoreTrending, setHasMoreTrending] = useState(true);
  const [loadingMoreTrending, setLoadingMoreTrending] = useState(false);

  const sentinelSearchRef = useRef<HTMLDivElement>(null);
  const sentinelTrendingRef = useRef<HTMLDivElement>(null);

  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterGenre, setFilterGenre] = useState<string>('');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const navigate = useNavigate();

  const [landscapeSetting, setLandscapeSetting] = useState(() => storageService.isLandscapePosterEnabled());

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== query) {
      setQuery(q);
    }
    const g = searchParams.get('genre');
    if (g && g !== filterGenre) {
      setFilterGenre(g);
    }
  }, [searchParams]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearchParams({}, { replace: true });
  };

  useEffect(() => {
    setRecentSearches(storageService.getRecentSearches());

    const handleRecentUpdate = () => {
      setRecentSearches(storageService.getRecentSearches());
    };
    const handleLandscapeSetting = () => {
      setLandscapeSetting(storageService.isLandscapePosterEnabled());
    };

    window.addEventListener('recentSearchesUpdated', handleRecentUpdate);
    window.addEventListener('searchHistoryCleared', handleRecentUpdate);
    window.addEventListener('landscapePosterSettingUpdated', handleLandscapeSetting);
    return () => {
      window.removeEventListener('recentSearchesUpdated', handleRecentUpdate);
      window.removeEventListener('searchHistoryCleared', handleRecentUpdate);
      window.removeEventListener('landscapePosterSettingUpdated', handleLandscapeSetting);
    };
  }, []);

  const handleResultClick = (movie: Movie) => {
    try {
      const updated = storageService.addRecentSearch(movie);
      setRecentSearches(updated);
    } catch (err) {
      console.warn('Could not record recent search:', err);
    }
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
        setSearchPage(1);
        setHasMoreSearch(true);
        return;
      }
      setLoading(true);
      setSearchPage(1);
      setHasMoreSearch(true);
      try {
        const data = await tmdbService.deepSearch(debouncedQuery, 1);
        const clean = (data || []).filter((item: any) => item.poster_path);
        setResults(clean);
        if (clean.length < 10) {
          setHasMoreSearch(false);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const loadMoreSearch = useCallback(async () => {
    if (loading || loadingMoreSearch || !hasMoreSearch || debouncedQuery.length < 2) return;
    setLoadingMoreSearch(true);
    try {
      const nextPage = searchPage + 1;
      const nextData = await tmdbService.deepSearch(debouncedQuery, nextPage);
      const clean = (nextData || []).filter((item: any) => item.poster_path);
      if (clean.length === 0) {
        setHasMoreSearch(false);
      } else {
        setResults(prev => {
          const seen = new Set(prev.map(p => `${p.media_type || (p.title ? 'movie' : 'tv')}-${p.id}`));
          const added: Movie[] = [];
          for (const item of clean) {
            const key = `${item.media_type || (item.title ? 'movie' : 'tv')}-${item.id}`;
            if (!seen.has(key)) {
              seen.add(key);
              added.push(item);
            }
          }
          if (added.length === 0) {
            setHasMoreSearch(false);
          }
          return [...prev, ...added];
        });
        setSearchPage(nextPage);
      }
    } catch (err) {
      console.error('Failed to load more search results:', err);
    } finally {
      setLoadingMoreSearch(false);
    }
  }, [loading, loadingMoreSearch, hasMoreSearch, debouncedQuery, searchPage]);

  const loadMoreTrending = useCallback(async () => {
    if (loadingMoreTrending || !hasMoreTrending || debouncedQuery) return;
    setLoadingMoreTrending(true);
    try {
      const nextTrendingPage = trendingPage + 1;
      const nextData = await tmdbService.getTrending('all', nextTrendingPage);
      const clean = (nextData || []).filter((item: any) => item.poster_path);
      if (clean.length === 0) {
        setHasMoreTrending(false);
      } else {
        setTrending(prev => {
          const seen = new Set(prev.map(p => `${p.media_type || (p.title ? 'movie' : 'tv')}-${p.id}`));
          const added: Movie[] = [];
          for (const item of clean) {
            const key = `${item.media_type || (item.title ? 'movie' : 'tv')}-${item.id}`;
            if (!seen.has(key)) {
              seen.add(key);
              added.push(item);
            }
          }
          if (added.length === 0) {
            setHasMoreTrending(false);
          }
          return [...prev, ...added];
        });
        setTrendingPage(nextTrendingPage);
      }
    } catch (err) {
      console.error('Failed to load more trending:', err);
    } finally {
      setLoadingMoreTrending(false);
    }
  }, [loadingMoreTrending, hasMoreTrending, debouncedQuery, trendingPage]);

  useEffect(() => {
    const sentinel = sentinelSearchRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreSearch();
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMoreSearch]);

  useEffect(() => {
    const sentinel = sentinelTrendingRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreTrending();
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMoreTrending]);

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

  const matchedTheme = useMemo(() => {
    return findThemeMatch(query);
  }, [query]);

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
    storageService.clearSearchHistory();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[100dvh] bg-black pb-24 lg:pb-8 flex flex-col font-sans"
    >
      <SEO
        title={query ? `Search: ${query}` : "Search Movies & TV"}
        description="Search for your favorite movies and TV shows."
      />

      <div className="sticky top-3 z-40 mx-3 sm:mx-6 md:mx-auto max-w-2xl w-[calc(100%-1.5rem)] sm:w-[calc(100%-3rem)] md:w-full mb-4 bg-zinc-900/85 backdrop-blur-2xl px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.7)] border border-white/10 transition-all">
        <div className="flex items-center gap-2 w-full">

          <div className="relative flex-1 flex items-center group">
            <SearchIcon className="absolute left-3 text-white/40 group-focus-within:text-white transition-colors w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search movies, TV shows, actors..."
              className="w-full bg-white/[0.04] focus:bg-white/[0.07] border border-white/5 focus:border-white/15 rounded-xl py-2 pl-9 pr-8 text-xs sm:text-sm font-medium text-white placeholder:text-white/35 outline-none transition-all"
              autoFocus
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-2.5 p-1 text-white/40 hover:text-white rounded-full transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`relative flex items-center justify-center h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer shrink-0 gap-1.5 ${
              isFiltered
                ? 'bg-white text-black border-white shadow-md'
                : showFilterDropdown
                  ? 'bg-white/15 text-white border-white/20'
                  : 'bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] border-white/5'
            }`}
            title="Filter search"
            aria-label="Toggle search filters"
          >
            <FilterIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs font-semibold">Filter</span>
            {isFiltered && (
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {showFilterDropdown && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-white/10 pt-2"
            >
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">

                <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/5">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${filterType === 'all' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterType('movie')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${filterType === 'movie' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    Movies
                  </button>
                  <button
                    onClick={() => setFilterType('tv')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${filterType === 'tv' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    TV
                  </button>
                </div>

                <div className="relative">
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="appearance-none bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 rounded-lg py-1 pl-2.5 pr-6 text-[11px] font-semibold text-white/75 hover:text-white outline-none cursor-pointer transition-all"
                  >
                    <option value="" className="bg-[#121214]">Any Year</option>
                    {years.map(y => (
                      <option key={y} value={y} className="bg-[#121214]">{y}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={filterGenre}
                    onChange={(e) => setFilterGenre(e.target.value)}
                    className="appearance-none bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 rounded-lg py-1 pl-2.5 pr-6 text-[11px] font-semibold text-white/75 hover:text-white outline-none cursor-pointer transition-all"
                  >
                    <option value="" className="bg-[#121214]">Any Genre</option>
                    {genres.map(g => (
                      <option key={g.id} value={g.id} className="bg-[#121214]">{g.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
                </div>

                {isFiltered && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] font-semibold text-white/40 hover:text-accent ml-auto transition-colors cursor-pointer py-1 px-2"
                  >
                    Reset
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isFiltered && (
          <div className="flex items-center gap-1.5 pt-2 overflow-x-auto no-scrollbar">
            {filterType !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white/90">
                {filterType === 'movie' ? 'Movies' : 'TV Shows'}
                <button onClick={() => setFilterType('all')} className="hover:text-white transition-colors" aria-label="Clear type filter">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {filterYear && (
              <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white/90 tabular-nums">
                Year: {filterYear}
                <button onClick={() => setFilterYear('')} className="hover:text-white transition-colors" aria-label="Clear year filter">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {filterGenre && (
              <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white/90">
                {genres.find(g => g.id === parseInt(filterGenre))?.name || 'Genre'}
                <button onClick={() => setFilterGenre('')} className="hover:text-white transition-colors" aria-label="Clear genre filter">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-[10px] font-bold text-white/40 hover:text-white underline ml-1 cursor-pointer"
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
              <div className="flex items-center gap-2">
                {matchedTheme && (
                  <span className="px-2 py-0.5 rounded-md bg-accent/15 border border-accent/30 text-accent font-bold text-[11px] uppercase tracking-wider">
                    Curated Theme
                  </span>
                )}
                <h2 className="text-xs sm:text-sm font-bold text-white/70 tracking-wider uppercase tabular-nums">
                  {loading
                    ? (matchedTheme ? `Curating ${matchedTheme.name}...` : 'Searching...')
                    : matchedTheme
                      ? `${filteredResults.length} ${matchedTheme.name} titles`
                      : `${filteredResults.length} results for "${query}"`}
                </h2>
              </div>
            </div>
            <AnimatePresence mode="popLayout">
              <div className={`grid ${landscapeSetting ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-5 md:gap-6' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 md:gap-3'}`}>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <motion.div key={`search-skeleton-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`w-full ${landscapeSetting ? 'aspect-video' : 'aspect-[2/3]'} rounded-xl bg-white/5 animate-pulse`} />
                    ))
                  ) : filteredResults.length > 0 ? (
                    filteredResults.map((movie, idx) => (
                      <motion.div
                        key={`${movie.media_type || (movie.title ? 'movie' : 'tv')}-${movie.id}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: Math.min(idx * 0.02, 0.2), duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
                        <div className="space-y-2 flex flex-col items-center">
                          <SearchIcon className="w-16 h-16 text-white/10" />
                          <h3 className="text-base font-semibold text-white">No results found</h3>
                          <p className="text-sm text-white/40 max-w-sm mx-auto">Try different keywords or check your spelling</p>
                          <button onClick={() => navigate('/')} className="btn-glass-beveled px-4 py-2 mt-2 rounded-xl text-xs font-bold">
                            Browse Trending
                          </button>
                        </div>
                    </motion.div>
                  )}
                </div>
              </AnimatePresence>

              {query && filteredResults.length > 0 && (
                <div className="py-6 flex flex-col items-center justify-center">
                  {loadingMoreSearch && (
                    <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.06] border border-white/10 text-white/70 text-xs font-semibold">
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Loading more titles...</span>
                    </div>
                  )}
                  {hasMoreSearch && <div ref={sentinelSearchRef} className="h-10 w-full pointer-events-none" />}
                  {!hasMoreSearch && filteredResults.length >= 10 && (
                    <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest pt-4">
                      End of results
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">

              {recentSearches.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">Recent Searches</h2>
                    <button
                      onClick={clearRecentSearches}
                      className="btn-glass-beveled text-xs font-semibold px-3 py-1 rounded-xl transition-all"
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
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ delay: Math.min(idx * 0.03, 0.3), duration: 0.2 }}
                          className="relative w-44 sm:w-52 md:w-60 aspect-video rounded-2xl overflow-hidden cursor-pointer group card-glass-debossed shrink-0"
                          onClick={() => handleResultClick(movie)}
                        >
                          <LazyImage
                            src={getImageUrl(movie.backdrop_path || movie.poster_path, 'w500')}
                            alt={movie.title || movie.name}
                            className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-105"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/95 via-[#09090b]/35 to-transparent" />
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

              <div className="space-y-2.5">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">Browse by Theme</h2>
                <div className="flex flex-wrap gap-2">
                  {TMDB_CONFIG.POPULAR_THEMES.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => handleQueryChange(theme.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 text-white/80 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <span className="text-accent font-bold text-[11px]">#</span>
                      <span>{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">Trending Now</h2>
                <div className={`grid ${landscapeSetting ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-5 md:gap-6' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 md:gap-3'}`}>
                  {trending.map((movie, idx) => (
                    <motion.div
                      key={`${movie.media_type || (movie.title ? 'movie' : 'tv')}-${movie.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.35) }}
                    >
                      <MovieCard
                        movie={movie}
                        className="w-full"
                        onClick={() => handleResultClick(movie)}
                      />
                    </motion.div>
                  ))}
                </div>

                <div className="py-6 flex flex-col items-center justify-center">
                  {loadingMoreTrending && (
                    <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.06] border border-white/10 text-white/70 text-xs font-semibold">
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Loading more trending...</span>
                    </div>
                  )}
                  {hasMoreTrending && <div ref={sentinelTrendingRef} className="h-10 w-full pointer-events-none" />}
                </div>
              </div>
            </div>
          )}
        </div>
    </motion.div>
  );
};
