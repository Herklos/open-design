import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { projectsApiPlugin } from './plugins/projects-api.js';

export default defineConfig({
  plugins: [react(), tailwindcss(), projectsApiPlugin()],
  resolve: {
    alias: {
      '@shared': path.resolve(import.meta.dirname, 'shared'),
      '@projects': path.resolve(import.meta.dirname, 'projects'),
    },
  },
  server: {
    fs: {
      allow: ['.'],
    },
  },
  optimizeDeps: {
    entries: ['src/main.jsx'],
  },
});
