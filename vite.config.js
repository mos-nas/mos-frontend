import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import federation from '@originjs/vite-plugin-federation';
import { VitePWA } from 'vite-plugin-pwa';

// Target configuration
const API_TARGET = 'http://mos-test.home';
const WS_TARGET = 'ws://mos-test.home';

export default defineConfig({
  define: {
    '__API_BASE_URL__': JSON.stringify(process.env.VITE_API_BASE_URL || (process.env.NODE_ENV === 'development' ? API_TARGET : '')),
    '__WS_BASE_URL__': JSON.stringify(process.env.VITE_WS_BASE_URL || (process.env.NODE_ENV === 'development' ? WS_TARGET : '')),
    '__BUNDLED_DEV__': true,
    '__SERVER_FORWARD_CONSOLE__': false,
  },
  plugins: [
    vue(),
    federation({
      name: 'mos-host',
      remotes: {},
      shared: ['vue', 'vue-router', 'vuetify'],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MiB
      },
      manifest: {
        name: 'MOS',
        short_name: 'MOS',
        description: 'MOS - Modular Operation System',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icons/icon_light_small.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon_light_large.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon_dark_small.png',
            sizes: '192x192',
            type: 'image/png',
            media: '(prefers-color-scheme: dark)',
          },
          {
            src: '/icons/icon_dark_large.png',
            sizes: '512x512',
            type: 'image/png',
            media: '(prefers-color-scheme: dark)',
          },
        ],
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 80,
    proxy: {
      '^/api/(?!v1/socket\\.io)': {
        target: API_TARGET,
        changeOrigin: true,
      },
      '/api/v1/socket.io': {
        target: API_TARGET,
        changeOrigin: true,
        ws: true,
      },
      '/ws': {
        target: WS_TARGET,
        ws: true,
      },
      '/api/v1/notify': {
        target: API_TARGET,
        changeOrigin: true,
        ws: true,
      },
      '/api/v1/vm/vnc/ws': {
        target: WS_TARGET,
        changeOrigin: true,
        ws: true,
      },
      '/_plugins': {
        target: API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/_plugins/, '/plugins'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: ['./reboot.html', './index.html', './shutdown.html'],
    },
  },
  optimizeDeps: {
    exclude: ['vue-i18n'],
  },
});
