import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tmdbService } from '../services/tmdbService';
import { LoadingSpinner } from './LoadingSpinner';

export const RandomPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRandom = async () => {
      try {
        const type = Math.random() > 0.5 ? 'movie' : 'tv';
        const randomPage = Math.floor(Math.random() * 10) + 1; 
        let items = [];
        if (type === 'movie') {
          items = await tmdbService.getPopularMovies(randomPage);
        } else {
          items = await tmdbService.getPopularTV(randomPage);
        }
        
        if (items && items.length > 0) {
          const randomItem = items[Math.floor(Math.random() * items.length)];
          navigate(`/${type}/${randomItem.id}`, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } catch (error) {
        navigate('/', { replace: true });
      }
    };

    fetchRandom();
  }, [navigate]);

  return (
    <div className="min-h-screen pt-8 px-4 md:px-8 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
};
