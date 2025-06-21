import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    port: 3000,
    headers: {
      'Strict-Transport-Security': 'max-age=86400; includeSubDomains',
      'Content-Security-Policy': 'upgrade-insecure-requests'
    }
  },
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: '*',
      manifest: {
        name: 'Seadox Document Network',
        short_name: 'Seadox',
        description: 'Seadox is a realtime document network for data that matters',
        theme_color: '#070707',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
