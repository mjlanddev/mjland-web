import { Movie } from '../types';

const WATCHLIST_KEY = 'mjland_watchlist';
const CONTINUE_WATCHING_KEY = 'mjland_continue_watching';

const minimizeMovie = (movie: any): Movie => {
  return {
    id: movie.id,
    title: movie.title,
    name: movie.name,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    media_type: movie.media_type,
    vote_average: movie.vote_average,
    release_date: movie.release_date,
    first_air_date: movie.first_air_date,
    season_number: movie.season_number,
    episode_number: movie.episode_number,
    updated_at: movie.updated_at
  } as Movie;
};

export const storageService = {
  getWatchlist: (): Movie[] => {
    try {
      const data = localStorage.getItem(WATCHLIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToWatchlist: (movie: Movie) => {
    const watchlist = storageService.getWatchlist();
    if (!watchlist.find(m => m.id === movie.id)) {
      const minimized = minimizeMovie(movie);
      const newList = [minimized, ...watchlist].slice(0, 100); 
      try {
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newList));
        window.dispatchEvent(new Event('watchlistUpdated'));
      } catch (e) {
        console.error('Watchlist storage quota exceeded');
      }
    }
  },

  removeFromWatchlist: (movieId: number) => {
    const watchlist = storageService.getWatchlist();
    const newList = watchlist.filter(m => m.id !== movieId);
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newList));
      window.dispatchEvent(new Event('watchlistUpdated'));
    } catch {}
  },

  toggleWatchlist: (movie: Movie): boolean => {
    const watchlist = storageService.getWatchlist();
    const exists = watchlist.some(m => m.id === movie.id);
    if (exists) {
      storageService.removeFromWatchlist(movie.id);
      return false;
    } else {
      storageService.addToWatchlist(movie);
      return true;
    }
  },

  isInWatchlist: (movieId: number): boolean => {
    const watchlist = storageService.getWatchlist();
    return !!watchlist.find(m => m.id === movieId);
  },

  getContinueWatching: (): Movie[] => {
    try {
      const data = localStorage.getItem(CONTINUE_WATCHING_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getContinueWatchingItem: (movieId: number): Movie | null => {
    const list = storageService.getContinueWatching();
    return list.find(m => m.id === movieId) || null;
  },

  addToContinueWatching: (movie: Movie) => {
    const list = storageService.getContinueWatching();
    const filteredList = list.filter(m => m.id !== movie.id);
    const itemWithTimestamp = minimizeMovie({
      ...movie,
      updated_at: Date.now()
    });

    let newList = [itemWithTimestamp, ...filteredList].slice(0, 20); 
    
    try {
      localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(newList));
      window.dispatchEvent(new Event('continueWatchingUpdated'));
    } catch (e) {
      
      try {
        newList = newList.slice(0, 5); 
        localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(newList));
        window.dispatchEvent(new Event('continueWatchingUpdated'));
      } catch (err) {
        console.error('Continue watching storage quota exceeded completely', err);
      }
    }
  },

  removeFromContinueWatching: (movieId: number) => {
    const list = storageService.getContinueWatching();
    const newList = list.filter(m => m.id !== movieId);
    try {
      localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(newList));
      window.dispatchEvent(new Event('continueWatchingUpdated'));
    } catch {}
  },

  clearWatchlist: () => {
    localStorage.removeItem(WATCHLIST_KEY);
    window.dispatchEvent(new Event('watchlistUpdated'));
  },

  clearContinueWatching: () => {
    localStorage.removeItem(CONTINUE_WATCHING_KEY);
    window.dispatchEvent(new Event('continueWatchingUpdated'));
  },

  getRecentSearches: (): Movie[] => {
    try {
      const data = localStorage.getItem('recent_searches');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  clearSearchHistory: () => {
    localStorage.removeItem('recent_searches');
    window.dispatchEvent(new Event('searchHistoryCleared'));
  }
};
