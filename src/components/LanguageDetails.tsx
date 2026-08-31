import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { Movie } from '../types';
import { MovieRow } from './MovieRow';
import { motion } from 'motion/react';
import { ArrowLeft01Icon as ChevronLeft } from 'hugeicons-react';
import { LoadingSpinner } from './LoadingSpinner';


import { LazyImage } from './LazyImage';
import { FadeSection } from './FadeSection';

interface GenreSection {
  id: number;
  name: string;
  movies: Movie[];
}

export const LanguageDetails = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTVShows] = useState<Movie[]>([]);
  const [genreSections, setGenreSections] = useState<GenreSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [backdrop, setBackdrop] = useState('');

  const [languageName, setLanguageName] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      if (!code) return;
      setLoading(true);
      try {
        const apiGenres = await tmdbService.getGenres('movie');
        const genres = apiGenres.slice(0, 6);
        
        const allLangs = await tmdbService.getLanguages();
        const langObj = allLangs.find((l: any) => l.iso_639_1 === code);
        if (langObj) setLanguageName(langObj.english_name);
        
        const [movieData, tvData, ...genreResults] = await Promise.all([
          tmdbService.getMoviesByLanguage(code),
          tmdbService.getTVByLanguage(code),
          ...genres.map(async (genre: any) => {
            const m = await tmdbService.getMoviesByLanguage(code, genre.id);
            const t = await tmdbService.getTVByLanguage(code, genre.id);
            return [...m, ...t].sort((a, b) => b.popularity - a.popularity).slice(0, 20);
          })
        ]);
        
        setMovies(movieData);
        setTVShows(tvData);
        
        if (movieData.length > 0) {
          setBackdrop(getImageUrl(movieData[0].backdrop_path || movieData[0].poster_path, 'original'));
        } else if (tvData.length > 0) {
          setBackdrop(getImageUrl(tvData[0].backdrop_path || tvData[0].poster_path, 'original'));
        }

        const sections: GenreSection[] = genres.map((genre: any, index: number) => ({
          id: genre.id,
          name: genre.name,
          movies: genreResults[index]
        })).filter((s: GenreSection) => s.movies.length > 0);

        setGenreSections(sections);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [code]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="relative h-[45vh] md:h-[60vh] w-full overflow-hidden">
        <motion.div 
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <LazyImage
            src={backdrop}
            alt={languageName}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-transparent to-transparent" />
        </motion.div>

        <div className="absolute top-0 left-0 w-full px-4 md:px-6 pt-6 md:pt-8 z-20">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -4 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group w-fit anim-btn bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
            <span className="text-xs font-bold uppercase tracking-wider">Back</span>
          </motion.button>
        </div>

        <div className="absolute bottom-0 left-0 px-4 md:px-8 pb-16 md:pb-28 w-full max-w-5xl">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-2 md:mb-4 drop-shadow-2xl"
          >
            {languageName}
          </motion.h1>
          {languageName && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-xs sm:text-sm md:text-lg text-white/70 max-w-2xl font-medium line-clamp-2 md:line-clamp-none leading-relaxed drop-shadow"
            >
              Explore the best of {languageName} cinema and television, from blockbuster movies to trending series.
            </motion.p>
          )}
        </div>
      </div>

      <div className="relative z-10 -mt-8 md:-mt-20 pb-20 space-y-2">
        {movies.length > 0 && (
          <FadeSection>
            <MovieRow
              title={languageName ? `Popular ${languageName} Movies` : 'Popular Movies'}
              movies={movies}
              fetchNextPage={(page) => tmdbService.getMoviesByLanguage(code!, undefined, page)}
            />
          </FadeSection>
        )}
        
        {tvShows.length > 0 && (
          <FadeSection>
            <MovieRow
              title={languageName ? `Trending ${languageName} TV Shows` : 'Trending TV Shows'}
              movies={tvShows}
              fetchNextPage={(page) => tmdbService.getTVByLanguage(code!, undefined, page)}
            />
          </FadeSection>
        )}

        {genreSections.map((section) => (
          <FadeSection key={section.id}>
            <MovieRow
              title={`${section.name} in ${languageName}`}
              movies={section.movies}
              fetchNextPage={async (page) => {
                const [m, t] = await Promise.all([
                  tmdbService.getMoviesByLanguage(code!, section.id, page),
                  tmdbService.getTVByLanguage(code!, section.id, page)
                ]);
                return [...m, ...t].sort((a, b) => b.popularity - a.popularity);
              }}
            />
          </FadeSection>
        ))}
      </div>
    </div>
  );
};
