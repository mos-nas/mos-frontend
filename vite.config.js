import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import federation from '@originjs/vite-plugin-federation';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'mos-host',
      remotes: {},
      shared: ['vue', 'vue-router', 'vuetify', 'vue-i18n'],
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
            media: '(prefers-color-scheme: light)',
          },
          {
            src: '/icons/icon_dark_small.png',
            sizes: '192x192',
            type: 'image/png',
            media: '(prefers-color-scheme: dark)',
          },
          {
            src: '/icons/icon_light_large.png',
            sizes: '512x512',
            type: 'image/png',
            media: '(prefers-color-scheme: light)',
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
        target: 'http://mos-test.home',
        changeOrigin: true,
      },
      '/api/v1/socket.io': {
        target: 'http://mos-test.home:998',
        changeOrigin: true,
        ws: true,
      },
      '/ws': {
        target: 'ws://mos-test.home:998',
        ws: true,
      },
      '/api/v1/notify': {
        target: 'http://mos-test.home',
        changeOrigin: true,
        ws: true,
      },
      '/api/v1/vm/vnc/ws': {
        target: 'ws://mos-test.home:998',
        changeOrigin: true,
        ws: true,
      },
      '/_plugins': {
        target: 'http://mos-test.home',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/_plugins/, '/plugins'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      input: ['./reboot.html', './index.html', './shutdown.html'],
      output: {
        codeSplitting: true,
        manualChunks(id) {
          if (id.includes('node_modules/vuetify')) return 'vendor-vuetify';
          if (
            id.includes('node_modules/codemirror') ||
            id.includes('node_modules/@codemirror') ||
            id.includes('node_modules/@uiw/codemirror')
          ) return 'vendor-codemirror';
          if (id.includes('node_modules/@xterm')) return 'vendor-xterm';
          if (id.includes('node_modules/chart.js') || id.includes('node_modules/vue-chartjs')) return 'vendor-charts';
          if (id.includes('node_modules/socket.io-client') || id.includes('node_modules/engine.io-client')) return 'vendor-socket';
          if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router') || id.includes('node_modules/vue-i18n')) return 'vendor-vue';
        },
      },
    },
  },
  });