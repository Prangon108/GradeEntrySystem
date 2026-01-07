import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // Proxy API calls to ASP.NET backend during development
        target: 'https://localhost:7162',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
})
