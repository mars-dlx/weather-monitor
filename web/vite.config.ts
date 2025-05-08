import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
dotenv.config({ path: '..' });

// https://vite.dev/config/
export default defineConfig({
  root: 'web',
  plugins: [react()],
  server: {
    proxy: {
      '/weather': {
        target: 'http://localhost:50000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../dist/web',

  },
});
