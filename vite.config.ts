import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    target: 'esnext',
  },
  esbuild: {
    target: 'esnext',
  },
  define: {
    'process.env': {},
  },
});