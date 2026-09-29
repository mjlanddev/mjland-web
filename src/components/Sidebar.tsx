import {
  Home01Icon as HomeIcon,
  Search01Icon as SearchIcon,
  Tv01Icon as TvIcon,
  Film01Icon as VideoIcon,
  Grid02Icon as GridIcon,
  LanguageCircleIcon as TranslateIcon,
  MagicWand01Icon as WandIcon,
  UserCircleIcon as PersonIcon
} from 'hugeicons-react';
import { NavLink } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CornLogo } from './CornLogo';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: HomeIcon, label: 'Home', path: '/' },
  { icon: SearchIcon, label: 'Search', path: '/search' },
  { icon: TvIcon, label: 'TV', path: '/tv' },
  { icon: VideoIcon, label: 'Movies', path: '/movie' },
  { icon: GridIcon, label: 'Genres', path: '/genres' },
  { icon: TranslateIcon, label: 'Languages', path: '/languages' },
  { icon: WandIcon, label: 'Random', path: '/random' },
];

export const Sidebar = () => {
  return (
    <div className="hidden md:block w-24 shrink-0 z-[60]">
      <aside className="fixed left-4 top-4 bottom-4 h-[calc(100vh-2rem)] w-[72px] flex flex-col items-center py-6 liquid-dock rounded-3xl hover:w-64 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 ring-1 ring-inset ring-white/10">
        <div className="mb-7 w-full flex justify-center mt-1">
          <CornLogo className="h-8 transition-transform duration-300 group-hover:scale-105" />
        </div>

        <nav className="flex flex-col gap-2 w-full px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex items-center group/item transition-all duration-200 active:scale-95"
            >
              {({ isActive }) => {
                const Icon = item.icon;
                return (
                  <div className={`flex items-center w-full p-2.5 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'glass-debossed text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] ring-1 ring-white/15'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                  }`}>
                    {isActive && (
                      <div className="absolute left-1 w-1 h-5 rounded-full bg-white" />
                    )}
                    <div className="w-[32px] flex justify-center shrink-0">
                      <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-white' : 'group-hover/item:scale-110'} transition-transform duration-200`} />
                    </div>
                    <span className="opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 group-hover:ml-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] font-semibold whitespace-nowrap text-sm overflow-hidden">
                      {item.label}
                    </span>
                    <span className="pointer-events-none absolute left-[80px] top-1/2 -translate-y-1/2 glass px-3 py-1.5 text-xs font-semibold rounded-xl opacity-0 group-hover/item:opacity-100 group-hover:hidden transition-opacity z-50 whitespace-nowrap text-white shadow-xl">
                      {item.label}
                    </span>
                  </div>
                );
              }}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto w-full px-3 mb-1 flex flex-col gap-2">
          <a
            href="https://github.com/mjlanddev/mjland-web"
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex items-center group/item transition-all duration-200 active:scale-95"
          >
            <div className="flex items-center w-full p-2.5 rounded-2xl text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors duration-200">
              <div className="w-[32px] flex justify-center shrink-0">
                <svg className="w-5 h-5 group-hover/item:scale-110 transition-transform duration-200" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </div>
              <span className="opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 group-hover:ml-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] font-semibold text-sm whitespace-nowrap overflow-hidden text-accent">
                Star on GitHub
              </span>
              <span className="pointer-events-none absolute left-[80px] top-1/2 -translate-y-1/2 glass px-3 py-1.5 text-xs font-semibold rounded-xl opacity-0 group-hover/item:opacity-100 group-hover:hidden transition-opacity z-50 whitespace-nowrap text-white shadow-xl">
                GitHub
              </span>
            </div>
          </a>

          <NavLink
            to="/profile"
            className="relative flex items-center group/item transition-all duration-200 active:scale-95"
          >
            {({ isActive }) => {
              const Icon = PersonIcon;
              return (
                <div className={`flex items-center w-full p-2.5 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'glass-debossed text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] ring-1 ring-white/15'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}>
                  {isActive && (
                    <div className="absolute left-1 w-1 h-5 rounded-full bg-white" />
                  )}
                  <div className="w-[32px] flex justify-center shrink-0">
                    <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-white' : 'group-hover/item:scale-110'} transition-transform duration-200`} />
                  </div>
                  <span className="opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 group-hover:ml-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] font-semibold text-sm whitespace-nowrap overflow-hidden">
                    My Space
                  </span>
                  <span className="pointer-events-none absolute left-[80px] top-1/2 -translate-y-1/2 glass px-3 py-1.5 text-xs font-semibold rounded-xl opacity-0 group-hover/item:opacity-100 group-hover:hidden transition-opacity z-50 whitespace-nowrap text-white shadow-xl">
                    My Space
                  </span>
                </div>
              );
            }}
          </NavLink>
        </div>
      </aside>
    </div>
  );
};
