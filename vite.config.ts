import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
dotenv.config();

import path from 'path'
import { PORT } from './api/src/config'


// https://vite.dev/config/
export default defineConfig({
  root: 'web',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${PORT}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/web'),
  },
});
