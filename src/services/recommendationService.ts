import { tmdbService } from './tmdbService';
import { Movie } from '../types';

export const recommendationService = {
  getPersonalizedRecommendations: async (type: 'all' | 'movie' | 'tv' = 'all'): Promise<Movie[]> => {
    try {
      // Fallback to trending since personalized ML engine is removed for open source
      return await tmdbService.getTrending(type);
    } catch (error) {
      console.error('Recommendation Engine Error:', error);
      return [];
    }
  }
};
