import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  
  const plugins: any[] = [react(), tailwindcss()];

  return {
    clearScreen: false,
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: true,
      proxy: {
        '/tmdb-panel': {
          target: 'https://www.themoviedb.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/tmdb-panel/, '/remote/panel')
        }
      }
    },
  };
});
