import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { MovieDetails, Episode } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { storageService } from '../services/storageService';
import {
  ArrowLeft01Icon as ChevronLeft,
  ArrowRight01Icon as ChevronRight,
  ArrowDown01Icon as ChevronDown,
  PlayIcon as Play,
  Share01Icon as Share2,
  Tv01Icon as TvIcon,
  ReloadIcon as RefreshIcon,
  CheckmarkCircle02Icon as CheckIcon,
  ModernTvIcon as TheaterIcon,
  Maximize01Icon as FullscreenIcon,
  Film01Icon as MovieIcon,
  StarIcon as Star,
  Cancel01Icon as CloseIcon
} from 'hugeicons-react';
import { MobileWatchPage } from './MobileWatchPage';
import { LazyImage } from './LazyImage';
import { PosterImage } from './PosterImage';
import { MovieCard } from './MovieRow';
import { ImdbBadge } from './ImdbBadge';
import { MpaaBadge } from './MpaaBadge';
import { SEO } from './SeoComponent';
import { LoadingSpinner } from './LoadingSpinner';
import { Helmet } from 'react-helmet-async';

const defaultServers = [
  { name: "VidLink", tag: "FAST • HD", lang: "English", movie: "https://vidlink.pro/movie/{id}", tv: "https://vidlink.pro/tv/{id}/{season}/{episode}" },
  { name: "Zxcstream", tag: "MULTI • PREFERRED", lang: "Multi", movie: "https://zxcstream.xyz/player/movie/{id}", tv: "https://zxcstream.xyz/player/tv/{id}/{season}/{episode}" },
  { name: "RGSHOWS", tag: "MULTI • INDIAN", lang: "Multi", movie: "https://vidsrc.wtf/api/2/movie/?id={id}", tv: "https://vidsrc.wtf/api/1/tv/?id={id}&s={season}&e={episode}/" },
  { name: "2Embed", tag: "AUTO • STREAM", lang: "English", movie: "https://www.2embed.cc/embed/{id}", tv: "https://www.2embed.cc/embedtv/{id}?s={season}&epi={episode}" },
  { name: "SmashyStream", tag: "FAST • HD", lang: "English", movie: "https://embed.smashystream.com/playere.php?tmdb={id}", tv: "https://embed.smashystream.com/playere.php?tmdb={id}&season={season}&episode={episode}" },
  { name: "FREMBED", tag: "FRENCH • VF", lang: "French", movie: "https://frembed.work/api/film.php?id={id}", tv: "https://frembed.work/api/serie.php?id={id}&sa={season}&epi={episode}" }
];

let parsedServers = defaultServers;
try {
  if (import.meta.env.VITE_SERVERS) {
    parsedServers = JSON.parse(import.meta.env.VITE_SERVERS);
  }
} catch (e) {
  console.error("Failed to parse VITE_SERVERS from env, falling back to default.", e);
}

export const SERVERS = parsedServers;

export const WatchPage = () => {
  const { type = 'movie', id = '', season = '1', episode = '1' } = useParams<{ type: string; id: string; season?: string; episode?: string }>();
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeServer, setActiveServer] = useState(SERVERS[0]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(parseInt(season));
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const [isExpandedDesc, setIsExpandedDesc] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [landscapeSetting, setLandscapeSetting] = useState(() => storageService.isLandscapePosterEnabled());
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleLandscape = () => setLandscapeSetting(storageService.isLandscapePosterEnabled());
    window.addEventListener('landscapePosterSettingUpdated', handleLandscape);
    return () => window.removeEventListener('landscapePosterSettingUpdated', handleLandscape);
  }, []);

  const handleFullscreen = () => {
    const el = iframeRef.current as any;
    if (!el) return;
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.webkitEnterFullscreen) {
      el.webkitEnterFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    }
  };

  const navigate = useNavigate();
  const disableStreaming = import.meta.env.VITE_DISABLE_STREAMING === 'true';

  useEffect(() => {

    if (disableStreaming && id && type) {
      navigate(`/${type}/${id}`, { replace: true });
    }
  }, [disableStreaming, id, type, navigate]);

  useEffect(() => {

    setIsMobile(window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    setSelectedSeason(parseInt(season));
  }, [season]);

  const shareContent = () => {
    const url = window.location.href;
    const title = details?.title || details?.name || 'Watch this on mjland';
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
          try {
            window.screen.orientation.unlock();
          } catch (e) {
            console.warn("Orientation unlock failed:", e);
          }
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (disableStreaming) return;
    const fetchDetails = async () => {
      if (!id || !type) return;
      setLoading(true);
      try {
        const data = type === 'movie'
          ? await tmdbService.getMovieDetails(parseInt(id))
          : await tmdbService.getTVDetails(parseInt(id));
        setDetails(data);

        let epTitle = '';
        let epStill = '';
        if (type === 'tv') {
          const sNum = season ? parseInt(season) : 1;
          const seasonData = await tmdbService.getTVSeasonDetails(parseInt(id), sNum);
          const epList = seasonData.episodes || [];
          setEpisodes(epList);
          const currentEp = epList.find((e: Episode) => e.episode_number === parseInt(episode));
          if (currentEp) {
            epTitle = currentEp.name;
            epStill = currentEp.still_path;
          }
        }

        const continueWatchingData = {
          ...data,
          season_number: season ? parseInt(season) : undefined,
          episode_number: episode ? parseInt(episode) : undefined,
          episode_name: epTitle || undefined,
          episode_still: epStill || undefined,
          media_type: type as 'movie' | 'tv'
        };
        storageService.addToContinueWatching(continueWatchingData);
      } catch (error) {
        console.error('Error loading watch page details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo(0, 0);
  }, [id, type, season, episode, disableStreaming]);

  const handleSeasonChange = async (s: number) => {
    setSelectedSeason(s);
    try {
      const seasonData = await tmdbService.getTVSeasonDetails(parseInt(id), s);
      setEpisodes(seasonData.episodes || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (type === 'tv' && episode && episodes.length > 0) {
      const timeoutId = setTimeout(() => {
        const el = document.getElementById(`episode-${episode}`);
        const container = document.getElementById('episodes-list-container');
        if (el && container) {
          container.scrollTo({
            top: el.offsetTop - container.offsetTop - 16,
            behavior: 'smooth'
          });
        }
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [type, episode, episodes, selectedSeason]);

  const currentEpNum = parseInt(episode);
  const currentEpData = episodes.find(e => e.episode_number === currentEpNum);

  const hasPrevEpisode = type === 'tv' && currentEpNum > 1;
  const hasNextEpisode = type === 'tv' && episodes.length > 0 && currentEpNum < episodes.length;

  const goToPrevEpisode = () => {
    if (hasPrevEpisode) {
      navigate(`/watch/tv/${id}/${season}/${currentEpNum - 1}`);
    }
  };

  const goToNextEpisode = () => {
    if (hasNextEpisode) {
      navigate(`/watch/tv/${id}/${season}/${currentEpNum + 1}`);
    }
  };

  const getPlayerUrl = () => {
    if (!id) return '';
    const template = type === 'movie' ? activeServer.movie : activeServer.tv;
    return template
      .replace('{id}', id)
      .replace('{season}', season || '1')
      .replace('{episode}', episode || '1');
  };

  const reloadPlayer = () => {
    const iframe = document.getElementById('main-video-player') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = getPlayerUrl();
    }
  };

  if (disableStreaming) return null;

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner />
        <span className="text-xs font-semibold text-white/40 tracking-wider uppercase">Loading player...</span>
      </div>
    );
  }

  if (!details) return null;

  if (isMobile) {
    return (
      <MobileWatchPage
        details={details}
        type={type || 'movie'}
        id={id || ''}
        season={season}
        episode={episode}
        activeServer={activeServer}
        setActiveServer={setActiveServer}
        episodes={episodes}
        navigate={navigate}
        shareContent={shareContent}
        getPlayerUrl={getPlayerUrl}
        SERVERS={SERVERS}
        hasPrevEpisode={hasPrevEpisode}
        hasNextEpisode={hasNextEpisode}
        goToPrevEpisode={goToPrevEpisode}
        goToNextEpisode={goToNextEpisode}
        currentEpData={currentEpData}
        handleSeasonChange={handleSeasonChange}
        selectedSeason={selectedSeason}
      />
    );
  }

  const releaseYear = details.release_date ? details.release_date.split('-')[0] : details.first_air_date ? details.first_air_date.split('-')[0] : '';
  const title = details.title || details.name;

  const getCertification = () => {
    if (!details) return '';
    if (type === 'tv' && details.content_ratings) {
      const r = details.content_ratings.results?.find((c: any) => c.iso_3166_1 === 'IN' || c.iso_3166_1 === 'US');
      return r?.rating || '';
    } else if (type === 'movie' && details.release_dates) {
      const r = details.release_dates.results?.find((c: any) => c.iso_3166_1 === 'IN' || c.iso_3166_1 === 'US');
      return r?.release_dates?.[0]?.certification || '';
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-accent/30">
      <SEO
        title={type === 'tv' && currentEpData?.name ? `Watching ${title} - S${season}:E${episode}` : `Watching ${title}`}
        description={`Watch ${title} in HD entirely for free. Stream on any device.`}
        image={getImageUrl(details.backdrop_path || details.poster_path, 'original')}
      />

      <header className="sticky top-0 z-50 w-full h-14 liquid-dock border-b border-white/10 px-4 lg:px-8 flex items-center justify-between shadow-xl">

        <div className="flex items-center gap-3.5 min-w-0">
          <button
            onClick={() => {
              navigate(`/${type}/${id}`);
            }}
            className="btn-glass-beveled anim-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="h-4 w-[1px] bg-white/10 shrink-0" />

          <button
            onClick={() => {
              navigate(`/${type}/${id}`);
            }}
            className="text-sm font-bold text-white tracking-tight hover:text-accent transition-colors truncate max-w-sm lg:max-w-lg"
          >
            {title}
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">

          <div className="relative">
            <button
              onClick={() => setShowServerDropdown(!showServerDropdown)}
              className="btn-glass-beveled anim-btn flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold"
            >
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-white/50 font-medium">Server:</span>
              <span className="text-white">{activeServer.name}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${showServerDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showServerDropdown && (
                <>
                  <div
                    onClick={() => setShowServerDropdown(false)}
                    className="fixed inset-0 z-40 bg-transparent"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 liquid-dock rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.95)] p-2 z-50 flex flex-col gap-1 max-h-80 overflow-y-auto no-scrollbar"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                      Streaming Sources
                    </div>
                    {SERVERS.map((server) => {
                      const isActive = activeServer.name === server.name;
                      return (
                        <button
                          key={server.name}
                          onClick={() => {
                            setActiveServer(server);
                            setShowServerDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                            isActive
                              ? 'glass-debossed text-white font-bold'
                              : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Play className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-white/30'}`} />
                            <span className="text-xs truncate">{server.name}</span>
                          </div>
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${isActive ? 'bg-white text-black font-bold' : 'badge-glass text-white/70'}`}>
                            {server.tag}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {}
          <button
            onClick={handleFullscreen}
            title="Enter Fullscreen"
            className="btn-glass-beveled anim-icon p-2 rounded-xl text-white/80 hover:text-white"
          >
            <FullscreenIcon className="w-4 h-4" />
          </button>

          {}
          <button
            onClick={reloadPlayer}
            title="Reload Stream"
            className="btn-glass-beveled anim-icon p-2 rounded-xl text-white/80 hover:text-white"
          >
            <RefreshIcon className="w-4 h-4" />
          </button>

          {}
          <button
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            title={isTheaterMode ? "Default View" : "Theater View"}
            className={`btn-glass-beveled anim-btn hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${isTheaterMode ? 'active' : ''}`}
          >
            <TheaterIcon className="w-4 h-4" />
            <span>{isTheaterMode ? 'Standard' : 'Theater'}</span>
          </button>

          {}
          <button
            onClick={shareContent}
            className="btn-glass-beveled anim-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
          >
            {copied ? <CheckIcon className="w-4 h-4 text-accent" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </header>

      {}
      <main className="max-w-[1720px] mx-auto px-4 lg:px-8 py-5">

        {isTheaterMode && (
          <div className="w-full mb-6">
            <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.9)] border border-white/10 ring-1 ring-inset ring-white/10">
              <iframe
                ref={iframeRef}
                id="main-video-player"
                src={getPlayerUrl()}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                frameBorder="0"
                title="Cinema Player"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className={`${isTheaterMode ? 'lg:col-span-8' : 'lg:col-span-8 xl:col-span-8'} space-y-5`}>

            {!isTheaterMode && (
              <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.9)] border border-white/10 ring-1 ring-inset ring-white/10">
                <iframe
                  ref={iframeRef}
                  id="main-video-player"
                  src={getPlayerUrl()}
                  className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                frameBorder="0"
                title="Cinema Player"
              />
            </div>
          )}

          {showDisclaimer && (
            <div className="bg-amber-500/[0.08] backdrop-blur-xl border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-500/90 mb-2 relative shadow-[inset_0_1px_1px_rgba(245,158,11,0.2)]">
              <button
                onClick={() => setShowDisclaimer(false)}
                className="absolute top-2.5 right-2.5 p-1.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-full transition-colors text-amber-500 anim-icon"
                title="Dismiss"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
              <div className="pr-6">
                <p className="font-bold text-amber-400 mb-1">Recommendations: Adblocker & VPN Info</p>
                <p className="mb-2">We highly recommend using an Adblocker (such as uBlock Origin) to prevent intrusive ads. <strong className="text-amber-300">If a video isn't loading while using a VPN, try changing the server from the dropdown above or disable the VPN, as some hosts block VPN traffic.</strong></p>
                <p className="text-[11px] opacity-80">Disclaimer: We do not host any of the media provided here. All videos are hosted and delivered by non-affiliated third-party servers.</p>
              </div>
            </div>
          )}

            {}
            {/* Title & Metadata Header */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h1 className="text-xl lg:text-2xl font-black tracking-tight text-white leading-tight">
                  {type === 'tv' && currentEpData?.name
                    ? `${title} - S${season}:E${episode} "${currentEpData.name}"`
                    : title}
                </h1>

                {type === 'tv' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={goToPrevEpisode}
                      disabled={!hasPrevEpisode}
                      className={`btn-glass-beveled anim-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                        !hasPrevEpisode ? 'opacity-30 cursor-not-allowed' : ''
                      }`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>

                    <button
                      onClick={goToNextEpisode}
                      disabled={!hasNextEpisode}
                      className={`btn-beveled-solid anim-btn flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold ${
                        !hasNextEpisode ? 'opacity-30 cursor-not-allowed' : ''
                      }`}
                    >
                      <span>Next Ep</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Clean Unified Metadata Bar */}
              <div className="flex flex-wrap items-center gap-2.5 pb-2 text-xs font-semibold text-white/90">
                <ImdbBadge rating={details.vote_average} />
                {getCertification() && <MpaaBadge rating={getCertification()} />}
                {releaseYear && (
                  <>
                    <span className="text-white/30">•</span>
                    <span className="tabular-nums text-white/70">{releaseYear}</span>
                  </>
                )}
                {details.runtime && (
                  <>
                    <span className="text-white/30">•</span>
                    <span className="tabular-nums text-white/70">
                      {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                    </span>
                  </>
                )}
                {details.number_of_seasons && (
                  <>
                    <span className="text-white/30">•</span>
                    <span className="tabular-nums text-white/70">
                      {details.number_of_seasons} Season{details.number_of_seasons > 1 ? 's' : ''}
                    </span>
                  </>
                )}
                {details.genres?.slice(0, 3).map((g: any) => (
                  <span key={g.id} className="badge-glass px-2.5 py-0.5 rounded-full text-[10px] text-white/80 font-medium">
                    {g.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Overview & Cast Drawer */}
            <div
              onClick={() => setIsExpandedDesc(!isExpandedDesc)}
              className="card-glass-debossed rounded-2xl p-4.5 transition-all cursor-pointer space-y-3 text-left group"
            >
              {details.tagline && (
                <p className="text-xs font-semibold italic text-white/60">
                  "{details.tagline}"
                </p>
              )}

              <p className={`text-xs md:text-sm font-normal text-white/80 leading-relaxed ${
                isExpandedDesc ? '' : 'line-clamp-2'
              }`}>
                {details.overview}
              </p>

              <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors inline-block pt-0.5">
                {isExpandedDesc ? 'Show less' : 'Read more...'}
              </span>

              {/* Cast */}
              {isExpandedDesc && details.credits?.cast?.length > 0 && (
                <div className="pt-4 border-t border-white/5 space-y-2.5">
                  <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider">Top Cast</h4>
                  <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
                    {details.credits.cast.slice(0, 8).map((actor: any) => (
                      <div key={actor.id} className="flex items-center gap-2 bg-white/5 p-1.5 pr-3 rounded-xl shrink-0">
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-black/40 shrink-0">
                          {actor.profile_path ? (
                            <LazyImage
                              src={getImageUrl(actor.profile_path, 'w500')}
                              alt={actor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white/30">
                              {actor.name[0]}
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-medium text-white/90 truncate max-w-[110px]">{actor.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Similar Titles / More Like This Grid */}
            {(type === 'tv' || isTheaterMode) && details.similar?.results?.filter((m: any) => m.poster_path).length > 0 && (
              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white tracking-tight">More Like This</h3>
                  <span className="text-xs text-white/40 font-medium">Recommended for you</span>
                </div>
                <div className={`grid ${landscapeSetting ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 gap-3.5'}`}>
                  {details.similar.results
                    .filter((m: any) => m.poster_path)
                    .slice(0, 8)
                    .map((movie: any) => (
                      <MovieCard
                        key={movie.id}
                        movie={{ ...movie, media_type: movie.media_type || type }}
                        className="w-full"
                      />
                    ))}
                </div>
              </div>
            )}

          </div>

          {}
          <div className={`${isTheaterMode ? 'lg:col-span-4' : 'lg:col-span-4 xl:col-span-4'} sticky top-16 space-y-3`}>

            {}
            {type === 'tv' && (
              <div className="w-full space-y-3">
                {}
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white tracking-tight">Episodes</h2>
                    <span className="text-[11px] text-text-secondary font-medium">
                      ({episodes.length})
                    </span>
                  </div>

                  {}
                  {details.number_of_seasons && details.number_of_seasons > 1 && (
                    <div className="relative">
                      <select
                        value={selectedSeason}
                        onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
                        className="appearance-none bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 pr-7 py-1 text-xs font-bold text-white focus:outline-none cursor-pointer"
                      >
                        {Array.from({ length: details.number_of_seasons }, (_, i) => i + 1).map((s) => (
                          <option key={s} value={s} className="bg-[#121214] text-white">
                            Season {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-white/50 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  )}
                </div>

                {}
                <div id="episodes-list-container" className="space-y-2.5 max-h-[calc(100vh-140px)] overflow-y-auto pr-2 scroll-smooth">
                  {episodes.map((ep) => {
                    const isPlaying = parseInt(season) === selectedSeason && parseInt(episode) === ep.episode_number;
                    return (
                      <div
                        id={`episode-${ep.episode_number}`}
                        key={ep.id}
                        onClick={() => navigate(`/watch/tv/${id}/${selectedSeason}/${ep.episode_number}`)}
                        className={`flex items-start gap-3 p-2 rounded-xl transition-all cursor-pointer group ${
                          isPlaying
                            ? 'bg-white/[0.08] ring-1 ring-white/15'
                            : 'hover:bg-white/[0.04]'
                        }`}
                      >
                        {}
                        <div className="relative w-36 sm:w-40 aspect-video rounded-xl overflow-hidden shrink-0 bg-black/40">
                          {ep.still_path ? (
                            <LazyImage
                              src={getImageUrl(ep.still_path, 'w500')}
                              alt={ep.name}
                              className="w-full h-full object-cover transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/5">
                              <TvIcon className="w-6 h-6 text-white/20" />
                            </div>
                          )}

                          {isPlaying ? (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600 text-white text-[8px] font-black uppercase tracking-wider shadow-lg">
                                <Play className="w-2.5 h-2.5 fill-current" /> Playing
                              </span>
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="w-4 h-4 text-white" />
                            </div>
                          )}

                          {ep.runtime > 0 && (
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-bold text-white/90">
                              {ep.runtime}m
                            </span>
                          )}
                        </div>

                        {}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                            Episode {ep.episode_number}
                          </span>
                          <h4 className={`text-xs font-bold line-clamp-2 leading-snug ${
                            isPlaying ? 'text-accent' : 'text-white group-hover:text-accent'
                          }`}>
                            {ep.name}
                          </h4>
                          {ep.overview && (
                            <p className="text-[10px] text-text-secondary line-clamp-1 mt-1">
                              {ep.overview}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {}
            {/* More Like This Sidebar for Movies */}
            {type === 'movie' && !isTheaterMode && details.similar?.results?.filter((m: any) => m.poster_path).length > 0 && (
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <h3 className="text-sm font-bold text-white tracking-tight">More Like This</h3>
                  <span className="text-xs text-white/40 font-medium">
                    {details.similar.results.filter((m: any) => m.poster_path).length} titles
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar pr-1">
                  {details.similar.results.filter((m: any) => m.poster_path).slice(0, 12).map((movie: any) => (
                    <div
                      key={movie.id}
                      onClick={() => navigate(`/watch/movie/${movie.id}`)}
                      className="flex items-start gap-3 p-2 rounded-2xl hover:bg-white/[0.06] transition-all cursor-pointer group card-glass-debossed"
                    >
                      <div className="relative w-28 aspect-video rounded-xl overflow-hidden bg-black/40 shrink-0">
                        <LazyImage
                          src={getImageUrl(movie.backdrop_path || movie.poster_path, 'w500')}
                          alt={movie.title || movie.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-accent transition-colors">
                          {movie.title || movie.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-white/50">
                          {movie.vote_average ? (
                            <span className="flex items-center gap-1 text-white/80 font-bold">
                              <Star className="w-3 h-3 text-[#f5c518] fill-current" />
                              {movie.vote_average.toFixed(1)}
                            </span>
                          ) : null}
                          {movie.release_date && (
                            <>
                              <span>•</span>
                              <span>{movie.release_date.split('-')[0]}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

    </div>
  );
};
