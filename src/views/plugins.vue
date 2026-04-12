<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <div class="d-flex align-center ga-3 mb-4">
          <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
          <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ t('plugins') }}</h2>
        </div>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card style="margin-bottom: 80px" class="pa-0">
          <v-card-text class="pa-0">
            <v-container fluid class="pa-4" v-if="!loading">
              <v-row class="ma-n2">
                <v-col v-if="plugins.length > 0" cols="12" sm="6" md="4" lg="4" xl="3" v-for="plugin in plugins" :key="plugin.name" class="pa-2">
                  <v-card style="height: 250px; display: flex; flex-direction: column" class="pa-0" @click="openPlugin(plugin)">
                    <v-card-text class="pa-0 pt-4">
                      <div class="d-flex justify-center">
                        <v-icon v-if="hasMdiIcon(plugin)" :icon="plugin.icon" size="60" color="primary"></v-icon>
                        <v-img v-else-if="!iconErrors[plugin.name]" :src="getIconSrc(plugin)" height="60" contain style="max-width: 100%" @error="onIconError($event, plugin)">
                          <template v-slot:error>
                            <v-icon size="60" color="primary">mdi-puzzle</v-icon>
                          </template>
                        </v-img>
                        <v-icon v-else size="60" color="primary">mdi-puzzle</v-icon>
                      </div>
                      <v-chip v-if="plugin.version" size="small" class="position-absolute" style="top: 12px; right: 12px; background: var(--v-theme-primary); color: var(--v-theme-on-primary)">
                        v{{ plugin.version }}
                      </v-chip>
                    </v-card-text>
                    <v-card-text class="py-2 px-4" style="min-height: 96px">
                      <div class="font-weight-bold mb-1" style="line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 1.1rem">
                        {{ pluginTitle(plugin) }}
                      </div>
                      <div
                        style="
                          max-height: 3.6em;
                          overflow: hidden;
                          text-overflow: ellipsis;
                          display: -webkit-box;
                          line-clamp: 2;
                          -webkit-line-clamp: 2;
                          -webkit-box-orient: vertical;
                          white-space: normal;
                          font-size: 0.9rem;
                        "
                      >
                        {{ pluginDescription(plugin) }}
                      </div>
                    </v-card-text>
                    <v-spacer />
                    <v-divider />
                    <v-card-actions style="flex: 0 0 auto; gap: 4px; padding: 8px">
                      <v-btn color="red" variant="text" icon size="small" @click.stop="openDeleteDialog(plugin)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                      <v-spacer />
                      <v-btn v-if="plugin.update_available" color="secondary" prepend-icon="mdi-update" size="small" @click.stop="updatePlugin(plugin)">
                        {{ $t('update') }}
                      </v-btn>
                      <v-btn color="secondary" prepend-icon="mdi-open-in-app" size="small" @click.stop="openPlugin(plugin)">
                        {{ $t('open') }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
                <v-col v-else cols="12">
                  <div class="text-center py-8">
                    <v-icon size="80" color="grey" style="opacity: 0.5" class="mb-4">mdi-puzzle-outline</v-icon>
                    <div class="text-h5 mb-2">{{ $t('no plugins installed') }}</div>
                    <div class="text-grey">{{ $t('plugins will appear here once installed') }}</div>
                  </div>
                </v-col>
              </v-row>
            </v-container>
            <v-container v-else fluid class="pa-4 d-flex justify-center">
              <v-row class="ma-n2" style="width: 100%">
                <v-col v-for="n in 4" :key="n" cols="12" sm="6" md="4" lg="4" xl="3" class="pa-2">
                  <v-skeleton-loader type="card" class="pa-0" />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <v-dialog v-model="deleteDialog.value" max-width="500">
    <v-card class="pa-0">
      <v-card-title class="text-h6">{{ $t('delete') }} {{ deleteDialog.plugin ? pluginTitle(deleteDialog.plugin) : '' }}</v-card-title>
      <v-card-text>
        {{ $t('are you sure you want to delete') }}
        <strong>{{ deleteDialog.plugin ? pluginTitle(deleteDialog.plugin) : '' }}</strong>
        ?
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="deleteDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deletePlugin(deleteDialog.plugin)">
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Floating Action Button with Menu -->
  <v-menu location="top">
    <template v-slot:activator="{ props }">
      <v-fab v-bind="props" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
        <v-icon color="onPrimary">mdi-dots-vertical</v-icon>
      </v-fab>
    </template>
    <v-list>
      <v-list-item @click="addPlugins()">
        <template v-slot:prepend>
          <v-icon>mdi-plus</v-icon>
        </template>
        <v-list-item-title>{{ $t('add plugins') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="checkUpdatePlugins()">
        <template v-slot:prepend>
          <v-icon>mdi-refresh</v-icon>
        </template>
        <v-list-item-title>{{ $t('check for updates') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { usePlugins, hasMdiIcon, getPluginIconUrl, getPluginRoute, loadPluginLocales } from '@/composables/usePlugins';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const router = useRouter();
const i18n = useI18n();
const { t, te } = i18n;
const { plugins, getPlugins } = usePlugins();
const loading = ref(true);
const overlay = ref(false);
const iconErrors = ref({});
const deleteDialog = reactive({
  value: false,
  plugin: null,
});

const pluginLocaleKey = (plugin, key) => `plugin_${plugin.name.replace(/-/g, '_')}.${key}`;

const pluginTitle = (plugin) => {
  const key = pluginLocaleKey(plugin, 'title');
  return te(key) ? t(key) : (plugin.displayName || plugin.name);
};

const pluginDescription = (plugin) => {
  const key = pluginLocaleKey(plugin, 'description');
  return te(key) ? t(key) : (plugin.description || '');
};

onMounted(async () => {
  try {
    await getPlugins();
    for (const plugin of plugins.value) {
      await loadPluginLocales(plugin, i18n);
    }
  } catch {
    showSnackbarError(t('error loading plugins'));
  } finally {
    loading.value = false;
  }
});

const getIconSrc = (plugin) => {
  if (iconErrors.value[plugin.name]) {
    return '';
  }
  return getPluginIconUrl(plugin);
};

const onIconError = (event, plugin) => {
  iconErrors.value[plugin.name] = true;
};

const openPlugin = (plugin) => {
  const route = getPluginRoute(plugin);
  router.push(route);
};

const openDeleteDialog = (plugin) => {
  deleteDialog.value = true;
  deleteDialog.plugin = plugin;
};

const deletePlugin = async (plugin) => {
  deleteDialog.value = false;
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/mos/plugins/delete/${plugin.name}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('plugin could not be deleted')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('plugin deleted successfully'));
    await getPlugins();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
    deleteDialog.plugin = null;
  }
};

const updatePlugin = async (plugin) => {
  deleteDialog.value = false;
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/mos/plugins/update`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plugin: plugin.name }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('plugin could not be updated')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('plugin update started successfully'));
    await getPlugins();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const checkUpdatePlugins = async () => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/mos/plugins/updatecheck`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('could not check for plugin updates')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('plugin update check completed'));
    await getPlugins();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const addPlugins = () => {
  router.push('/mosHub?hubType=plugin');
};
</script>
