import React from 'react';
import { IMDbLogo } from './IMDbLogo';

export const ImdbBadge = ({ rating, className = "" }: { rating: number | string, className?: string }) => {
  if (!rating) return null;
  const num = typeof rating === 'number' ? rating : parseFloat(rating);
  if (isNaN(num) || num <= 0) return null;
  const formatted = num.toFixed(1);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 text-white shrink-0 transition-colors shadow-sm select-none h-6 ${className}`}
      title={`IMDb Rating: ${formatted} / 10`}
    >
      <IMDbLogo className="h-3 w-auto shrink-0 rounded-[2px]" />
      <span className="text-xs font-bold text-white tabular-nums tracking-tight leading-none">
        {formatted}
      </span>
    </div>
  );
};
