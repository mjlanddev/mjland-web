import React from 'react';

export const Footer = () => {
  const appName = import.meta.env.VITE_APP_NAME || 'mjland';
  
  return (
    <footer className="w-full bg-[#030303] border-t border-white/5 py-14 px-6 md:px-12 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-10 text-center md:text-left">
        
        {}
        <div className="flex flex-col items-center md:items-start gap-1 md:max-w-md">
          <h2 className="text-2xl font-black tracking-tighter text-white mb-2">{appName}</h2>
          <p className="text-[12px] font-medium text-[#8f98b0]/70 leading-relaxed mb-4">
            &copy; {new Date().getFullYear()} {appName}. All Rights Reserved.
          </p>
        </div>

        {}
        <div className="flex flex-wrap md:flex-col justify-center md:justify-start gap-x-6 gap-y-3 text-[13px] font-semibold text-[#8f98b0] pt-2">
          <a href="/disclaimer" className="hover:text-white transition-colors duration-200">Disclaimer</a>
          <a href="/terms" className="hover:text-white transition-colors duration-200">Terms of Use</a>
          <a href="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
          <a href="/cookie-policy" className="hover:text-white transition-colors duration-200">Cookie Policy</a>
        </div>
        
      </div>
    </footer>
  );
};
