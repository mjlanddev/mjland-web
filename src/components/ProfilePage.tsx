import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Add01Icon as Plus, 
  PlayIcon as Play, 
  ArrowRight01Icon as ChevronRight, 
  ArrowLeft01Icon as ChevronLeft, 
  Cancel01Icon as X, 
  UserCircleIcon as UserCircle,
  Clock01Icon as History,
  Bookmark02Icon as Bookmark,
  Settings01Icon as Settings,
  Search01Icon as Search,
  Delete01Icon as Trash
} from 'hugeicons-react';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { Movie } from '../types';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';

import { LazyImage } from './LazyImage';

const ScrollRow = ({ title, children, count }: { title: string; children: React.ReactNode; count: number }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 10);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  return (
    <section className="relative group/row mb-12">
      <div className="flex items-center justify-between mb-6 px-4 md:px-12">
        <h2 className="text-xl font-bold text-white/90 flex items-center gap-2">
          {title}
        </h2>
        <ChevronRight className="w-5 h-5 text-white/40" />
      </div>

      <div className="relative">
        <div className={`absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showLeft ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showRight ? 'opacity-100' : 'opacity-0'}`} />

        <button 
          onClick={() => scroll('left')}
          className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/60 ${!showLeft && 'pointer-events-none'}`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={() => scroll('right')}
          className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/60 ${!showRight && 'pointer-events-none'}`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar px-4 md:px-12 py-4 -my-4"
        >
          {children}
        </div>
      </div>
    </section>
  );
};

export const ProfilePage = () => {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [continueWatching, setContinueWatching] = useState<Movie[]>([]);
  const [backdrop, setBackdrop] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadData = async () => {
    const wList = storageService.getWatchlist();
    const cWatching = storageService.getContinueWatching();
    setWatchlist(wList);
    setContinueWatching(cWatching);

    if (cWatching.length > 0 && cWatching[0].backdrop_path) {
      setBackdrop(getImageUrl(cWatching[0].backdrop_path, 'original'));
    } else if (wList.length > 0 && wList[0].backdrop_path) {
      setBackdrop(getImageUrl(wList[0].backdrop_path, 'original'));
    } else {
      try {
        const popular = await tmdbService.getPopularMovies(1);
        if (popular && popular.length > 0 && popular[0].backdrop_path) {
          setBackdrop(getImageUrl(popular[0].backdrop_path, 'original'));
        }
      } catch (err) {
      }
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('watchlistUpdated', loadData);
    window.addEventListener('continueWatchingUpdated', loadData);
    return () => {
      window.removeEventListener('watchlistUpdated', loadData);
      window.removeEventListener('continueWatchingUpdated', loadData);
    };
  }, []);

  const handleRemoveWatchlist = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    storageService.removeFromWatchlist(id);
  };

  const handleRemoveContinue = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    storageService.removeFromContinueWatching(id);
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your Continue Watching history?")) {
      storageService.clearContinueWatching();
    }
  };

  const handleClearWatchlist = () => {
    if (confirm("Are you sure you want to clear your Watchlist?")) {
      storageService.clearWatchlist();
    }
  };

  const handleClearSearch = () => {
    if (confirm("Are you sure you want to clear your Search History?")) {
      storageService.clearSearchHistory();
    }
  };

  return (
    <div className="min-h-screen bg-bg text-white pb-20">
      <div className="relative h-[40vh] md:h-[50vh] flex flex-col justify-end pb-8 px-4 md:px-12 mb-12">
        <div className="absolute inset-0 overflow-hidden">
          {backdrop && (
            <LazyImage 
              src={backdrop} 
              alt="My Space" 
              className="w-full h-full object-cover opacity-60 md:opacity-80 object-top"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/40 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-center md:justify-between w-full gap-4 md:gap-0">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight drop-shadow-xl text-center md:text-left">My Space</h1>
          
          <div className="flex gap-2 md:gap-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl w-24 md:w-32 py-2 md:py-3 flex flex-col items-center justify-center shadow-xl">
              <span className="text-[10px] md:text-xs text-white/60 font-bold uppercase tracking-wider mb-1">Saved</span>
              <span className="text-xl md:text-2xl font-black">{watchlist.length}</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl w-24 md:w-32 py-2 md:py-3 flex flex-col items-center justify-center shadow-xl">
              <span className="text-[10px] md:text-xs text-white/60 font-bold uppercase tracking-wider mb-1">History</span>
              <span className="text-xl md:text-2xl font-black">{continueWatching.length}</span>
            </div>
          </div>
        </div>
      </div>

      {continueWatching.length > 0 ? (
        <ScrollRow title="Continue Watching" count={continueWatching.length}>
          {continueWatching.map((movie) => (
            <div key={movie.id} className="flex-none w-[180px] md:w-[240px] cursor-pointer group">
              <div 
                className="relative aspect-video rounded-xl overflow-hidden mb-3 md:mb-4 shadow-2xl anim-poster"
                onClick={() => navigate(`/${movie.media_type || 'movie'}/${movie.id}`)}
              >
                <LazyImage
                  src={getImageUrl(movie.backdrop_path || movie.poster_path, 'w500')}
                  alt={movie.title || movie.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <Play className="w-10 h-10 md:w-12 md:h-12 fill-current text-white" />
                </div>
                <button 
                  onClick={(e) => handleRemoveContinue(e, movie.id)}
                  className="absolute top-2 right-2 md:top-3 md:right-3 w-7 h-7 md:w-8 md:h-8 glass rounded-full flex items-center justify-center hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100 anim-btn"
                >
                  <X className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>
              
              <div className="px-1">
                <h3 className="text-xs md:text-sm font-bold text-white/90 truncate group-hover:text-accent transition-colors">
                  {movie.title || movie.name}
                </h3>
              </div>
            </div>
          ))}
        </ScrollRow>
      ) : (
        <div className="px-4 md:px-12 mb-12 mt-6">
          <h2 className="text-lg md:text-xl font-bold mb-6 text-white/90">Continue Watching</h2>
          <div className="flex flex-col items-start px-4 border-l-2 border-white/10">
            <p className="text-sm font-medium text-white/40 mb-3">You haven't watched anything yet.</p>
            <button onClick={() => navigate('/')} className="text-[11px] font-bold text-white/80 hover:text-accent uppercase tracking-widest transition-colors flex items-center gap-1 group">
              Explore <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {watchlist.length > 0 ? (
        <ScrollRow title="Watchlist" count={watchlist.length}>
          {watchlist.map((movie) => (
            <div 
              key={movie.id} 
              className="flex-none w-32 md:w-40 aspect-[2/3] rounded-xl overflow-hidden cursor-pointer shadow-2xl relative group anim-poster"
              onClick={() => navigate(`/${movie.media_type || 'movie'}/${movie.id}`)}
            >
              <LazyImage
                src={getImageUrl(movie.poster_path, 'w500')}
                alt={movie.title || movie.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <button 
                onClick={(e) => handleRemoveWatchlist(e, movie.id)}
                className="absolute top-2 right-2 md:top-3 md:right-3 w-7 h-7 md:w-8 md:h-8 glass rounded-full flex items-center justify-center hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3 md:w-4 md:h-4" />
              </button>
              <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] md:text-sm font-bold text-white truncate">{movie.title || movie.name}</p>
              </div>
            </div>
          ))}
        </ScrollRow>
      ) : (
        <div className="px-4 md:px-12 mb-12">
          <h2 className="text-lg md:text-xl font-bold mb-6 text-white/90">Watchlist</h2>
          <div className="flex flex-col items-start px-4 border-l-2 border-white/10">
            <p className="text-sm font-medium text-white/40 mb-3">Your watchlist is empty.</p>
            <button onClick={() => navigate('/')} className="text-[11px] font-bold text-white/80 hover:text-accent uppercase tracking-widest transition-colors flex items-center gap-1 group">
              Find Something <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {}
      <div className="px-4 md:px-12 mt-16 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-white/70" />
          <h2 className="text-lg md:text-xl font-bold text-white/90">Data & Preferences</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={handleClearHistory}
            className="flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all rounded-2xl group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <History className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white/90">Clear History</p>
                <p className="text-[10px] text-white/50">Remove continue watching</p>
              </div>
            </div>
            <Trash className="w-4 h-4 text-white/30 group-hover:text-red-400 transition-colors" />
          </button>

          <button 
            onClick={handleClearWatchlist}
            className="flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all rounded-2xl group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <Bookmark className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white/90">Clear Watchlist</p>
                <p className="text-[10px] text-white/50">Remove all saved items</p>
              </div>
            </div>
            <Trash className="w-4 h-4 text-white/30 group-hover:text-red-400 transition-colors" />
          </button>

          <button 
            onClick={handleClearSearch}
            className="flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all rounded-2xl group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <Search className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white/90">Clear Searches</p>
                <p className="text-[10px] text-white/50">Remove recent searches</p>
              </div>
            </div>
            <Trash className="w-4 h-4 text-white/30 group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};
