import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MovieDetails } from '../types';
import { getImageUrl } from '../services/tmdbService';

const Building2 = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
    <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>
  </svg>
);

const Film = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18"/>
    <line x1="7" x2="7" y1="2" y2="22"/>
    <line x1="17" x2="17" y1="2" y2="22"/>
    <line x1="2" x2="22" y1="12" y2="12"/>
    <line x1="2" x2="7" y1="7" y2="7"/>
    <line x1="2" x2="7" y1="17" y2="17"/>
    <line x1="17" x2="22" y1="17" y2="17"/>
    <line x1="17" x2="22" y1="7" y2="7"/>
  </svg>
);

const Tag = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
    <path d="M7 7h.01"/>
  </svg>
);

const Calendar = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
    <line x1="16" x2="16" y1="2" y2="6"/>
    <line x1="8" x2="8" y1="2" y2="6"/>
    <line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

const Globe = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" x2="22" y1="12" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const DollarSign = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" x2="12" y1="2" y2="22"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const Award = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"/>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
  </svg>
);

const Layers = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);

const ExternalLink = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" x2="21" y1="14" y2="3"/>
  </svg>
);

interface MediaMetadataSectionProps {
  details: MovieDetails;
  type: 'movie' | 'tv';
}

export const MediaMetadataSection: React.FC<MediaMetadataSectionProps> = ({ details, type }) => {
  const navigate = useNavigate();

  const keywords = (details.keywords?.keywords || details.keywords?.results || []).filter(
    (kw) => Boolean(kw && kw.name)
  );

  const formatCurrency = (amount?: number) => {
    if (!amount || amount <= 0) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const productionCompanies = details.production_companies || [];
  const networks = details.networks || [];
  const countries = details.production_countries || [];
  const languages = details.spoken_languages || [];
  const budgetStr = formatCurrency(details.budget);
  const revenueStr = formatCurrency(details.revenue);
  const formattedReleaseDate = formatDate(details.release_date || details.first_air_date);

  const hasAnyInfo =
    productionCompanies.length > 0 ||
    networks.length > 0 ||
    keywords.length > 0 ||
    details.status ||
    countries.length > 0 ||
    languages.length > 0 ||
    budgetStr ||
    revenueStr ||
    details.tagline;

  if (!hasAnyInfo) return null;

  return (
    <div className="w-full mt-10 md:mt-14 pt-8 md:pt-10 border-t border-white/10 space-y-8 md:space-y-10">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-white/50" />
          <h3 className="text-xs md:text-sm font-bold tracking-widest text-white/50 uppercase">
            Information & Production
          </h3>
        </div>
        {details.status && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full card-glass-debossed">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-white/80">{details.status}</span>
          </div>
        )}
      </div>

      {productionCompanies.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] md:text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-white/40" />
              <span>Production Companies</span>
            </h4>
            <span className="text-[10px] md:text-[11px] font-semibold text-white/30">
              {productionCompanies.length} Studios
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar overscroll-x-contain py-2 px-0.5">
            {productionCompanies.map((company) => (
              <button
                key={company.id}
                onClick={() => navigate(`/studio/${company.id}`)}
                className="flex items-center gap-3.5 shrink-0 card-glass-debossed rounded-2xl px-4 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:border-white/30 active:scale-95 cursor-pointer group"
              >
                {company.logo_path ? (
                  <div className="w-12 h-7 flex items-center justify-center shrink-0">
                    <img
                      src={getImageUrl(company.logo_path, 'w500')}
                      alt={company.name}
                      className="max-h-7 max-w-[48px] object-contain brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                    <Building2 className="w-3.5 h-3.5 text-white/40" />
                  </div>
                )}
                <div className="text-left">
                  <span className="text-xs font-bold text-white/90 group-hover:text-white transition-colors block leading-tight max-w-[150px] truncate">
                    {company.name}
                  </span>
                  {company.origin_country && (
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider mt-0.5 block">
                      {company.origin_country}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {type === 'tv' && networks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] md:text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
              <Film className="w-3.5 h-3.5 text-white/40" />
              <span>Original Networks</span>
            </h4>
            <span className="text-[10px] md:text-[11px] font-semibold text-white/30">
              {networks.length} Networks
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar overscroll-x-contain py-2 px-0.5">
            {networks.map((network) => (
              <button
                key={network.id}
                onClick={() => navigate(`/network/${network.id}`)}
                className="flex items-center gap-3 shrink-0 card-glass-debossed rounded-2xl px-4 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:border-white/30 active:scale-95 cursor-pointer group"
              >
                {network.logo_path ? (
                  <img
                    src={getImageUrl(network.logo_path, 'w500')}
                    alt={network.name}
                    className="h-6 max-w-[80px] object-contain brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <span className="text-xs font-bold text-white/90">{network.name}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {keywords.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] md:text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-white/40" />
              <span>Tags & Themes</span>
            </h4>
            <span className="text-[10px] md:text-[11px] font-semibold text-white/30">
              {keywords.length} Tags
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <button
                key={kw.id}
                onClick={() => navigate(`/search?q=${encodeURIComponent(kw.name)}`)}
                className="card-glass-debossed px-3 py-1.5 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:border-white/25 active:scale-95 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
              >
                <span className="text-white/35">#</span>
                <span>{kw.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">

        {(details.original_title || details.original_name) && (
          <div className="card-glass-debossed p-3.5 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
              Original Title
            </span>
            <span className="text-xs font-bold text-white/90 truncate" title={details.original_title || details.original_name}>
              {details.original_title || details.original_name}
            </span>
          </div>
        )}

        {formattedReleaseDate && (
          <div className="card-glass-debossed p-3.5 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-white/30" />
              <span>{type === 'tv' ? 'First Aired' : 'Release Date'}</span>
            </span>
            <span className="text-xs font-bold text-white/90 truncate">
              {formattedReleaseDate}
            </span>
          </div>
        )}

        {languages.length > 0 && (
          <div className="card-glass-debossed p-3.5 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Globe className="w-3 h-3 text-white/30" />
              <span>Spoken Languages</span>
            </span>
            <span className="text-xs font-bold text-white/90 truncate" title={languages.map(l => l.english_name || l.name).join(', ')}>
              {languages.map((l) => l.english_name || l.name).slice(0, 2).join(', ')}
              {languages.length > 2 ? ` +${languages.length - 2}` : ''}
            </span>
          </div>
        )}

        {countries.length > 0 && (
          <div className="card-glass-debossed p-3.5 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
              Origin Countries
            </span>
            <span className="text-xs font-bold text-white/90 truncate" title={countries.map(c => c.name).join(', ')}>
              {countries.map((c) => c.name).slice(0, 2).join(', ')}
              {countries.length > 2 ? ` +${countries.length - 2}` : ''}
            </span>
          </div>
        )}

        {budgetStr && (
          <div className="card-glass-debossed p-3.5 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-white/30" />
              <span>Budget</span>
            </span>
            <span className="text-xs font-bold text-white/90 tabular-nums">
              {budgetStr}
            </span>
          </div>
        )}

        {revenueStr && (
          <div className="card-glass-debossed p-3.5 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Award className="w-3 h-3 text-white/30" />
              <span>Revenue</span>
            </span>
            <span className="text-xs font-bold text-emerald-400 tabular-nums">
              {revenueStr}
            </span>
          </div>
        )}

        {type === 'tv' && details.number_of_seasons && (
          <div className="card-glass-debossed p-3.5 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
              Total Content
            </span>
            <span className="text-xs font-bold text-white/90 tabular-nums">
              {details.number_of_seasons} Seasons · {details.number_of_episodes || 0} Ep
            </span>
          </div>
        )}

        {details.homepage && (
          <div className="card-glass-debossed p-3.5 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
              Official Website
            </span>
            <a
              href={details.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-accent hover:underline flex items-center gap-1 truncate"
            >
              <span>Visit Page</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        )}
      </div>

      {details.tagline && (
        <div className="text-center py-2">
          <p className="text-xs md:text-sm italic font-medium text-white/40 tracking-wide">
            "{details.tagline}"
          </p>
        </div>
      )}
    </div>
  );
};
