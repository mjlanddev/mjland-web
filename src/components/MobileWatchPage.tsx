import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft01Icon as ChevronLeft, 
  ArrowRight01Icon as ChevronRight,
  PlayIcon as Play, 
  Share01Icon as Share2,
  Tv01Icon as TvIcon,
  ArrowDown01Icon as ChevronDown,
  CheckmarkCircle02Icon as CheckIcon,
  CloudServerIcon as ServerIcon,
  Cancel01Icon as CloseIcon,
  Maximize01Icon as FullscreenIcon
} from 'hugeicons-react';
import { getImageUrl } from '../services/tmdbService';
import { LazyImage } from './LazyImage';
import { PosterImage } from './PosterImage';
import { ImdbBadge } from './ImdbBadge';

interface MobileWatchPageProps {
  details: any;
  type: string;
  id: string;
  season?: string;
  episode?: string;
  activeServer: any;
  setActiveServer: (server: any) => void;
  episodes: any[];
  navigate: any;
  shareContent: () => void;
  getPlayerUrl: () => string;
  SERVERS: any[];
  hasPrevEpisode?: boolean;
  hasNextEpisode?: boolean;
  goToPrevEpisode?: () => void;
  goToNextEpisode?: () => void;
  currentEpData?: any;
  handleSeasonChange?: (s: number) => void;
  selectedSeason?: number;
}

export const MobileWatchPage: React.FC<MobileWatchPageProps> = ({
  details,
  type,
  id,
  season = '1',
  episode = '1',
  activeServer,
  setActiveServer,
  episodes,
  navigate,
  shareContent,
  getPlayerUrl,
  SERVERS,
  hasPrevEpisode,
  hasNextEpisode,
  goToPrevEpisode,
  goToNextEpisode,
  currentEpData,
  handleSeasonChange,
  selectedSeason = 1
}) => {
  const [showServerModal, setShowServerModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExpandedOverview, setIsExpandedOverview] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

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

  const releaseYear = details.release_date ? details.release_date.split('-')[0] : details.first_air_date ? details.first_air_date.split('-')[0] : '';
  const title = details.title || details.name;

  const handleShare = () => {
    shareContent();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
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
    if (type === 'tv' && episode && episodes.length > 0) {
      const timeoutId = setTimeout(() => {
        const el = document.getElementById(`mobile-episode-${episode}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [type, episode, episodes, season]);

  return (
    <div className="min-h-screen bg-bg text-white pb-28 relative overflow-x-hidden font-sans selection:bg-accent/30">
      
      {}
      <div className="sticky top-0 inset-x-0 z-50 flex items-center justify-between px-4 py-2.5 bg-bg/90 backdrop-blur-2xl border-b border-white/5">
        <button 
          onClick={() => {
            navigate(`/${type}/${id}`);
          }}
          className="btn-glass-beveled anim-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex flex-col items-center max-w-[180px] truncate">
          <span className="text-xs font-bold text-white truncate">{title}</span>
          {type === 'tv' && (
            <span className="text-[10px] font-semibold text-[#a3a3a3] truncate">
              S{season} E{episode} {currentEpData?.name ? `• ${currentEpData.name}` : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleFullscreen}
            title="Enter Fullscreen"
            className="btn-glass-beveled anim-icon p-2 rounded-xl text-white"
          >
            <FullscreenIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={handleShare}
            className="btn-glass-beveled anim-icon p-2 rounded-xl text-white"
          >
            {copied ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Docked 16:9 Video Canvas */}
      <div className="w-full aspect-video bg-black relative z-10 shadow-2xl group/player">
        <iframe
          ref={iframeRef}
          src={getPlayerUrl()}
          className="w-full h-full"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          frameBorder="0"
          title="Video Player"
        />
      </div>

      {/* 3. Primary Show Info & Quick Actions */}
      <div className="px-4 pt-4 space-y-4">
        
        {/* Adblocker / VPN / Hosting Disclaimer */}
        {showDisclaimer && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-500/80 relative">
            <button 
              onClick={() => setShowDisclaimer(false)}
              className="absolute top-2 right-2 p-1.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-full transition-colors text-amber-500"
              title="Dismiss"
            >
              <CloseIcon className="w-3 h-3" />
            </button>
            <div className="pr-5">
              <p className="font-bold text-amber-500 mb-1">Recommendations: Adblocker & VPN Info</p>
              <p className="mb-2">We highly recommend using an Adblocker (such as uBlock Origin) to prevent intrusive ads. <strong className="text-amber-400">If a video isn't loading while using a VPN, try changing the server from the dropdown above or disable the VPN, as some hosts block VPN traffic.</strong></p>
              <p className="text-[9px] opacity-80">Disclaimer: We do not host any of the media provided here. All videos are hosted and delivered by non-affiliated third-party servers.</p>
            </div>
          </div>
        )}
        
        {}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <ImdbBadge rating={details.vote_average} />
                {releaseYear && <span className="text-xs font-semibold text-[#a3a3a3]">{releaseYear}</span>}
                {details.runtime && (
                  <span className="text-xs font-semibold text-[#a3a3a3]">
                    • {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                  </span>
                )}
                {details.number_of_seasons && (
                  <span className="text-xs font-semibold text-[#a3a3a3]">
                    • {details.number_of_seasons} Seasons
                  </span>
                )}
              </div>
            </div>

            {}
            <button
              onClick={() => setShowServerModal(true)}
              className="btn-glass-beveled anim-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-white/80">{activeServer.name.split('•')[0].trim()}</span>
              <ChevronDown className="w-3 h-3 text-white/40" />
            </button>
          </div>

          {}
          {details.overview && (
            <p 
              onClick={() => setIsExpandedOverview(!isExpandedOverview)}
              className={`text-xs font-medium text-[#a3a3a3] leading-relaxed cursor-pointer ${
                isExpandedOverview ? '' : 'line-clamp-2'
              }`}
            >
              {details.overview}
            </p>
          )}
        </div>

        {}
        {type === 'tv' && (
          <div className="flex items-center justify-between gap-2 p-2 rounded-2xl btn-glass-beveled">
            <button
              onClick={goToPrevEpisode}
              disabled={!hasPrevEpisode}
              className={`btn-glass-beveled anim-btn flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold ${
                !hasPrevEpisode ? 'opacity-30 cursor-not-allowed' : ''
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <div className="text-center px-1 truncate min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#a3a3a3] block">
                S{season} • E{episode}
              </span>
              <span className="text-xs font-bold text-white truncate block max-w-[150px]">
                {currentEpData?.name || `Episode ${episode}`}
              </span>
            </div>

            <button
              onClick={goToNextEpisode}
              disabled={!hasNextEpisode}
              className={`btn-beveled-solid anim-btn flex items-center gap-1 px-4 py-1.5 rounded-xl text-[11px] font-bold ${
                !hasNextEpisode ? 'opacity-30 cursor-not-allowed' : ''
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {}
        {type === 'tv' && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TvIcon className="w-4 h-4 text-white/80" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">Episodes</h2>
              </div>
            </div>

            {}
            {details.number_of_seasons && details.number_of_seasons > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {Array.from({ length: details.number_of_seasons }, (_, i) => i + 1).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSeasonChange && handleSeasonChange(s)}
                    className={`btn-glass-beveled anim-pill px-4 py-1.5 rounded-full text-xs font-bold shrink-0 ${
                      selectedSeason === s ? 'active' : ''
                    }`}
                  >
                    Season {s}
                  </button>
                ))}
              </div>
            )}

            {}
            <div className="space-y-3">
              {episodes.map((ep) => {
                const isPlaying = parseInt(season) === selectedSeason && parseInt(episode) === ep.episode_number;
                return (
                  <div
                    id={`mobile-episode-${ep.episode_number}`}
                    key={ep.id}
                    onClick={() => navigate(`/watch/tv/${id}/${selectedSeason}/${ep.episode_number}`)}
                    className={`btn-glass-beveled flex items-center gap-3 p-2.5 rounded-2xl transition-all cursor-pointer ${
                      isPlaying ? 'active ring-1 ring-white/30' : ''
                    }`}
                  >
                    {}
                    <div className="relative w-28 aspect-video rounded-xl overflow-hidden shrink-0 bg-black/40">
                      {ep.still_path ? (
                        <LazyImage
                          src={getImageUrl(ep.still_path, 'w500')}
                          alt={ep.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                          <TvIcon className="w-5 h-5 text-white/20" />
                        </div>
                      )}

                      {isPlaying ? (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600 text-white text-[8px] font-black uppercase tracking-wider">
                            <Play className="w-2.5 h-2.5 fill-current" /> Playing
                          </span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white/80" />
                        </div>
                      )}

                      {ep.runtime > 0 && (
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[8px] font-bold text-white/80">
                          {ep.runtime}m
                        </span>
                      )}
                    </div>

                    {}
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold text-[#a3a3a3] uppercase tracking-wider block">
                        EP {ep.episode_number}
                      </span>
                      <h4 className={`text-xs font-bold truncate ${isPlaying ? 'text-accent' : 'text-white'}`}>
                        {ep.name}
                      </h4>
                      {ep.overview && (
                        <p className="text-[10px] text-[#a3a3a3] line-clamp-1 mt-0.5">
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
        {details.similar?.results?.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-white/5">
            <h3 className="text-xs font-bold text-[#a3a3a3] uppercase tracking-wider">More Like This</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {details.similar.results.slice(0, 9).map((movie: any) => (
                <div
                  key={movie.id}
                  onClick={() => navigate(`/${type}/${movie.id}`)}
                  className="relative aspect-[2/3] rounded-xl overflow-hidden anim-poster"
                >
                  <PosterImage
                    src={getImageUrl(movie.poster_path, 'w500')}
                    alt={movie.title || movie.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {}
      <AnimatePresence>
        {showServerModal && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            {}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowServerModal(false)}
              className="absolute inset-0 bg-black/80 cursor-pointer"
            />

            {}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md mx-auto bg-[#13141a] border-t border-white/10 rounded-t-[28px] px-5 pt-3 pb-8 space-y-3.5 shadow-2xl z-10 will-change-transform transform-gpu"
            >
              {}
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto" />

              {}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Select Server</h3>
                  <p className="text-[11px] text-white/50 font-medium">Choose a stream source for optimal speed</p>
                </div>
                <button 
                  onClick={() => setShowServerModal(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {}
              <div className="divide-y divide-white/5 rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden max-h-72 overflow-y-auto no-scrollbar">
                {SERVERS.map((server) => {
                  const isActive = activeServer.name === server.name;
                  return (
                    <button
                      key={server.name}
                      onClick={() => {
                        setActiveServer(server);
                        setShowServerModal(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors active:bg-white/15 ${
                        isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-white/20'}`} />
                        <div className="min-w-0">
                          <span className={`text-xs font-bold block truncate ${isActive ? 'text-white' : 'text-white/80'}`}>
                            {server.name}
                          </span>
                          <span className="text-[10px] text-white/40 block truncate">
                            {server.lang} • {server.tag}
                          </span>
                        </div>
                      </div>

                      {isActive && (
                        <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shrink-0 ml-2 shadow-md">
                          <CheckIcon className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
