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
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
              if (id.includes('hugeicons-react') || id.includes('@fluentui') || id.includes('mage-icons-react')) {
                return 'vendor-icons';
              }
              if (id.includes('axios')) {
                return 'vendor-axios';
              }
            }
          }
        }
      }
    }
  };
});
