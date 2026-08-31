import React, { useEffect, useState, useRef } from 'react';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight01Icon as ChevronRight, ArrowLeft01Icon as ChevronLeft } from 'hugeicons-react';
import { useNavigate } from 'react-router-dom';
import { PosterImage } from './PosterImage';

interface Studio {
  id: number;
  name: string;
  logo_path: string;
}

import { TMDB_CONFIG } from '../config/tmdbConfig';

import { LazyImage } from './LazyImage';

const STUDIO_IDS = TMDB_CONFIG.studios.map(s => s.id);

export const StudiosRow = () => {
  const [studios, setStudios] = useState<Studio[]>([]);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 10);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const fetchStudios = async () => {
      try {
        const results = await Promise.all(
          STUDIO_IDS.map(id => tmdbService.getStudioDetails(id))
        );
        setStudios(results);
      } catch (error) {
      }
    };
    fetchStudios();
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [studios]);

  return (
    <div 
      className="py-4 md:py-6 group/row relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-3 px-4 md:px-6">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Studios</h2>
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
                  <ChevronLeft className="w-6 h-6 text-white group-hover/btn:scale-110 transition-transform" />
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
                  <ChevronRight className="w-6 h-6 text-white group-hover/btn:scale-110 transition-transform" />
                </motion.button>
              )}
            </>
          )}
        </AnimatePresence>

        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 overflow-x-auto no-scrollbar px-4 md:px-6 py-4 -my-4"
        >
          {studios.map((studio) => (
            <motion.div
              key={studio.id}
              onClick={() => navigate(`/studio/${studio.id}`)}
              className="flex-none w-[140px] md:w-[180px] aspect-video bg-gradient-to-b from-[#282c34] to-[#1a1d23] rounded-lg flex items-center justify-center p-4 anim-poster group overflow-hidden relative"
            >
              <LazyImage
                src={getImageUrl(studio.logo_path, 'w500')}
                alt={studio.name}
                className="max-w-full max-h-full object-contain brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-2xl z-10"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
