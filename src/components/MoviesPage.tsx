import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { Movie } from '../types';
import { Hero } from './Hero';
import { MovieRow } from './MovieRow';
import { StudiosRow } from './StudiosRow';
import { CategoryCard, CategoryRow } from './CategoryCard';
import { SEO } from './SeoComponent';
import { motion } from 'motion/react';
import { TMDB_CONFIG } from '../config/tmdbConfig';
import { recommendationService } from '../services/recommendationService';
import { deduplicateRows } from '../utils/deduplicate';
import { LoadingSpinner } from './LoadingSpinner';

import { FadeSection } from './FadeSection';

export const MoviesPage = () => {
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [comedyMovies, setComedyMovies] = useState<Movie[]>([]);
  const [documentaries, setDocumentaries] = useState<Movie[]>([]);
  const [romanceMovies, setRomanceMovies] = useState<Movie[]>([]);
  
  const [genreBackdrops, setGenreBackdrops] = useState<Record<string, string>>({});
  const [languageBackdrops, setLanguageBackdrops] = useState<Record<string, string>>({});
  
  const [genresList, setGenresList] = useState<any[]>([]);
  const [languagesList, setLanguagesList] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          recommendationService.getPersonalizedRecommendations('movie'),
          tmdbService.getTrending('movie'),
          tmdbService.getPopularMovies(),
          tmdbService.getNowPlayingMovies(),
          tmdbService.getTopRated(),
          tmdbService.getMoviesByGenre(28, 2),
          tmdbService.getMoviesByGenre(35, 2),
          tmdbService.getMoviesByGenre(99, 2),
          tmdbService.getMoviesByGenre(10749, 2)
        ]);
        
        const [
          recommendationsData,
          trendingData,
          popularData,
          nowPlayingData,
          topRatedData,
          actionData,
          comedyData,
          documentaryData,
          romanceData
        ] = results.map(r => r.status === 'fulfilled' ? r.value : []);
        
        const [
          dedupedRecs,
          dedupedTrending,
          dedupedPopular,
          dedupedNowPlaying,
          dedupedTopRated,
          dedupedAction,
          dedupedComedy,
          dedupedDoc,
          dedupedRomance
        ] = deduplicateRows([
          recommendationsData,
          trendingData,
          popularData,
          nowPlayingData,
          topRatedData,
          actionData,
          comedyData,
          documentaryData,
          romanceData
        ]);

        setRecommendations(dedupedRecs);
        setTrending(dedupedTrending);
        setPopular(dedupedPopular);
        setNowPlaying(dedupedNowPlaying);
        setTopRated(dedupedTopRated);
        setActionMovies(dedupedAction);
        setComedyMovies(dedupedComedy);
        setDocumentaries(dedupedDoc);
        setRomanceMovies(dedupedRomance);

        const apiGenres = await tmdbService.getGenres('movie').catch(() => []);
        const genres = apiGenres.slice(0, 10);
        setGenresList(genres);
        const genreResultsRaw = await Promise.allSettled(genres.map((g: any) => tmdbService.getMoviesByGenre(g.id)));
        const genreResults = genreResultsRaw.map(r => r.status === 'fulfilled' ? r.value : []);
        const genreMap: Record<string, string> = {};
        const usedMovieIds = new Set<number>();
        genres.forEach((g: any, i: number) => {
          const movies = genreResults[i];
          const uniqueMovie = movies.find((m: any) => !usedMovieIds.has(m.id)) || movies[0];
          if (uniqueMovie) {
            usedMovieIds.add(uniqueMovie.id);
            genreMap[g.name] = getImageUrl(uniqueMovie.backdrop_path || uniqueMovie.poster_path, 'w500');
          }
        });
        setGenreBackdrops(genreMap);

        const allLangs = await tmdbService.getLanguages();
        const languages = TMDB_CONFIG.POPULAR_LANGUAGE_CODES
          .map(code => allLangs.find((l: any) => l.iso_639_1 === code))
          .filter(Boolean);
        setLanguagesList(languages);
        
        const langResultsRaw = await Promise.allSettled(languages.map((l: any) => tmdbService.getMoviesByLanguage(l.iso_639_1)));
        const langResults = langResultsRaw.map(r => r.status === 'fulfilled' ? r.value : []);
        const langMap: Record<string, string> = {};
        languages.forEach((l: any, i: number) => {
          const first = langResults[i]?.[0];
          langMap[l.english_name] = getImageUrl(first?.backdrop_path || first?.poster_path, 'w500');
        });
        setLanguageBackdrops(langMap);

      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const navigate = useNavigate();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO 
        title="Movies" 
        description="Browse our vast collection of HD movies and discover cinematic masterpieces."
      />
      <Hero movies={trending} />
      
      <div className="relative mt-0 md:mt-4 z-10 pb-20 space-y-6 md:space-y-8">
        {recommendations.length > 0 && (
          <FadeSection>
            <MovieRow 
              title="Recommended for You" 
              movies={recommendations}
              isLandscape={false}
            />
          </FadeSection>
        )}

        <FadeSection>
          <MovieRow 
            title="Trending Movies" 
            movies={trending.slice(1)} 
            fetchNextPage={(page) => tmdbService.getTrending('movie', page)}
          />
        </FadeSection>

        <FadeSection>
          <MovieRow 
            title="Popular Movies" 
            movies={popular} 
            fetchNextPage={(page) => tmdbService.getPopularMovies(page)}
          />
        </FadeSection>

        <FadeSection>
          <CategoryRow title="Popular Languages" onTitleClick={() => navigate('/languages')}>
            {languagesList.map(lang => (
              <CategoryCard 
                key={lang.iso_639_1}
                title={lang.english_name} 
                subtitle={lang.name} 
                image={languageBackdrops[lang.english_name]} 
                onClick={() => navigate(`/language/${lang.iso_639_1}`)} 
              />
            ))}
          </CategoryRow>
        </FadeSection>

        <FadeSection>
          <MovieRow 
            title="Comedy" 
            movies={comedyMovies} 
            fetchNextPage={(page) => tmdbService.getMoviesByGenre(35, page + 1)}
          />
        </FadeSection>

        <FadeSection>
          <MovieRow 
            title="Action Movies" 
            movies={actionMovies} 
            fetchNextPage={(page) => tmdbService.getMoviesByGenre(28, page + 1)}
          />
        </FadeSection>

        <FadeSection>
          <StudiosRow />
        </FadeSection>

        <FadeSection>
          <MovieRow 
            title="Romance" 
            movies={romanceMovies} 
            fetchNextPage={(page) => tmdbService.getMoviesByGenre(10749, page + 1)}
          />
        </FadeSection>

        <FadeSection>
          <MovieRow 
            title="Documentaries" 
            movies={documentaries} 
            fetchNextPage={(page) => tmdbService.getMoviesByGenre(99, page + 1)}
          />
        </FadeSection>

        <FadeSection>
          <CategoryRow title="Popular Genres" onTitleClick={() => navigate('/genres')}>
            {genresList.map(genre => (
              <CategoryCard 
                key={genre.id}
                title={genre.name} 
                image={genreBackdrops[genre.name]} 
                onClick={() => navigate(`/genre/${genre.id}`)} 
              />
            ))}
          </CategoryRow>
        </FadeSection>

        <FadeSection>
          <MovieRow 
            title="Top Rated Movies" 
            movies={topRated} 
            fetchNextPage={(page) => tmdbService.getTopRated(page)}
          />
        </FadeSection>
      </div>
    </motion.div>
  );
};
