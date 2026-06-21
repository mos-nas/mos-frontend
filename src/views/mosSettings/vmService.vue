<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <v-row>
          <v-col cols="auto" class="d-flex align-center justify-center" style="height: 40px">
            <v-icon @click="$router.back()" class="mr-2" style="vertical-align: middle">mdi-arrow-left</v-icon>
          </v-col>
          <div class="d-flex align-center ga-3 mb-4" style="height: 40px">
            <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('vm service') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader :loading="vmServiceLoading" type="card" class="w-100">
          <v-card fluid style="margin-bottom: 80px" class="pa-0">
            <v-card-text>
              <v-switch :label="$t('enabled')" color="green" inset density="compact" v-model="vmSettings.enabled"></v-switch>
              <v-text-field
                :label="$t('directory')"
                v-model="vmSettings.directory"
                append-inner-icon="mdi-folder"
                @click:append-inner="
                  openFsDialog((item) => {
                    vmSettings.directory = item.path;
                  })
                "
              ></v-text-field>
              <v-text-field
                :label="$t('vdisk directory')"
                v-model="vmSettings.vdisk_directory"
                append-inner-icon="mdi-folder"
                @click:append-inner="
                  openFsDialog((item) => {
                    vmSettings.vdisk_directory = item.path;
                  })
                "
                hide-details="auto"
              ></v-text-field>
              <v-checkbox :label="$t('iommu active')" color="green" v-model="vmSettings.iommu_active" readonly hide-details="auto" />
              <v-divider class="my-4"></v-divider>
              <span class="text-title-medium font-weight-medium">{{ $t('virtio isos') }}</span>
              <v-row class="no-gutters mt-2">
                <v-col cols="12" lg="12" md="12" sm="12">
                  <v-select
                    :items="virtioIsos"
                    item-title="version"
                    :label="$t('available virtio iso versions')"
                    density="comfortable"
                    outlined
                    class="mt-2"
                    hide-details="auto"
                    v-model="selectedVirtioIso"
                    :loading="loadingVirtioIsos"
                    append-icon="mdi-download"
                    @click:append="downloadVirtioIso(selectedVirtioIso)"
                  ></v-select>
                </v-col>
              </v-row>
              <p class="mt-2">{{ $t('installed virtio isos') }}:</p>
              <template v-for="iso in installedVirtioIsos" :key="iso">
                <v-chip class="ma-1">{{ iso }}</v-chip>
              </template>
              <br />
              <v-btn class="mt-4" @click="cleanupVirtioIsos()">{{ $t('cleanup virtio isos') }}</v-btn>
              <v-divider class="my-4"></v-divider>
              <span class="text-title-medium font-weight-medium">{{ $t('huge pages') }}</span>
              <v-switch :label="$t('enabled')" color="green" inset density="compact" v-model="vmSettings.hugepages.enabled" class="mt-2 mb-2" hide-details="auto"></v-switch>
              <v-row class="no-gutters mt-4">
                <v-col cols="12" lg="3" md="3" sm="12">
                  <v-text-field
                    :label="$t('set huge pages')"
                    type="number"
                    density="comfortable"
                    outlined
                    hide-details="auto"
                    v-model="vmSettings.hugepages.total"
                    :disabled="!vmSettings.hugepages.enabled"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" lg="3" md="3" sm="12">
                  <v-text-field
                    :label="$t('system huge page size')"
                    type="number"
                    density="comfortable"
                    outlined
                    hide-details="auto"
                    v-model="vmSettings.hugepages.size_mb"
                    :disabled="!vmSettings.hugepages.enabled"
                    readonly
                    suffix="MB"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" lg="3" md="3" sm="12">
                  <v-text-field
                    :label="$t('huge pages')"
                    type="number"
                    density="comfortable"
                    outlined
                    hide-details="auto"
                    v-model="usedHugePages"
                    :disabled="!vmSettings.hugepages.enabled"
                    readonly
                    prepend-inner-icon="mdi-calculator"
                    suffix="MB"
                  >
                  </v-text-field>
                </v-col>
                <v-col cols="12" lg="3" md="3" sm="12">
                  <v-text-field
                    :label="$t('free huge pages')"
                    type="number"
                    density="comfortable"
                    outlined
                    hide-details="auto"
                    v-model="vmSettings.hugepages.free"
                    readonly
                    :disabled="!vmSettings.hugepages.enabled"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-skeleton-loader>
      </v-container>
    </v-container>
  </v-container>

  <!-- File System Navigator Dialog -->
  <fsNavigatorDialog v-model="fsDialog" :initial-path="'/'" select-type="directory" :title="$t('select directory')" @selected="handleFsSelected" />

  <!-- Floating Action Button -->
  <v-fab @click="setVMService()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-content-save</v-icon>
  </v-fab>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';
import fsNavigatorDialog from '@/components/fsNavigatorDialog.vue';

const fsDialog = ref(false);
const fsDialogCallback = ref(null);
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const vmSettings = ref({
  enabled: false,
  directory: '',
  vdisk_directory: '',
  iommu_active: false,
  hugepages: {
    enabled: false,
    total: 0,
    size_mb: 0,
    free: 0,
  },
});
const usedHugePages = ref(0);
const virtioIsos = ref([]);
const { t } = useI18n();
const { overlay } = useOverlay();
const vmServiceLoading = ref(true);
const loadingVirtioIsos = ref(false);
const selectedVirtioIso = ref('');
const installedVirtioIsos = ref([]);

onMounted(() => {
  getVMService();
  getVirtioIsoVersions();
  getVirtioIsoInstalled();
});

watch(
  () => vmSettings.value.hugepages.total,
  (newVal) => {
    const total = parseInt(newVal) || 0;
    usedHugePages.value = vmSettings.value.hugepages.size_mb * total;
  },
);

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

const getVMService = async () => {
  try {
    const res = await fetch('/api/v1/mos/settings/vm', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('vm service could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    vmSettings.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    vmServiceLoading.value = false;
  }
};

const setVMService = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/settings/vm', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...vmSettings.value,
        hugepages: {
          ...vmSettings.value.hugepages,
          total: parseInt(vmSettings.value.hugepages.total) || 0,
        },
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('vm service could not be changed')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('vm service changed successfully'));
    emit('refresh-drawer');
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const getVirtioIsoVersions = async () => {
  loadingVirtioIsos.value = true;
  try {
    const res = await fetch('/api/v1/vm/virtioiso/versions', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('could not fetch virtio iso versions')}|$| ${error.error || t('unknown error')}`);
    }
    virtioIsos.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
    return [];
  } finally {
    loadingVirtioIsos.value = false;
  }
};

const getVirtioIsoInstalled = async () => {
  try {
    const res = await fetch('/api/v1/vm/virtioiso/installed', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('could not fetch installed virtio isos')}|$| ${error.error || t('unknown error')}`);
    }
    installedVirtioIsos.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
    return [];
  }
};

const downloadVirtioIso = async (version) => {
  const payload = {
    version: version,
  };
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/vm/virtioiso/download`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('could not download virtio iso')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('virtio iso download started successfully'));
    getVirtioIsoInstalled();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const cleanupVirtioIsos = async () => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/vm/virtioiso/cleanup`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('could not cleanup virtio isos')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('virtio isos cleaned up successfully'));
    getVirtioIsoInstalled();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};
</script>
