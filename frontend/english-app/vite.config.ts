import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/english',
  plugins: [react()],
  server: {
    proxy: {
      '/english/get-cooldown': {
        target: 'http://127.0.0.1:8080/',
        changeOrigin: true,
        secure: false,
      },
      '/english/award-points': {
        target: 'http://127.0.0.1:8080/',
        changeOrigin: true,
        secure: false,
      }
    },
  },
})
