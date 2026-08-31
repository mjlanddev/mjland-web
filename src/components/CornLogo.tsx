import React from 'react';

export const CornLogo = ({ className = "h-8" }: { className?: string }) => {
  const appName = import.meta.env.VITE_APP_NAME || "mjland";
  const shortName = import.meta.env.VITE_APP_SHORT_NAME || appName.charAt(0);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span className="font-sans font-black tracking-tighter text-white text-2xl flex items-center group cursor-pointer relative h-8">
        <span className="absolute left-1/2 -translate-x-1/2 group-hover:opacity-0 transition-opacity duration-300 whitespace-nowrap">
          {shortName}
        </span>
        <span className="max-w-0 opacity-0 group-hover:max-w-[200px] group-hover:opacity-100 transition-all duration-500 ease-in-out whitespace-nowrap">
          {appName}
        </span>
      </span>
    </div>
  );
};
