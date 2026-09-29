import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PlayIcon as Play,
  PauseIcon as Pause,
  Add01Icon as Plus,
  CheckmarkCircle02Icon as Check,
  ArrowRight01Icon as ChevronRight,
  VolumeHighIcon as Volume2,
  VolumeOffIcon as VolumeX,
  ArrowLeft01Icon as ChevronLeft
} from 'hugeicons-react';
import { getImageUrl } from '../services/tmdbService';
import { MovieDetails as MovieDetailsType, Episode } from '../types';
import { PosterImage } from './PosterImage';
import { VideoModal, VideoModalData } from './VideoModal';
import { LazyImage } from './LazyImage';
import { EpisodesSection } from './EpisodesSection';
import { MediaMetadataSection } from './MediaMetadataSection';
import { MpaaBadge } from './MpaaBadge';
import { ImdbBadge } from './ImdbBadge';
import { MovieCard } from './MovieRow';
import { storageService } from '../services/storageService';

interface MovieDetailsDesktopProps {
  details: MovieDetailsType;
  type: string;
  id: string;
  activeTab: 'episodes' | 'more' | 'trailers';
  setActiveTab: (tab: 'episodes' | 'more' | 'trailers') => void;
  selectedSeason: number;
  handleSeasonChange: (seasonNum: number) => void;
  episodes: Episode[];
  showTrailer: boolean;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  isInWatchlist: boolean;
  historyItem: any;
  toggleWatchlist: () => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  handleSubscribe: () => void;
  year: number;
  rating: string;
  duration: string;
  logo: any;
  trailer: any;
  getCertification: () => string;
  getLanguageName: (code: string) => string;
  videoContainerRef?: any;
  navigate: (to: any) => void;
  disableStreaming?: boolean;
}

export const MovieDetailsDesktop = ({
  details,
  type,
  id,
  activeTab,
  setActiveTab,
  selectedSeason,
  handleSeasonChange,
  episodes,
  showTrailer,
  isMuted,
  setIsMuted,
  isInWatchlist,
  historyItem,
  toggleWatchlist,
  isPaused,
  setIsPaused,
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
  disableStreaming
}: MovieDetailsDesktopProps) => {
  const [activeVideo, setActiveVideo] = useState<VideoModalData | null>(null);
  const [landscapeSetting, setLandscapeSetting] = useState(() => storageService.isLandscapePosterEnabled());

  useEffect(() => {
    const handleLandscape = () => setLandscapeSetting(storageService.isLandscapePosterEnabled());
    window.addEventListener('landscapePosterSettingUpdated', handleLandscape);
    return () => window.removeEventListener('landscapePosterSettingUpdated', handleLandscape);
  }, []);

  const cast = details.credits?.cast || [];
  const watchLabel = disableStreaming
    ? 'Watch Trailer'
    : historyItem
      ? (type === 'tv' && historyItem.season_number && historyItem.episode_number
          ? `Resume S${historyItem.season_number} E${historyItem.episode_number}`
          : 'Resume')
      : (type === 'tv' ? `Watch Now` : 'Watch Now');

  return (
    <div className="hidden md:block min-h-screen bg-black text-white relative">

      <div className="absolute top-6 left-6 lg:left-8 z-30">
        <button
          onClick={() => {
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              navigate('/');
            }
          }}
          className="btn-glass-beveled anim-btn flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer text-xs font-bold uppercase tracking-wider text-white/90 shadow-2xl"
          aria-label="Go back"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
          <span>Back</span>
        </button>
      </div>

      <div className="relative w-full overflow-hidden" style={{ height: 'min(72vh, 640px)' }}>

        <LazyImage
          src={getImageUrl(details.backdrop_path, 'original')}
          alt={details.title || details.name}
          className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ${showTrailer && !isPaused ? 'opacity-0' : 'opacity-100'}`}
          referrerPolicy="no-referrer"
        />

        {trailer && (
          <div
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 overflow-hidden pointer-events-none ${showTrailer && !isPaused ? 'opacity-100' : 'opacity-0'}`}
          >
            <div
              ref={videoContainerRef}
              className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:object-cover [&>iframe]:scale-110 [&>iframe]:pointer-events-none"
            />
          </div>
        )}

        {showTrailer && (
          <div className="absolute right-8 bottom-8 flex gap-2.5 z-30">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="w-10 h-10 btn-glass-beveled anim-icon rounded-full flex items-center justify-center text-white cursor-pointer"
              aria-label={isPaused ? "Play trailer" : "Pause trailer"}
            >
              {isPaused ? <Play className="w-4 h-4 text-white ml-0.5" /> : <Pause className="w-4 h-4 text-white" />}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 btn-glass-beveled anim-icon rounded-full flex items-center justify-center text-white cursor-pointer"
              aria-label={isMuted ? "Unmute trailer" : "Mute trailer"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
            </button>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent z-10" />

        <div className="absolute inset-0 z-20 flex items-end px-8 md:px-12 pb-10 max-w-[1400px]">
          <div className="w-full max-w-2xl flex flex-col items-start">

            {logo ? (
              <LazyImage
                src={getImageUrl(logo.file_path, 'original')}
                alt={details.title || details.name}
                className="max-h-20 max-w-xs object-contain mb-4 drop-shadow-[0_8px_24px_rgba(0,0,0,0.9)]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <h1 className="text-3xl xl:text-5xl font-black mb-4 tracking-tight leading-none text-white text-balance drop-shadow-[0_6px_20px_rgba(0,0,0,0.9)]">
                {details.title || details.name}
              </h1>
            )}

            <div className="flex items-center gap-2.5 mb-4 flex-wrap text-sm font-semibold text-white/90">
              <ImdbBadge rating={rating} />
              <MpaaBadge rating={getCertification()} />
              <span className="text-white/40">•</span>
              <span className="tabular-nums text-white/80">
                {year}
              </span>
              <span className="text-white/40">•</span>
              <span className="tabular-nums text-white/80">
                {type === 'tv' ? `${details.number_of_seasons} Season${details.number_of_seasons > 1 ? 's' : ''}` : duration}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-white/80">
                {getLanguageName(details.original_language)}
              </span>
            </div>

            <p className="text-xs md:text-sm font-medium text-white/80 mb-4 leading-relaxed line-clamp-3 max-w-xl text-pretty drop-shadow-md">
              {details.overview}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {details.genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => navigate(`/genre/${genre.id}`)}
                  className="badge-glass text-xs font-semibold px-3 py-1 rounded-full text-white/85 hover:text-white cursor-pointer"
                >
                  {genre.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSubscribe}
                className="btn-beveled-solid anim-btn flex items-center gap-2.5 px-8 h-12 rounded-2xl font-bold text-sm cursor-pointer shadow-2xl"
              >
                <Play className="w-4 h-4 fill-current text-[#09090b] translate-x-0.5" />
                <span>{watchLabel}</span>
              </button>
              <button
                onClick={toggleWatchlist}
                title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                className={`btn-glass-beveled anim-btn w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer ${
                  isInWatchlist ? 'active text-accent border-white/30' : ''
                }`}
                aria-label="Toggle Watchlist"
              >
                {isInWatchlist ? <Check className="w-5 h-5 text-accent" /> : <Plus className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 max-w-[1400px] mx-auto">

        {cast.length > 0 && (
          <div className="py-5 border-b border-white/5">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Top Cast</h3>
              <span className="text-[11px] font-semibold text-white/30">{cast.length} Actors</span>
            </div>
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar overscroll-x-contain py-1 px-1 -mx-1">
              {cast.map((actor: any) => (
                <button
                  key={actor.id}
                  onClick={() => navigate(`/person/${actor.id}`)}
                  className="flex items-center gap-3 shrink-0 card-glass-debossed rounded-full py-1.5 pl-1.5 pr-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:border-white/30 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden glass-debossed ring-1 ring-white/15 ring-inset shrink-0 shadow-md">
                    {actor.profile_path ? (
                      <LazyImage
                        src={getImageUrl(actor.profile_path, 'w500')}
                        alt={actor.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/40 bg-white/[0.04]">
                        {actor.name[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/95 leading-tight group-hover:text-white transition-colors truncate max-w-[130px]">
                      {actor.name}
                    </p>
                    <p className="text-[10px] text-white/50 truncate max-w-[130px] font-medium leading-none mt-0.5">
                      {actor.character}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {}
        {type === 'tv' && (
          <div className="py-4 pb-8 border-b border-white/5">
            <EpisodesSection
              animeId={parseInt(id)}
              totalEpisodes={details.number_of_episodes}
              totalSeasons={details.number_of_seasons}
              status={details.status}
              type={type || 'tv'}
              gridLayout={true}
            />
          </div>
        )}

        <div className="flex items-center gap-2 pt-6 pb-2">
          <div className="glass-debossed p-1.5 rounded-2xl flex items-center gap-2">
            {details.similar?.results?.length > 0 && (
              <button
                onClick={() => setActiveTab('more')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'more'
                    ? 'btn-beveled-solid'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>More Like This</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
                  activeTab === 'more' ? 'bg-black/15 text-black' : 'bg-white/10 text-white/60'
                }`}>
                  {details.similar.results.length}
                </span>
              </button>
            )}

            {details.videos?.results?.length > 0 && (
              <button
                onClick={() => setActiveTab('trailers')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'trailers'
                    ? 'btn-beveled-solid'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>Trailers & More</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
                  activeTab === 'trailers' ? 'bg-black/15 text-black' : 'bg-white/10 text-white/60'
                }`}>
                  {details.videos.results.length}
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="py-6 pb-24">
          {activeTab === 'more' && details.similar?.results?.length > 0 && (
            <div className={`grid ${landscapeSetting ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-5 md:gap-6' : 'grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4'}`}>
              {details.similar.results.slice(0, 21).map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={{ ...movie, media_type: movie.media_type || type }}
                  className="w-full"
                />
              ))}
            </div>
          )}

          {activeTab === 'trailers' && details.videos?.results?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5">
              {details.videos.results.slice(0, 12).map((video) => (
                <div
                  key={video.key}
                  className="flex flex-col gap-2.5 group cursor-pointer"
                  onClick={() => setActiveVideo({
                    id: video.key,
                    title: video.name,
                    subtitle: video.type
                  })}
                >
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/5 group-hover:border-white/20 transition-all shadow-xl">
                    <PosterImage
                      src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                      alt={video.type}
                      className="w-full h-full object-cover transition-transform duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[10px] font-bold text-white/90 uppercase tracking-wider border border-white/10">
                      {video.type}
                    </div>
                  </div>
                  <h3 className="text-sm font-bold line-clamp-1 text-white/90 group-hover:text-accent transition-colors">
                    {video.name}
                  </h3>
                </div>
              ))}
            </div>
          )}
        </div>

        <MediaMetadataSection details={details} type={type} />
      </div>

      <VideoModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
      />
    </div>
  );
};
