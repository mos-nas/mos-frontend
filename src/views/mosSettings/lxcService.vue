<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <v-row>
          <v-col cols="auto" class="d-flex align-center justify-center" style="height: 40px;">
            <v-icon @click="$router.back()" class="mr-2" style="vertical-align: middle;">mdi-arrow-left</v-icon>
          </v-col>
          <div class="d-flex align-center ga-3 mb-4" style="height: 40px;">
            <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('lxc service') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader :loading="lxcServiceLoading" type="card" class="w-100">
          <v-card fluid style="margin-bottom: 80px" class="pa-0">
            <v-card-text>
              <v-switch :label="$t('lxc service')" color="green" inset density="compact" v-model="settingsLXC.enabled" hide-details="auto"></v-switch>
              <v-switch :label="$t('bridge')" color="green" inset density="compact" v-model="settingsLXC.bridge"></v-switch>
              <v-text-field
                :label="$t('directory')"
                v-model="settingsLXC.directory"
                append-inner-icon="mdi-folder"
                @click:append-inner="
                  openFsDialog((item) => {
                    settingsLXC.directory = item.path;
                  })
                "
              ></v-text-field>
              <v-text-field :label="$t('start wait (seconds)')" type="number" v-model="settingsLXC.start_wait"></v-text-field>
              <v-text-field :label="$t('lxc registry')" v-model="settingsLXC.lxc_registry" placeholder="images.linuxcontainers.org or empty"></v-text-field>
              <v-select
                :items="[
                  { label: $t('directory'), value: 'directory' },
                  { label: $t('btrfs'), value: 'btrfs' },
                ]"
                item-title="label"
                item-value="value"
                :label="$t('backing storage')"
                v-model="settingsLXC.backing_storage"
              />
              <v-divider class="my-2"></v-divider>
              <span class="text-title-medium font-weight-medium">{{ $t('backup') }}</span>
              <v-text-field
                class="mt-4"
                :label="$t('backup path')"
                v-model="settingsLXC.backup_path"
                append-inner-icon="mdi-folder"
                placeholder="/path/to/backup/location"
                @click:append-inner="
                  openFsDialog((item) => {
                    settingsLXC.backup_path = item.path;
                  })
                "
              ></v-text-field>
              <v-text-field :label="$t('backups to keep')" type="number" v-model.number="settingsLXC.backups_to_keep" :min="0" :max="50" />
              <v-slider v-model="settingsLXC.compression" :min="0" :max="9" step="1" :label="$t('compression')" thumb-label />
              <v-text-field :label="$t('threads')" type="number" v-model.number="settingsLXC.threads" :min="0" :max="100"></v-text-field>
              <v-switch :label="$t('use snapshot for backups')" color="green" inset density="compact" v-model="settingsLXC.use_snapshot" hide-details="auto"></v-switch>
            </v-card-text>
          </v-card>
        </v-skeleton-loader>
      </v-container>
    </v-container>
  </v-container>

  <!-- File System Navigator Dialog -->
  <fsNavigatorDialog v-model="fsDialog" :initial-path="'/'" select-type="directory" :title="$t('select directory')" @selected="handleFsSelected" />

  <!-- Floating Action Button -->
  <v-fab @click="setLXCService()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-content-save</v-icon>
  </v-fab>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';
import fsNavigatorDialog from '@/components/fsNavigatorDialog.vue';

const fsDialog = ref(false);
const fsDialogCallback = ref(null);
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const settingsLXC = ref({
  enabled: false,
  bridge: '',
  directory: '',
  start_wait: '0',
  lxc_registry: null,
  backing_storage: '',
  backup_path: '',
  backups_to_keep: 0,
  compression: 0,
  threads: 0,
  use_snapshot: false,
});
const { overlay } = useOverlay();
const { t } = useI18n();
const lxcServiceLoading = ref(true);

onMounted(() => {
  getLXCService();
});

const openFsDialog = (cb) => {
  fsDialogCallback.value = cb;
  fsDialog.value = true;
};
const handleFsSelected = (item) => {
  if (typeof fsDialogCallback.value === 'function') {
    fsDialogCallback.value(item);
  }
  fsDialogCallback.value = null;
  fsDialog.value = false;
};

const getLXCService = async () => {
  try {
    const res = await fetch('/api/v1/mos/settings/lxc', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('lxc service could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const data = await res.json();
    // Ensure threads is an integer
    data.threads = Number.isInteger(data.threads) ? data.threads : parseInt(data.threads) || 0;
    settingsLXC.value = data;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    lxcServiceLoading.value = false;
  }
};

const setLXCService = async () => {
  overlay.value = true;
  try {
    // ensure threads is sent as integer
    const payload = { ...settingsLXC.value, threads: parseInt(settingsLXC.value.threads) || 0 };
    const res = await fetch('/api/v1/mos/settings/lxc', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('lxc service could not be changed')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('lxc service changed successfully'));
    emit('refresh-drawer');
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};
</script>
