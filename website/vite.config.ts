import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('md-')
        }
      }
    }),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      manifest: {
        short_name: 'Examduler',
        name: 'Examduler',
        description: 'A lightweight yet powerful exam management app for educators and students.',
        icons: [
          {
            src: 'examduler_logo_trans_full.png',
            sizes: '500x500',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'examduler_logo_trans.png',
            sizes: '500x500',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'examduler_logo_monochrome_full.png',
            sizes: '500x500',
            type: 'image/png',
            purpose: 'monochrome',
          },
        ],
        screenshots: [
          {
            src: 'screenshots/desktop_dashboard.png',
            sizes: '1920x1128',
            form_factor: 'wide',
            label: 'Dashboard on desktop'
          },
          {
            src: 'screenshots/desktop_exam_dialog.png',
            sizes: '1920x1128',
            form_factor: 'wide',
            label: 'Examination dialog on desktop'
          },
          {
            src: 'screenshots/desktop_create_exam_dialog.png',
            sizes: '1920x1128',
            form_factor: 'wide',
            label: 'Examination creation dialog on desktop'
          },
          {
            src: 'screenshots/desktop_org_dialog.png',
            sizes: '1920x1128',
            form_factor: 'wide',
            label: 'Organization dialog view on desktop'
          },
          {
            src: 'screenshots/desktop_exam_view.png',
            sizes: '1920x1128',
            form_factor: 'wide',
            label: 'Examination view on desktop'
          },
          {
            src: 'screenshots/mobile_dashboard.png',
            sizes: '1080x2400',
            form_factor: 'narrow',
            label: 'Dashboard on mobile'
          },
          {
            src: 'screenshots/mobile_exam_dialog.png',
            sizes: '1080x2400',
            form_factor: 'narrow',
            label: 'Examination dialog on mobile'
          },
          {
            src: 'screenshots/mobile_create_exam_dialog.png',
            sizes: '1080x2400',
            form_factor: 'narrow',
            label: 'Examination creation dialog on mobile'
          },
          {
            src: 'screenshots/mobile_org_dialog.png',
            sizes: '1080x2400',
            form_factor: 'narrow',
            label: 'Organization dialog view on mobile'
          },
          {
            src: 'screenshots/mobile_exam_view.png',
            sizes: '1080x2400',
            form_factor: 'narrow',
            label: 'Examination view on mobile'
          },
        ],
        start_url: '/',
        display: 'standalone',
        theme_color: '#126682',
        background_color: '#F6FAFD',
      },
      srcDir: 'src/',
      includeAssets: ['public/*'],
      workbox: {
        globPatterns: [
          '**/*.{html,css,js,png,svg,ico,json}',
        ],
        cacheId: 'v1.0.0',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 *365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 *365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            }
          },
        ],
      }
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 3002,
  },
  preview: {
    port: 3002,
  },
  base: '/',
})
