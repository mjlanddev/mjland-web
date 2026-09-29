import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cancel01Icon as X } from 'hugeicons-react';

export const GithubPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasDismissed = localStorage.getItem('githubPopupDismissed');
    if (!hasDismissed) {

      const timer = setTimeout(() => setIsVisible(true), 6000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('githubPopupDismissed', 'true');
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
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[9000] max-w-[340px] bg-zinc-950/90 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.7)] rounded-2xl p-3 sm:p-3.5 ring-1 ring-inset ring-white/5"
        >
          <div className="flex items-center gap-3">

            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-bold text-white leading-tight truncate">Enjoying the app?</h4>
              <p className="text-[11px] text-white/50 leading-snug">Star us on GitHub</p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href="https://github.com/mjlanddev/mjland-web"
                target="_blank"
                rel="noopener noreferrer"
                onClick={dismiss}
                className="inline-flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-black px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-3 h-3 fill-current text-amber-950" viewBox="0 0 24 24">
                  <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
                </svg>
                <span>Star</span>
              </a>

              <button
                onClick={dismiss}
                className="p-1.5 text-white/40 hover:text-white rounded-lg transition-colors cursor-pointer"
                aria-label="Dismiss GitHub star prompt"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
