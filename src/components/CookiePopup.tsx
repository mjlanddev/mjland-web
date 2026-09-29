import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export const CookiePopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasDismissed = localStorage.getItem('cookieConsentDismissed');
    if (!hasDismissed) {

      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('cookieConsentDismissed', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-[9000] max-w-[360px] bg-zinc-950/90 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.7)] rounded-2xl p-3 sm:p-3.5 ring-1 ring-inset ring-white/5"
        >
          <div className="flex items-center gap-3">

            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                <path d="M8.5 8.5v.01" />
                <path d="M16 15.5v.01" />
                <path d="M12 12v.01" />
                <path d="M11 17v.01" />
                <path d="M7 14v.01" />
              </svg>
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <p className="text-[11px] text-white/70 leading-snug">
                We use local storage for your watchlist & playback progress.{' '}
                <Link to="/cookie-policy" onClick={dismiss} className="text-white underline hover:text-accent transition-colors font-medium">
                  Learn more
                </Link>
              </p>
            </div>

            <button
              onClick={dismiss}
              className="bg-white hover:bg-white/90 text-black px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm"
            >
              Got it
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
