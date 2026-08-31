import React, { useState, useEffect, useRef, memo } from 'react';
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
  Loading01Icon as Loader2 
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
  const title = movie.title || movie.name;
  
  const [isHovered, setIsHovered] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(() => storageService.isInWatchlist(movie.id));
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState<'center' | 'left' | 'right'>('center');
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const handleWatchlistChange = () => {
      setIsInWatchlist(storageService.isInWatchlist(movie.id));
    };
    window.addEventListener('watchlistUpdated', handleWatchlistChange);
    return () => window.removeEventListener('watchlistUpdated', handleWatchlistChange);
  }, [movie.id]);

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
    if (isLandscape && !disableStreaming) {
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
    if (window.innerWidth < 768) return; // Disable hover cards on mobile
    
    if (cardRef.current) {
      const currentRect = cardRef.current.getBoundingClientRect();
      setRect(currentRect);
      const isCloseToLeft = currentRect.left < 100;
      const isCloseToRight = window.innerWidth - currentRect.right < 100;
      if (isCloseToLeft) setOrigin('left');
      else if (isCloseToRight) setOrigin('right');
      else setOrigin('center');
    }

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
    }, 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
  };

  useEffect(() => {
    if (isHovered) {
      // Close hover card on any scroll to prevent floating detached cards
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
      <div className={`absolute ${badgeType === 'language' ? 'bottom-1 left-1' : 'top-1 left-1'} px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider shadow-lg z-10 ${
        badgeType === 'episodes' ? 'bg-[#D80073] text-white' : 
        badgeType === 'new' ? 'bg-[#6200EA] text-white' : 
        'bg-black/60 text-white backdrop-blur-sm border border-white/10'
      }`}>
        {badge}
      </div>
    );
  };

  const getPortalStyle = () => {
    if (!rect) return {};
    
    // Scale desktop hover cards to be large and cinematic, keep mobile compact
    const isDesktop = window.innerWidth >= 768;
      // Make hover modal more compact and sleek
      const cardWidth = isDesktop ? Math.min(280, Math.max(260, rect.width * 1.2)) : rect.width * 1.05;
    const estimatedHeight = isDesktop ? cardWidth * 1.15 : 330;
    
    // Ensure top is never clipped off the top of the viewport
    let top = rect.top - (estimatedHeight - rect.height) / 2;
    if (top < 20) {
      top = 20;
    } else if (top + estimatedHeight > window.innerHeight - 20) {
      top = Math.max(20, window.innerHeight - estimatedHeight - 20);
    }

    // Ensure left is never clipped off the sides of the viewport
    let left = rect.left + (rect.width - cardWidth) / 2;
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
      className={`relative ${isLandscape ? 'flex flex-col' : 'aspect-[2/3]'} cursor-pointer group/card shrink-0 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Base Poster */}
      <div className={`w-full ${isLandscape ? 'aspect-video' : 'h-full'} rounded-lg overflow-hidden relative`}>
        <PosterImage
          src={getImageUrl(isLandscape ? (movie.backdrop_path || movie.poster_path) : movie.poster_path, 'w500')}
          alt={title}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        {renderBadge()}
        {isLandscape && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/card:opacity-100 transition-opacity">
            <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-current drop-shadow-lg" />
          </div>
        )}
      </div>
      {isLandscape && (
        <div className="mt-1.5 px-0.5 w-full">
          <h3 className="text-xs md:text-sm font-semibold text-white/90 truncate group-hover/card:text-accent transition-colors">
            {title}
          </h3>
          {type === 'tv' && movie.season_number && movie.episode_number && (
            <span className="text-[10px] font-bold text-accent/80 truncate block">
              S{movie.season_number} E{movie.episode_number} {movie.episode_name ? `• ${movie.episode_name}` : ''}
            </span>
          )}
        </div>
      )}

      {/* Hover Card Overlay via Portal to escape overflow-hidden/auto */}
      {createPortal(
        <AnimatePresence>
          {isHovered && rect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed z-[100] bg-[#0f1014] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden cursor-pointer block outline-none origin-center"
              style={getPortalStyle()}
              onMouseLeave={handleMouseLeave}
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                setIsHovered(true);
              }}
              onClick={handleDetailsClick}
            >
              <div className="relative aspect-video w-full group/modalposter">
                <PosterImage
                  src={getImageUrl(movie.backdrop_path || movie.poster_path, 'w500')}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                
                {}
                {details?.images?.logos?.length > 0 ? (
                  <div className="absolute inset-x-0 bottom-3 flex justify-center z-10 px-4 pointer-events-none">
                    <LazyImage 
                      src={getImageUrl(details.images.logos.find((l:any)=>l.iso_639_1==='en')?.file_path || details.images.logos[0].file_path, 'w500')} 
                      className="max-h-12 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="absolute inset-x-0 bottom-3 flex justify-center z-10 px-4 pointer-events-none">
                    <h4 className="text-sm md:text-base font-black text-white text-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] leading-tight">{title}</h4>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/20 to-transparent opacity-100 pointer-events-none" />
              </div>
              
              <div className="p-4 pt-2">
                <div className="flex items-center gap-2.5 w-full mb-3.5">
                  <button 
                    onClick={handleWatchNow}
                    className="btn-beveled-solid flex items-center justify-center gap-2 flex-1 h-9 rounded-md font-bold cursor-pointer transition-all active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current text-[#0f1014]" />
                    <span className="text-[12px] md:text-[13px]">Watch Now</span>
                  </button>
                  <button 
                    onClick={handleToggleWatchlist}
                    title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                    className={`btn-glass-beveled flex items-center justify-center w-9 h-9 rounded-md shrink-0 cursor-pointer transition-all active:scale-90 ${
                      isInWatchlist ? 'active text-emerald-400 border-emerald-400/30' : ''
                    }`}
                  >
                    {isInWatchlist ? <CheckmarkCircle02Icon className="w-4.5 h-4.5 text-emerald-400" /> : <Plus className="w-4.5 h-4.5" />}
                  </button>
                </div>
                
                <div className="flex items-center gap-2 mb-2.5 text-[10px] md:text-[11px] font-semibold text-[#e1e6f0] flex-wrap leading-none opacity-90">
                  <span>{new Date(movie.release_date || movie.first_air_date || '').getFullYear() || ''}</span>
                  <span className="w-0.5 h-0.5 bg-white/40 rounded-full" />
                  <span className="border border-white/20 px-1 py-0.5 rounded text-[8px] md:text-[9px] uppercase tracking-wider">{getRating()}</span>
                  <span className="w-0.5 h-0.5 bg-white/40 rounded-full" />
                  <span>{type === 'tv' ? `${details?.number_of_seasons || 1} Season${details?.number_of_seasons > 1 ? 's' : ''}` : (details?.runtime ? `${Math.floor(details.runtime/60)}h ${details.runtime%60}m` : '')}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-2.5 text-[9px] md:text-[10px] font-medium text-white/70 flex-wrap">
                   {details?.genres?.slice(0, 3)?.map((g: any, i: number) => (
                     <React.Fragment key={g.id}>
                       <span>{g.name}</span>
                       {i < Math.min(2, details.genres.length - 1) && <span className="w-1 h-1 bg-white/30 rounded-full" />}
                     </React.Fragment>
                   ))}
                </div>


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

  useEffect(() => {
    setMovies(initialMovies);
  }, [initialMovies]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 10);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [movies]);

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
      className="py-4 md:py-6 group/row relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-3 px-4 md:px-6">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{title}</h2>
      </div>

      <div className="relative">
        <div className={`absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-bg via-bg/20 to-transparent z-10 pointer-events-none transition-opacity duration-500 ${showLeft ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-bg via-bg/20 to-transparent z-10 pointer-events-none transition-opacity duration-500 ${showRight ? 'opacity-100' : 'opacity-0'}`} />

        <AnimatePresence>
          {isHovered && window.innerWidth >= 768 && (
            <>
              {showLeft && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => handleScroll('left')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 z-20 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-all group/btn"
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 z-20 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-all group/btn"
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
          className="flex gap-3 md:gap-4 overflow-x-auto overscroll-x-contain no-scrollbar px-4 md:px-6 py-4 -my-4"
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
              badge = 'à®¤à®®à®¿à®´à¯';
              badgeType = 'language';
            }

            return (
              <MovieCard 
                key={`${movie.id}-${index}`} 
                movie={movie} 
                isLandscape={isLandscape}
                className={`flex-none ${isLandscape ? 'w-48 sm:w-56 md:w-64' : 'w-[130px] sm:w-[145px] md:w-[170px]'}`}
                badge={badge}
                badgeType={badgeType}
              />
            );
          })}
          {loading && (
            <div className={`flex-none ${isLandscape ? 'w-48 sm:w-56 md:w-64 aspect-video' : 'w-[130px] sm:w-[145px] md:w-[170px] aspect-[2/3]'} flex items-center justify-center bg-white/5 rounded-lg`}>
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
