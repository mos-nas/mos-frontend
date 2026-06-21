<template>
  <v-app id="app">
    <template v-if="!loginChecked">
      <v-progress-circular indeterminate color="onPrimary" class="ma-5"></v-progress-circular>
    </template>
    <template v-if="loginChecked && !loggedIn && !token && !mfaRequired">
      <Login @login-success="handleLoginSuccess" @mfa-required="handleMfaRequired" />
    </template>
    <template v-if="loginChecked && !loggedIn && !token && mfaRequired && route.path === '/mfa'">
      <router-view v-slot="{ Component }">
        <component :is="Component" :mfa-token="mfaToken" @login-success="handleLoginSuccess" />
      </router-view>
    </template>
    <template v-if="loginChecked && !loggedIn && token">
      <FirstSetup @setup-complete="handleSetupComplete" :token="token" />
    </template>
    <template v-else-if="loginChecked && loggedIn && !token">
      <v-app-bar v-if="!$route.meta.hideAppBar" :color="appBarColor" app>
        <v-app-bar-nav-icon variant="text" @click.stop="toggleDrawer"></v-app-bar-nav-icon>
        <v-img :src="logoSrc" alt="MOS Logo" max-width="50" width="50" height="40" class="ml-3 mr-3" contain />
        <v-toolbar-title>{{ hostname || '' }}</v-toolbar-title>
        <v-badge :model-value="notificationsBadge" color="green" dot floating bordered location="bottom end" offset-x="18" offset-y="18">
          <v-btn icon variant="text" :aria-label="$t('notifications')" to="/notifications">
            <v-icon>mdi-bell</v-icon>
          </v-btn>
        </v-badge>
        <v-btn icon variant="text" to="/profile">
          <v-icon>mdi-account-circle</v-icon>
        </v-btn>
      </v-app-bar>
      <v-navigation-drawer v-if="!$route.meta.hideAppBar" v-model="drawer" :temporary="!display.mdAndUp.value">
        <v-list>
          <v-list-item to="/dashboard" prepend-icon="mdi-view-dashboard">
            <v-list-item-title>{{ $t('dashboard') }}</v-list-item-title>
          </v-list-item>
          <v-list-group v-if="groupMenus">
            <template #activator="{ props }">
              <v-list-item v-bind="props" prepend-icon="mdi-database" :title="$t('storage')" />
            </template>
            <v-list-item to="/disks" prepend-icon="mdi-harddisk" :title="$t('disks')" />
            <v-list-item to="/pools" prepend-icon="mdi-view-array" :title="$t('pools')" />
          </v-list-group>
          <template v-else>
            <v-list-item to="/disks" prepend-icon="mdi-harddisk" :title="$t('disks')" />
            <v-list-item to="/pools" prepend-icon="mdi-view-array" :title="$t('pools')" />
          </template>
          <v-list-group v-if="groupMenus">
            <template #activator="{ props }">
              <v-list-item v-bind="props" prepend-icon="mdi-server" :title="$t('network access')" />
            </template>
            <v-list-item to="/shares" prepend-icon="mdi-share" :title="$t('shares')" />
            <v-list-item
              v-if="!hideInactiveMenus || mosServices.remote_mounting?.enabled"
              :disabled="!mosServices.remote_mounting?.enabled"
              to="/remoteMounting"
              prepend-icon="mdi-cloud-sync"
              :title="$t('remote mounting')"
            />
          </v-list-group>
          <template v-else>
            <v-list-item to="/shares" prepend-icon="mdi-share" :title="$t('shares')" />
            <v-list-item
              v-if="!hideInactiveMenus || mosServices.remote_mounting?.enabled"
              :disabled="!mosServices.remote_mounting?.enabled"
              to="/remoteMounting"
              prepend-icon="mdi-cloud-sync"
              :title="$t('remote mounting')"
            />
          </template>
          <v-list-item v-if="mosServices.hub?.enabled" to="/mosHub" prepend-icon="mdi-hub" :title="$t('mos hub')" />
          <v-list-group v-if="groupMenus">
            <template #activator="{ props }">
              <v-list-item v-bind="props" prepend-icon="mdi-server" :title="$t('virtualization')" />
            </template>
            <v-list-item v-if="!hideInactiveMenus || mosServices.docker?.running" :disabled="!mosServices.docker?.running" to="/docker" prepend-icon="mdi-docker" :title="$t('docker')" />
            <v-list-item v-if="!hideInactiveMenus || mosServices.lxc?.enabled" :disabled="!mosServices.lxc?.enabled" to="/lxc" prepend-icon="mdi-package-variant" :title="$t('lxc')" />
            <v-list-item v-if="!hideInactiveMenus || mosServices.vm?.running" :disabled="!mosServices.vm?.running" to="/vm" prepend-icon="mdi-monitor-account" :title="$t('vm')" />
          </v-list-group>
          <template v-else>
            <v-list-item v-if="!hideInactiveMenus || mosServices.docker?.running" :disabled="!mosServices.docker?.running" to="/docker" prepend-icon="mdi-docker" :title="$t('docker')" />
            <v-list-item v-if="!hideInactiveMenus || mosServices.lxc?.enabled" :disabled="!mosServices.lxc?.enabled" to="/lxc" prepend-icon="mdi-package-variant" :title="$t('lxc')" />
            <v-list-item v-if="!hideInactiveMenus || mosServices.vm?.running" :disabled="!mosServices.vm?.running" to="/vm" prepend-icon="mdi-monitor-account" :title="$t('vm')" />
          </template>
          <v-list-item to="/plugins" prepend-icon="mdi-puzzle" :title="$t('plugins')" />
          <v-list-group v-if="groupMenus">
            <template #activator="{ props }">
              <v-list-item v-bind="props" prepend-icon="mdi-tools" :title="$t('mos tools')" />
            </template>
            <v-list-item to="/mosTools/webterminal" prepend-icon="mdi-console" :title="$t('terminal')" />
            <v-list-item to="/mosTools/filebrowser" prepend-icon="mdi-folder" :title="$t('filebrowser')" />
          </v-list-group>
          <template v-else>
            <v-list-item to="/mosTools/webterminal" prepend-icon="mdi-console" :title="$t('terminal')" />
            <v-list-item to="/mosTools/filebrowser" prepend-icon="mdi-folder" :title="$t('filebrowser')" />
          </template>
          <v-list-item to="/mosSettings" prepend-icon="mdi-cog" :title="$t('settings')" />
          <v-list-item v-on:click="logoutDialog = true" prepend-icon="mdi-logout" :title="$t('logout')" />
        </v-list>
        <template #append>
          <div v-if="mosServices.tailscale?.enabled || mosServices.netbird?.enabled" class="d-flex justify-center flex-wrap ga-1 pt-2 pb-1">
            <v-chip
              v-if="mosServices.tailscale?.enabled"
              size="x-small"
              :color="mosServices.tailscale?.online ? 'success' : 'error'"
              :prepend-icon="mosServices.tailscale?.online ? 'mdi-lock-outline' : 'mdi-lock-off-outline'"
              variant="tonal"
            >
              Tailscale
            </v-chip>
            <v-chip
              v-if="mosServices.netbird?.enabled"
              size="x-small"
              :color="mosServices.netbird?.online ? 'success' : 'error'"
              :prepend-icon="mosServices.netbird?.online ? 'mdi-lock-outline' : 'mdi-lock-off-outline'"
              variant="tonal"
            >
              Netbird
            </v-chip>
          </div>
          <v-divider />
          <div class="pa-2 pb-3">
            <div v-if="mosVersion" class="d-flex align-center justify-center ga-1 pt-2 text-caption text-disabled">{{ $t('mos') }}: {{ mosVersion }}</div>
            <v-divider v-if="mosServices?.mos?.supporter" class="mt-3" />
            <div v-if="mosServices?.mos?.supporter" class="d-flex align-center justify-center pt-2">
              <div class="supporter-badge">
                <v-img src="/mos_black.png" alt="MOS" width="32" height="32" contain class="supporter-badge__logo" />
                <span class="supporter-badge__label">{{ $t('supporter') }}</span>
              </div>
            </div>
          </div>
        </template>
      </v-navigation-drawer>
      <v-main>
        <router-view v-slot="{ Component }">
          <component :is="Component" @refresh-drawer="refreshDrawer()" @refresh-notifications-badge="getNotificationsBadge()" />
        </router-view>
      </v-main>
    </template>
  </v-app>

  <!-- Top Toaster -->
  <Toaster id="top-toaster" position="top-center" :richColors="true" :theme="theme.global.name.value === 'dark' ? 'dark' : 'light'" :expand="true" :visibleToasts="3" :offset="16" />

  <!-- Bottom Toaster -->
  <Toaster id="bottom-toaster" position="bottom-center" :richColors="true" :theme="theme.global.name.value === 'dark' ? 'dark' : 'light'" :expand="true" :visibleToasts="3" :offset="16" />



  <v-dialog v-model="logoutDialog" width="auto" min-width="400">
    <v-card max-width="400" prepend-icon="mdi-logout" :text="$t('do you want to logout?')" :title="$t('logout')">
      <template v-slot:actions>
        <v-btn color="onPrimary" :text="$t('cancel')" @click="logoutDialog = false"></v-btn>
        <v-btn color="onPrimary" :text="$t('ok')" @click="doLogout"></v-btn>
      </template>
    </v-card>
  </v-dialog>

  <!-- Global Loading Overlay -->
  <v-overlay :model-value="overlay" contained class="d-flex align-center justify-center" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex !important; align-items: center !important; justify-content: center !important;">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, provide } from 'vue';
import Login from './views/login.vue';
import FirstSetup from './views/firstSetup.vue';
import { showSnackbarError, showSnackbarSuccess, showSnackbarInfo, showSnackbarWarning } from './composables/snackbar';
import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { getContrast } from 'vuetify/lib/util/colorUtils';
import { Toaster } from 'vue-sonner';
import mosBlack from '/mos_black.png';
import mosWhite from '/mos_white.png';
import { useDisplay } from 'vuetify';
import { useRoute, useRouter } from 'vue-router';

const display = useDisplay();
const theme = useTheme();
const route = useRoute();
const router = useRouter();
const { locale, t } = useI18n();
const tab = ref('');
const drawer = ref(false);
const isWideScreen = computed(() => display.mdAndUp.value);
const loggedIn = ref(false);
const token = ref('');
const logoutDialog = ref(false);
const mfaRequired = ref(false);
const mfaToken = ref('');
const loginChecked = ref(false);
const mosServices = ref({});
const appBarColor = 'primary';
const notificationsBadge = ref(false);
const hostname = ref('');
const hideInactiveMenus = ref(localStorage.getItem('hideInactiveMenus') === 'true');
const groupMenus = ref(localStorage.getItem('groupMenus') === 'true');
const mosVersion = ref('');
const RECONNECT_MAX_DELAY = 15000;
const RECONNECT_BASE_DELAY = 1000;

let ws = null;
let reconnectTimer = null;
let reconnectAttempts = 0;

const overlay = ref(false);

provide('mosServices', mosServices);
provide('overlay', overlay);

watch(drawer, (val) => {
  localStorage.setItem('drawer', String(val));
});

watch(
  () => [hostname.value, route.path],
  () => {
    const title = route.meta?.title || '';
    document.title = hostname.value ? `${title} - ${hostname.value}` : title;
  },
);

watch(
  () => [loginChecked.value, loggedIn.value],
  ([checked, isLoggedIn]) => {
    if (checked && !isLoggedIn) {
      applySystemThemeDefaults();
    }
  },
);

onMounted(async () => {
  if (tab.value === '') {
    tab.value = 'dashboard';
  }
  await checkLoggedIn();
  if (loggedIn.value) {
    hideInactiveMenus.value = localStorage.getItem('hideInactiveMenus') === 'true';
    groupMenus.value = localStorage.getItem('groupMenus') === 'true';
    getNotificationsBadge();
    connectNotificationWS();
    subscribePush();
    await getMosServices();
    await getHostname();
    getDrawerState();
  }
});

onUnmounted(() => {
  cleanupWS();
});

const backgroundColor = computed(() => {
  return theme.current.value.colors[appBarColor];
});
const isDark = computed(() => {
  const contrast = getContrast(backgroundColor.value, '#fff');
  return contrast < 2.7;
});
const logoSrc = computed(() => {
  return isDark.value ? mosBlack : mosWhite;
});

const applySystemThemeDefaults = () => {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  theme.change(prefersDark ? 'dark' : 'light');
  theme.themes.value.light.colors.primary = '#1976D2';
  theme.themes.value.dark.colors.primary = '#1976D2';
};

const checkLoggedIn = async () => {
  if (localStorage.getItem('authToken')) {
    checkTokenExpired(localStorage.getItem('authToken'));
    if (loggedIn.value) {
      await getUserProfile();
    } else {
      loggedIn.value = false;
    }
  } else {
    token.value = await checkFirstSetup();
    loggedIn.value = false;
  }
  loginChecked.value = true;
};

function checkTokenExpired(token) {
  if (token) {
    const payload = token.split('.')[1];
    try {
      const decoded = JSON.parse(atob(payload));
      if (decoded.exp && Date.now() / 1000 > decoded.exp) {
        localStorage.removeItem('authToken');
        loggedIn.value = false;
        return;
      }
    } catch (e) {
      loggedIn.value = false;
      return;
    }
  }
  loggedIn.value = true;
  return;
}

const getUserProfile = async () => {
  try {
    const res = await fetch('/api/v1/auth/profile', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('Not logged in');

    const result = await res.json();

    if (result.darkmode) {
      theme.change('dark');
    } else {
      theme.change('light');
    }
    locale.value = result.language || 'en';
    theme.themes.value[theme.global.name.value].colors.primary = result.primary_color || '#1976D2';
    localStorage.setItem('userid', result.id);
    localStorage.setItem('hideInactiveMenus', String(result.hide_inactive_menus));
    localStorage.setItem('groupMenus', String(result.group_menus));

    loggedIn.value = true;
  } catch (e) {
    loggedIn.value = false;
  }
};

function handleMfaRequired(newMfaToken) {
  mfaRequired.value = true;
  mfaToken.value = newMfaToken || '';
  router.push('/mfa');
}

async function handleLoginSuccess() {
  hideInactiveMenus.value = localStorage.getItem('hideInactiveMenus') === 'true';
  groupMenus.value = localStorage.getItem('groupMenus') === 'true';
  loggedIn.value = true;
  mfaRequired.value = false;
  mfaToken.value = '';

  getNotificationsBadge();
  connectNotificationWS();
  subscribePush();

  await getMosServices();
  await getHostname();
  getDrawerState();
}

function handleSetupComplete() {
  loggedIn.value = false;
  token.value = '';
  mfaRequired.value = false;
  mfaToken.value = '';
  applySystemThemeDefaults();
}

function doLogout() {
  unsubscribePush().catch(() => {});
  cleanupWS();

  notificationsBadge.value = false;
  hostname.value = '';
  token.value = '';
  mfaRequired.value = false;
  mfaToken.value = '';
  hideInactiveMenus.value = false;
  groupMenus.value = false;

  applySystemThemeDefaults();

  localStorage.removeItem('authToken');
  localStorage.removeItem('userid');
  localStorage.removeItem('username');
  localStorage.removeItem('hideInactiveMenus');
  localStorage.removeItem('groupMenus');
  localStorage.removeItem('drawer');
  localStorage.removeItem('byte_format');

  tab.value = 'dashboard';
  loggedIn.value = false;
  drawer.value = false;

  logoutDialog.value = false;
}

const refreshDrawer = async () => {
  hideInactiveMenus.value = localStorage.getItem('hideInactiveMenus') === 'true';
  groupMenus.value = localStorage.getItem('groupMenus') === 'true';
  await getMosServices();
};

const getMosServices = async () => {
  try {
    const res = await fetch('/api/v1/mos/services', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    mosServices.value = await res.json();
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const getHostname = async () => {
  try {
    const res = await fetch('/api/v1/mos/osinfo', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    const result = await res.json();
    hostname.value = result.hostname || '';
    mosVersion.value = result.mos?.version || '';
  } catch (e) {
    hostname.value = '';
  }
};

const checkFirstSetup = async () => {
  try {
    const res = await fetch('/api/v1/auth/firstsetup', {
      method: 'GET',
    });

    if (!res.ok) throw new Error('API-Error');

    const result = await res.json();
    return result.firstsetup;
  } catch (e) {
    return false;
  }
};

const getNotificationsBadge = async () => {
  try {
    const res = await fetch('/api/v1/notifications?read=false&limit=1', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    let notification = await res.json();

    notificationsBadge.value = notification.length > 0;
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const toggleDrawer = () => {
  drawer.value = !drawer.value;
};

const getDrawerState = () => {
  if (localStorage.getItem('drawer')) {
    if (localStorage.getItem('drawer') === 'true' && isWideScreen.value) {
      drawer.value = true;
    } else {
      drawer.value = false;
    }
  } else {
    drawer.value = true;
  }
};

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

const getVapidKey = async () => {
  const res = await fetch('/api/v1/notifications/push/vapid-key', {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('authToken'),
    },
  });

  if (!res.ok) throw new Error('API-Error');
  const result = await res.json();
  return result.publicKey;
};

const subscribePush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const registration = await navigator.serviceWorker.ready;
    const vapidKey = await getVapidKey();

    const existing = await registration.pushManager.getSubscription();
    if (existing) return;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    await fetch('/api/v1/notifications/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(subscription),
    });
  } catch (e) {
    showSnackbarError('Failed to subscribe for push notifications: ' + e.message);
  }
};

const unsubscribePush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      await fetch('/api/v1/notifications/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        },
        body: JSON.stringify(subscription),
      });
    }
  } catch (e) {
    showSnackbarError('Failed to unsubscribe from push notifications: ' + e.message);
  }
};

// WS START --------------------------------------
function connectNotificationWS() {
  cleanupWS();
  ws = new WebSocket('/api/v1/notify');

  ws.onopen = () => {
    reconnectAttempts = 0;
    try {
      ws.send(JSON.stringify({ type: 'subscribe-notifications' }));
    } catch {}
  };

  ws.onerror = (ev) => {
    //showSnackbarError('Notification connection error');
  };

  ws.onclose = (ev) => {
    scheduleReconnect();
  };

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg?.type === 'ping') {
      ws?.send?.(JSON.stringify({ type: 'pong' }));
    } else {
      notificationsBadge.value = true;
      window.dispatchEvent(new CustomEvent('notification-received'));
      if (msg?.priority === 'error' || msg?.priority === 'alert') {
        showSnackbarError(msg?.message || 'New notification received', '', 'mdi-bell-ring', 'top-toaster');
      } else if (msg?.priority === 'warning') {
        showSnackbarWarning(msg?.message || 'New notification received', 'mdi-bell-ring', 'top-toaster');
      } else if (msg?.priority === 'success') {
        showSnackbarSuccess(msg?.message || 'New notification received', 'mdi-bell-ring', 'top-toaster');
      } else if (msg?.priority === 'info') {
        showSnackbarInfo(msg?.message || 'New notification received', 'mdi-bell-ring', 'top-toaster');
      } else {
        showSnackbarInfo(msg?.message || 'New notification received', 'mdi-bell-ring', 'top-toaster');
      }
    }
  };
}

function scheduleReconnect() {
  cleanupWS(false);
  const delay = Math.min(RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts++), RECONNECT_MAX_DELAY);
  reconnectTimer = window.setTimeout(connectNotificationWS, delay);
}

function cleanupWS(clearTimer = true) {
  try {
    ws?.close();
  } catch {}
  ws = null;
  if (clearTimer && reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}
// WS ENDE --------------------------------------
</script>

<style>
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
.supporter-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.1px;
  color: rgba(0, 0, 0, 0.82);
  background: linear-gradient(115deg, rgba(165, 214, 167, 0.35) 0%, rgba(200, 230, 201, 0.3) 35%, rgba(178, 223, 219, 0.3) 60%, rgba(197, 225, 165, 0.35) 100%);
  border: 1px solid rgba(76, 175, 80, 0.25);
  box-shadow:
    0 1px 4px rgba(76, 175, 80, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.supporter-badge__logo {
  flex: 0 0 auto;
  margin: -8px 0;
}

.supporter-badge__label {
  flex: 0 0 auto;
}
</style>
