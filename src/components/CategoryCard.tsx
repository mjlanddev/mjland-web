import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft01Icon as ChevronLeft, ArrowRight01Icon as ChevronRight } from 'hugeicons-react';
import { PosterImage } from './PosterImage';

interface CategoryCardProps {
  title: string;
  subtitle?: string;
  image: string | undefined;
  onClick?: () => void | Promise<void>;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ title, subtitle, image, onClick, className }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex-none aspect-video rounded-xl overflow-hidden cursor-pointer group shadow-lg border border-white/5 hover:border-white/20 transition-all ${className || 'w-[150px] sm:w-[170px] md:w-52'}`}
      onClick={onClick}
    >
      <PosterImage
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-200 ease-out"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-2.5 md:p-3.5 group-hover:from-black/95 transition-all">
        <h3 className="text-xs sm:text-sm md:text-base font-black tracking-tight text-white group-hover:text-accent transition-colors drop-shadow-md">{title}</h3>
        {subtitle && <p className="text-[9px] md:text-[11px] text-white/50 truncate font-medium mt-0.5">{subtitle}</p>}
      </div>
      <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-white/25 rounded-xl pointer-events-none transition-all" />
    </motion.div>
  );
};

export const CategoryRow = ({ title, children, onTitleClick }: { title: string; children: React.ReactNode; onTitleClick?: () => void }) => {
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

  const onWheelCapture = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.stopPropagation();
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  return (
    <div 
      className="py-4 md:py-6 group/row relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-3 px-4 md:px-6">
        <h2 
          className={`text-xl md:text-2xl font-bold text-white tracking-tight ${onTitleClick ? 'cursor-pointer hover:text-accent transition-colors flex items-center gap-2 group/title' : ''}`}
          onClick={onTitleClick}
        >
          {title}
          {onTitleClick && <ChevronRight className="w-5 h-5 text-white/40 group-hover/title:text-accent group-hover/title:translate-x-1 transition-all" />}
        </h2>
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
          onWheel={onWheelCapture}
          className="flex gap-3 md:gap-4 overflow-x-auto overscroll-x-contain no-scrollbar px-4 md:px-6 py-4 -my-4"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

