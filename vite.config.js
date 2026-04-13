import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],

  build: {
    // Vite 8 uses Rolldown — must use rolldownOptions (not rollupOptions)
    rolldownOptions: {
      output: {
        // Must be a function in Rolldown, NOT an object
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'react-vendor'
            }
            if (id.includes('apexcharts') || id.includes('react-apexcharts')) {
              return 'charts-vendor'
            }
            if (id.includes('socket.io-client')) {
              return 'socket-vendor'
            }
          }
        }
      }
    }
  },

  server: {
    port: 3001,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:5001',
        ws: true,
      }
    }
  }
})