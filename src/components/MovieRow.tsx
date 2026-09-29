import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Movie, MovieDetails } from '../types';
import { getImageUrl, tmdbService } from '../services/tmdbService';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  PlayIcon as Play,
  Add01Icon as Plus,
  CheckmarkCircle02Icon,
  VolumeHighIcon as Volume2,
  VolumeOffIcon as VolumeX,
  ArrowRight01Icon as ChevronRight,
  ArrowLeft01Icon as ChevronLeft,
  Loading01Icon as Loader2,
  InformationCircleIcon as InfoIcon
} from 'hugeicons-react';
import { storageService } from '../services/storageService';
import { PosterImage } from './PosterImage';
import { LazyImage } from './LazyImage';

interface MovieCardProps {
  movie: Movie;
  className?: string;
  badge?: string;
  badgeType?: 'new' | 'episodes' | 'language';
  isLandscape?: boolean;
  onClick?: () => void;
}

export const MovieCard = memo<MovieCardProps>(({ movie, className = "", badge, badgeType, isLandscape, onClick }) => {
  const navigate = useNavigate();
  const type = movie.media_type || (movie.title ? 'movie' : 'tv');
  const isMovie = type === 'movie';
  const title = movie.title || movie.name;

  const [isHovered, setIsHovered] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(() => storageService.isInWatchlist(movie.id));
  const [hoverModalEnabled, setHoverModalEnabled] = useState(() => storageService.isHoverModalEnabled());
  const [landscapeSetting, setLandscapeSetting] = useState(() => storageService.isLandscapePosterEnabled());
  const [hidePosterTitles, setHidePosterTitles] = useState(() => storageService.isHidePosterTitlesEnabled());
  const [enBackdrop, setEnBackdrop] = useState<string | null>(null);
  const [enLogo, setEnLogo] = useState<string | null>(null);

  const effectiveIsLandscape = isLandscape !== undefined ? (isLandscape || landscapeSetting) : landscapeSetting;

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState<'center' | 'left' | 'right'>('center');
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const handleWatchlistChange = () => {
      setIsInWatchlist(storageService.isInWatchlist(movie.id));
    };
    const handleHoverSettingChange = () => {
      setHoverModalEnabled(storageService.isHoverModalEnabled());
    };
    const handleLandscapeSettingChange = () => {
      setLandscapeSetting(storageService.isLandscapePosterEnabled());
    };
    const handleHidePosterTitlesChange = () => {
      setHidePosterTitles(storageService.isHidePosterTitlesEnabled());
    };
    window.addEventListener('watchlistUpdated', handleWatchlistChange);
    window.addEventListener('hoverModalSettingUpdated', handleHoverSettingChange);
    window.addEventListener('landscapePosterSettingUpdated', handleLandscapeSettingChange);
    window.addEventListener('hidePosterTitlesSettingUpdated', handleHidePosterTitlesChange);
    return () => {
      window.removeEventListener('watchlistUpdated', handleWatchlistChange);
      window.removeEventListener('hoverModalSettingUpdated', handleHoverSettingChange);
      window.removeEventListener('landscapePosterSettingUpdated', handleLandscapeSettingChange);
      window.removeEventListener('hidePosterTitlesSettingUpdated', handleHidePosterTitlesChange);
    };
  }, [movie.id]);

  useEffect(() => {
    if (effectiveIsLandscape) {
      let isCancelled = false;
      tmdbService.getEnglishLandscapeAssets(movie.id, type === 'tv' ? 'tv' : 'movie').then(({ backdrop, logo }) => {
        if (!isCancelled) {
          if (backdrop) setEnBackdrop(backdrop);
          if (logo) setEnLogo(logo);
        }
      });
      return () => {
        isCancelled = true;
      };
    }
  }, [movie.id, effectiveIsLandscape, type]);

  const handleToggleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const added = storageService.toggleWatchlist(movie);
    setIsInWatchlist(added);
  };

  const handleWatchNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const disableStreaming = import.meta.env.VITE_DISABLE_STREAMING === 'true';
    if (!disableStreaming) {
      if (type === 'tv') {
        const sNum = movie.season_number || 1;
        const eNum = movie.episode_number || 1;
        navigate(`/watch/tv/${movie.id}/${sNum}/${eNum}`);
      } else {
        navigate(`/watch/movie/${movie.id}`);
      }
    } else {
      navigate(`/${type}/${movie.id}`);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    const disableStreaming = import.meta.env.VITE_DISABLE_STREAMING === 'true';
    if (effectiveIsLandscape && !disableStreaming && (movie as any).updated_at) {
      if (type === 'tv' && movie.season_number && movie.episode_number) {
        navigate(`/watch/tv/${movie.id}/${movie.season_number}/${movie.episode_number}`);
        return;
      } else if (type === 'movie') {
        navigate(`/watch/movie/${movie.id}`);
        return;
      }
    }
    navigate(`/${type}/${movie.id}`);
  };

  const handleMouseEnter = () => {

    if (!hoverModalEnabled) return;

    if (window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.innerWidth < 768) return;

    if (cardRef.current) {
      const currentRect = cardRef.current.getBoundingClientRect();
      setRect(currentRect);
      const isCloseToLeft = currentRect.left < 130;
      const isCloseToRight = window.innerWidth - currentRect.right < 130;
      if (isCloseToLeft) setOrigin('left');
      else if (isCloseToRight) setOrigin('right');
      else setOrigin('center');
    }

    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(async () => {
      setIsHovered(true);
      if (!details) {
        try {
          const data = type === 'movie'
            ? await tmdbService.getMovieDetails(movie.id)
            : await tmdbService.getTVDetails(movie.id);
          setDetails(data);
        } catch (e) {}
      }
    }, 260);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
  };

  useEffect(() => {
    if (isHovered) {

      window.addEventListener('scroll', handleMouseLeave, true);
      return () => window.removeEventListener('scroll', handleMouseLeave, true);
    }
  }, [isHovered]);

  const getRating = () => {
    if (!details) return 'U/A 16+';
    if (type === 'tv' && details.content_ratings) {
      const r = details.content_ratings.results.find((c: any) => c.iso_3166_1 === 'IN' || c.iso_3166_1 === 'US');
      return r?.rating || 'U/A 16+';
    } else if (type === 'movie' && details.release_dates) {
      const r = details.release_dates.results.find((c: any) => c.iso_3166_1 === 'IN' || c.iso_3166_1 === 'US');
      return r?.release_dates[0]?.certification || 'U/A 16+';
    }
    return 'U/A 16+';
  };

  const renderBadge = () => {
    if (!badge) return null;
    return (
      <div className={`absolute ${badgeType === 'language' ? 'bottom-2 left-2' : 'top-2 left-2'} px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider z-10 ${
        badgeType === 'episodes' ? 'bg-white text-black shadow-lg font-black' :
        badgeType === 'new' ? 'bg-white text-black shadow-lg font-black' :
        'badge-glass text-white'
      }`}>
        {badge}
      </div>
    );
  };

  const getPortalStyle = () => {
    if (!rect) return {};

    const isDesktop = window.innerWidth >= 768;
    const cardWidth = isDesktop ? Math.min(300, Math.max(260, rect.width * 1.25)) : rect.width * 1.05;
    const estimatedHeight = isDesktop ? cardWidth * 1.16 : 330;

    let top = rect.top - (estimatedHeight - rect.height) / 2;
    if (top < 24) {
      top = 24;
    } else if (top + estimatedHeight > window.innerHeight - 24) {
      top = Math.max(24, window.innerHeight - estimatedHeight - 24);
    }

    let left = rect.left + (rect.width - cardWidth) / 2;
    if (origin === 'left') {
      left = Math.max(16, rect.left);
    } else if (origin === 'right') {
      left = Math.min(window.innerWidth - cardWidth - 16, rect.right - cardWidth);
    }

    if (left < 16) {
      left = 16;
    } else if (left + cardWidth > window.innerWidth - 16) {
      left = window.innerWidth - cardWidth - 16;
    }

    return { top, left, width: cardWidth };
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
      return;
    }
    navigate(`/${type}/${movie.id}`);
  };

  return (
    <div
      ref={cardRef}
      className={`relative ${effectiveIsLandscape ? 'flex flex-col' : 'aspect-[2/3]'} cursor-pointer group/card ${className.includes('w-') ? '' : 'shrink-0'} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >

      <div className={`w-full ${effectiveIsLandscape ? 'aspect-video' : 'h-full'} card-glass-debossed relative overflow-hidden`}>
        <PosterImage
          src={getImageUrl(effectiveIsLandscape ? (enBackdrop || movie.backdrop_path || movie.poster_path) : movie.poster_path, effectiveIsLandscape ? 'w780' : 'w500')}
          alt={title}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {effectiveIsLandscape && !enBackdrop && enLogo && (
          <div className="absolute inset-0 flex items-end justify-center px-4 pb-3 sm:pb-4 pt-10 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none">
            <img
              src={getImageUrl(enLogo, 'w500')}
              alt={title}
              className="max-h-[46%] max-w-[76%] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] transition-transform duration-300 group-hover/card:scale-105"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        {renderBadge()}
        {effectiveIsLandscape && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover/card:opacity-100 transition-opacity">
            <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-current drop-shadow-xl" />
          </div>
        )}
        {effectiveIsLandscape && (movie as any).updated_at && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
            <div className="h-full bg-accent rounded-r-full" style={{ width: '40%' }} />
          </div>
        )}
      </div>
      {effectiveIsLandscape && !hidePosterTitles && (
        <div className="mt-2.5 px-0.5 w-full">
          <h3 className="text-xs md:text-sm font-semibold text-white/90 truncate group-hover/card:text-accent transition-colors">
            {title}
          </h3>
          {type === 'tv' && movie.season_number && movie.episode_number && (
            <span className="text-[10px] font-bold text-accent/80 truncate block mt-0.5">
              S{movie.season_number} E{movie.episode_number} {movie.episode_name ? `• ${movie.episode_name}` : ''}
            </span>
          )}
        </div>
      )}

      {createPortal(
        <AnimatePresence>
          {isHovered && rect && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="fixed z-[100] liquid-dock rounded-2xl border border-white/20 shadow-[0_32px_80px_rgba(0,0,0,0.95)] overflow-hidden cursor-pointer block outline-none select-none"
              style={{
                ...getPortalStyle(),
                transformOrigin: origin === 'left' ? 'left center' : origin === 'right' ? 'right center' : 'center center'
              }}
              onMouseLeave={handleMouseLeave}
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                setIsHovered(true);
              }}
              onClick={handleDetailsClick}
            >
              <div className="relative aspect-video w-full group/modalposter overflow-hidden">
                <PosterImage
                  src={getImageUrl(movie.backdrop_path || movie.poster_path, 'w500')}
                  alt={title}
                  className="w-full h-full object-cover"
                />

                {details?.images?.logos?.length > 0 ? (
                  <div className="absolute inset-x-0 bottom-3 flex justify-center z-10 px-4 pointer-events-none">
                    <LazyImage
                      src={getImageUrl(details.images.logos.find((l:any)=>l.iso_639_1==='en')?.file_path || details.images.logos[0].file_path, 'w500')}
                      className="max-h-12 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="absolute inset-x-0 bottom-3 flex justify-center z-10 px-4 pointer-events-none">
                    <h4 className="text-sm md:text-base font-black text-white text-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] leading-tight text-balance">{title}</h4>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent pointer-events-none" />
              </div>

              <div className="p-4 pt-2.5">
                <div className="flex items-center gap-2 w-full mb-3">
                  <button
                    onClick={handleWatchNow}
                    className="btn-beveled-solid anim-btn flex items-center justify-center gap-2 flex-1 h-9 rounded-xl font-bold cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current text-[#09090b] translate-x-0.5" />
                    <span className="text-xs">Watch Now</span>
                  </button>
                  <button
                    onClick={handleToggleWatchlist}
                    title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                    className={`btn-glass-beveled anim-btn flex items-center justify-center w-9 h-9 rounded-xl shrink-0 cursor-pointer ${
                      isInWatchlist ? 'active text-accent border-white/30' : ''
                    }`}
                    aria-label="Toggle Watchlist"
                  >
                    {isInWatchlist ? <CheckmarkCircle02Icon className="w-4.5 h-4.5 text-accent" /> : <Plus className="w-4.5 h-4.5 text-white" />}
                  </button>
                  <button
                    onClick={handleDetailsClick}
                    title="View Details"
                    className="btn-glass-beveled anim-btn flex items-center justify-center w-9 h-9 rounded-xl shrink-0 cursor-pointer"
                    aria-label="View Details"
                  >
                    <InfoIcon className="w-4.5 h-4.5 text-white/80" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-2 text-[10px] md:text-[11px] font-semibold text-white/80 flex-wrap leading-none">
                  {(movie.release_date || movie.first_air_date) && (
                    <span className="tabular-nums">{new Date(movie.release_date || movie.first_air_date).getFullYear()}</span>
                  )}
                  <span className="w-1 h-1 bg-white/30 rounded-full" />
                  <span className="glass-debossed px-1.5 py-0.5 rounded text-[8px] md:text-[9px] uppercase tracking-wider text-white/90">{getRating()}</span>
                  <span className="w-1 h-1 bg-white/30 rounded-full" />
                  <span className="tabular-nums">
                    {type === 'tv'
                      ? `${details?.number_of_seasons || 1} Season${(details?.number_of_seasons || 1) > 1 ? 's' : ''}`
                      : (details?.runtime ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m` : '')}
                  </span>
                </div>

                {details?.genres?.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                    {details.genres.slice(0, 3).map((g: any) => (
                      <span key={g.id} className="badge-glass px-2 py-0.5 rounded-full text-[9px] font-semibold text-white/75">
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-[11px] text-white/55 line-clamp-2 leading-relaxed text-pretty">
                  {details?.overview}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
});

interface MovieRowProps {
  title: string;
  movies: Movie[];
  isLandscape?: boolean;
  fetchNextPage?: (page: number) => Promise<Movie[]>;
}

export const MovieRow: React.FC<MovieRowProps> = ({ title, movies: initialMovies, isLandscape, fetchNextPage }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [landscapeSetting, setLandscapeSetting] = useState(() => storageService.isLandscapePosterEnabled());
  const [hideTitlesSetting, setHideTitlesSetting] = useState(() => storageService.isHidePosterTitlesEnabled());

  useEffect(() => {
    const handleLandscapeSetting = () => setLandscapeSetting(storageService.isLandscapePosterEnabled());
    const handleHidePosterTitles = () => setHideTitlesSetting(storageService.isHidePosterTitlesEnabled());
    window.addEventListener('landscapePosterSettingUpdated', handleLandscapeSetting);
    window.addEventListener('hidePosterTitlesSettingUpdated', handleHidePosterTitles);
    return () => {
      window.removeEventListener('landscapePosterSettingUpdated', handleLandscapeSetting);
      window.removeEventListener('hidePosterTitlesSettingUpdated', handleHidePosterTitles);
    };
  }, []);

  const rowIsLandscape = isLandscape === true || landscapeSetting;

  useEffect(() => {
    setMovies(initialMovies);
  }, [initialMovies]);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 6);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  }, []);

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
  }, [movies, checkScroll]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left'
        ? scrollLeft - clientWidth * 0.8
        : scrollLeft + clientWidth * 0.8;

      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const onScroll = async () => {
    checkScroll();
    if (!scrollRef.current || !fetchNextPage || loading || !hasMore) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

    if (scrollLeft + clientWidth >= scrollWidth - 200) {
      setLoading(true);
      try {
        const nextPage = page + 1;
        const nextMovies = await fetchNextPage(nextPage);

        if (nextMovies.length === 0) {
          setHasMore(false);
        } else {
          setMovies(prev => [...prev, ...nextMovies]);
          setPage(nextPage);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
  };

  const onWheelCapture = (e: React.WheelEvent<HTMLDivElement>) => {

    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.stopPropagation();
    }

  };

  return (
    <div
      className="py-1.5 md:py-2.5 group/row relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-2 md:mb-3 px-4 md:px-6">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight text-balance">{title}</h2>
      </div>

      <div className="relative">
        <div className={`absolute inset-y-0 left-0 w-16 sm:w-24 md:w-32 lg:w-40 bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none transition-opacity duration-300 ${showLeft ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute inset-y-0 right-0 w-16 sm:w-24 md:w-32 lg:w-40 bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none transition-opacity duration-300 ${showRight ? 'opacity-100' : 'opacity-0'}`} />
        <AnimatePresence>
          {isHovered && window.innerWidth >= 768 && (
            <>
              {showLeft && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => handleScroll('left')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 z-30 flex items-center justify-center btn-glass-beveled rounded-full text-white shadow-xl group/btn cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-6 h-6 text-white group-hover/btn:scale-110 transition-transform" />
                </motion.button>
              )}
              {showRight && (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={() => handleScroll('right')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 z-30 flex items-center justify-center btn-glass-beveled rounded-full text-white shadow-xl group/btn cursor-pointer"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-6 h-6 text-white group-hover/btn:scale-110 transition-transform" />
                </motion.button>
              )}
            </>
          )}
        </AnimatePresence>

        <div
          ref={scrollRef}
          onScroll={onScroll}
          onWheel={onWheelCapture}
          className="flex gap-2 sm:gap-2.5 md:gap-3 overflow-x-auto overscroll-x-contain no-scrollbar px-4 md:px-6 py-2.5 md:py-3.5"
        >
          {movies.map((movie, index) => {
            let badge;
            let badgeType: 'new' | 'episodes' | 'language' | undefined;
            const appName = import.meta.env.VITE_APP_NAME || 'mjland';
            if (title === `${appName} Specials`) {
              if (index % 3 === 0) {
                badge = 'New Episodes';
                badgeType = 'episodes';
              } else if (index % 3 === 1) {
                badge = 'New Release';
                badgeType = 'new';
              }
            } else if (title === `New on ${appName}` && index === 0) {
              badge = 'Tamil';
              badgeType = 'language';
            }

            const isTrendingRow = title.toLowerCase().includes('trending');

            return (
              <div
                key={`${movie.id}-${index}`}
                className={`flex items-end shrink-0 relative group/trendingItem ${isTrendingRow && index === 0 ? 'pl-1 sm:pl-2' : ''}`}
              >
                {isTrendingRow && index < 10 && (
                  <div className={`relative z-0 select-none pointer-events-none ${index === 9 ? '-mr-8 sm:-mr-11 md:-mr-13' : '-mr-5 sm:-mr-7 md:-mr-9'} ${rowIsLandscape && !hideTitlesSetting ? 'mb-6 sm:mb-7' : 'mb-0'} shrink-0 overflow-visible`}>
                    <span
                      className={`${rowIsLandscape ? 'text-7xl sm:text-8xl md:text-9xl' : 'text-8xl sm:text-9xl md:text-[10rem]'} font-black tracking-tight leading-none select-none inline-block pl-1 pr-1`}
                      style={{
                        color: '#08080a',
                        WebkitTextFillColor: '#08080a',
                        WebkitTextStroke: '2.5px rgba(255, 255, 255, 0.55)',
                        paintOrder: 'stroke fill',
                        filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.95))'
                      }}
                    >
                      {index + 1}
                    </span>
                  </div>
                )}
                <MovieCard
                  movie={movie}
                  isLandscape={rowIsLandscape}
                  className={`relative z-10 flex-none shadow-[0_12px_28px_rgba(0,0,0,0.85)] ${rowIsLandscape ? 'w-64 sm:w-72 md:w-80 lg:w-[340px]' : 'w-[140px] sm:w-[155px] md:w-[175px]'}`}
                  badge={badge}
                  badgeType={badgeType}
                />
              </div>
            );
          })}
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className={`flex-none ${rowIsLandscape ? 'w-64 sm:w-72 md:w-80 lg:w-[340px] aspect-video' : 'w-[140px] sm:w-[155px] md:w-[175px] aspect-[2/3]'} rounded-2xl bg-white/5 animate-pulse`} />
          ))}
        </div>
      </div>
    </div>
  );
};
