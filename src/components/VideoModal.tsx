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
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 md:p-12"
          onClick={onClose}
        >
          <button
            className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-11 md:h-11 btn-glass-beveled rounded-full flex items-center justify-center text-white z-[110] cursor-pointer"
            onClick={onClose}
            aria-label="Close trailer modal"
          >
            <DismissRegular className="w-5 h-5" />
          </button>

          <div
            className="w-full max-w-5xl liquid-dock rounded-3xl overflow-hidden shadow-[0_32px_96px_rgba(0,0,0,0.9)] relative border border-white/10 ring-1 ring-inset ring-white/10 flex flex-col"
            onClick={e => e.stopPropagation()}
          >

            <div className="p-4 md:px-6 md:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/[0.02] border-b border-white/10 gap-3 sm:gap-0">
              <div className="pr-4">
                <h2 className="text-lg md:text-xl font-bold text-white/95 leading-tight">{video.title}</h2>
                {video.subtitle && <p className="text-xs md:text-sm text-white/50 mt-0.5">{video.subtitle}</p>}
              </div>

              {video.tmdbId && video.mediaType && (
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/${video.mediaType}/${video.tmdbId}`);
                  }}
                  className="shrink-0 btn-beveled-solid px-5 py-2 rounded-full font-bold text-xs md:text-sm w-full sm:w-auto"
                >
                  View Details
                </button>
              )}
            </div>

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
