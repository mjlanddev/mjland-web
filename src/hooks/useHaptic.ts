import React, { useEffect } from 'react';

export const useHaptic = () => {
  const trigger = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate([30, 50, 30]);
          break;
        default:
          navigator.vibrate(10);
      }
    }
  };

  return trigger;
};
