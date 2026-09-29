import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const appName = import.meta.env.VITE_APP_NAME || 'mjland';

  return (
    <footer className="w-full liquid-dock border-t border-white/10 rounded-t-3xl md:rounded-t-[36px] py-14 px-6 md:px-12 mt-20 shadow-[0_-16px_48px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-10 text-center md:text-left">

        <div className="flex flex-col items-center md:items-start gap-1 md:max-w-md">
          <h2 className="text-2xl font-black tracking-tighter text-white mb-2">{appName}</h2>
          <p className="text-[12px] font-medium text-white/40 leading-relaxed mb-4 tabular-nums">
            &copy; {new Date().getFullYear()} {appName}. All Rights Reserved.
          </p>
        </div>

        <div className="flex flex-wrap md:flex-col justify-center md:justify-start gap-x-6 gap-y-3 text-[13px] font-medium text-white/60 pt-2">
          <Link to="/disclaimer" className="hover:text-white transition-colors duration-200">Disclaimer</Link>
          <Link to="/terms" className="hover:text-white transition-colors duration-200">Terms of Use</Link>
          <Link to="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link>
          <Link to="/cookie-policy" className="hover:text-white transition-colors duration-200">Cookie Policy</Link>
        </div>

      </div>
    </footer>
  );
};
