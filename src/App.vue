<template>
  <v-app id="app">
    <div v-if="!ready" class="loading-screen">
      <div class="loading-container">
        <div class="logo-wrapper">
          <img :src="currentLogo" alt="MOS Logo" class="mos-logo" />
        </div>
        <p class="loading-text">{{ loadingStatus }}</p>
      </div>
    </div>
    <component :is="layout" v-else />
  </v-app>

  <Toaster id="top-toaster" position="top-center" :richColors="true" :theme="theme.global.name.value === 'dark' ? 'dark' : 'light'" :expand="true" :visibleToasts="3" :offset="16" />
  <Toaster id="bottom-toaster" position="bottom-center" :richColors="true" :theme="theme.global.name.value === 'dark' ? 'dark' : 'light'" :expand="true" :visibleToasts="3" :offset="16" />

  <v-overlay
    :model-value="overlay"
    contained
    class="d-flex align-center justify-center"
    style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex !important; align-items: center !important; justify-content: center !important"
  >
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { ref, computed, watch, provide, onMounted } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import { useTheme as useVuetifyTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { Toaster } from 'vue-sonner';
import AppShell from './layouts/AppShell.vue';
import { useAuth } from './composables/useAuth';
import { useAppearance } from './composables/useAppearance';
import { useServerInfo } from './composables/useServerInfo';
import mosIcon from '/mos_icon.svg?url';
import mosIconWhite from '/mos_icon_white.svg?url';

const route = useRoute();
const router = useRouter();
const theme = useVuetifyTheme();
const { t } = useI18n();
const { isLoggedIn } = useAuth();
const { hostname } = useServerInfo();
const { applyStoredAppearance, applySystemDefaults } = useAppearance();

const ready = ref(false);
const overlay = ref(false);
const loadingStatus = ref('');

const currentLogo = computed(() => (theme.global.name.value === 'dark' ? mosIconWhite : mosIcon));

const startLoadingMessages = () => {
  const messages = [t('initializing system'), t('loading modules'), t('preparing interface'), t('almost there')];

  const randomIndex = Math.floor(Math.random() * messages.length);
  loadingStatus.value = messages[randomIndex];
};

provide('overlay', overlay);

onMounted(() => {
  startLoadingMessages();
});

router
  .isReady()
  .catch(() => {})
  .finally(() => {
    ready.value = true;
  });

const layout = computed(() => (route.meta.layout === 'blank' ? RouterView : AppShell));

applyStoredAppearance();

watch(
  isLoggedIn,
  (loggedIn) => {
    if (!loggedIn) {
      applySystemDefaults();
    }
  },
  { immediate: true },
);

watch(
  () => [hostname.value, route.path],
  () => {
    const title = route.meta?.title || '';
    document.title = hostname.value ? `${title} - ${hostname.value}` : title;
  },
);
</script>

<style>
html {
  scrollbar-gutter: stable;
}

.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--v-theme-background) 0%, var(--v-theme-surface) 100%);
  z-index: 9999;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.logo-wrapper {
  animation: float 3s ease-in-out infinite;
}

.mos-logo {
  width: 150px;
  height: 150px;
  opacity: 0.9;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
}

.loading-text {
  font-size: 0.95rem;
  color: rgb(var(--v-theme-on-background));
  opacity: 0.8;
  font-weight: 500;
  letter-spacing: 0.5px;
  animation: pulse 2s ease-in-out infinite;
  min-height: 1.5em;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.v-btn--variant-flat.bg-primary,
.v-btn--variant-elevated.bg-primary {
  background: rgb(var(--v-theme-primary)) !important;
  color: rgb(var(--v-theme-on-primary)) !important;
  -webkit-text-fill-color: rgb(var(--v-theme-on-primary)) !important;
}

.v-btn--variant-flat.bg-secondary,
.v-btn--variant-elevated.bg-secondary {
  background: rgb(var(--v-theme-secondary)) !important;
  color: rgb(var(--v-theme-on-secondary)) !important;
  -webkit-text-fill-color: rgb(var(--v-theme-on-secondary)) !important;
}

.v-btn--variant-flat.bg-error,
.v-btn--variant-elevated.bg-error {
  background: rgb(var(--v-theme-error)) !important;
  color: rgb(var(--v-theme-on-error)) !important;
  -webkit-text-fill-color: rgb(var(--v-theme-on-error)) !important;
}

.text-caption {
  font-size: 0.9rem !important;
  line-height: 1.4 !important;
}
.text-body-2 {
  font-size: 0.9rem !important;
  line-height: 1.4 !important;
}
</style>
