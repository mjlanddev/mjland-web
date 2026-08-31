import React from 'react';

const getMpaaHeader = (rating: string) => {
  const r = rating.toUpperCase();
  if (r === 'G') return 'GENERAL AUDIENCES';
  if (r === 'PG') return 'PARENTAL GUIDANCE';
  if (r.includes('PG-13')) return 'PARENTS CAUTIONED';
  if (r === 'R') return 'RESTRICTED';
  if (r === 'NC-17') return 'NO ONE 17 & UNDER';
  if (r.includes('U/A') || r.includes('TV-14') || r.includes('TV-PG')) return 'PARENTAL GUIDANCE';
  if (r === 'A' || r.includes('TV-MA')) return 'RESTRICTED';
  return 'CERTIFIED RATING';
};

export const MpaaBadge = ({ rating, className = "" }: { rating: string, className?: string }) => {
  if (!rating) return null;
  return (
    <div 
      className={`flex flex-col border-[1.5px] rounded-[3px] overflow-hidden bg-white text-black shrink-0 w-fit h-fit leading-none shadow-md drop-shadow-sm ${className}`}
      style={{
        borderColor: '#e5e5e5',
        borderTopColor: '#ffffff',
        borderLeftColor: '#ffffff',
        borderBottomColor: '#a0a0a0',
        borderRightColor: '#a0a0a0',
      }}
    >
      <div 
        className="text-white text-[4px] md:text-[5px] font-black px-1.5 py-[2px] text-center uppercase tracking-widest"
        style={{
          background: 'linear-gradient(to bottom, #4a4a4a, #000000)',
          boxShadow: 'inset 1px 1px 1px rgba(255,255,255,0.25), inset -1px -1px 1px rgba(0,0,0,0.6)'
        }}
      >
        {getMpaaHeader(rating)}
      </div>
      <div 
        className="text-[10px] md:text-[11px] font-black px-2 py-0.5 md:py-1 text-center tracking-tight"
        style={{
          background: 'linear-gradient(to bottom, #ffffff, #e0e0e0)',
          boxShadow: 'inset 1px 1px 2px rgba(255,255,255,1), inset -1px -1px 2px rgba(0,0,0,0.1)',
          textShadow: '0px 1px 1px rgba(255,255,255,0.8)'
        }}
      >
        {rating}
      </div>
    </div>
  );
};
