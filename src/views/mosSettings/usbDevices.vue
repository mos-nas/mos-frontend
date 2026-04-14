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
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('usb devices') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
            <v-skeleton-loader v-if="usbDevicesLoading" type="card" class="mb-4" />
            <v-expansion-panels v-else multiple variant="accordion">
              <v-expansion-panel v-for="d in usbDevices" :key="`${d.bus}-${d.device}-${d.vendor_id}-${d.product_id}`">
                <v-expansion-panel-title>
                  <div class="d-flex flex-column">
                    <div class="text-title-medium">{{ d.description }}</div>
                    <div class="text-caption text-medium-emphasis">{{ $t('bus') }} {{ d.bus }} · {{ $t('device') }} {{ d.device }} · {{ $t('vendor id') }} {{ d.vendor_id }} · {{ $t('product id') }} {{ d.product_id }}</div>
                  </div>
                </v-expansion-panel-title >
                <v-expansion-panel-text>
                  <v-table density="compact" class="mb-4">
                    <tbody>
                      <tr>
                        <td class="text-medium-emphasis">{{ $t('bus') }}</td>
                        <td>{{ d.bus }}</td>
                      </tr>
                      <tr>
                        <td class="text-medium-emphasis">{{ $t('device') }}</td>
                        <td>{{ d.device }}</td>
                      </tr>
                      <tr>
                        <td class="text-medium-emphasis">{{ $t('vendor id') }}</td>
                        <td>{{ d.vendor_id }}</td>
                      </tr>
                      <tr>
                        <td class="text-medium-emphasis">{{ $t('product id') }}</td>
                        <td>{{ d.product_id }}</td>
                      </tr>
                    </tbody>
                  </v-table>
                  <v-row density="comfortable">
                    <v-col cols="12" v-for="[section, text] in Object.entries(d.details ?? {})" :key="section">
                      <v-card variant="outlined" class="pa-0">
                        <v-card-title class="text-subtitle-2 font-weight-bold">{{ section }}</v-card-title>
                        <v-card-text class="pt-0">
                          <pre class="text-caption mb-0" style="white-space: pre-wrap">{{ String(text) }}</pre>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
      </v-container>
    </v-container>
  </v-container>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const usbDevices = ref([]);
const usbDevicesLoading = ref(true);

onMounted(() => {
  getUsbDevices();
});

const getUsbDevices = async () => {
  try {
    const res = await fetch(`/api/v1/system/devices/usb`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('usb devices could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    usbDevices.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    usbDevicesLoading.value = false;
  }
};
</script>
