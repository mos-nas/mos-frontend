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
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('s.m.a.r.t.') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader :loading="dockerServiceLoading" type="card" class="w-100">
          <v-card fluid style="margin-bottom: 80px" class="pa-0">
            <v-card-text>
              <span class="text-title-medium">{{ $t('temperature limits') }}</span>
              <v-row class="pt-4">
                <v-col cols="12" md="4">
                  <span class="text-caption">{{ $t('hdd') }}</span>
                  <v-text-field
                    v-model.number="smartConfig.defaults.temperatureLimits.hdd.warning"
                    :label="$t('warning')"
                    type="number"
                    density="compact"
                    hide-details="auto"
                    class="pt-2"
                    suffix="°C"
                  ></v-text-field>
                  <v-text-field
                    v-model.number="smartConfig.defaults.temperatureLimits.hdd.critical"
                    :label="$t('critical')"
                    type="number"
                    density="compact"
                    hide-details="auto"
                    class="mt-2"
                    suffix="°C"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <span class="text-caption">{{ $t('ssd') }}</span>
                  <v-text-field
                    v-model.number="smartConfig.defaults.temperatureLimits.ssd.warning"
                    :label="$t('warning')"
                    type="number"
                    density="compact"
                    hide-details="auto"
                    class="pt-2"
                    suffix="°C"
                  ></v-text-field>
                  <v-text-field
                    v-model.number="smartConfig.defaults.temperatureLimits.ssd.critical"
                    :label="$t('critical')"
                    type="number"
                    density="compact"
                    hide-details="auto"
                    class="mt-2"
                    suffix="°C"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <span class="text-caption">{{ $t('nvme') }}</span>
                  <v-text-field
                    v-model.number="smartConfig.defaults.temperatureLimits.nvme.warning"
                    :label="$t('warning')"
                    type="number"
                    density="compact"
                    hide-details="auto"
                    class="pt-2"
                    suffix="°C"
                  ></v-text-field>
                  <v-text-field
                    v-model.number="smartConfig.defaults.temperatureLimits.nvme.critical"
                    :label="$t('critical')"
                    type="number"
                    density="compact"
                    hide-details="auto"
                    class="mt-2"
                    suffix="°C"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-divider class="my-4"></v-divider>
              <span class="text-title-medium">{{ $t('default monitored attributes') }}</span>
              <v-row class="pt-2 ga-2">
                <v-col cols="12" sm="6">
                  <v-checkbox v-model="smartConfig.defaults.monitoredAttributes" :value="5" label="5 - Reallocated Sectors" density="compact" hide-details></v-checkbox>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-checkbox v-model="smartConfig.defaults.monitoredAttributes" :value="187" label="187 - Reported Uncorrectable Errors" density="compact" hide-details></v-checkbox>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-checkbox v-model="smartConfig.defaults.monitoredAttributes" :value="198" label="198 - Offline Uncorrectable Sectors" density="compact" hide-details></v-checkbox>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-checkbox v-model="smartConfig.defaults.monitoredAttributes" :value="199" label="199 - UDMA CRC Errors" density="compact" hide-details></v-checkbox>
                </v-col>
              </v-row>
              <v-divider class="my-4"></v-divider>
              <v-switch v-model="smartConfig.defaults.bootCheck" :label="$t('boot check')" inset density="compact" color="green" hide-details="auto"></v-switch>
              <v-text-field
                v-model.number="smartConfig.defaults.attributeNotificationCooldown"
                :label="$t('attribute notification cooldown')"
                type="number"
                min="0"
                hide-details="auto"
                class="mt-4"
              ></v-text-field>
            </v-card-text>
          </v-card>
        </v-skeleton-loader>
      </v-container>
    </v-container>
  </v-container>

  <!-- File System Navigator Dialog -->
  <fsNavigatorDialog v-model="fsDialog" :initial-path="'/'" select-type="directory" :title="$t('select directory')" @selected="handleFsSelected" />

  <!-- Floating Action Button -->
  <v-fab @click="setSmartSettings()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-content-save</v-icon>
  </v-fab>

</template>

<script setup>
import { onMounted, ref } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';
import fsNavigatorDialog from '@/components/fsNavigatorDialog.vue';

const fsDialog = ref(false);
const fsDialogCallback = ref(null);
const smartConfig = ref({
  defaults: {
    temperatureLimits: {
      hdd: {
        warning: 45,
        critical: 55,
      },
      ssd: {
        warning: 55,
        critical: 70,
      },
      nvme: {
        warning: 65,
        critical: 80,
      },
    },
    monitoredAttributes: [5, 187, 198, 199],
    attributeNotificationCooldown: 300,
    bootCheck: true,
  },
});
const dockerServiceLoading = ref(true);
const { overlay } = useOverlay();
const { t } = useI18n();
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);

onMounted(() => {
  getSmartSettings();
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

const getSmartSettings = async () => {
  try {
    const res = await fetch('/api/v1/disks/smart/config', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('smart settings could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    smartConfig.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    dockerServiceLoading.value = false;
  }
};

const setSmartSettings = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/disks/smart/config', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(smartConfig.value),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('smart settings could not be saved')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('smart settings saved successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};
</script>
