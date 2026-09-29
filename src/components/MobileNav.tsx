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
    <div className="md:hidden fixed bottom-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] inset-x-0 z-[100] flex justify-center pointer-events-none px-4" ref={moreRef}>
      <div className="relative inline-flex pointer-events-auto">
        <AnimatePresence>
          {showMore && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.94 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-full mb-2 right-0 liquid-dock rounded-2xl p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.9)] flex flex-col gap-0.5 w-44 origin-bottom-right border border-white/10 z-50 backdrop-blur-2xl"
            >
              {moreNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 ${
                      isActive
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-white/70 hover:bg-white/[0.08] hover:text-white'
                    }`}
                    aria-label={item.label}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent' : ''}`} variant={isActive ? "solid" : "stroke"} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
              <div className="my-0.5 border-t border-white/10" />
              <a
                href="https://github.com/mjlanddev/mjland-web"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors text-white/70 hover:bg-white/[0.08] hover:text-white"
              >
                <svg className="w-4 h-4 text-white/60 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span className="text-xs font-medium">GitHub</span>
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="inline-flex items-center gap-1 liquid-dock rounded-full p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.85)] border border-white/10 backdrop-blur-2xl">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`
                  relative flex flex-col items-center justify-center h-10 w-16 rounded-full transition-all duration-150 active:scale-95
                  ${isActive ? 'text-white' : 'text-white/50 hover:text-white/80'}
                `}
                aria-label={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavTabMobile"
                    className="absolute inset-0 bg-white/[0.12] rounded-full border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <Icon className={`w-4 h-4 mb-0.5 shrink-0 relative z-10 transition-colors ${isActive ? 'text-accent' : ''}`} variant={isActive ? "solid" : "stroke"} />
                <span className={`text-[10px] leading-tight tracking-tight relative z-10 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}

          <button
            onClick={() => setShowMore(!showMore)}
            className={`
              relative flex flex-col items-center justify-center h-10 w-16 rounded-full transition-all duration-150 active:scale-95
              ${showMore || moreNavItems.some(i => location.pathname === i.path) ? 'text-white' : 'text-white/50 hover:text-white/80'}
            `}
            aria-label="More navigation options"
          >
            {(showMore || moreNavItems.some(i => location.pathname === i.path)) && (
              <motion.div
                layoutId="activeNavTabMobile"
                className="absolute inset-0 bg-white/[0.12] rounded-full border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <Menu01Icon className={`w-4 h-4 mb-0.5 shrink-0 relative z-10 transition-colors ${showMore || moreNavItems.some(i => location.pathname === i.path) ? 'text-accent' : ''}`} variant={showMore || moreNavItems.some(i => location.pathname === i.path) ? "solid" : "stroke"} />
            <span className={`text-[10px] leading-tight tracking-tight relative z-10 ${showMore || moreNavItems.some(i => location.pathname === i.path) ? 'font-bold' : 'font-medium'}`}>
              More
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
};
