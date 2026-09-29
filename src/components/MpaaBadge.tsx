import React from 'react';

const getCertificationLabel = (rating: string) => {
  const r = rating.toUpperCase();
  if (r === 'G') return 'General Audiences - All ages admitted';
  if (r === 'PG') return 'Parental Guidance Suggested';
  if (r.includes('PG-13')) return 'Parents Strongly Cautioned';
  if (r === 'R') return 'Restricted (17+ or with parent)';
  if (r === 'NC-17') return 'No One 17 and Under Admitted';
  if (r.includes('TV-MA')) return 'Mature Audience Only';
  if (r.includes('TV-14')) return 'Parents Strongly Cautioned';
  if (r.includes('TV-PG')) return 'Parental Guidance Suggested';
  if (r.includes('TV-G') || r.includes('TV-Y')) return 'Suitable for All Ages';
  if (r.includes('U/A')) return 'Parental Guidance for children under 16/13';
  if (r === 'U') return 'Universal - Unrestricted Public Exhibition';
  if (r === 'A') return 'Adults Only';
  return 'Content Rating';
};

export const MpaaBadge = ({ rating, className = "" }: { rating: string, className?: string }) => {
  if (!rating || rating === 'NR') return null;
  const cleanRating = rating.trim();
  if (!cleanRating) return null;

  return (
    <div
      className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] md:text-[11px] font-bold tracking-wide uppercase border border-white/20 bg-white/[0.05] text-white/90 shrink-0 leading-none select-none transition-colors hover:border-white/35 h-6 ${className}`}
      title={getCertificationLabel(cleanRating)}
    >
      {cleanRating}
    </div>
  );
};
