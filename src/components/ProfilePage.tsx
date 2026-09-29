import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  Delete01Icon as Trash,
  Mouse01Icon as MouseIcon,
  Image01Icon
} from 'hugeicons-react';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { Movie } from '../types';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';

import { LazyImage } from './LazyImage';
import { showToast } from '../utils/toast';
import { SEO } from './SeoComponent';

const ScrollRow = ({ title, children, count }: { title: string; children: React.ReactNode; count: number }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 6);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  }, []);

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
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    const t1 = setTimeout(checkScroll, 100);
    const t2 = setTimeout(checkScroll, 400);

    const observer = new ResizeObserver(() => {
      checkScroll();
    });
    observer.observe(el);

    if (el.firstElementChild) observer.observe(el.firstElementChild);
    if (el.lastElementChild) observer.observe(el.lastElementChild);

    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
      window.removeEventListener('resize', checkScroll);
    };
  }, [children, checkScroll]);

  return (
    <section className="relative group/row mb-12">
      <div className="flex items-center justify-between mb-6 px-4 md:px-12">
        <h2 className="text-xl font-bold text-white/90 flex items-center gap-2 text-balance">
          {title}
        </h2>
        <ChevronRight className="w-5 h-5 text-white/40" />
      </div>

      <div className="relative">
        <div className={`absolute left-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 lg:w-40 bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none transition-opacity duration-300 ${showLeft ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute right-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 lg:w-40 bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none transition-opacity duration-300 ${showRight ? 'opacity-100' : 'opacity-0'}`} />

        <button
          onClick={() => scroll('left')}
          className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 btn-glass-beveled rounded-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity ${!showLeft && 'pointer-events-none'}`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => scroll('right')}
          className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 btn-glass-beveled rounded-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity ${!showRight && 'pointer-events-none'}`}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar px-4 md:px-12 py-3"
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
  const [hoverModalEnabled, setHoverModalEnabled] = useState<boolean>(() => storageService.isHoverModalEnabled());
  const [landscapePosterEnabled, setLandscapePosterEnabled] = useState<boolean>(() => storageService.isLandscapePosterEnabled());
  const [hidePosterTitlesEnabled, setHidePosterTitlesEnabled] = useState<boolean>(() => storageService.isHidePosterTitlesEnabled());
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
    const handleHoverModal = () => setHoverModalEnabled(storageService.isHoverModalEnabled());
    const handleLandscapePoster = () => setLandscapePosterEnabled(storageService.isLandscapePosterEnabled());
    const handleHidePosterTitles = () => setHidePosterTitlesEnabled(storageService.isHidePosterTitlesEnabled());

    window.addEventListener('watchlistUpdated', loadData);
    window.addEventListener('continueWatchingUpdated', loadData);
    window.addEventListener('hoverModalSettingUpdated', handleHoverModal);
    window.addEventListener('landscapePosterSettingUpdated', handleLandscapePoster);
    window.addEventListener('hidePosterTitlesSettingUpdated', handleHidePosterTitles);

    return () => {
      window.removeEventListener('watchlistUpdated', loadData);
      window.removeEventListener('continueWatchingUpdated', loadData);
      window.removeEventListener('hoverModalSettingUpdated', handleHoverModal);
      window.removeEventListener('landscapePosterSettingUpdated', handleLandscapePoster);
      window.removeEventListener('hidePosterTitlesSettingUpdated', handleHidePosterTitles);
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
    storageService.clearContinueWatching();
    showToast("Continue Watching history cleared");
  };

  const handleClearWatchlist = () => {
    storageService.clearWatchlist();
    showToast("Watchlist cleared");
  };

  const handleClearSearch = () => {
    storageService.clearSearchHistory();
    showToast("Search history cleared");
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <SEO
        title="My Space"
        description="Your saved movies, continue watching history and data preferences."
      />
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
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-center md:justify-between w-full gap-4 md:gap-0">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight drop-shadow-2xl text-center md:text-left text-balance">My Space</h1>

          <div className="flex gap-2.5 md:gap-4">
            <div className="glass-debossed rounded-2xl w-28 md:w-36 py-3 md:py-3.5 flex flex-col items-center justify-center shadow-xl">
              <span className="text-[10px] md:text-xs text-white/50 font-bold uppercase tracking-wider mb-0.5">Saved</span>
              <span className="text-xl md:text-2xl font-black text-white tabular-nums">{watchlist.length}</span>
            </div>
            <div className="glass-debossed rounded-2xl w-28 md:w-36 py-3 md:py-3.5 flex flex-col items-center justify-center shadow-xl">
              <span className="text-[10px] md:text-xs text-white/50 font-bold uppercase tracking-wider mb-0.5">History</span>
              <span className="text-xl md:text-2xl font-black text-white tabular-nums">{continueWatching.length}</span>
            </div>
          </div>
        </div>
      </div>

      {continueWatching.length > 0 ? (
        <ScrollRow title="Continue Watching" count={continueWatching.length}>
          {continueWatching.map((movie) => (
            <div key={movie.id} className="flex-none w-[200px] md:w-[260px] cursor-pointer group">
              <div
                className="relative aspect-video rounded-2xl overflow-hidden mb-3 md:mb-4 shadow-xl card-glass-debossed transition-transform duration-200 group-hover:-translate-y-1"
                onClick={() => navigate(`/${movie.media_type || 'movie'}/${movie.id}`)}
              >
                <LazyImage
                  src={getImageUrl(movie.backdrop_path || movie.poster_path, 'w500')}
                  alt={movie.title || movie.name}
                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:brightness-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                  <div className="w-12 h-12 rounded-full glass-debossed flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-current text-white translate-x-0.5" />
                  </div>
                </div>
                <button
                  onClick={(e) => handleRemoveContinue(e, movie.id)}
                  className="absolute top-2.5 right-2.5 w-8 h-8 glass-debossed rounded-full flex items-center justify-center hover:bg-red-500/80 text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Remove from continue watching"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="px-1">
                <h3 className="text-xs md:text-sm font-semibold text-white/90 truncate group-hover:text-white transition-colors">
                  {movie.title || movie.name}
                </h3>
              </div>
            </div>
          ))}
        </ScrollRow>
      ) : (
        <div className="px-4 md:px-12 mb-12 mt-6">
          <h2 className="text-lg md:text-xl font-bold mb-6 text-white/90">Continue Watching</h2>
          <div className="flex flex-col items-center justify-center p-12 glass-debossed rounded-3xl border border-white/10">
            <div className="w-14 h-14 rounded-2xl glass-debossed flex items-center justify-center mb-4 text-white/30">
              <History className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-white/90 mb-1">Nothing here yet</h3>
            <p className="text-sm text-white/50 mb-5 text-center max-w-sm">Movies and TV shows you start watching will appear here so you can easily pick up where you left off.</p>
            <button onClick={() => navigate('/')} className="btn-beveled-solid px-6 py-2.5 rounded-full text-xs font-bold">
              Explore Content
            </button>
          </div>
        </div>
      )}

      {watchlist.length > 0 ? (
        <ScrollRow title="Watchlist" count={watchlist.length}>
          {watchlist.map((movie) => (
            <div
              key={movie.id}
              className="flex-none w-32 md:w-44 aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer shadow-xl relative group card-glass-debossed transition-transform duration-200 group-hover:-translate-y-1"
              onClick={() => navigate(`/${movie.media_type || 'movie'}/${movie.id}`)}
            >
              <LazyImage
                src={getImageUrl(movie.poster_path, 'w500')}
                alt={movie.title || movie.name}
                className="w-full h-full object-cover transition-opacity duration-300 group-hover:brightness-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3" />
              <button
                onClick={(e) => handleRemoveWatchlist(e, movie.id)}
                className="absolute top-2.5 right-2.5 w-8 h-8 glass-debossed rounded-full flex items-center justify-center hover:bg-red-500/80 text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
                aria-label="Remove from watchlist"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <p className="text-xs md:text-sm font-semibold text-white truncate">{movie.title || movie.name}</p>
              </div>
            </div>
          ))}
        </ScrollRow>
      ) : (
        <div className="px-4 md:px-12 mb-12">
          <h2 className="text-lg md:text-xl font-bold mb-6 text-white/90">Watchlist</h2>
          <div className="flex flex-col items-center justify-center p-12 glass-debossed rounded-3xl border border-white/10">
            <div className="w-14 h-14 rounded-2xl glass-debossed flex items-center justify-center mb-4 text-white/30">
              <Bookmark className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-white/90 mb-1">Your watchlist is empty</h3>
            <p className="text-sm text-white/50 mb-5 text-center max-w-sm">Save shows and movies to keep track of what you want to watch next.</p>
            <button onClick={() => navigate('/')} className="btn-beveled-solid px-6 py-2.5 rounded-full text-xs font-bold">
              Discover Favorites
            </button>
          </div>
        </div>
      )}

      <div className="px-4 md:px-12 mt-16 mb-12">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-lg glass-debossed flex items-center justify-center text-white/80">
            <Settings className="w-4 h-4" />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white/90">Data & Preferences</h2>
        </div>

        <div className="mb-6 space-y-3">

          <div className="card-glass-debossed p-5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl glass-debossed flex items-center justify-center shrink-0">
                <Image01Icon className="w-5 h-5 text-white/80" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/95">Landscape Poster Type</p>
                <p className="text-xs text-white/50">Display movies with 16:9 widescreen landscape posters using English backdrops (Default: Off)</p>
              </div>
            </div>

            <button
              onClick={() => {
                const nextState = !landscapePosterEnabled;
                setLandscapePosterEnabled(nextState);
                storageService.setLandscapePosterEnabled(nextState);
                showToast(nextState ? "Landscape movie posters enabled" : "Landscape movie posters disabled");
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                landscapePosterEnabled ? 'bg-white' : 'bg-white/20'
              }`}
              role="switch"
              aria-checked={landscapePosterEnabled}
              aria-label="Toggle landscape poster type"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out ${
                  landscapePosterEnabled ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white'
                }`}
              />
            </button>
          </div>

          <div className="card-glass-debossed p-5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl glass-debossed flex items-center justify-center shrink-0">
                <MouseIcon className="w-5 h-5 text-white/80" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/95">Hover Preview Cards</p>
                <p className="text-xs text-white/50">Show video and details popup when hovering movie cards on desktop (Default: Off)</p>
              </div>
            </div>

            <button
              onClick={() => {
                const nextState = !hoverModalEnabled;
                setHoverModalEnabled(nextState);
                storageService.setHoverModalEnabled(nextState);
                showToast(nextState ? "Hover previews enabled" : "Hover previews disabled");
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                hoverModalEnabled ? 'bg-white' : 'bg-white/20'
              }`}
              role="switch"
              aria-checked={hoverModalEnabled}
              aria-label="Toggle hover preview cards"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out ${
                  hoverModalEnabled ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white'
                }`}
              />
            </button>
          </div>

          <div className="card-glass-debossed p-5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl glass-debossed flex items-center justify-center shrink-0">
                <Bookmark className="w-5 h-5 text-white/80" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/95">Hide Titles Below Posters</p>
                <p className="text-xs text-white/50">Hide the text titles shown below landscape posters for a minimal poster-only look (Default: Off)</p>
              </div>
            </div>

            <button
              onClick={() => {
                const nextState = !hidePosterTitlesEnabled;
                setHidePosterTitlesEnabled(nextState);
                storageService.setHidePosterTitlesEnabled(nextState);
                showToast(nextState ? "Titles below posters hidden" : "Titles below posters visible");
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                hidePosterTitlesEnabled ? 'bg-white' : 'bg-white/20'
              }`}
              role="switch"
              aria-checked={hidePosterTitlesEnabled}
              aria-label="Toggle hide titles below posters"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out ${
                  hidePosterTitlesEnabled ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleClearHistory}
            className="card-glass-debossed p-4 rounded-2xl flex items-center justify-between group cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl glass-debossed flex items-center justify-center">
                <History className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white/95">Clear History</p>
                <p className="text-xs text-white/50">Remove continue watching</p>
              </div>
            </div>
            <Trash className="w-4 h-4 text-white/30 group-hover:text-red-400 transition-colors mr-1" />
          </button>

          <button
            onClick={handleClearWatchlist}
            className="card-glass-debossed p-4 rounded-2xl flex items-center justify-between group cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl glass-debossed flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white/95">Clear Watchlist</p>
                <p className="text-xs text-white/50">Remove all saved items</p>
              </div>
            </div>
            <Trash className="w-4 h-4 text-white/30 group-hover:text-red-400 transition-colors mr-1" />
          </button>

          <button
            onClick={handleClearSearch}
            className="card-glass-debossed p-4 rounded-2xl flex items-center justify-between group cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl glass-debossed flex items-center justify-center">
                <Search className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white/95">Clear Searches</p>
                <p className="text-xs text-white/50">Remove recent searches</p>
              </div>
            </div>
            <Trash className="w-4 h-4 text-white/30 group-hover:text-red-400 transition-colors mr-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
