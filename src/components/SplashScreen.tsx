import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    
    const dir = document.documentElement.dir || document.body.dir || window.getComputedStyle(document.body).direction;
    setIsRtl(dir === 'rtl');

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 1000); 
    }, 2800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] } }}
          className="fixed inset-0 z-[99999] bg-[#030303] flex flex-col items-center justify-center pointer-events-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center"
          >
            {}
            <h1 
              className="text-4xl md:text-6xl font-black px-4 pb-2"
              style={{
                letterSpacing: '-0.08em', 
                
                background: 'linear-gradient(to right, #111111 35%, #ffffff 50%, #111111 65%)',
                backgroundSize: '200% auto',
                color: 'transparent',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                animation: `${isRtl ? 'shimmer-rtl' : 'shimmer'} 3.5s ease-in-out infinite`
              }}
            >
              mjland
            </h1>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
