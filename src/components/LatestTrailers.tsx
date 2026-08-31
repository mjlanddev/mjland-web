import React, { useEffect, useState, useRef } from 'react';
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

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 0);
      setShowRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [trailers]);

  if (trailers.length === 0 && !loading) return null;

  return (
    <>
      <div 
        className="py-4 md:py-6 group/row relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 px-4 md:px-6">
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight shrink-0">Latest Trailers</h2>
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveGroup(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all whitespace-nowrap border ${
                  activeGroup === tab.id 
                    ? 'bg-white text-black border-white' 
                    : 'bg-transparent text-white/60 border-white/20 hover:border-white/50 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className={`absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-bg via-bg/20 to-transparent z-10 pointer-events-none transition-opacity duration-500 ${showLeft ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-bg via-bg/20 to-transparent z-10 pointer-events-none transition-opacity duration-500 ${showRight ? 'opacity-100' : 'opacity-0'}`} />

          <AnimatePresence>
            {isHovered && window.innerWidth >= 768 && (
              <>
                {showLeft && (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onClick={() => scroll('left')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 z-20 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-all group/btn"
                  >
                    <ChevronLeftRegular className="w-6 h-6 text-white group-hover/btn:scale-110 transition-transform" />
                  </motion.button>
                )}
                {showRight && (
                  <motion.button
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onClick={() => scroll('right')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 z-20 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-all group/btn"
                  >
                    <ChevronRightRegular className="w-6 h-6 text-white group-hover/btn:scale-110 transition-transform" />
                  </motion.button>
                )}
              </>
            )}
          </AnimatePresence>

          <div 
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-2 overflow-x-auto no-scrollbar px-4 md:px-6 py-4 -my-4"
          >
            {trailers.map((trailer) => (
              <div 
                key={trailer.id}
                className="flex-none w-48 md:w-64 flex flex-col gap-3 group/card cursor-pointer"
                onClick={() => setActiveTrailer(trailer)}
              >
                <div className="relative aspect-video rounded-lg overflow-hidden bg-white/5 anim-poster">
                  <LazyImage 
                    src={trailer.backdrop} 
                    alt={trailer.title}
                    className="w-full h-full object-cover transition-transform duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <PlayFilled className="w-10 h-10 text-white fill-current" />
                  </div>
                </div>
                
                <div className="flex flex-col items-start px-0.5">
                  <h3 className="text-sm md:text-base font-bold text-white line-clamp-1 group-hover/card:text-accent transition-colors">
                    {trailer.title}
                  </h3>
                  {trailer.subtitle && (
                    <p className="text-[10px] md:text-xs text-white/60 line-clamp-1 mt-0.5 font-medium">
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
