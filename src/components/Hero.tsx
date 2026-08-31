import React, { useState, useEffect, useRef } from 'react';
import { 
  PlayIcon as PlayRegular, 
  PauseIcon as PauseRegular, 
  Add01Icon as AddRegular, 
  VolumeHighIcon as Speaker2Regular, 
  VolumeOffIcon as SpeakerOffRegular, 
  ArrowRight01Icon as ChevronRightRegular, 
  CheckmarkCircle02Icon as CheckmarkRegular 
} from 'hugeicons-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { getImageUrl, tmdbService } from '../services/tmdbService';
import { storageService } from '../services/storageService';
import { PosterImage } from './PosterImage';
import { LazyImage } from './LazyImage';
import { ImdbBadge } from './ImdbBadge';
import { MpaaBadge } from './MpaaBadge';

interface HeroProps {
  movies: Movie[];
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const getLanguageName = (code: string) => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) || code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
};

export const Hero = ({ movies }: HeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [parentalRating, setParentalRating] = useState<string>('U/A 13+');
  const [genres, setGenres] = useState<string[]>([]);
  const [language, setLanguage] = useState<string>('English');
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const playerRef = useRef<any>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const disableStreaming = import.meta.env.VITE_DISABLE_STREAMING === 'true';

  const navigate = useNavigate();
  const currentMovie = movies[currentIndex];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        setCurrentIndex((prev) => (prev - 1 + Math.min(movies.length, 10)) % Math.min(movies.length, 10));
      }
    }
    touchStartX.current = null;
  };

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const isOffScreen = rect.bottom < 200; 
      
      if (isOffScreen && !isPaused) {
        setIsPaused(true);
        if (playerRef.current && playerRef.current.pauseVideo) {
          playerRef.current.pauseVideo();
        }
      } else if (!isOffScreen && isPaused) {
        setIsPaused(false);
        if (playerRef.current && playerRef.current.playVideo) {
          playerRef.current.playVideo();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPaused]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.min(movies.length, 10));
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === 0) {
      nextSlide();
    } else if (event.data === 1) {
      setShowVideo(true);
    }
  };

  const initPlayer = (key: string) => {
    if (!window.YT || !window.YT.Player || !videoContainerRef.current) return;

    try {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    } catch (e) {}

    videoContainerRef.current.innerHTML = '';
    const ytNode = document.createElement('div');
    videoContainerRef.current.appendChild(ytNode);

    playerRef.current = new window.YT.Player(ytNode, {
      width: '100%',
      height: '100%',
      videoId: key,
      playerVars: {
        autoplay: 1,
        mute: isMuted ? 1 : 0,
        controls: 0,
        showinfo: 0,
        rel: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        disablekb: 1,
        fs: 0,
        loop: 1,
        playlist: key,
        origin: window.location.origin,
      },
      events: {
        onReady: (event: any) => {
          event.target.playVideo();
        },
        onStateChange: onPlayerStateChange,
      },
    });
  };

  useEffect(() => {
    if (!currentMovie) return;

    const updateWatchlistStatus = () => {
      setIsInWatchlist(storageService.isInWatchlist(currentMovie.id));
    };

    updateWatchlistStatus();
    window.addEventListener('watchlistUpdated', updateWatchlistStatus);

    const fetchExtraData = async () => {
      try {
        setImageLoaded(false);
        setShowVideo(false);
        const details = currentMovie.media_type === 'tv' 
          ? await tmdbService.getTVDetails(currentMovie.id)
          : await tmdbService.getMovieDetails(currentMovie.id);
        
        const logo = details.images?.logos?.find((l: any) => l.iso_639_1 === 'en') || details.images?.logos?.[0];
        setLogoUrl(logo ? getImageUrl(logo.file_path, 'original') : null);

        const vids = details.videos?.results?.filter((v: any) => v.site === 'YouTube' && !v.name.toLowerCase().includes('short') && !v.name.toLowerCase().includes('clip')) || [];
        const trailer = vids.find((v: any) => v.type === 'Trailer' && v.official) || vids.find((v: any) => v.type === 'Trailer') || vids[0];
        setVideoKey(trailer?.key || null);

        let rating = 'U/A 13+';
        if (currentMovie.media_type === 'tv') {
          const r = details.content_ratings?.results?.find((c: any) => c.iso_3166_1 === 'IN' || c.iso_3166_1 === 'US');
          if (r) rating = r.rating;
        } else {
          const r = details.release_dates?.results?.find((c: any) => c.iso_3166_1 === 'IN' || c.iso_3166_1 === 'US');
          if (r && r.release_dates?.[0]?.certification) rating = r.release_dates[0].certification;
        }
        setParentalRating(rating || 'U/A 13+');

        setLanguage(getLanguageName(details.original_language));

        setGenres(details.genres.map((g: any) => g.name).slice(0, 4));

      } catch (error) {
      }
    };

    fetchExtraData();

    return () => {
      window.removeEventListener('watchlistUpdated', updateWatchlistStatus);
      if (videoTimerRef.current) clearTimeout(videoTimerRef.current);
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [currentIndex, currentMovie]);

  useEffect(() => {
    if (imageLoaded) {
      if (videoTimerRef.current) clearTimeout(videoTimerRef.current);
      
      const isMobile = window.innerWidth < 768;
      const interval = isMobile ? 4000 : 10000;

      if (videoKey && !isMobile) {
        videoTimerRef.current = setTimeout(() => {
          initPlayer(videoKey);
          
          setTimeout(() => {
            if (playerRef.current && playerRef.current.getPlayerState() !== 1) {
              nextSlide();
            }
          }, 6000);
        }, 4000);
      } else {
        videoTimerRef.current = setTimeout(() => {
          nextSlide();
        }, interval);
      }
    }
  }, [imageLoaded, videoKey]);

  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      if (isMuted) playerRef.current.mute();
      else playerRef.current.unMute();
    }
  }, [isMuted]);

  const toggleWatchlist = () => {
    if (isInWatchlist) {
      storageService.removeFromWatchlist(currentMovie.id);
      setIsInWatchlist(false);
    } else {
      storageService.addToWatchlist(currentMovie);
      setIsInWatchlist(true);
    }
  };

  const handleWatchNow = () => {
    storageService.addToContinueWatching(currentMovie);
    const type = currentMovie.media_type || (currentMovie.title ? 'movie' : 'tv');
    navigate(`/${type}/${currentMovie.id}`);
  };

  if (!currentMovie) return null;

  return (
    <section 
      ref={heroRef} 
      className="relative h-[65vh] md:h-[85vh] min-h-[480px] md:min-h-[640px] max-h-[880px] w-full overflow-hidden bg-bg"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence>
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <LazyImage
            src={getImageUrl(currentMovie.backdrop_path, 'original')}
            alt={currentMovie.title || currentMovie.name}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover will-change-opacity ${showVideo && !isPaused ? 'opacity-0' : 'opacity-100'}`}
            referrerPolicy="no-referrer"
            loading="eager"
          />

          <div className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden transition-opacity duration-300 z-0 ${showVideo && !isPaused ? 'opacity-100' : 'opacity-0'}`}>
            <div 
              ref={videoContainerRef} 
              className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:object-cover [&>iframe]:scale-125 md:[&>iframe]:scale-110 [&>iframe]:pointer-events-none" 
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-bg/80 via-transparent to-bg z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg/60 via-bg/20 to-transparent md:w-3/5 z-10" />
          <div className="absolute inset-0 bg-black/40 md:bg-black/20 z-10" />

          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 md:hidden flex items-center justify-center">
            <span className="text-xl font-black tracking-tighter text-white drop-shadow-2xl">
              {import.meta.env.VITE_APP_NAME || 'mjland'}
            </span>
          </div>

          <div className="absolute inset-0 flex flex-col justify-end px-4 md:px-8 lg:px-12 pt-16 md:pt-8 pb-8 md:pb-24 max-w-2xl lg:max-w-3xl z-20">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center md:items-start text-center md:text-left"
            >
              <div className="mb-2 md:mb-4 flex items-end justify-center md:justify-start w-full">
                {logoUrl ? (
                  <LazyImage src={logoUrl} alt="Logo" className="max-h-[85px] md:max-h-[130px] max-w-[240px] md:max-w-[380px] object-contain drop-shadow-2xl" referrerPolicy="no-referrer" />
                ) : (
                  <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-white drop-shadow-2xl">
                    {currentMovie.title || currentMovie.name}
                  </h1>
                )}
              </div>

              <div className="md:hidden flex flex-col items-center gap-2 mb-3 w-full">
                <div className="flex items-center justify-center flex-wrap gap-2.5 text-xs font-semibold text-white/90">
                  <div className="flex items-center gap-2">
                    <ImdbBadge rating={currentMovie.vote_average} />
                    <MpaaBadge rating={parentalRating} />
                  </div>
                </div>
                
                <div className="flex items-center justify-center flex-wrap gap-2 text-xs font-semibold text-white/90">
                  <div className="flex items-center gap-2">
                    {genres.slice(0, 3).map((genre, idx) => (
                      <React.Fragment key={genre}>
                        <span>{genre}</span>
                        {idx < genres.slice(0, 3).length - 1 && <span className="text-white/40">•</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-[12px] md:text-[13px] font-medium text-[#a3a3a3] mb-4 leading-snug max-w-lg line-clamp-3 drop-shadow-lg text-center md:text-left px-2 md:px-0">
                {currentMovie.overview}
              </p>

              <div className="hidden md:flex items-center gap-3 text-xs font-bold text-white mb-3">
                <div className="flex items-center gap-2">
                  <ImdbBadge rating={currentMovie.vote_average} />
                  <MpaaBadge rating={parentalRating} />
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 text-xs font-bold mb-6 text-white drop-shadow-md">
                {genres.map((genre, idx) => (
                  <React.Fragment key={genre}>
                    <span>{genre}</span>
                    {idx < genres.length - 1 && <span className="text-white/40">•</span>}
                  </React.Fragment>
                ))}
              </div>

              <div className="flex items-center gap-3 w-full justify-center md:justify-start">
                <button 
                  onClick={handleWatchNow}
                  className="btn-beveled-solid anim-btn flex items-center justify-center gap-2 px-6 md:px-10 h-[48px] rounded-lg font-bold flex-1 md:flex-none max-w-[280px] md:max-w-none"
                >
                  <PlayRegular className="w-5 h-5 fill-current text-[#0f1014]" />
                  <span className="text-[15px]">{disableStreaming ? 'View Details' : 'Watch Now'}</span>
                </button>
                <button 
                  onClick={toggleWatchlist}
                  className={`btn-glass-beveled anim-btn flex items-center justify-center w-[48px] h-[48px] rounded-lg`}
                >
                  {isInWatchlist ? <CheckmarkRegular className="w-6 h-6" /> : <AddRegular className="w-6 h-6" />}
                </button>
              </div>
            </motion.div>

            <div className="flex md:hidden items-center justify-center gap-1.5 mt-4">
              {movies.slice(0, 8).map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/30'}`}
                />
              ))}
            </div>
          </div>

          {showVideo && (
            <div className="hidden md:flex absolute right-6 bottom-1/3 flex-col gap-3 z-30 transition-opacity duration-500">
              <button 
                onClick={() => {
                  setIsPaused(!isPaused);
                  if (playerRef.current) {
                    if (isPaused) playerRef.current.playVideo();
                    else playerRef.current.pauseVideo();
                  }
                }}
                className="anim-icon w-10 h-10 glass rounded-full flex items-center justify-center text-white shadow-lg"
              >
                {isPaused ? <PlayRegular className="w-4 h-4 ml-0.5" /> : <PauseRegular className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="anim-icon w-10 h-10 glass rounded-full flex items-center justify-center text-white shadow-lg"
              >
                {isMuted ? <SpeakerOffRegular className="w-4 h-4" /> : <Speaker2Regular className="w-4 h-4" />}
              </button>
            </div>
          )}

          <div className="hidden md:flex absolute right-6 bottom-8 items-center z-30 group/thumbs">
            <div className="relative w-[432px]">
              <div 
                className="flex gap-2 transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${Math.max(0, currentIndex - 4) * 88}px)` }}
              >
                {movies.slice(0, 10).map((movie, idx) => {
                  const startIndex = Math.max(0, currentIndex - 4);
                  const isVisible = idx >= startIndex && idx <= startIndex + 4;
                  return (
                    <div 
                      key={movie.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`flex-none relative w-20 aspect-video rounded-md cursor-pointer transition-all duration-300 ${idx === currentIndex ? 'ring-2 ring-white scale-110 z-10 shadow-2xl' : 'hover:opacity-100'} ${isVisible ? (idx === currentIndex ? 'opacity-100' : 'opacity-60') : 'opacity-0 pointer-events-none'}`}
                    >
                      <LazyImage 
                        src={getImageUrl(movie.backdrop_path)} 
                        alt="Next" 
                        className="w-full h-full object-cover rounded-md"
                        referrerPolicy="no-referrer"
                      />
                      {idx === currentIndex && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-md">
                          <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div 
                onClick={nextSlide}
                className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-end pr-1 bg-gradient-to-l from-black/80 via-black/40 to-transparent cursor-pointer opacity-0 group-hover/thumbs:opacity-100 transition-opacity z-20 rounded-r-md"
              >
                <ChevronRightRegular className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>

          {}
          <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center z-30 opacity-40 hover:opacity-100 transition-opacity duration-300">
            <div className="w-[18px] h-[28px] border-[1.5px] border-white/40 rounded-full flex justify-center p-[2px]">
              <motion.div 
                animate={{ y: [0, 8, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-[3px] h-[5px] bg-white/70 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
