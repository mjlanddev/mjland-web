import React, { useState, useEffect, useRef } from 'react';
import { 
  Home01Icon, 
  Search01Icon, 
  UserCircleIcon, 
  Tv01Icon, 
  Video01Icon, 
  Grid02Icon as GridIcon, 
  LanguageCircleIcon, 
  HelpCircleIcon, 
  Menu01Icon 
} from 'hugeicons-react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';

export const MobileNav = () => {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setShowMore(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setShowMore(false);
  }, [location.pathname]);

  const mainNavItems = [
    { icon: Home01Icon, label: 'Home', path: '/' },
    { icon: Search01Icon, label: 'Search', path: '/search' },
    { icon: UserCircleIcon, label: 'My Space', path: '/profile' },
  ];

  const moreNavItems = [
    { icon: Tv01Icon, label: 'TV', path: '/tv' },
    { icon: Video01Icon, label: 'Movies', path: '/movie' },
    { icon: GridIcon, label: 'Genres', path: '/genres' },
    { icon: LanguageCircleIcon, label: 'Languages', path: '/languages' },
    { icon: HelpCircleIcon, label: 'Random', path: '/random' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-[100] w-full flex justify-center" ref={moreRef}>
      <AnimatePresence>
        {showMore && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-4 right-4 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-2 shadow-2xl flex flex-col gap-1 w-48 origin-bottom-right"
          >
            {moreNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : ''}`} variant={isActive ? "solid" : "stroke"} />
                  <span className="text-sm font-semibold">{item.label}</span>
                </NavLink>
              );
            })}
            <div className="my-1 border-t border-white/10" />
            <a
              href="https://github.com/mjlanddev/mjland-web"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl transition-colors text-emerald-400 hover:bg-white/5 hover:text-emerald-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span className="text-sm font-semibold">Star on GitHub</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="w-full bg-[#0a0b0d]/80 backdrop-blur-3xl border-t border-white/10 h-[60px] pb-safe px-4 flex items-center justify-around pointer-events-auto">
        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center h-full px-2 transition-all duration-200
                ${isActive ? 'text-accent' : 'text-white/50 hover:text-white/80'}
              `}
            >
              <Icon className={`${isActive ? 'w-5 h-5 mb-1' : 'w-5 h-5 mb-1'} shrink-0 transition-all`} variant={isActive ? "solid" : "stroke"} />
              <span className={`text-[9px] font-bold tracking-wide transition-all`}>{item.label}</span>
            </NavLink>
          );
        })}
        
        <button
          onClick={() => setShowMore(!showMore)}
          className={`
            flex flex-col items-center justify-center h-full px-2 transition-all duration-200
            ${showMore || moreNavItems.some(i => location.pathname === i.path) ? 'text-accent' : 'text-white/50 hover:text-white/80'}
          `}
        >
          <Menu01Icon className="w-5 h-5 mb-1 shrink-0 transition-all" variant={showMore || moreNavItems.some(i => location.pathname === i.path) ? "solid" : "stroke"} />
          <span className="text-[9px] font-bold tracking-wide">More</span>
        </button>
      </nav>
    </div>
  );
};
