import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for heavy libraries (avoid Firebase chunking)
          'vendor-ai': ['@google/generative-ai'],
          'vendor-graph': ['react-force-graph-2d'],
          'vendor-charts': ['recharts'],
          'vendor-particles': ['@tsparticles/react', '@tsparticles/slim'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    headers: {
      'Cache-Control': 'max-age=3600'
    }
  }
})