import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { serwist } from '@serwist/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    serwist({
      swSrc: 'src/sw.ts',
      swDest: 'sw.js',
      globDirectory: 'dist',
      injectionPoint: 'self.__SW_MANIFEST',
      rollupFormat: 'iife',
    }),
  ],
  base: process.env.VITE_BASE_URL || '/',
})
