import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    svgr(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['aerotech.png', 'favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Aerotech Gestión',
        short_name: 'Aerotech',
        description: 'Sistema de Gestión y Monitoreo Aerotech',
        theme_color: '#111827',
        background_color: '#111827',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 10485760,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/printer-ui(?:\/|$)/,
          /^\/api/
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api-remitos': { target: 'http://10.35.144.252:5003', changeOrigin: true, rewrite: (path) => path.replace(/^\/api-remitos/, '') },
      '/monitor-impresoras': { target: 'http://10.35.144.252:8443', changeOrigin: true, rewrite: (path) => path.replace(/^\/monitor-impresoras/, '') },
      '/api-nagios': { target: 'http://10.35.144.252:5500', changeOrigin: true, rewrite: (path) => path.replace(/^\/api-nagios/, '') },
      '/api-switch': { target: 'http://10.35.144.252:5063', changeOrigin: true, rewrite: (path) => path.replace(/^\/api-switch/, '') },
      '/ws-ssh': { target: 'ws://10.35.144.252:5064', ws: true, changeOrigin: true, rewrite: (path) => path.replace(/^\/ws-ssh/, '') }
    }
  }
})