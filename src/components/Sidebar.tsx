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
    <div className="hidden md:block w-[72px] shrink-0 z-[60]">
      <aside className="fixed left-0 top-0 h-screen w-[72px] flex-col items-center py-6 bg-black/40 backdrop-blur-md hover:bg-black/90 hover:backdrop-blur-2xl group hover:w-64 transition-all duration-300 ease-out flex overflow-hidden border-r border-white/5">
        <div className="mb-10 w-full flex justify-center mt-2">
          <CornLogo className="h-8" />
        </div>
      
      <nav className="flex flex-col gap-6 w-full px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center group/item transition-all duration-300 ease-out active:scale-95"
          >
            {({ isActive }) => {
              const Icon = item.icon;
              return (
                <div className={`flex items-center w-full ${isActive ? 'text-white' : 'text-text-secondary hover:text-white transition-colors duration-300'}`}>
                  <div className="w-[40px] flex justify-center shrink-0">
                    <Icon className={`w-[22px] h-[22px] ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'group-hover/item:scale-110'} transition-transform duration-300`} />
                  </div>
                  <span className="opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 group-hover:ml-4 transition-all duration-300 ease-out font-medium whitespace-nowrap text-[15px] overflow-hidden">
                    {item.label}
                  </span>
                </div>
              );
            }}
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-auto w-full px-4 mb-4 flex flex-col gap-6">
        <a
          href="https://github.com/mjlanddev/mjland-web"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center group/item transition-all duration-300 ease-out active:scale-95"
        >
          <div className="flex items-center w-full text-text-secondary hover:text-white transition-colors duration-300">
            <div className="w-[40px] flex justify-center shrink-0">
              <svg className="w-[22px] h-[22px] group-hover/item:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </div>
            <span className="opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 group-hover:ml-4 transition-all duration-300 ease-out font-medium text-[15px] whitespace-nowrap overflow-hidden text-emerald-400">
              Star on GitHub
            </span>
          </div>
        </a>

        <NavLink
          to="/profile"
          className="flex items-center group/item transition-all duration-300 ease-out active:scale-95"
        >
          {({ isActive }) => {
            const Icon = PersonIcon;
            return (
              <div className={`flex items-center w-full ${isActive ? 'text-white' : 'text-text-secondary hover:text-white transition-colors duration-300'}`}>
                <div className="w-[40px] flex justify-center shrink-0">
                  <Icon className={`w-[22px] h-[22px] ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'group-hover/item:scale-110'} transition-transform duration-300`} />
                </div>
                <span className="opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 group-hover:ml-4 transition-all duration-300 ease-out font-medium text-[15px] whitespace-nowrap overflow-hidden">
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
