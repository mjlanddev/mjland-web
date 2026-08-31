import React, { useState, useEffect, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlayIcon as Play,
  LockIcon as LockClosedRegular,
  ArrowLeft01Icon as ChevronLeftRegular,
  ArrowRight01Icon as ChevronRightRegular,
} from "hugeicons-react";
import { tmdbService, getImageUrl } from "../services/tmdbService";
import { LazyImage } from "./LazyImage";
import { storageService } from "../services/storageService";

interface Episode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  still_path: string;
  air_date: string;
  runtime: number;
  overview: string;
}

interface EpisodesSectionProps {
  animeId: number;
  totalEpisodes?: number;
  totalSeasons?: number;
  status?: string;
  type: string;
  gridLayout?: boolean;
}

const PAGE_SIZE_GRID = 24; 
const PAGE_SIZE_LIST = 12; 

export const EpisodesSection: React.FC<EpisodesSectionProps> = ({
  animeId,
  totalEpisodes,
  totalSeasons,
  status,
  type,
  gridLayout,
}) => {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const disableStreaming = import.meta.env.VITE_DISABLE_STREAMING === 'true';
  const [historyItem, setHistoryItem] = useState<any>(null);

  useEffect(() => {
    const updateHistory = () => {
      setHistoryItem(storageService.getContinueWatchingItem(animeId));
    };
    updateHistory();
    window.addEventListener('continueWatchingUpdated', updateHistory);
    return () => window.removeEventListener('continueWatchingUpdated', updateHistory);
  }, [animeId]);

  const handleEpisodeClick = (ep: Episode) => {
    const isAired = !ep.air_date || new Date(ep.air_date) <= new Date();
    if (!isAired) return;

    if (!disableStreaming) {
      navigate(`/watch/tv/${animeId}/${selectedSeason}/${ep.episode_number}`);
    }
  };

  const pageSize = gridLayout ? PAGE_SIZE_GRID : PAGE_SIZE_LIST;
  const totalPages = Math.ceil(episodes.length / pageSize);
  const start = (currentPage - 1) * pageSize;
  const pageEpisodes = episodes.slice(start, start + pageSize);

  useEffect(() => {
    if (type === "movie") return;
    setLoading(true);
    setError(false);
    setCurrentPage(1);
    tmdbService
      .getTVSeasonDetails(animeId, selectedSeason)
      .then((data: any) => {
        setEpisodes(data.episodes || []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [animeId, type, selectedSeason]);

  if (type === "movie") return null;

  const goToPage = (p: number) => {
    setCurrentPage(p);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const formatRuntime = (min: number) => (min ? `${min}m` : "24m");
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  // Build compact page-number array with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  };

  return (
    <div ref={sectionRef} className="w-full">
      {}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">Episodes</h3>
        {episodes.length > 0 && (
          <span className="text-xs md:text-sm text-white/50 font-semibold">
            {episodes.length} episodes
          </span>
        )}
      </div>

      {}
      {totalSeasons && totalSeasons > 1 && (
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar mb-5 pb-1 -mx-1 px-1">
          {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSeason(s)}
              className={`btn-glass-beveled px-5 py-2 rounded-full font-bold text-xs shrink-0 cursor-pointer ${
                selectedSeason === s ? 'active' : ''
              }`}
            >
              Season {s}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className={gridLayout ? "grid grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-6" : "space-y-2.5"}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`flex ${gridLayout ? 'gap-4' : 'gap-3 items-start py-2'}`}>
              <div className={`relative flex-shrink-0 rounded-xl bg-white/5 animate-pulse ${gridLayout ? 'w-44 aspect-video' : 'w-32 sm:w-36 aspect-video'}`} />
              <div className={`flex-1 min-w-0 ${gridLayout ? 'flex flex-col justify-center gap-2' : 'py-0.5 flex flex-col gap-2'}`}>
                <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-1/4 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : error || episodes.length === 0 ? (
        <div className="text-center py-12 text-white/50">
          <p className="text-sm">Episode list not available.</p>
        </div>
      ) : (
        <>
          {}
          {gridLayout ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-6">
              {pageEpisodes.map((ep) => {
                const isAired = !ep.air_date || new Date(ep.air_date) <= new Date();
                const isWatched = historyItem?.season_number === selectedSeason && historyItem?.episode_number === ep.episode_number;
                return (
                  <div
                    key={ep.id}
                    onClick={() => handleEpisodeClick(ep)}
                    tabIndex={isAired ? 0 : -1}
                    className={`group flex flex-col gap-2.5 rounded-xl transition-all ${
                      isAired ? "cursor-pointer active:scale-[0.98]" : "opacity-50"
                    } ${isWatched ? "ring-1 ring-accent/40 bg-white/[0.02] p-2" : ""}`}
                  >
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/5 shadow-md">
                      {ep.still_path ? (
                        <LazyImage
                          src={getImageUrl(ep.still_path)}
                          alt={ep.name}
                          className="w-full h-full object-cover transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center">
                          <span className="text-white/10 text-4xl font-black">{ep.episode_number}</span>
                        </div>
                      )}
                      {isAired && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-10 h-10 fill-current text-white" />
                        </div>
                      )}
                      {!isAired && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <LockClosedRegular className="w-6 h-6 text-white/60" />
                        </div>
                      )}
                      {isWatched && (
                        <div className="absolute top-2 right-2 bg-red-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-white shadow-lg">
                          Last Watched
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm rounded-md px-2 py-0.5 text-[10px] font-bold text-white/90">
                        {formatRuntime(ep.runtime)}
                      </div>
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-md px-2 py-0.5 text-[10px] font-bold text-white/80">
                        EP {ep.episode_number}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white leading-snug line-clamp-1 group-hover:text-accent transition-colors">
                        {ep.name || `Episode ${ep.episode_number}`}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
                        {ep.air_date && <span>{formatDate(ep.air_date)}</span>}
                      </div>
                      {ep.overview && ep.overview !== "Episode overview not available." && (
                        <p className="text-xs text-white/50 leading-relaxed line-clamp-2 pt-0.5">
                          {ep.overview}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            
            <div className="space-y-1.5">
              {pageEpisodes.map((ep) => {
                const isAired = !ep.air_date || new Date(ep.air_date) <= new Date();
                const isWatched = historyItem?.season_number === selectedSeason && historyItem?.episode_number === ep.episode_number;
                return (
                  <div
                    key={ep.id}
                    onClick={() => handleEpisodeClick(ep)}
                    tabIndex={isAired ? 0 : -1}
                    className={`group flex gap-3 items-center rounded-xl transition-all duration-200 py-2 px-1.5 ${
                      isAired ? "cursor-pointer hover:bg-white/5 active:scale-[0.98]" : "opacity-60"
                    } ${isWatched ? "bg-white/[0.04] ring-1 ring-accent/30" : ""}`}
                  >
                    <div className="relative flex-shrink-0 w-32 sm:w-40 aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/5 shadow-sm">
                      {ep.still_path ? (
                        <LazyImage
                          src={getImageUrl(ep.still_path)}
                          alt={ep.name}
                          className="w-full h-full object-cover transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center">
                          <span className="text-white/20 text-xl font-black">{ep.episode_number}</span>
                        </div>
                      )}
                      {isAired && (
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-7 h-7 fill-current text-white drop-shadow-lg" />
                        </div>
                      )}
                      {!isAired && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <LockClosedRegular className="w-5 h-5 text-white/60" />
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-md rounded px-1.5 py-0.5 text-[9px] font-bold text-white tracking-wide">
                        E{ep.episode_number}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                      <div className="flex items-start justify-between gap-1.5 mb-0.5">
                        <h4 className="text-xs sm:text-sm font-bold text-white/95 leading-tight line-clamp-1 group-hover:text-accent transition-colors">
                          {ep.name || `Episode ${ep.episode_number}`}
                        </h4>
                        <span className="text-[9px] sm:text-[10px] text-white/50 font-medium flex-shrink-0">
                          {formatRuntime(ep.runtime)}
                        </span>
                      </div>
                      {ep.air_date && (
                        <p className="text-[10px] sm:text-[11px] text-white/50 font-medium mb-1">{formatDate(ep.air_date)}</p>
                      )}
                      {ep.overview && ep.overview !== "Episode overview not available." && (
                        <p className="text-[11px] text-white/40 leading-snug line-clamp-2">{ep.overview}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-1.5 flex-wrap">
              {}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous Page"
                className="btn-glass-beveled w-9 h-9 flex items-center justify-center rounded-xl disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeftRegular className="w-4 h-4" />
              </button>

              {}
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="w-8 text-center text-white/40 text-sm select-none">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p as number)}
                    aria-label={`Page ${p}`}
                    aria-current={currentPage === p ? 'page' : undefined}
                    className={`btn-glass-beveled w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold ${
                      currentPage === p ? 'active' : ''
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              {}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next Page"
                className="btn-glass-beveled w-9 h-9 flex items-center justify-center rounded-xl disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRightRegular className="w-4 h-4" />
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <p className="text-center text-[11px] text-white/30 mt-2.5 font-medium">
              Showing {start + 1}-{Math.min(start + pageSize, episodes.length)} of {episodes.length} episodes
            </p>
          )}
        </>
      )}
    </div>
  );
};
