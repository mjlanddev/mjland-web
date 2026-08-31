import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { tmdbService } from '../services/tmdbService';
import { motion, AnimatePresence } from 'motion/react';
import { Search01Icon as SearchIcon, Cancel01Icon as X } from 'hugeicons-react';
import { LoadingSpinner } from './LoadingSpinner';

export const LanguagesPage = () => {
  const [languages, setLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllLanguages = async () => {
      try {
        const allLangs = await tmdbService.getLanguages();
        
        const sortedLangs = allLangs
          .filter((l: any) => l.english_name)
          .sort((a: any, b: any) => a.english_name.localeCompare(b.english_name));
          
        setLanguages(sortedLangs);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchAllLanguages();
  }, []);

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return languages;
    const q = searchQuery.toLowerCase();
    return languages.filter(l => 
      l.english_name.toLowerCase().includes(q) || 
      (l.name && l.name.toLowerCase().includes(q)) ||
      l.iso_639_1.toLowerCase().includes(q)
    );
  }, [languages, searchQuery]);

  const groupedLanguages = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredLanguages.forEach(lang => {
      const firstLetter = lang.english_name.charAt(0).toUpperCase();
      const key = /[A-Z]/.test(firstLetter) ? firstLetter : '#';
      if (!groups[key]) groups[key] = [];
      groups[key].push(lang);
    });
    return groups;
  }, [filteredLanguages]);

  const letters = useMemo(() => Object.keys(groupedLanguages).sort(), [groupedLanguages]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen pt-16 md:pt-20 px-4 md:px-8 pb-20 max-w-7xl mx-auto"
    >
      {/* Header section */}
      <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">Languages</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white/80 border border-white/10">
              {filteredLanguages.length}
            </span>
          </div>
          <p className="text-white/60 text-sm md:text-base font-medium">Browse movies and series from across the globe in any dialect.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search languages..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-9 text-xs md:text-sm font-medium text-white placeholder:text-white/30 focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Alphabet Quick Nav */}
      {!searchQuery && letters.length > 1 && (
        <div className="flex flex-wrap gap-1 mb-10 p-2 bg-white/[0.02] border border-white/5 rounded-2xl">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#section-${letter}`}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs font-black text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              {letter}
            </a>
          ))}
        </div>
      )}

      {/* Grouped language cards */}
      <div className="space-y-12">
        {letters.map((letter) => {
          const langs = groupedLanguages[letter];
          return (
            <motion.div 
              key={letter}
              id={`section-${letter}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative scroll-mt-24"
            >
              <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-2.5">
                <h2 className="text-2xl md:text-3xl font-black text-accent">{letter}</h2>
                <span className="text-white/40 text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                  {langs.length} {langs.length === 1 ? 'Language' : 'Languages'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 md:gap-3.5">
                {langs.map((lang: any) => (
                  <motion.div
                    key={lang.iso_639_1}
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => navigate(`/language/${lang.iso_639_1}`)}
                    className="cursor-pointer group bg-white/[0.03] hover:bg-white/[0.08] rounded-xl p-3.5 transition-all border border-white/5 hover:border-white/20 shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-accent transition-colors truncate">
                        {lang.english_name}
                      </h3>
                      {lang.name && lang.name !== lang.english_name && (
                        <p className="text-[11px] text-white/40 truncate mt-0.5 group-hover:text-white/60 transition-colors font-medium">
                          {lang.name}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-white/30 uppercase tracking-wider">
                      <span>{lang.iso_639_1}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-accent">Explore →</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {filteredLanguages.length === 0 && (
          <div className="py-20 text-center text-white/40">
            <p className="font-semibold text-sm">No languages match "{searchQuery}"</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

