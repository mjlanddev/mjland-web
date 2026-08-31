import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cancel01Icon as DismissRegular } from 'hugeicons-react';
import { useNavigate } from 'react-router-dom';

export interface VideoModalData {
  id: string; 
  title: string;
  subtitle?: string;
  tmdbId?: string;
  mediaType?: string;
}

interface VideoModalProps {
  video: VideoModalData | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {video && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-12"
          onClick={onClose}
        >
          <button 
            className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors text-white z-[110]"
            onClick={onClose}
          >
            <DismissRegular className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          
          <div 
            className="w-full max-w-5xl bg-bg rounded-2xl overflow-hidden shadow-2xl relative border border-white/10 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {}
            <div className="p-4 md:px-6 md:py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-black/60 border-b border-white/5 gap-4 sm:gap-0">
              <div className="pr-4">
                <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">{video.title}</h2>
                {video.subtitle && <p className="text-sm md:text-base text-text-secondary mt-1">{video.subtitle}</p>}
              </div>
              
              {video.tmdbId && video.mediaType && (
                <button 
                  onClick={() => {
                    onClose();
                    navigate(`/${video.mediaType}/${video.tmdbId}`);
                  }}
                  className="shrink-0 px-5 py-2 md:px-6 md:py-2.5 bg-white text-black font-bold rounded-full hover:bg-accent hover:text-white transition-colors text-sm md:text-base w-full sm:w-auto"
                >
                  View Details
                </button>
              )}
            </div>

            {}
            <div className="w-full aspect-video bg-black relative">
              <iframe
                src={`https://www.youtube.com/embed/${video.id}?autoplay=1&mute=0&rel=0&modestbranding=1&origin=${encodeURIComponent(window.location.origin)}`}
                title={video.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
