import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cancel01Icon } from 'hugeicons-react';

export const GithubPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasDismissed = localStorage.getItem('githubPopupDismissed');
    if (!hasDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
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
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[380px] z-[9999] bg-[#0f1014]/90 backdrop-blur-3xl border border-emerald-500/30 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] p-5"
        >
          <button 
            onClick={dismiss}
            className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors"
          >
            <Cancel01Icon className="w-5 h-5" />
          </button>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Open Source!
            </h3>
            <p className="text-xs text-[#8f98b0] leading-relaxed pr-6">
              Love this app? It's completely open source! Support the project by dropping a star on GitHub.
            </p>
            <div className="flex items-center gap-3 mt-1">
              <a 
                href="https://github.com/mjlanddev/mjland-web"
                target="_blank"
                rel="noopener noreferrer"
                onClick={dismiss}
                className="flex-1 btn-glass-beveled anim-btn text-white text-xs font-bold py-2.5 rounded-xl border border-emerald-500/50 hover:border-emerald-500 hover:bg-emerald-500/10 text-center flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
                Star on GitHub
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
