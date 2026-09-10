import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/division-drop/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Division Drop',
        short_name: 'DivDrop',
        description:
          'A cheerful falling-block game that practices 3rd-grade division. Math is a power-up, not a gate!',
        theme_color: '#5B2CFF',
        background_color: '#1A0A3E',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/division-drop/',
        scope: '/division-drop/',
        categories: ['games', 'education'],
        lang: 'en-US',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: 'index.html',
      },
    }),
  ],
  server: { host: true },
  preview: { host: true },
})
