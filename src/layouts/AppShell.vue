<template>
  <v-app-bar :color="appBarColor" app>
    <v-app-bar-nav-icon v-if="menuLayout === 'vertical'" variant="text" @click.stop="toggleDrawer"></v-app-bar-nav-icon>
    <v-img :src="logoSrc" alt="MOS Logo" max-width="50" width="50" height="40" class="ml-3 mr-3" contain />
    <v-toolbar-title>{{ hostname || '' }}</v-toolbar-title>
    <v-spacer v-if="menuLayout === 'horizontal'" />
    <v-badge :model-value="notificationsBadge" color="green" dot floating bordered location="bottom end" offset-x="18" offset-y="18">
      <v-btn icon variant="text" :aria-label="$t('notifications')" to="/notifications">
        <v-icon>mdi-bell</v-icon>
      </v-btn>
    </v-badge>
    <v-btn icon variant="text" to="/profile">
      <v-icon>mdi-account-circle</v-icon>
    </v-btn>

    <!-- Horizontal Menu in extension slot -->
    <template v-if="menuLayout === 'horizontal'" v-slot:extension>
      <v-tabs v-model="activeTab" align-tabs="start" color="white" slider-size="4" show-arrows>
        <v-tab value="dashboard" to="/dashboard">
          <v-icon start>mdi-view-dashboard</v-icon>
          {{ $t('dashboard') }}
        </v-tab>
        <v-tab value="disks" to="/disks">
          <v-icon start>mdi-harddisk</v-icon>
          {{ $t('disks') }}
        </v-tab>
        <v-tab value="pools" to="/pools">
          <v-icon start>mdi-view-array</v-icon>
          {{ $t('pools') }}
        </v-tab>
        <v-tab value="shares" to="/shares">
          <v-icon start>mdi-share</v-icon>
          {{ $t('shares') }}
        </v-tab>
        <v-tab value="docker" to="/docker">
          <v-icon start>mdi-docker</v-icon>
          {{ $t('docker') }}
        </v-tab>
        <v-tab value="lxc" to="/lxc">
          <v-icon start>mdi-package-variant</v-icon>
          {{ $t('lxc') }}
        </v-tab>
        <v-tab value="vm" to="/vm">
          <v-icon start>mdi-monitor-account</v-icon>
          {{ $t('vm') }}
        </v-tab>
        <v-tab value="plugins" to="/plugins">
          <v-icon start>mdi-puzzle</v-icon>
          {{ $t('plugins') }}
        </v-tab>
        <v-tab value="webterminal" to="/mosTools/webterminal">
          <v-icon start>mdi-console</v-icon>
          {{ $t('terminal') }}
        </v-tab>
        <v-tab value="filebrowser" to="/mosTools/filebrowser">
          <v-icon start>mdi-folder</v-icon>
          {{ $t('filebrowser') }}
        </v-tab>
        <v-tab value="settings" to="/mosSettings">
          <v-icon start>mdi-cog</v-icon>
          {{ $t('settings') }}
        </v-tab>
      </v-tabs>
    </template>
  </v-app-bar>

  <!-- Vertical Navigation Drawer -->
  <v-navigation-drawer v-if="menuLayout === 'vertical'" v-model="drawer" :temporary="!display.mdAndUp.value">
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
      <component :is="Component" @refresh-drawer="refreshDrawer()" @refresh-notifications-badge="refreshBadge()" />
    </router-view>
  </v-main>
  <v-dialog v-model="logoutDialog" width="auto" min-width="400">
    <v-card max-width="400" prepend-icon="mdi-logout" :text="$t('do you want to logout?')" :title="$t('logout')">
      <template v-slot:actions>
        <v-btn color="onPrimary" :text="$t('cancel')" @click="logoutDialog = false"></v-btn>
        <v-btn color="onPrimary" :text="$t('ok')" @click="doLogout"></v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, provide } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay, useTheme as useVuetifyTheme } from 'vuetify';
import { getContrast } from 'vuetify/lib/util/colorUtils';
import mosBlack from '/mos_black.png';
import mosWhite from '/mos_white.png';
import { useAuth } from '../composables/useAuth';
import { useAppearance } from '../composables/useAppearance';
import { useNotifications } from '../composables/useNotifications';
import { useServerInfo } from '../composables/useServerInfo';

const router = useRouter();
const display = useDisplay();
const theme = useVuetifyTheme();
const { logout, fetchProfile } = useAuth();
const { applySystemDefaults, applyUser } = useAppearance();
const { notificationsBadge, refreshBadge, connect, disconnect, subscribePush, unsubscribePush, reset: resetNotifications } = useNotifications();
const { mosServices, hostname, mosVersion, hideInactiveMenus, groupMenus, menuLayout, loadMenuPreferences, loadServices, loadHostInfo, reset: resetServerInfo } = useServerInfo();

const drawer = ref(false);
const logoutDialog = ref(false);
const appBarColor = 'primary';
const isWideScreen = computed(() => display.mdAndUp.value);
const activeTab = computed(() => {
  const path = router.currentRoute.value.path;
  const pathMap = {
    '/': 'dashboard',
    '/dashboard': 'dashboard',
    '/disks': 'disks',
    '/pools': 'pools',
    '/shares': 'shares',
    '/remoteMounting': 'remoteMounting',
    '/mosHub': 'hub',
    '/docker': 'docker',
    '/lxc': 'lxc',
    '/vm': 'vm',
    '/plugins': 'plugins',
    '/mosTools/webterminal': 'webterminal',
    '/mosTools/filebrowser': 'filebrowser',
    '/mosSettings': 'settings',
  };
  return pathMap[path] || null;
});

provide('mosServices', mosServices);

const backgroundColor = computed(() => theme.current.value.colors[appBarColor]);
const isDark = computed(() => getContrast(backgroundColor.value, '#fff') < 2.7);
const logoSrc = computed(() => (isDark.value ? mosBlack : mosWhite));

watch(drawer, (val) => {
  localStorage.setItem('drawer', String(val));
});

const getDrawerState = () => {
  if (localStorage.getItem('drawer')) {
    drawer.value = localStorage.getItem('drawer') === 'true' && isWideScreen.value;
  } else {
    drawer.value = true;
  }
};

const toggleDrawer = () => {
  drawer.value = !drawer.value;
};

const refreshDrawer = async () => {
  loadMenuPreferences();
  await loadServices();
};

const doLogout = async () => {
  logoutDialog.value = false;
  await unsubscribePush();
  disconnect();
  resetNotifications();
  resetServerInfo();
  logout();
  applySystemDefaults();
  await router.push('/login');
};

onMounted(async () => {
  const profile = await fetchProfile();
  if (!profile) return;
  applyUser(profile);
  loadMenuPreferences();
  refreshBadge();
  connect();
  subscribePush();
  await loadServices();
  await loadHostInfo();
  getDrawerState();
});

watch(
  menuLayout,
  (newVal) => {
    // Menu layout changed
  },
  { immediate: true },
);

onUnmounted(() => {
  disconnect();
});
</script>

<style>
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

/* Tabs in app-bar extension - white text with white underline */
.v-app-bar ::v-deep(.v-tabs) {
  background-color: transparent;
}

.v-app-bar ::v-deep(.v-tab) {
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0 12px;
  color: rgba(255, 255, 255, 0.7) !important;
}

.v-app-bar ::v-deep(.v-tab.v-tab--selected) {
  color: #ffffff !important;
}

.v-app-bar ::v-deep(.v-tab--selected) {
  color: #ffffff !important;
}

/* Make the slider/underline white */
.v-app-bar ::v-deep(.v-tabs-bar__slider) {
  background-color: #ffffff !important;
}

.v-app-bar ::v-deep(.v-slide-group__slider) {
  background-color: #ffffff !important;
}
</style>
