import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Livro-Caixa SaaS',
        short_name: 'Finanças',
        description: 'Gestão financeira em tempo real',
        theme_color: '#F6F2E8',
        background_color: '#F6F2E8',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  // A magia da proteção anti-cópia acontece aqui
  build: {
    sourcemap: false, // Impede o navegador de reconstruir o teu código fonte original
    minify: 'terser', // Esmaga o código e muda o nome das variáveis para letras aleatórias
    terserOptions: {
      compress: {
        drop_console: true, // Remove todos os console.log para não dar pistas a curiosos
        drop_debugger: true
      }
    }
  }
})