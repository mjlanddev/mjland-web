import React, { useState, useEffect, useRef } from 'react';
import {
  PlayIcon as PlayRegular,
  PauseIcon as PauseRegular,
  Add01Icon as AddRegular,
  VolumeHighIcon as Speaker2Regular,
  VolumeOffIcon as SpeakerOffRegular,
  ArrowRight01Icon as ChevronRightRegular,
  CheckmarkCircle02Icon as CheckmarkRegular,
  InformationCircleIcon as InfoRegular
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
      className="relative h-[75vh] md:h-[85vh] min-h-[460px] md:min-h-[500px] w-full overflow-hidden bg-black rounded-b-3xl md:rounded-3xl md:mx-auto md:max-w-[1600px] md:mt-3 md:border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.85)]"
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

          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent md:w-3/5 z-10" />
          <div className="absolute inset-0 bg-black/30 md:bg-black/10 z-10" />

          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 md:hidden flex items-center justify-center">
            <span className="text-xl font-black tracking-tighter text-white drop-shadow-2xl">
              {import.meta.env.VITE_APP_NAME || 'mjland'}
            </span>
          </div>

          <div className="absolute inset-0 flex flex-col justify-end px-4 md:px-10 lg:px-14 pb-8 md:pb-14 max-w-xl lg:max-w-2xl z-20">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center md:items-start text-center md:text-left"
            >
              <div className="mb-2 md:mb-3 flex items-end justify-center md:justify-start w-full">
                {logoUrl ? (
                  <LazyImage src={logoUrl} alt="Logo" className="max-h-[85px] md:max-h-[120px] max-w-[240px] md:max-w-[360px] object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.9)]" referrerPolicy="no-referrer" />
                ) : (
                  <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-white drop-shadow-[0_6px_20px_rgba(0,0,0,0.9)] text-balance">
                    {currentMovie.title || currentMovie.name}
                  </h1>
                )}
              </div>

              <div className="md:hidden flex flex-col items-center gap-2 mb-3 w-full">
                <div className="flex items-center justify-center flex-wrap gap-2 text-xs font-semibold text-white/90">
                  <ImdbBadge rating={currentMovie.vote_average} />
                  <MpaaBadge rating={parentalRating} />
                  {(currentMovie.release_date || currentMovie.first_air_date) && (
                    <>
                      <span className="text-white/40">•</span>
                      <span className="tabular-nums text-white/80">
                        {new Date(currentMovie.release_date || currentMovie.first_air_date).getFullYear()}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-center flex-wrap gap-1.5 text-xs font-semibold text-white/90">
                  {genres.slice(0, 3).map((genre) => (
                    <span key={genre} className="badge-glass px-2 py-0.5 rounded-full text-[10px]">{genre}</span>
                  ))}
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2.5 text-sm font-semibold text-white mb-3">
                <ImdbBadge rating={currentMovie.vote_average} />
                <MpaaBadge rating={parentalRating} />
                {(currentMovie.release_date || currentMovie.first_air_date) && (
                  <>
                    <span className="text-white/40">•</span>
                    <span className="tabular-nums text-white/80">
                      {new Date(currentMovie.release_date || currentMovie.first_air_date).getFullYear()}
                    </span>
                  </>
                )}
                {language && (
                  <>
                    <span className="text-white/40">•</span>
                    <span className="text-white/80">
                      {language}
                    </span>
                  </>
                )}
              </div>

              <div className="hidden md:flex items-center gap-2 text-xs font-semibold mb-3.5 text-white/80">
                {genres.map((genre) => (
                  <span key={genre} className="badge-glass px-2.5 py-0.5 rounded-full">{genre}</span>
                ))}
              </div>

              <p className="text-xs md:text-sm font-medium text-white/80 mb-5 leading-relaxed max-w-md md:max-w-lg line-clamp-3 text-center md:text-left px-1 md:px-0 text-pretty drop-shadow-md">
                {currentMovie.overview}
              </p>

              <div className="flex items-center gap-3 w-full justify-center md:justify-start">
                <button
                  onClick={handleWatchNow}
                  className="btn-beveled-solid anim-btn flex items-center justify-center gap-2.5 px-7 md:px-9 h-12 rounded-2xl font-bold flex-1 md:flex-none max-w-[280px] md:max-w-none cursor-pointer shadow-2xl"
                >
                  <PlayRegular className="w-5 h-5 fill-current text-[#09090b] translate-x-0.5" />
                  <span className="text-sm md:text-[15px]">{disableStreaming ? 'View Details' : 'Watch Now'}</span>
                </button>
                <button
                  onClick={toggleWatchlist}
                  title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                  className={`btn-glass-beveled anim-btn flex items-center justify-center w-12 h-12 rounded-2xl cursor-pointer ${
                    isInWatchlist ? 'active text-accent border-white/30' : ''
                  }`}
                  aria-label="Toggle Watchlist"
                >
                  {isInWatchlist ? <CheckmarkRegular className="w-5 h-5 text-accent" /> : <AddRegular className="w-5 h-5 text-white" />}
                </button>
                <button
                  onClick={() => {
                    const type = currentMovie.media_type || (currentMovie.title ? 'movie' : 'tv');
                    navigate(`/${type}/${currentMovie.id}`);
                  }}
                  title="More Details"
                  className="btn-glass-beveled anim-btn hidden sm:flex items-center justify-center w-12 h-12 rounded-2xl cursor-pointer"
                  aria-label="More Details"
                >
                  <InfoRegular className="w-5 h-5 text-white/85" />
                </button>
              </div>
            </motion.div>

            <div className="flex md:hidden items-center justify-center gap-1.5 mt-4">
              {movies.slice(0, 8).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/20'}`}
                />
              ))}
            </div>
          </div>

          {showVideo && (
            <div className="hidden md:flex absolute right-8 bottom-1/3 flex-col gap-3 z-30 transition-opacity duration-500">
              <button
                onClick={() => {
                  setIsPaused(!isPaused);
                  if (playerRef.current) {
                    if (isPaused) playerRef.current.playVideo();
                    else playerRef.current.pauseVideo();
                  }
                }}
                className="btn-glass-beveled anim-icon w-10 h-10 rounded-full flex items-center justify-center text-white cursor-pointer"
                aria-label="Pause or resume hero video"
              >
                {isPaused ? <PlayRegular className="w-4 h-4 ml-0.5" /> : <PauseRegular className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="btn-glass-beveled anim-icon w-10 h-10 rounded-full flex items-center justify-center text-white cursor-pointer"
                aria-label="Mute or unmute hero video"
              >
                {isMuted ? <SpeakerOffRegular className="w-4 h-4" /> : <Speaker2Regular className="w-4 h-4" />}
              </button>
            </div>
          )}

          <div className="hidden md:flex absolute right-8 bottom-10 items-center z-30 group/thumbs">
            <div className="glass-debossed p-2 rounded-2xl relative w-[440px] shadow-[0_20px_48px_rgba(0,0,0,0.8)] overflow-hidden">
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
                      className={`flex-none relative w-20 aspect-video rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                        idx === currentIndex
                          ? 'ring-1.5 ring-white -translate-y-0.5 z-10 shadow-lg'
                          : 'hover:opacity-100 opacity-60'
                      } ${isVisible ? '' : 'pointer-events-none opacity-0'}`}
                    >
                      <LazyImage
                        src={getImageUrl(movie.backdrop_path)}
                        alt="Next"
                        className="w-full h-full object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                      {idx === currentIndex && (
                        <div className="absolute bottom-0 inset-x-0 h-[2.5px] bg-white/30 overflow-hidden rounded-b-xl z-20">
                          <motion.div
                            key={currentIndex}
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: videoKey ? 4 : 10, ease: 'linear' }}
                            className="h-full bg-white"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={nextSlide}
                className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-end pr-2 bg-gradient-to-l from-black/80 via-black/40 to-transparent cursor-pointer opacity-0 group-hover/thumbs:opacity-100 transition-opacity z-20 rounded-r-xl"
                aria-label="Next slide"
              >
                <ChevronRightRegular className="w-5 h-5 text-white drop-shadow-lg" />
              </button>
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
