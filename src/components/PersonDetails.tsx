import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft01Icon as ChevronLeft, Calendar01Icon as Calendar, Location01Icon as MapPin } from 'hugeicons-react';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { MovieRow } from './MovieRow';
import { LoadingSpinner } from './LoadingSpinner';
import { LazyImage } from './LazyImage';
import { SEO } from './SeoComponent';

export const PersonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  useEffect(() => {
    const fetchPerson = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await tmdbService.getPersonDetails(parseInt(id));
        setPerson(data);
      } catch (error) {
        console.error('Error fetching person:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPerson();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!person) return <div className="p-8 text-center text-white/50">Person not found</div>;

  const profileUrl = getImageUrl(person.profile_path, 'w500');

  const allCastCredits = person.combined_credits?.cast || [];
  const knownFor = [...allCastCredits]
    .sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 20);

  const allCrewCredits = person.combined_credits?.crew || [];
  const knownForCrew = [...allCrewCredits]
    .filter((c: any) => c.job === 'Director' || c.job === 'Producer' || c.job === 'Writer')
    .sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 20);

  const backdropItem = knownFor.find((m: any) => m.backdrop_path) || knownForCrew.find((m: any) => m.backdrop_path);
  const backdropUrl = backdropItem ? getImageUrl(backdropItem.backdrop_path, 'original') : '';

  return (
    <>
      <SEO 
        title={`${person.name} - Movies & TV Shows`}
        description={person.biography?.substring(0, 160) || `Check out ${person.name}'s movies and TV shows.`}
        image={profileUrl}
        type="profile"
      />
      
      <div className="min-h-screen bg-bg text-white pb-20 relative">
        
        {/* Back Button Overlay - Absolute Top */}
        <div className="absolute top-0 left-0 w-full px-4 md:px-6 pt-6 md:pt-8 z-30">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -4 }}
            onClick={handleBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group w-fit anim-btn bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
            <span className="text-xs font-bold uppercase tracking-wider">Back</span>
          </motion.button>
        </div>

        {/* Space-Efficient Backdrop Banner */}
        {backdropUrl && (
          <div className="relative h-[28vh] md:h-[40vh] w-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 z-0"
            >
              <LazyImage
                src={backdropUrl}
                alt={`${person.name} backdrop`}
                className="w-full h-full object-cover opacity-40 md:opacity-50"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-bg/90 via-bg/20 to-transparent" />
            </motion.div>
          </div>
        )}

        {}
        <div className={`relative z-20 max-w-7xl mx-auto px-4 md:px-8 ${backdropUrl ? '-mt-16 md:-mt-24' : 'pt-24'} pb-8`}>
          
          <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-center md:items-start mb-10">
            {}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="shrink-0 w-32 h-32 md:w-48 md:h-[288px] rounded-full md:rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl z-10"
            >
              {profileUrl ? (
                <LazyImage
                  src={profileUrl}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5">
                  <span className="text-4xl md:text-6xl text-white/20 font-black tracking-tighter">{person.name[0]}</span>
                </div>
              )}
            </motion.div>

            {}
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left md:pt-8">
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-3 drop-shadow-lg"
              >
                {person.name}
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-[11px] font-bold text-white/70 mb-5 drop-shadow-md"
              >
                <div className="px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                  {person.known_for_department}
                </div>
                {person.birthday && (
                  <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    {new Date(person.birthday).getFullYear()}
                    {person.deathday ? ` - ${new Date(person.deathday).getFullYear()}` : ''}
                  </div>
                )}
                {person.place_of_birth && (
                  <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    {person.place_of_birth}
                  </div>
                )}
              </motion.div>

              {person.biography && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-full max-w-3xl"
                >
                  <div className={`text-[13px] md:text-sm leading-relaxed text-white/70 font-medium ${!isBioExpanded && 'line-clamp-4 md:line-clamp-5'}`}>
                    {person.biography.split('\n').map((line: string, i: number) => (
                      <React.Fragment key={i}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </div>
                  {person.biography.length > 250 && (
                    <button 
                      onClick={() => setIsBioExpanded(!isBioExpanded)}
                      className="mt-2 text-[11px] font-bold text-accent hover:text-white transition-colors uppercase tracking-wider"
                    >
                      {isBioExpanded ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6 md:space-y-8"
          >
            {knownFor.length > 0 && (
              <MovieRow 
                title="Known For (Acting)" 
                movies={knownFor} 
              />
            )}
            {knownForCrew.length > 0 && (
              <MovieRow 
                title="Known For (Crew)" 
                movies={knownForCrew} 
              />
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};
