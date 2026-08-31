import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { Movie } from '../types';
import { MovieRow } from './MovieRow';
import { motion } from 'motion/react';
import { LoadingSpinner } from './LoadingSpinner';

import { LazyImage } from './LazyImage';

interface StudioInfo {
  id: number;
  name: string;
  logo_path: string;
  headquarters: string;
  homepage: string;
}

interface GenreSection {
  id: number;
  name: string;
  movies: Movie[];
}

export const StudioDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [studio, setStudio] = useState<StudioInfo | null>(null);
  const [sections, setSections] = useState<GenreSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [backdrop, setBackdrop] = useState('');

  const genres = [
    { id: 18, name: 'Popular Dramas' },
    { id: 80, name: 'Crime & Mystery' },
    { id: 28, name: 'Action Packed' },
    { id: 35, name: 'Comedy Delights' },
    { id: 14, name: 'Sci-fi & Fantasy' },
    { id: 99, name: 'Groundbreaking Documentaries' }
  ];

  useEffect(() => {
    const fetchStudioData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const studioId = parseInt(id);
        const studioData = await tmdbService.getStudioDetails(studioId);
        setStudio(studioData);

        const sectionData = await Promise.all(
          genres.map(async (genre) => {
            const movies = await tmdbService.getMoviesByStudio(studioId, genre.id);
            const tvShows = await tmdbService.getTVByStudio(studioId, genre.id);
            
            const combined = [...movies, ...tvShows]
              .sort((a, b) => b.vote_average - a.vote_average)
              .slice(0, 20);

            return {
              ...genre,
              movies: combined
            };
          })
        );

        const validSections = sectionData.filter(s => s.movies.length > 0);
        setSections(validSections);

        if (validSections.length > 0 && validSections[0].movies.length > 0) {
          setBackdrop(getImageUrl(validSections[0].movies[0].backdrop_path || validSections[0].movies[0].poster_path, 'original'));
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchStudioData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!studio) return null;

  return (
    <div className="min-h-screen bg-bg text-white">
      <div className="relative h-[50vh] flex flex-col items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0">
          {backdrop && (
            <LazyImage 
              src={backdrop} 
              alt="" 
              className="w-full h-full object-cover grayscale opacity-30"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-bg/20 via-bg/60 to-bg" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex flex-col items-center"
        >
          {studio.logo_path ? (
            <LazyImage
              src={getImageUrl(studio.logo_path, 'original')}
              alt={studio.name}
              className="h-32 md:h-48 object-contain mb-8 brightness-0 invert drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              referrerPolicy="no-referrer"
            />
          ) : (
            <h1 className="text-6xl font-bold mb-8 tracking-tight">{studio.name}</h1>
          )}
        </motion.div>
      </div>

      <div className="relative z-10 pb-20">
        {sections.map((section) => (
          <MovieRow
            key={section.id}
            title={section.name}
            movies={section.movies}
            fetchNextPage={async (page) => {
              const [m, t] = await Promise.all([
                tmdbService.getMoviesByStudio(studio.id, section.id, page),
                tmdbService.getTVByStudio(studio.id, section.id, page)
              ]);
              return [...m, ...t].sort((a, b) => b.vote_average - a.vote_average);
            }}
          />
        ))}
      </div>
    </div>
  );
};
