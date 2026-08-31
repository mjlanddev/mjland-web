import React, { useState } from 'react';
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
import { MpaaBadge } from './MpaaBadge';
import { ImdbBadge } from './ImdbBadge';

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
  videoContainerRef: React.RefObject<HTMLDivElement>;
  navigate: (path: string) => void;
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

  const cast = details.credits?.cast || [];
  const watchLabel = disableStreaming
    ? 'Watch Trailer'
    : historyItem
      ? (type === 'tv' && historyItem.season_number && historyItem.episode_number
          ? `Resume S${historyItem.season_number} E${historyItem.episode_number}`
          : 'Resume')
      : (type === 'tv' ? `Watch Now` : 'Watch Now');

  return (
    <div className="hidden md:block min-h-screen bg-bg text-white">

      {}
      <div className="relative w-full overflow-hidden" style={{ height: 'min(72vh, 640px)' }}>

        {}
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

        {}
        {showTrailer && (
          <div className="absolute right-8 bottom-8 flex gap-2.5 z-30">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/50 transition-all border border-white/10"
            >
              {isPaused ? <Play className="w-4 h-4 text-white ml-0.5" /> : <Pause className="w-4 h-4 text-white" />}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/50 transition-all border border-white/10"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
            </button>
          </div>
        )}

        {}
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/70 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent z-10" />

        {}
        <div className="absolute inset-0 z-20 flex items-end px-8 pb-10 max-w-[1400px]">
          <div className="w-full max-w-2xl">

            {}
            {logo ? (
              <LazyImage
                src={getImageUrl(logo.file_path, 'original')}
                alt={details.title || details.name}
                className="max-h-24 max-w-xs object-contain mb-5 drop-shadow-2xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              <h1 className="text-4xl xl:text-5xl font-black mb-5 tracking-tight leading-none">
                {details.title || details.name}
              </h1>
            )}

            {}
            <div className="flex items-center gap-2.5 mb-4 flex-wrap text-sm font-semibold text-white/70">
              <ImdbBadge rating={rating} />
              <MpaaBadge rating={getCertification()} />
              <span className="text-white/30">·</span>
              <span>{year}</span>
              <span className="text-white/30">·</span>
              <span>{type === 'tv' ? `${details.number_of_seasons} Season${details.number_of_seasons > 1 ? 's' : ''}` : duration}</span>
              <span className="text-white/30">·</span>
              <span>{getLanguageName(details.original_language)}</span>
            </div>

            {}
            <p className="text-sm font-medium text-white/60 mb-5 leading-relaxed line-clamp-3 max-w-xl">
              {details.overview}
            </p>

            {}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {details.genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => navigate(`/genre/${genre.id}`)}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  {genre.name}
                </button>
              ))}
            </div>

            {}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubscribe}
                className="btn-beveled-solid anim-btn flex items-center gap-2.5 px-8 h-11 rounded-xl font-bold text-sm"
              >
                <Play className="w-4 h-4 fill-current text-[#0f1014]" />
                <span>{watchLabel}</span>
              </button>
              <button
                onClick={toggleWatchlist}
                title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                className="btn-glass-beveled anim-btn w-11 h-11 rounded-xl flex items-center justify-center"
              >
                {isInWatchlist ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="px-6 lg:px-8 max-w-[1400px] mx-auto">

        {}
        {cast.length > 0 && (
          <div className="py-5">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
              {cast.map((actor: any) => (
                <button 
                  key={actor.id} 
                  onClick={() => navigate(`/person/${actor.id}`)}
                  className="flex items-center gap-2.5 shrink-0 bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all rounded-xl p-2 pr-3.5 text-left"
                >
                  <div className="w-9 h-9 rounded-xl overflow-hidden bg-black/40 shrink-0">
                    {actor.profile_path ? (
                      <LazyImage
                        src={getImageUrl(actor.profile_path, 'w500')}
                        alt={actor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/30">
                        {actor.name[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-none truncate max-w-[120px]">{actor.name}</p>
                    <p className="text-[10px] text-white/40 mt-0.5 truncate max-w-[120px]">{actor.character}</p>
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

        {}
        <div className="flex items-center gap-2.5 pt-6 pb-2 overflow-x-auto no-scrollbar">
          {details.similar?.results?.length > 0 && (
            <button
              onClick={() => setActiveTab('more')}
              className={`flex items-center gap-2 px-4.5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all duration-150 cursor-pointer ${
                activeTab === 'more'
                  ? 'bg-white text-black shadow-md scale-100'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>More Like This</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === 'more' ? 'bg-black/10 text-black' : 'bg-white/10 text-white/60'
              }`}>
                {details.similar.results.length}
              </span>
            </button>
          )}

          {details.videos?.results?.length > 0 && (
            <button
              onClick={() => setActiveTab('trailers')}
              className={`flex items-center gap-2 px-4.5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all duration-150 cursor-pointer ${
                activeTab === 'trailers'
                  ? 'bg-white text-black shadow-md scale-100'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Trailers & More</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === 'trailers' ? 'bg-black/10 text-black' : 'bg-white/10 text-white/60'
              }`}>
                {details.videos.results.length}
              </span>
            </button>
          )}
        </div>

        {}
        <div className="py-5 pb-24">
          {activeTab === 'more' && details.similar?.results?.length > 0 && (
            <div className="grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2.5 md:gap-3">
              {details.similar.results.slice(0, 21).map((movie) => (
                <div
                  key={movie.id}
                  className="relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer bg-white/5 hover:scale-[1.03] transition-transform duration-200"
                  onClick={() => navigate(`/${type}/${movie.id}`)}
                >
                  <PosterImage
                    src={getImageUrl(movie.poster_path)}
                    alt={movie.title || movie.name}
                    className="w-full h-full"
                  />
                </div>
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
      </div>

      <VideoModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
      />
    </div>
  );
};
