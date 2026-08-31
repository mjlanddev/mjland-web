import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { Movie } from '../types';
import { Hero } from './Hero';
import { MovieRow } from './MovieRow';
import { NetworksRow } from './NetworksRow';
import { CategoryCard, CategoryRow } from './CategoryCard';
import { SEO } from './SeoComponent';
import { motion } from 'motion/react';
import { TMDB_CONFIG } from '../config/tmdbConfig';
import { recommendationService } from '../services/recommendationService';
import { deduplicateRows } from '../utils/deduplicate';
import { LoadingSpinner } from './LoadingSpinner';

import { FadeSection } from './FadeSection';

export const TVPage = () => {
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [onTheAir, setOnTheAir] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [actionShows, setActionShows] = useState<Movie[]>([]);
  const [animationShows, setAnimationShows] = useState<Movie[]>([]);
  const [comedyShows, setComedyShows] = useState<Movie[]>([]);
  const [dramaShows, setDramaShows] = useState<Movie[]>([]);
  const [sciFiShows, setSciFiShows] = useState<Movie[]>([]);
  
  const [genreBackdrops, setGenreBackdrops] = useState<Record<string, string>>({});
  const [languageBackdrops, setLanguageBackdrops] = useState<Record<string, string>>({});
  
  const [genresList, setGenresList] = useState<any[]>([]);
  const [languagesList, setLanguagesList] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          recommendationService.getPersonalizedRecommendations('tv'),
          tmdbService.getTrending('tv'),
          tmdbService.getPopularTV(),
          tmdbService.getOnTheAirTV(),
          tmdbService.getTopRatedTV(),
          tmdbService.getTVByGenre(10759, 2), 
          tmdbService.getTVByGenre(16, 2), 
          tmdbService.getTVByGenre(35, 2), 
          tmdbService.getTVByGenre(18, 2), 
          tmdbService.getTVByGenre(10765, 2) 
        ]);
        
        const [
          recommendationsData,
          trendingData,
          popularData,
          onTheAirData,
          topRatedData,
          actionData,
          animationData,
          comedyData,
          dramaData,
          sciFiData
        ] = results.map(r => r.status === 'fulfilled' ? r.value : []);
        
        const [
          dedupedRecs,
          dedupedTrending,
          dedupedPopular,
          dedupedOnTheAir,
          dedupedTopRated,
          dedupedAction,
          dedupedAnimation,
          dedupedComedy,
          dedupedDrama,
          dedupedSciFi
        ] = deduplicateRows([
          recommendationsData,
          trendingData,
          popularData,
          onTheAirData,
          topRatedData,
          actionData,
          animationData,
          comedyData,
          dramaData,
          sciFiData
        ]);

        setRecommendations(dedupedRecs);
        setTrending(dedupedTrending);
        setPopular(dedupedPopular);
        setOnTheAir(dedupedOnTheAir);
        setTopRated(dedupedTopRated);
        setActionShows(dedupedAction);
        setAnimationShows(dedupedAnimation);
        setComedyShows(dedupedComedy);
        setDramaShows(dedupedDrama);
        setSciFiShows(dedupedSciFi);

        const apiGenres = await tmdbService.getGenres('tv').catch(() => []);
        const genres = apiGenres.slice(0, 10);
        setGenresList(genres);
        const genreResultsRaw = await Promise.allSettled(genres.map((g: any) => tmdbService.getTVByGenre(g.id)));
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
        
        const langResultsRaw = await Promise.allSettled(languages.map((l: any) => tmdbService.getTVByLanguage(l.iso_639_1)));
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
        title="TV Shows" 
        description="Explore popular TV shows, seasons, and episodes in HD."
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
            title="Trending TV Shows" 
            movies={trending.slice(1)} 
            fetchNextPage={(page) => tmdbService.getTrending('tv', page)}
          />
        </FadeSection>

        <FadeSection>
          <MovieRow 
            title="Popular TV Shows" 
            movies={popular} 
            fetchNextPage={(page) => tmdbService.getPopularTV(page)}
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
            title="Sci-Fi & Fantasy" 
            movies={sciFiShows} 
            fetchNextPage={(page) => tmdbService.getTVByGenre(10765, page + 1)}
          />
        </FadeSection>

        <FadeSection>
          <MovieRow 
            title="Action & Adventure" 
            movies={actionShows} 
            fetchNextPage={(page) => tmdbService.getTVByGenre(10759, page + 1)}
          />
        </FadeSection>

        <FadeSection>
          <NetworksRow />
        </FadeSection>

        <FadeSection>
          <MovieRow 
            title="Comedy" 
            movies={comedyShows} 
            fetchNextPage={(page) => tmdbService.getTVByGenre(35, page + 1)}
          />
        </FadeSection>

        <FadeSection>
          <MovieRow 
            title="Drama" 
            movies={dramaShows} 
            fetchNextPage={(page) => tmdbService.getTVByGenre(18, page + 1)}
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
            title="Top Rated TV Shows" 
            movies={topRated} 
            fetchNextPage={(page) => tmdbService.getTopRatedTV(page)}
          />
        </FadeSection>
      </div>
    </motion.div>
  );
};
