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
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('network services') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card fluid style="margin-bottom: 80px" class="pa-0">
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-switch :label="$t('ssh')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.ssh.enabled"></v-switch>
                <v-switch :label="$t('nfs')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.nfs.enabled"></v-switch>
                <v-switch :label="$t('dnsmasq')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.dnsmasq.enabled"></v-switch>
              </v-col>
              <v-col cols="12" md="6">
                <v-switch :label="$t('nut')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.nut.enabled"></v-switch>
                <v-switch :label="$t('remote mounting')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.remote_mounting.enabled"></v-switch>
              </v-col>
            </v-row>
            <v-divider class="my-4"></v-divider>
            <span class="text-title-medium font-weight-medium">{{ $t('samba') }}</span>
            <v-row>
              <v-col cols="12" md="6">
                <v-switch :label="$t('samba')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.samba.enabled"></v-switch>
              </v-col>
              <v-col cols="12" md="6">
                <v-switch :label="$t('samba discovery')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.samba_discovery.enabled" :disabled="!settingsNetwork.samba.enabled"></v-switch>
              </v-col>
            </v-row>
            <v-text-field class="mt-2" :label="$t('workgroup')" color="green" inset hide-details="auto" v-model="settingsNetwork.samba.workgroup"></v-text-field>
            <v-divider class="my-4"></v-divider>
            <span class="text-title-medium font-weight-medium">{{ $t('tailscale') }}</span>
            <v-row>
              <v-col cols="12" md="6">
                <v-switch :label="$t('tailscale')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.tailscale.enabled"></v-switch>
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  :label="$t('tailscale update check')"
                  color="green"
                  inset
                  hide-details="auto"
                  density="compact"
                  v-model="settingsNetwork.tailscale.update_check"
                ></v-switch>
              </v-col>
            </v-row>
            <v-text-field class="mt-2" :label="$t('tailscale params')" v-model="settingsNetwork.tailscale.tailscaled_params" hide-details="auto"></v-text-field>
            <v-divider class="my-4"></v-divider>
            <span class="text-title-medium font-weight-medium">{{ $t('netbird') }}</span>
            <v-row>
              <v-col cols="12" md="6">
                <v-switch :label="$t('netbird')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.netbird.enabled"></v-switch>
              </v-col>
              <v-col cols="12" md="6">
                <v-switch :label="$t('netbird update check')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.netbird.update_check"></v-switch>
              </v-col>
            </v-row>
            <v-text-field class="mt-2" :label="$t('netbird service params')" v-model="settingsNetwork.netbird.netbird_service_params"></v-text-field>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Floating Action Button -->
  <v-fab @click="setNetworkSettings()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-content-save</v-icon>
  </v-fab>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const settingsNetwork = ref({
  ssh: {
    enabled: false,
  },
  samba: {
    enabled: false,
    workgroup: '',
  },
  samba_discovery: {
    enabled: false,
  },
  nfs: {
    enabled: false,
    exports: [],
  },
  nut: {
    enabled: false,
  },
  tailscale: {
    enabled: false,
    update_check: false,
    tailscaled_params: null,
  },
  netbird: {
    enabled: false,
    update_check: false,
    netbird_service_params: null,
  },
  remote_mounting: {
    enabled: false,
  },
  dnsmasq: {
    enabled: false
  }
});
const overlay = ref(false);
const { t } = useI18n();

onMounted(() => {
  getNetworkSettings();
});

const getNetworkSettings = async () => {
  try {
    const res = await fetch('/api/v1/mos/settings/network/services', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('network settings could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    settingsNetwork.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const setNetworkSettings = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/settings/network/services', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsNetwork.value),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('network settings could not be changed')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('network settings changed successfully'));
    emit('refresh-drawer');
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};
</script>
