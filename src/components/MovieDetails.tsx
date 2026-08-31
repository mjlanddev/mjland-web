import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { MovieDetails as MovieDetailsType, Episode, Movie } from '../types';
import { 
  PlayIcon as Play, 
  Add01Icon as Plus, 
  ArrowRight01Icon as ChevronRight, 
  StarIcon as Star, 
  VolumeHighIcon as Volume2, 
  VolumeOffIcon as VolumeX, 
  CheckmarkCircle02Icon as Check, 
  Cancel01Icon as X, 
  Share01Icon as Share2, 
  Download01Icon as Download, 
  ThumbsUpIcon as ThumbsUp 
} from 'hugeicons-react';
import { motion, AnimatePresence } from 'motion/react';
import { storageService } from '../services/storageService';
import { LoadingSpinner } from './LoadingSpinner';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

import { MovieDetailsMobile } from './MovieDetailsMobile';
import { MovieDetailsDesktop } from './MovieDetailsDesktop';
import { SEO } from './SeoComponent';

const DISABLE_STREAMING = import.meta.env.VITE_DISABLE_STREAMING === 'true';

export const MovieDetails = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const [details, setDetails] = useState<MovieDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'more' | 'trailers'>('more');
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [historyItem, setHistoryItem] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const detailsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWatchlistStatus = () => {
      if (id) {
        setIsInWatchlist(storageService.isInWatchlist(parseInt(id)));
        const history = storageService.getContinueWatching();
        const item = history.find(m => m.id === parseInt(id));
        setHistoryItem(item || null);
      }
    };

    const fetchDetails = async () => {
      if (!id || !type) return;
      setLoading(true);
      setShowTrailer(false);
      try {
        const data = type === 'movie' 
          ? await tmdbService.getMovieDetails(parseInt(id))
          : await tmdbService.getTVDetails(parseInt(id));
        setDetails(data);
        
        updateWatchlistStatus();
        window.addEventListener('watchlistUpdated', updateWatchlistStatus);
        
        if (data.similar?.results?.length > 0) {
          setActiveTab('more');
        } else if (data.videos?.results?.length > 0) {
          setActiveTab('trailers');
        } else {
          setActiveTab('more');
        }

        if (type === 'tv') {
          const seasonData = await tmdbService.getTVSeasonDetails(parseInt(id), 1);
          setEpisodes(seasonData.episodes);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo(0, 0);
    return () => {
      window.removeEventListener('watchlistUpdated', updateWatchlistStatus);
    };
  }, [id, type]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  const trailerKey = (() => {
    if (!details?.videos?.results?.length) return null;
    const vids = details.videos.results.filter(v => v.site === 'YouTube' && !v.name.toLowerCase().includes('short') && !v.name.toLowerCase().includes('clip'));
    const trailer = vids.find(v => v.type === 'Trailer' && v.official) || vids.find(v => v.type === 'Trailer') || vids[0];
    return trailer?.key || null;
  })();

  useEffect(() => {
    if (!trailerKey) return;

    let initTimer: any = null;

    const setupPlayer = () => {
      if (!videoContainerRef.current) return;
      
      try {
        if (playerRef.current) playerRef.current.destroy();
      } catch (e) {}

      videoContainerRef.current.innerHTML = '';
      const ytNode = document.createElement('div');
      videoContainerRef.current.appendChild(ytNode);

      try {
        playerRef.current = new window.YT.Player(ytNode, {
          width: '100%',
          height: '100%',
          videoId: trailerKey,
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
            playlist: trailerKey,
            origin: window.location.origin
          },
          events: {
            onReady: (event: any) => {
              try {
                if (isMuted) event.target.mute();
                else event.target.unMute();
                event.target.playVideo();
              } catch (e) {}
            },
            onStateChange: (event: any) => {
              if (event.data === 1) { 
                setShowTrailer(true);
              }
            }
          }
        });
      } catch (e) {
        console.warn("YouTube player init failed:", e);
      }
    };

    if (!window.YT || !window.YT.Player) {
      const retryTimer = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(retryTimer);
          setupPlayer();
        }
      }, 300);
      return () => clearInterval(retryTimer);
    }

    initTimer = setTimeout(setupPlayer, 600);

    return () => {
      if (initTimer) clearTimeout(initTimer);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (e) {}
      }
    };
  }, [details?.id, isMobile]);

  const wasScrolledRef = useRef(false);
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 300;
      if (isScrolled !== wasScrolledRef.current) {
        wasScrolledRef.current = isScrolled;
        setIsPaused(isScrolled);
        if (playerRef.current) {
          try {
            if (isScrolled) playerRef.current.pauseVideo();
            else playerRef.current.playVideo();
          } catch (e) {}
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMute = (newMuted: boolean) => {
    setIsMuted(newMuted);
    if (playerRef.current) {
      try {
        if (newMuted) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
          playerRef.current.setVolume(100);
        }
      } catch (e) {
        console.warn("Mute toggle failed", e);
      }
    }
  };

  const togglePause = (newPaused: boolean) => {
    setIsPaused(newPaused);
    if (playerRef.current) {
      try {
        if (newPaused) {
          playerRef.current.pauseVideo();
        } else {
          playerRef.current.playVideo();
        }
      } catch (e) {}
    }
  };

  const handleSeasonChange = async (seasonNum: number) => {
    if (!id) return;
    setSelectedSeason(seasonNum);
    try {
      const seasonData = await tmdbService.getTVSeasonDetails(parseInt(id), seasonNum);
      setEpisodes(seasonData.episodes);
    } catch (error) {
    }
  };

  const toggleWatchlist = () => {
    if (!details) return;
    const movie: Movie = {
      ...details,
      media_type: type as 'movie' | 'tv'
    };

    if (isInWatchlist) {
      storageService.removeFromWatchlist(details.id);
      setIsInWatchlist(false);
    } else {
      storageService.addToWatchlist(movie);
      setIsInWatchlist(true);
    }
  };

  const handleSubscribe = () => {
    if (!details) return;

    if (DISABLE_STREAMING) {
      if (trailer) {
        window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
      } else {
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent((details.title || details.name) + ' trailer')}`, '_blank');
      }
      return;
    }

    const movie: Movie = {
      ...details,
      media_type: type as 'movie' | 'tv'
    };
    storageService.addToContinueWatching(movie);
    
    if (type === 'tv') {
      if (historyItem?.season_number && historyItem?.episode_number) {
        navigate(`/watch/tv/${id}/${historyItem.season_number}/${historyItem.episode_number}`);
      } else {
        navigate(`/watch/tv/${id}/1/1`);
      }
    } else {
      navigate(`/watch/movie/${id}`);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!details) return null;

  const year = new Date(details.release_date || details.first_air_date || '').getFullYear();
  const rating = details.vote_average.toFixed(1);
  const duration = details.runtime 
    ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
    : details.number_of_seasons ? `${details.number_of_seasons} Seasons` : '';

  const logo = details.images.logos.find(l => l.iso_639_1 === 'en') || details.images.logos[0];
  const trailer = (() => {
    if (!details?.videos?.results?.length) return null;
    const vids = details.videos.results.filter(v => v.site === 'YouTube' && !v.name.toLowerCase().includes('short') && !v.name.toLowerCase().includes('clip'));
    return vids.find(v => v.type === 'Trailer' && v.official) || vids.find(v => v.type === 'Trailer') || vids[0] || null;
  })();

  const getCertification = () => {
    if (type === 'movie' && details.release_dates) {
      const india = details.release_dates.results.find((r: any) => r.iso_3166_1 === 'IN');
      const us = details.release_dates.results.find((r: any) => r.iso_3166_1 === 'US');
      const result = india || us || details.release_dates.results[0];
      return result?.release_dates[0]?.certification || 'U/A';
    } else if (type === 'tv' && details.content_ratings) {
      const india = details.content_ratings.results.find((r: any) => r.iso_3166_1 === 'IN');
      const us = details.content_ratings.results.find((r: any) => r.iso_3166_1 === 'US');
      const result = india || us || details.content_ratings.results[0];
      return result?.rating || 'U/A';
    }
    return 'U/A';
  };

  const getLanguageName = (code: string) => {
    try {
      return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) || code;
    } catch {
      return code;
    }
  };

  const commonProps = {
    details,
    type,
    id: id!,
    activeTab,
    setActiveTab,
    selectedSeason,
    handleSeasonChange,
    episodes,
    showTrailer,
    isMuted,
    setIsMuted: toggleMute,
    isInWatchlist,
    toggleWatchlist,
    historyItem,
    isPaused,
    setIsPaused: togglePause,
    handleSubscribe,
    year,
    rating,
    duration,
    logo,
    trailer,
    getCertification,
    getLanguageName,
    videoContainerRef,
    navigate,
    disableStreaming: DISABLE_STREAMING
  };

  return (
    <div ref={detailsContainerRef}>
      <SEO 
        title={details?.title || details?.name ? `${details.title || details.name} (${year}) - Watch Free` : "Loading..."}
        description={details?.overview || "Watch free movies and tv shows in HD."}
        image={details ? getImageUrl(details.backdrop_path || details.poster_path, 'original') : undefined}
        type={type === 'tv' ? 'video.tv_show' : 'video.movie'}
      />
      {isMobile ? (
        <MovieDetailsMobile {...commonProps} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      ) : (
        <MovieDetailsDesktop {...commonProps} />
      )}
    </div>
  );
};
