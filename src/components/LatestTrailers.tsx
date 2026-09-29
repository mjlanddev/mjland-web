import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft01Icon as ChevronLeftRegular,
  ArrowRight01Icon as ChevronRightRegular,
  PlayIcon as PlayFilled,
  Cancel01Icon as DismissRegular
} from 'hugeicons-react';
import { useNavigate } from 'react-router-dom';
import { VideoModal } from './VideoModal';
import { LazyImage } from './LazyImage';

interface Trailer {
  id: string;
  tmdbId: string;
  mediaType: string;
  title: string;
  subtitle: string;
  backdrop: string;
}

export const LatestTrailers = () => {
  const tabs = [
    { id: 'popular', label: 'Popular' },
    { id: 'streaming', label: 'Streaming' },
    { id: 'on-tv', label: 'On TV' },
    { id: 'for-rent', label: 'For Rent' },
    { id: 'in-theatres', label: 'In Theatres' }
  ];

  const [activeGroup, setActiveGroup] = useState<string>('popular');
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [activeTrailer, setActiveTrailer] = useState<Trailer | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrailers = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/tmdb-panel?panel=trailer_scroller&group=${activeGroup}`);
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');

        const trailerElements = doc.querySelectorAll('.media-card-list > .group');
        const parsedTrailers: Trailer[] = [];

        trailerElements.forEach(el => {
          const playLink = el.querySelector('a.play_trailer');
          const optionsDiv = el.querySelector('.options');
          const titleEl = el.querySelector('h2 a');
          const subtitleEl = el.querySelector('h3');
          const imgEl = el.querySelector('img.backdrop');

          if (playLink && optionsDiv && titleEl && imgEl) {
            parsedTrailers.push({
              id: playLink.getAttribute('data-id') || '',
              tmdbId: optionsDiv.getAttribute('data-id') || '',
              mediaType: optionsDiv.getAttribute('data-media-type') || 'movie',
              title: titleEl.textContent || '',
              subtitle: subtitleEl?.textContent || '',
              backdrop: imgEl.getAttribute('src') || ''
            });
          }
        });

        setTrailers(parsedTrailers);
      } catch (error) {
        console.error('Failed to fetch trailers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrailers();
  }, [activeGroup]);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 6);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    const t1 = setTimeout(checkScroll, 100);
    const t2 = setTimeout(checkScroll, 400);

    const observer = new ResizeObserver(() => {
      checkScroll();
    });
    observer.observe(el);

    if (el.firstElementChild) observer.observe(el.firstElementChild);
    if (el.lastElementChild) observer.observe(el.lastElementChild);

    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
      window.removeEventListener('resize', checkScroll);
    };
  }, [trailers, checkScroll]);

  if (trailers.length === 0 && !loading) return null;

  return (
    <>
      <div
        className="py-4 md:py-6 group/row relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 px-4 md:px-6">
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight shrink-0">Latest Trailers</h2>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0 glass-debossed p-1 rounded-full">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveGroup(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeGroup === tab.id
                    ? 'btn-beveled-solid'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className={`absolute inset-y-0 left-0 w-16 sm:w-24 md:w-32 lg:w-40 bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none transition-opacity duration-300 ${showLeft ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`absolute inset-y-0 right-0 w-16 sm:w-24 md:w-32 lg:w-40 bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none transition-opacity duration-300 ${showRight ? 'opacity-100' : 'opacity-0'}`} />

          <AnimatePresence>
            {isHovered && window.innerWidth >= 768 && (
              <>
                {showLeft && (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onClick={() => scroll('left')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 z-30 flex items-center justify-center btn-glass-beveled rounded-full text-white cursor-pointer"
                    aria-label="Scroll left"
                  >
                    <ChevronLeftRegular className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </motion.button>
                )}
                {showRight && (
                  <motion.button
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onClick={() => scroll('right')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 z-30 flex items-center justify-center btn-glass-beveled rounded-full text-white cursor-pointer"
                    aria-label="Scroll right"
                  >
                    <ChevronRightRegular className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </motion.button>
                )}
              </>
            )}
          </AnimatePresence>

          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-4 overflow-x-auto no-scrollbar px-4 md:px-6 py-3"
          >
            {trailers.map((trailer) => (
              <div
                key={trailer.id}
                className="flex-none w-56 md:w-72 flex flex-col gap-2.5 group/card cursor-pointer"
                onClick={() => setActiveTrailer(trailer)}
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden card-glass-debossed transition-transform duration-200 group-hover/card:-translate-y-1 shadow-lg">
                  <LazyImage
                    src={trailer.backdrop}
                    alt={trailer.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/30 backdrop-blur-xs">
                    <div className="w-12 h-12 rounded-full glass-debossed flex items-center justify-center shadow-xl">
                      <PlayFilled className="w-5 h-5 text-white fill-current translate-x-0.5" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start px-1">
                  <h3 className="text-xs md:text-sm font-semibold text-white/95 line-clamp-1 group-hover/card:text-white transition-colors">
                    {trailer.title}
                  </h3>
                  {trailer.subtitle && (
                    <p className="text-[11px] md:text-xs text-white/50 line-clamp-1 mt-0.5 font-normal">
                      {trailer.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <VideoModal
        video={activeTrailer ? {
          id: activeTrailer.id,
          title: activeTrailer.title,
          subtitle: activeTrailer.subtitle,
          tmdbId: activeTrailer.tmdbId,
          mediaType: activeTrailer.mediaType
        } : null}
        onClose={() => setActiveTrailer(null)}
      />
    </>
  );
};
