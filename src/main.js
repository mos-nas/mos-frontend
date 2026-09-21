// main.js
import { createApp } from 'vue';
import * as Vue from 'vue';
import App from './App.vue';
import '@mdi/font/css/materialdesignicons.css';

window.__VUE__ = Vue;

// Global fetch wrapper to handle API URLs in development
const originalFetch = window.fetch;
const apiBase = typeof __API_BASE_URL__ !== 'undefined' ? __API_BASE_URL__ : '';

// Make API base URL globally available
if (apiBase) {
  globalThis.__API_BASE_URL__ = apiBase;
}

window.fetch = function(...args) {
  let [resource, config] = args;
  
  // If resource is a string and starts with /api, prepend the API base URL
  if (typeof resource === 'string' && resource.startsWith('/api')) {
    if (apiBase && !resource.startsWith('http')) {
      resource = apiBase + resource;
    }
  }
  
  return originalFetch(resource, config);
};

import { createI18n } from 'vue-i18n';
import de from './locales/de.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import router from './router';
import 'vue-sonner/style.css';
import CronVuetifyPlugin from '@vue-js-cron/vuetify';
import '@vue-js-cron/vuetify/dist/vuetify.css';

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import colors from 'vuetify/util/colors';
import { md3 } from 'vuetify/blueprints';
import { createAutoOnColorsPlugin } from './plugins/autoOnColors';

const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = prefersDark ? 'dark' : 'light';

const vuetify = createVuetify({
  blueprint: md3,
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    defaultTheme: initialTheme,
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1976D2',
          'on-primary': '#ffffff',
          secondary: colors.teal.darken4,
          'on-secondary': '#ffffff',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#1976D2',
          'on-primary': '#000000',
          secondary: colors.teal.darken3,
          'on-secondary': '#000000',
        },
      },
    },
  },
  defaults: {
    VTextField: { density: 'comfortable', variant: 'outlined' },
    VSelect: { density: 'comfortable', variant: 'outlined' },
    VAutocomplete: { density: 'comfortable', variant: 'outlined' },
    VCombobox: { density: 'comfortable', variant: 'outlined' },
    VTextarea: { density: 'comfortable', variant: 'outlined' },
    VCard: {
      style: {
        background: 'rgb(var(--v-theme-background))',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.06)',
        border: '1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 15%, transparent)',
      },
    },
  },
});

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    de,
    en,
    fr,
  },
});

createApp(App).use(vuetify).use(router).use(i18n).use(createAutoOnColorsPlugin(vuetify)).use(CronVuetifyPlugin).mount('#app');
