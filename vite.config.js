import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cloudflare } from "@cloudflare/vite-plugin"

export default defineConfig({
  plugins: [react(), cloudflare()],

  server: {
    port: 3001,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  },

  build: {
    rollupOptions: {
      output: {}   // ✅ NOTHING here
    }
  }
})