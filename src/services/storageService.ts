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

const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`Storage quota warning while setting "${key}". Pruning storage...`);
    try {

      const cw = localStorage.getItem(CONTINUE_WATCHING_KEY);
      if (cw) {
        try {
          const parsed = JSON.parse(cw);
          if (Array.isArray(parsed) && parsed.length > 5) {
            localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(parsed.slice(0, 5)));
          }
        } catch {}
      }

      const wl = localStorage.getItem(WATCHLIST_KEY);
      if (wl) {
        try {
          const parsed = JSON.parse(wl);
          if (Array.isArray(parsed) && parsed.length > 30) {
            localStorage.setItem(WATCHLIST_KEY, JSON.stringify(parsed.slice(0, 30)));
          }
        } catch {}
      }

      localStorage.setItem(key, value);
      return true;
    } catch (retryErr) {
      console.error(`Storage setItem failed definitively for "${key}"`, retryErr);
      return false;
    }
  }
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
      let newList = [minimized, ...watchlist].slice(0, 100);
      if (!safeSetItem(WATCHLIST_KEY, JSON.stringify(newList))) {
        newList = newList.slice(0, 25);
        safeSetItem(WATCHLIST_KEY, JSON.stringify(newList));
      }
      window.dispatchEvent(new Event('watchlistUpdated'));
    }
  },

  removeFromWatchlist: (movieId: number) => {
    const watchlist = storageService.getWatchlist();
    const newList = watchlist.filter(m => m.id !== movieId);
    safeSetItem(WATCHLIST_KEY, JSON.stringify(newList));
    window.dispatchEvent(new Event('watchlistUpdated'));
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

    if (!safeSetItem(CONTINUE_WATCHING_KEY, JSON.stringify(newList))) {
      newList = newList.slice(0, 5);
      safeSetItem(CONTINUE_WATCHING_KEY, JSON.stringify(newList));
    }
    window.dispatchEvent(new Event('continueWatchingUpdated'));
  },

  removeFromContinueWatching: (movieId: number) => {
    const list = storageService.getContinueWatching();
    const newList = list.filter(m => m.id !== movieId);
    safeSetItem(CONTINUE_WATCHING_KEY, JSON.stringify(newList));
    window.dispatchEvent(new Event('continueWatchingUpdated'));
  },

  clearWatchlist: () => {
    try {
      localStorage.removeItem(WATCHLIST_KEY);
      window.dispatchEvent(new Event('watchlistUpdated'));
    } catch {}
  },

  clearContinueWatching: () => {
    try {
      localStorage.removeItem(CONTINUE_WATCHING_KEY);
      window.dispatchEvent(new Event('continueWatchingUpdated'));
    } catch {}
  },

  getRecentSearches: (): Movie[] => {
    try {
      const data = localStorage.getItem('recent_searches');
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];

      const minimizedList = parsed.slice(0, 10).map(minimizeMovie);

      if (data.length > 8000) {
        safeSetItem('recent_searches', JSON.stringify(minimizedList));
      }
      return minimizedList;
    } catch {
      return [];
    }
  },

  addRecentSearch: (movie: Movie): Movie[] => {
    try {
      const current = storageService.getRecentSearches();
      const minimized = minimizeMovie(movie);
      let updated = [minimized, ...current.filter(m => m.id !== movie.id)].slice(0, 10);

      const success = safeSetItem('recent_searches', JSON.stringify(updated));
      if (!success) {

        updated = updated.slice(0, 5);
        const secondTry = safeSetItem('recent_searches', JSON.stringify(updated));
        if (!secondTry) {

          updated = updated.slice(0, 2);
          safeSetItem('recent_searches', JSON.stringify(updated));
        }
      }

      window.dispatchEvent(new Event('recentSearchesUpdated'));
      return updated;
    } catch (err) {
      console.warn('Error in addRecentSearch:', err);
      return [minimizeMovie(movie)];
    }
  },

  clearSearchHistory: () => {
    try {
      localStorage.removeItem('recent_searches');
      window.dispatchEvent(new Event('searchHistoryCleared'));
      window.dispatchEvent(new Event('recentSearchesUpdated'));
    } catch (e) {
      console.warn('Error clearing search history:', e);
    }
  },

  isHoverModalEnabled: (): boolean => {

    return localStorage.getItem('mjland_hover_modal') === 'true';
  },

  setHoverModalEnabled: (enabled: boolean) => {
    localStorage.setItem('mjland_hover_modal', enabled ? 'true' : 'false');
    window.dispatchEvent(new Event('hoverModalSettingUpdated'));
  },

  isLandscapePosterEnabled: (): boolean => {

    return localStorage.getItem('mjland_landscape_poster') === 'true';
  },

  setLandscapePosterEnabled: (enabled: boolean) => {
    localStorage.setItem('mjland_landscape_poster', enabled ? 'true' : 'false');
    window.dispatchEvent(new Event('landscapePosterSettingUpdated'));
  },

  isHidePosterTitlesEnabled: (): boolean => {

    return localStorage.getItem('mjland_hide_poster_titles') === 'true';
  },

  setHidePosterTitlesEnabled: (enabled: boolean) => {
    localStorage.setItem('mjland_hide_poster_titles', enabled ? 'true' : 'false');
    window.dispatchEvent(new Event('hidePosterTitlesSettingUpdated'));
  }
};
