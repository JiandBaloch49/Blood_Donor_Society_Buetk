import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// NOTE: vite-plugin-pwa was removed due to install-time OOM on this machine.
// PWA is instead implemented manually via public/manifest.json + public/sw.js
export default defineConfig({
  plugins: [react()],
  server: {
    // Expose dev server on all network interfaces so other devices can access it
    host: true,
    // Proxy /api requests to the backend — this eliminates ALL CORS issues.
    // The browser only ever talks to the Vite dev server (same origin),
    // so no cross-origin request is ever made, regardless of which network you're on.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
