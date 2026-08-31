import React from 'react';

export const ImdbBadge = ({ rating, className = "" }: { rating: number | string, className?: string }) => {
  if (!rating) return null;
  return (
    <div 
      className={`flex flex-col border-[1.5px] rounded-[3px] overflow-hidden text-black shrink-0 w-fit h-fit leading-none shadow-md drop-shadow-sm ${className}`}
      style={{ 
        borderColor: '#f5c518',
        borderTopColor: '#ffe87c',
        borderLeftColor: '#ffe87c',
        borderBottomColor: '#b38d00',
        borderRightColor: '#b38d00'
      }}
    >
      <div 
        className="text-white text-[4px] md:text-[5px] font-black px-1.5 py-[2px] text-center uppercase tracking-widest"
        style={{
          background: 'linear-gradient(to bottom, #4a4a4a, #000000)',
          boxShadow: 'inset 1px 1px 1px rgba(255,255,255,0.25), inset -1px -1px 1px rgba(0,0,0,0.6)'
        }}
      >
        IMDb
      </div>
      <div 
        className="text-[10px] md:text-[11px] font-black px-2 py-0.5 md:py-1 text-center tracking-tight text-black"
        style={{ 
          background: 'linear-gradient(to bottom, #fdd531, #e0b000)',
          boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.7), inset -1px -1px 2px rgba(0,0,0,0.15)',
          textShadow: '0px 1px 1px rgba(255,255,255,0.5)'
        }}
      >
        {typeof rating === 'number' ? rating.toFixed(1) : rating}
      </div>
    </div>
  );
};
