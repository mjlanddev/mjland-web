import { useEffect } from 'react';

export const useImageColor = (colorHex: string | undefined | null) => {
  useEffect(() => {
    if (!colorHex || !colorHex.startsWith('#')) return;
    
    try {
      
      const hex = colorHex.replace('#', '');
      let r = parseInt(hex.substring(0, 2), 16);
      let g = parseInt(hex.substring(2, 4), 16);
      let b = parseInt(hex.substring(4, 6), 16);
      
      // Boost saturation and lightness for "accent" feel
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let l = (max + min) / 2;
      
      if (l < 50) {
        // brighten dark colors
        const factor = 100 / max;
        r = Math.min(255, Math.floor(r * factor));
        g = Math.min(255, Math.floor(g * factor));
        b = Math.min(255, Math.floor(b * factor));
      }
      
      document.documentElement.style.setProperty('--dynamic-accent', `rgb(${r}, ${g}, ${b})`);
      document.documentElement.style.setProperty('--dynamic-accent-rgb', `${r} ${g} ${b}`);
    } catch (e) {
      console.log('Could not parse color', e);
    }
    
    return () => {
      document.documentElement.style.removeProperty('--dynamic-accent');
      document.documentElement.style.removeProperty('--dynamic-accent-rgb');
    };
  }, [colorHex]);
};
