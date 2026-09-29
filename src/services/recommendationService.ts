import { tmdbService } from './tmdbService';
import { Movie } from '../types';

import { storageService } from './storageService';

export const recommendationService = {
  getPersonalizedRecommendations: async (type: 'all' | 'movie' | 'tv' = 'all'): Promise<Movie[]> => {
    try {
      const continueWatching = storageService.getContinueWatching();
      const watchlist = storageService.getWatchlist();
      const recent = continueWatching[0] || watchlist[0];

      if (recent && recent.id) {
        const isTv = recent.media_type === 'tv' || (!recent.title && Boolean(recent.name));
        const recs = isTv
          ? await tmdbService.getTVRecommendations(recent.id)
          : await tmdbService.getMovieRecommendations(recent.id);
        if (recs && recs.length > 0) return recs;
      }

      if (type === 'tv') {
        return await tmdbService.getTopRatedTV();
      }
      return await tmdbService.getTopRated();
    } catch (error) {
      console.error('Recommendation Engine Error:', error);
      return [];
    }
  }
};
