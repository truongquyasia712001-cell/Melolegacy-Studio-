import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Local recognition sidecar runs on port 8000.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
