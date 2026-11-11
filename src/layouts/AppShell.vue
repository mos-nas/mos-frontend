<template>
  <v-app-bar :color="appBarColor" app>
    <v-app-bar-nav-icon v-if="menuLayout === 'vertical'" variant="text" @click.stop="toggleDrawer"></v-app-bar-nav-icon>
    <v-img :src="logoSrc" alt="MOS Logo" max-width="50" width="50" height="40" class="ml-3 mr-3" contain />
    <v-toolbar-title v-show="display.mdAndUp.value">{{ hostname || '' }}</v-toolbar-title>
    <v-spacer />

    <v-btn icon variant="text" :title="$t('about')" :aria-label="$t('about')" class="info-btn-appbar">
      <v-icon>mdi-information</v-icon>

      <v-menu activator="parent" location="bottom">
        <v-card min-width="200">
          <v-card-text class="pa-3">
            <!-- MOS Version with Status Icon -->
            <div v-if="mosVersion" class="d-flex align-center ga-1">
              <span class="text-caption text-disabled">{{ $t('mos') }}: {{ mosVersion }}&nbsp;</span>
              <v-icon size="x-small" :color="mosServices?.mos?.os_update_available ? 'warning' : 'success'">
                {{ mosServices?.mos?.os_update_available ? 'mdi-alert-circle' : 'mdi-check-circle' }}
              </v-icon>
            </div>
            <!-- OS Update Status -->
            <div class="d-flex align-center ga-2">
              <div class="flex-grow-1">
                <div v-if="mosServices?.mos?.os_update_available" class="text-subtitle-2 text-warning">
                  {{ $t('new version') }}
                </div>
                <div v-if="mosServices?.mos?.os_update_available" class="text-caption text-medium-emphasis">
                  {{ mosServices?.mos?.os_update_available }}
                </div>
              </div>
            </div>

            <!-- Auto Update Info -->
            <div class="d-flex align-center ga-2">
              <span class="text-caption text-disabled">{{ $t('auto update') }}:&nbsp;</span>
              <div class="flex-grow-1">
                <div class="text-caption text-disabled">
                  {{ mosServices?.mos?.auto_update?.enabled ? $t('enabled') : $t('disabled') }}
                </div>
              </div>
            </div>

            <!-- Security Notice -->
            <div v-if="mosServices?.mos?.security_notice" class="d-flex align-center ga-2">
              <span class="text-caption text-disabled">{{ $t('security notice') }}:&nbsp;</span>
              <div class="flex-grow-1">
                <div class="text-caption text-disabled">
                  {{ mosServices.mos.security_notice }}
                </div>
              </div>
            </div>

            <!-- Reboot Pending -->
            <div v-if="mosServices?.mos?.reboot_pending?.pending" class="d-flex align-center ga-2">
              <span class="text-caption text-disabled">{{ $t('reboot pending') }}:&nbsp;</span>
              <div class="flex-grow-1">
                <div class="text-caption text-disabled">
                  {{ mosServices?.mos?.reboot_pending?.reason?.join(', ') }}
                </div>
              </div>
            </div>

            <!-- Horizontal Menu Content -->
            <div v-if="menuLayout === 'horizontal'" class="d-flex flex-column ga-2">
              <v-divider class="mt-2 mb-2"></v-divider>

              <!-- Tailscale -->
              <div v-if="mosServices?.tailscale?.enabled" class="d-flex align-center ga-1">
                <v-icon size="x-small" :color="mosServices.tailscale?.online ? 'success' : 'error'">
                  {{ mosServices.tailscale?.online ? 'mdi-lock-outline' : 'mdi-lock-off-outline' }}
                </v-icon>
                <span class="text-caption" :class="mosServices.tailscale?.online ? 'text-success' : 'text-error'">Tailscale</span>
              </div>

              <!-- Netbird -->
              <div v-if="mosServices?.netbird?.enabled" class="d-flex align-center ga-1">
                <v-icon size="x-small" :color="mosServices.netbird?.online ? 'success' : 'error'">
                  {{ mosServices.netbird?.online ? 'mdi-lock-outline' : 'mdi-lock-off-outline' }}
                </v-icon>
                <span class="text-caption" :class="mosServices.netbird?.online ? 'text-success' : 'text-error'">Netbird</span>
              </div>

              <!-- Supporter Badge -->
              <div v-if="mosServices?.mos?.supporter">
                <div class="supporter-badge">
                  <v-img src="/mos_black.png" alt="MOS" width="24" height="24" contain class="supporter-badge__logo" />
                  <span class="supporter-badge__label">{{ $t('supporter') }}</span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-btn>
    <v-badge :model-value="notificationsBadge" color="green" dot floating bordered location="bottom end" offset-x="18" offset-y="18">
      <v-btn icon variant="text" :aria-label="$t('notifications')" to="/notifications">
        <v-icon>mdi-bell</v-icon>
      </v-btn>
    </v-badge>
    <v-btn icon variant="text" :aria-label="$t('profile')" to="/profile">
      <v-icon>mdi-account-circle</v-icon>
    </v-btn>

    <!-- Horizontal Menu in extension slot -->
    <template v-if="menuLayout === 'horizontal'" v-slot:extension>
      <div class="horizontal-menu-container">
        <div class="horizontal-menu-left">
          <template v-for="entry in displayEntries" :key="entry.key">
            <v-menu v-if="entry.items" location="bottom">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" :active="isGroupActive(entry)" class="horizontal-menu-item">
                  <v-icon start>{{ entry.icon }}</v-icon>
                  {{ $t(entry.title) }}
                  <v-icon end size="small">mdi-chevron-down</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item v-for="item in entry.items" :key="item.key" :to="item.to" :prepend-icon="item.icon" :title="$t(item.title)" :disabled="item.disabled" />
              </v-list>
            </v-menu>
            <v-btn v-else variant="text" :active="activeTab === entry.key" :disabled="entry.disabled" :to="entry.to" class="horizontal-menu-item">
              <v-icon start>{{ entry.icon }}</v-icon>
              {{ $t(entry.title) }}
            </v-btn>
          </template>
        </div>

        <!-- Right-aligned items -->
        <div class="horizontal-menu-right">
          <!-- Logout button -->
          <v-btn icon variant="text" size="x-small" :title="$t('logout')" :aria-label="$t('logout')" @click="logoutDialog = true" class="logout-btn ml-2">
            <v-icon>mdi-logout</v-icon>
          </v-btn>
        </div>
      </div>
    </template>
  </v-app-bar>

  <!-- Vertical Navigation Drawer -->
  <v-navigation-drawer v-if="menuLayout === 'vertical'" v-model="drawer" :temporary="!display.mdAndUp.value">
    <v-list>
      <template v-for="entry in displayEntries" :key="entry.key">
        <v-list-group v-if="entry.items" :value="entry.key">
          <template #activator="{ props }">
            <v-list-item v-bind="props" :prepend-icon="entry.icon" :title="$t(entry.title)" />
          </template>
          <v-list-item v-for="item in entry.items" :key="item.key" :to="item.to" :prepend-icon="item.icon" :title="$t(item.title)" :disabled="item.disabled" />
        </v-list-group>
        <v-list-item v-else :to="entry.to" :prepend-icon="entry.icon" :title="$t(entry.title)" :disabled="entry.disabled" />
      </template>
      <v-list-item v-on:click="logoutDialog = true" prepend-icon="mdi-logout" :title="$t('logout')" />
    </v-list>
    <template #append>
      <div v-if="mosServices?.tailscale?.enabled || mosServices?.netbird?.enabled" class="d-flex justify-center flex-wrap ga-1 pt-2 pb-1">
        <v-chip
          v-if="mosServices?.tailscale?.enabled"
          size="x-small"
          :color="mosServices.tailscale?.online ? 'success' : 'error'"
          :prepend-icon="mosServices.tailscale?.online ? 'mdi-lock-outline' : 'mdi-lock-off-outline'"
          variant="tonal"
        >
          Tailscale
        </v-chip>
        <v-chip
          v-if="mosServices?.netbird?.enabled"
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
import { ref, computed, watch, onMounted, onUnmounted, provide, unref } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay, useTheme as useVuetifyTheme } from 'vuetify';
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
const { applyUser } = useAppearance();
const { notificationsBadge, refreshBadge, connect, disconnect, subscribePush, unsubscribePush, reset: resetNotifications } = useNotifications();
const { mosServices, hostname, mosVersion, hideInactiveMenus, groupMenus, menuLayout, loadMenuPreferences, loadServices, loadHostInfo, reset: resetServerInfo } = useServerInfo();

const drawer = ref(false);
const logoutDialog = ref(false);
const appBarColor = 'primary';

const createItem = (key, title, icon, to, state = {}) => ({
  key,
  title,
  icon,
  to,
  visible: true,
  disabled: false,
  ...state,
});

const createGroup = (key, title, icon, items) => ({ key, title, icon, items });

const menuEntries = computed(() => {
  const services = unref(mosServices) ?? {};
  const hideInactive = unref(hideInactiveMenus);
  const optional = (active) => ({ visible: !hideInactive || Boolean(active), disabled: !active });

  return [
    createItem('dashboard', 'dashboard', 'mdi-view-dashboard', '/dashboard'),
    createGroup('storage', 'storage', 'mdi-database', [createItem('disks', 'disks', 'mdi-harddisk', '/disks'), createItem('pools', 'pools', 'mdi-view-array', '/pools')]),
    createGroup('network', 'network access', 'mdi-server', [
      createItem('shares', 'shares', 'mdi-share', '/shares'),
      createItem('remoteMounting', 'remote mounting', 'mdi-cloud-sync', '/remoteMounting', optional(services.remote_mounting?.enabled)),
    ]),
    createItem('hub', 'mos hub', 'mdi-hub', '/mosHub', { visible: Boolean(services.hub?.enabled) }),
    createGroup('virtualization', 'virtualization', 'mdi-server-network', [
      createItem('docker', 'docker', 'mdi-docker', '/docker', optional(services.docker?.running)),
      createItem('lxc', 'lxc', 'mdi-package-variant', '/lxc', optional(services.lxc?.enabled)),
      createItem('vm', 'vm', 'mdi-monitor-account', '/vm', optional(services.vm?.running)),
    ]),
    createItem('plugins', 'plugins', 'mdi-puzzle', '/plugins'),
    createGroup('tools', 'mos tools', 'mdi-tools', [
      createItem('webterminal', 'terminal', 'mdi-console', '/mosTools/webterminal'),
      createItem('filebrowser', 'filebrowser', 'mdi-folder', '/mosTools/filebrowser'),
    ]),
    createItem('settings', 'settings', 'mdi-cog', '/mosSettings'),
  ];
});

const displayEntries = computed(() => {
  const grouped = unref(groupMenus);
  return menuEntries.value.flatMap((entry) => {
    if (!entry.items) return entry.visible ? [entry] : [];
    const items = entry.items.filter((item) => item.visible);
    return grouped ? [{ ...entry, items }] : items;
  });
});

const activeTab = computed(() => {
  const path = router.currentRoute.value.path;
  if (path === '/') return 'dashboard';
  const allItems = menuEntries.value.flatMap((entry) => entry.items ?? [entry]);
  return allItems.find((item) => item.to === path)?.key ?? null;
});

const isGroupActive = (entry) => entry.items.some((item) => item.key === activeTab.value);

provide('mosServices', mosServices);

const relativeLuminance = (hex) => {
  const value = String(hex).replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((char) => char + char)
          .join('')
      : value.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16) / 255).map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const backgroundColor = computed(() => theme.current.value.colors[appBarColor]);
const isLightBackground = computed(() => 1.05 / (relativeLuminance(backgroundColor.value) + 0.05) < 2.7);
const logoSrc = computed(() => (isLightBackground.value ? mosBlack : mosWhite));

watch(drawer, (val) => {
  if (display.mdAndUp.value) {
    localStorage.setItem('drawer', String(val));
  }
});

const getDrawerState = () => {
  drawer.value = display.mdAndUp.value && localStorage.getItem('drawer') !== 'false';
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
  try {
    await unsubscribePush();
    disconnect();
    resetNotifications();
    resetServerInfo();
  } catch (error) {
    console.error(error);
  } finally {
    logout();
    await router.push('/login');
  }
};

onMounted(async () => {
  getDrawerState();
  const profile = await fetchProfile();
  if (!profile) return;
  applyUser(profile);
  loadMenuPreferences();
  refreshBadge();
  connect();
  subscribePush();
  await Promise.all([loadServices(), loadHostInfo()]);
});

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

/* Horizontal Menu Button-based Layout */
.horizontal-menu-container {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0;
  min-width: 0;
}

.horizontal-menu-left {
  display: flex;
  align-items: center;
  gap: 0;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.horizontal-menu-left::-webkit-scrollbar {
  display: none;
}

.horizontal-menu-item {
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0 12px;
  height: 56px;
  color: rgb(var(--v-theme-on-primary)) !important;
  border-radius: 0;
  white-space: nowrap;
  flex-shrink: 0;
  position: relative;
}

.horizontal-menu-item:hover {
  background-color: rgba(var(--v-theme-on-primary), 0.1) !important;
}

.horizontal-menu-item.v-btn--active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: rgb(var(--v-theme-on-primary));
}

.horizontal-menu-right {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  padding-right: 8px;
  flex-shrink: 0;
}

.info-btn-appbar,
.logout-btn {
  color: rgb(var(--v-theme-on-primary)) !important;
}

.info-btn-appbar:hover,
.logout-btn:hover {
  background-color: rgba(var(--v-theme-on-primary), 0.1) !important;
}
</style>
