import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  PlayIcon as Play,
  PauseIcon as Pause,
  Add01Icon as Plus,
  CheckmarkCircle02Icon as Check,
  Cancel01Icon as X,
  Share01Icon as Share2,
  FavouriteIcon as Heart,
  VolumeHighIcon as Volume2,
  VolumeOffIcon as VolumeX
} from 'hugeicons-react';
import { getImageUrl } from '../services/tmdbService';
import { MovieDetails as MovieDetailsType, Episode } from '../types';
import { PosterImage } from './PosterImage';
import { LazyImage } from './LazyImage';
import { EpisodesSection } from './EpisodesSection';
import { MediaMetadataSection } from './MediaMetadataSection';
import { MpaaBadge } from './MpaaBadge';
import { ImdbBadge } from './ImdbBadge';
import { VideoModal, VideoModalData } from './VideoModal';
import { MovieCard } from './MovieRow';
import { storageService } from '../services/storageService';

interface MovieDetailsMobileProps {
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
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  handleSubscribe: () => void;
  year: number;
  rating: string;
  duration: string;
  logo: any;
  trailer: any;
  getCertification: () => string;
  getLanguageName: (code: string) => string;
  videoContainerRef: React.RefObject<HTMLDivElement>;
  navigate: (to: any) => void;
  disableStreaming?: boolean;
}

export const MovieDetailsMobile = ({
  details,
  type,
  id,
  activeTab,
  setActiveTab,
  showTrailer,
  isMuted,
  setIsMuted,
  isInWatchlist,
  historyItem,
  toggleWatchlist,
  isPaused,
  setIsPaused,
  isExpanded,
  setIsExpanded,
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
}: MovieDetailsMobileProps) => {
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
      : (type === 'tv' ? 'Watch Now' : 'Watch Now');

  return (
    <div className="md:hidden min-h-screen bg-black text-white">

      <button
        onClick={() => {
          if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
          } else {
            navigate('/');
          }
        }}
        className="fixed top-4 left-4 z-50 p-2.5 btn-glass-beveled rounded-full shadow-2xl"
        aria-label="Go back"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="relative w-full" style={{ height: '54vw', minHeight: 210, maxHeight: 290 }}>
        <LazyImage
          src={getImageUrl(details.backdrop_path, 'original')}
          alt={details.title || details.name}
          className="absolute inset-0 w-full h-full object-cover object-top"
          referrerPolicy="no-referrer"
          loading="eager"
        />

        {trailer && (
          <div
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 overflow-hidden pointer-events-none ${showTrailer && !isPaused ? 'opacity-100' : 'opacity-0'}`}
          >
            <div
              ref={videoContainerRef}
              className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:object-cover [&>iframe]:scale-150 [&>iframe]:pointer-events-none"
            />
          </div>
        )}

        {showTrailer && (
          <div className="absolute right-3 bottom-3 flex gap-2 z-20">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="w-8 h-8 btn-glass-beveled rounded-full flex items-center justify-center"
              aria-label={isPaused ? "Play trailer" : "Pause trailer"}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-white ml-0.5" /> : <Pause className="w-3.5 h-3.5 text-white" />}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 btn-glass-beveled rounded-full flex items-center justify-center"
              aria-label={isMuted ? "Unmute trailer" : "Mute trailer"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-white" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
            </button>
          </div>
        )}

        {}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {}
      <div className="relative -mt-10 z-10 px-4 pb-28">

        <div className="flex gap-3.5 mb-4">
          <div className="w-[84px] h-[126px] card-glass-debossed shrink-0">
            <PosterImage
              src={getImageUrl(details.poster_path, 'w500')}
              alt={details.title || details.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 pt-1">
            {logo ? (
              <LazyImage
                src={getImageUrl(logo.file_path, 'w500')}
                alt={details.title || details.name}
                className="max-h-11 object-contain mb-2"
                referrerPolicy="no-referrer"
              />
            ) : (
              <h1 className="text-xl sm:text-2xl font-black mb-1.5 tracking-tight leading-tight line-clamp-2 text-balance">
                {details.title || details.name}
              </h1>
            )}

            <div className="flex items-center gap-2 flex-wrap mb-2">
              <ImdbBadge rating={rating} />
              <MpaaBadge rating={getCertification()} />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-semibold text-white/50">
              <span className="tabular-nums">{year}</span>
              <span>·</span>
              <span className="tabular-nums">{type === 'tv' ? `${details.number_of_seasons} Season${details.number_of_seasons > 1 ? 's' : ''}` : duration}</span>
              <span>·</span>
              <span>{getLanguageName(details.original_language)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {details.genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => navigate(`/genre/${genre.id}`)}
              className="btn-glass-beveled text-[11px] font-semibold px-3 py-1 rounded-full text-white/80"
            >
              {genre.name}
            </button>
          ))}
        </div>

        <div className="mb-5">
          <p className={`text-[12.5px] leading-relaxed font-medium text-white/60 text-pretty ${!isExpanded ? 'line-clamp-3' : ''}`}>
            {details.overview}
          </p>
          {details.overview && details.overview.length > 120 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-accent text-[11px] font-bold mt-1 uppercase tracking-wide"
            >
              {isExpanded ? 'Show Less' : 'More'}
            </button>
          )}
        </div>

        <div className="flex gap-2.5 mb-5">
          <button
            onClick={handleSubscribe}
            className="btn-beveled-solid anim-btn flex-1 h-12 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm"
          >
            <Play className="w-4 h-4 fill-current text-[#09090b] translate-x-0.5" />
            <span>{watchLabel}</span>
          </button>
          <button
            onClick={toggleWatchlist}
            className={`btn-glass-beveled anim-btn w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center ${
              isInWatchlist ? 'active text-accent border-white/30' : ''
            }`}
            aria-label="Toggle Watchlist"
          >
            {isInWatchlist ? <Check className="w-5 h-5 text-accent" /> : <Plus className="w-5 h-5 text-white" />}
          </button>
          <button
            className="btn-glass-beveled anim-btn w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {cast.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Top Cast</h3>
              <span className="text-[10px] font-semibold text-white/30">{cast.length} Actors</span>
            </div>
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar overscroll-x-contain py-1 px-1 -mx-1">
              {cast.map((actor: any) => (
                <button
                  key={actor.id}
                  onClick={() => navigate(`/person/${actor.id}`)}
                  className="flex items-center gap-2.5 shrink-0 card-glass-debossed rounded-full py-1.5 pl-1.5 pr-3.5 text-left transition-transform active:scale-95 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden glass-debossed ring-1 ring-white/15 ring-inset shrink-0 shadow-sm">
                    {actor.profile_path ? (
                      <LazyImage
                        src={getImageUrl(actor.profile_path, 'w500')}
                        alt={actor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/30 bg-white/[0.04]">
                        {actor.name[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white/95 max-w-[110px] truncate block leading-tight">
                      {actor.name}
                    </span>
                    <span className="text-[10px] font-medium text-white/45 max-w-[110px] truncate block leading-none mt-0.5">
                      {actor.character}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {}
        {type === 'tv' && (
          <div className="mb-6 pb-4 border-b border-white/5">
            <EpisodesSection
              animeId={parseInt(id)}
              totalEpisodes={details.number_of_episodes}
              totalSeasons={details.number_of_seasons}
              status={details.status}
              type={type || 'tv'}
              gridLayout={false}
            />
          </div>
        )}

        <div className="flex items-center gap-2 pb-2 mb-4 overflow-x-auto no-scrollbar">
          <div className="glass-debossed p-1 rounded-2xl flex items-center gap-1.5">
            {details.similar?.results?.length > 0 && (
              <button
                onClick={() => setActiveTab('more')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'more'
                    ? 'btn-beveled-solid'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <span>More Like This</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
                  activeTab === 'more' ? 'bg-black/15 text-black' : 'bg-white/10 text-white/60'
                }`}>
                  {details.similar.results.length}
                </span>
              </button>
            )}

            {details.videos?.results?.length > 0 && (
              <button
                onClick={() => setActiveTab('trailers')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'trailers'
                    ? 'btn-beveled-solid'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <span>Trailers & Clips</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
                  activeTab === 'trailers' ? 'bg-black/15 text-black' : 'bg-white/10 text-white/60'
                }`}>
                  {details.videos.results.length}
                </span>
              </button>
            )}
          </div>
        </div>

        {activeTab === 'more' && details.similar?.results?.length > 0 && (
          <div className={`grid ${landscapeSetting ? 'grid-cols-1 sm:grid-cols-2 gap-3' : 'grid-cols-3 gap-2.5'} pb-6`}>
            {details.similar.results.slice(0, 15).map((movie) => (
              <MovieCard
                key={movie.id}
                movie={{ ...movie, media_type: movie.media_type || type }}
                className="w-full"
              />
            ))}
          </div>
        )}

        {activeTab === 'trailers' && details.videos?.results?.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {details.videos.results.slice(0, 10).map((video) => (
                <div
                  key={video.key}
                  className="group flex flex-col gap-1.5 cursor-pointer bg-white/[0.03] p-2 rounded-xl border border-white/5 active:bg-white/10"
                  onClick={() => setActiveVideo({
                    id: video.key,
                    title: video.name,
                    subtitle: video.type
                  })}
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-white/5">
                    <PosterImage
                      src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                      alt={video.type}
                      className="w-full h-full object-cover transition-transform duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity duration-200">
                      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/80 rounded text-[9px] font-bold text-white uppercase">
                      {video.type}
                    </div>
                  </div>
                  <h3 className="text-xs font-bold line-clamp-1 text-white/90">
                    {video.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        )}

        <MediaMetadataSection details={details} type={type} />
      </div>

      <VideoModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
      />
    </div>
  );
};
