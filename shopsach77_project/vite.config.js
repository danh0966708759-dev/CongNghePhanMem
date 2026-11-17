import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: {
    proxy: {
      '/php': {
        target: 'http://127.0.0.1',
        changeOrigin: true,
        rewrite: path => `/shopsach77${path}`,
      },
    },
  },
})
