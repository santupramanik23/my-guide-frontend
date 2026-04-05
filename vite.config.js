// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  esbuild: {
    // Strip all console.* and debugger statements in production
    drop: ['console', 'debugger'],
  },
  build: {
    // Warn when a chunk exceeds 500 kB
    chunkSizeWarningLimit: 500,
    // Disable source maps in production — dev only
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React — always tiny, cache well
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Charting library — heavy, only used in dashboards
          'vendor-recharts': ['recharts'],
          // Real-time — heavy, only used in dashboard pages
          'vendor-socket': ['socket.io-client'],
          // Form validation
          'vendor-zod': ['zod'],
          // Date utilities
          'vendor-date': ['date-fns'],
          // Icon library
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
});
