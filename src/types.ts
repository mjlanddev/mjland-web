export interface Movie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type?: 'movie' | 'tv';
  genre_ids: number[];
  original_language: string;
  popularity?: number;
  vote_count?: number;
  original_title?: string;
  original_name?: string;
  season_number?: number;
  episode_number?: number;
  episode_name?: string;
  episode_still?: string;
  updated_at?: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime?: number;
  status?: string;
  tagline?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  videos: {
    results: Video[];
  };
  credits: {
    cast: Cast[];
  };
  similar: {
    results: Movie[];
  };
  images: {
    backdrops: any[];
    logos: any[];
    posters: any[];
  };
  content_ratings?: {
    results: any[];
  };
  release_dates?: {
    results: any[];
  };
  production_companies?: Array<{
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }>;
  networks?: Array<{
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }>;
  production_countries?: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  spoken_languages?: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
  budget?: number;
  revenue?: number;
  original_title?: string;
  original_name?: string;
  homepage?: string;
  keywords?: {
    keywords?: Array<{ id: number; name: string }>;
    results?: Array<{ id: number; name: string }>;
  };
}

export interface Video {
  key: string;
  site: string;
  type: string;
  name: string;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string;
  air_date: string;
  episode_number: number;
  season_number: number;
  runtime: number;
}
