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
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('pci devices') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <v-expansion-panels multiple variant="accordion">
          <v-expansion-panel v-for="d in pciDevices" :key="`${d.slot}-${d.vendor_id}-${d.device_id}`">
            <v-expansion-panel-title>
              <div class="d-flex flex-column">
                <div class="text-title-medium">
                  {{ d.name || d.class || d.slot }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ $t('slot') }} {{ d.slot }} · {{ $t('class') }} {{ d.class }} ({{ d.class_id }}) · {{ $t('vendor id') }} {{ d.vendor_id }} · {{ $t('device id') }} {{ d.device_id }}
                </div>
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text>
              <v-table density="compact" class="mb-4">
                <tbody>
                  <tr>
                    <td class="text-medium-emphasis">{{ $t('slot') }}</td>
                    <td>{{ d.slot }}</td>
                  </tr>
                  <tr>
                    <td class="text-medium-emphasis">{{ $t('class') }}</td>
                    <td>
                      {{ d.class }}
                      <span v-if="d.class_id">({{ d.class_id }})</span>
                    </td>
                  </tr>
                  <tr v-if="d.vendor">
                    <td class="text-medium-emphasis">{{ $t('vendor') }}</td>
                    <td>{{ d.vendor }}</td>
                  </tr>
                  <tr>
                    <td class="text-medium-emphasis">{{ $t('vendor id') }}</td>
                    <td>{{ d.vendor_id }}</td>
                  </tr>
                  <tr v-if="d.name">
                    <td class="text-medium-emphasis">{{ $t('name') }}</td>
                    <td>{{ d.name }}</td>
                  </tr>
                  <tr>
                    <td class="text-medium-emphasis">{{ $t('device id') }}</td>
                    <td>{{ d.device_id }}</td>
                  </tr>

                  <tr v-if="d.subsystem_vendor">
                    <td class="text-medium-emphasis">{{ $t('subsystem vendor') }}</td>
                    <td>{{ d.subsystem_vendor }}</td>
                  </tr>
                  <tr v-if="d.subsystem_vendor_id">
                    <td class="text-medium-emphasis">{{ $t('subsystem vendor id') }}</td>
                    <td>{{ d.subsystem_vendor_id }}</td>
                  </tr>
                  <tr v-if="d.subsystem">
                    <td class="text-medium-emphasis">{{ $t('subsystem') }}</td>
                    <td>{{ d.subsystem }}</td>
                  </tr>
                  <tr v-if="d.subsystem_id">
                    <td class="text-medium-emphasis">{{ $t('subsystem id') }}</td>
                    <td>{{ d.subsystem_id }}</td>
                  </tr>
                  <tr v-if="d.subsystem_device_id">
                    <td class="text-medium-emphasis">{{ $t('subsystem device id') }}</td>
                    <td>{{ d.subsystem_device_id }}</td>
                  </tr>

                  <tr v-if="d.prog_if">
                    <td class="text-medium-emphasis">{{ $t('prog if') }}</td>
                    <td>{{ d.prog_if }}</td>
                  </tr>
                  <tr v-if="d.revision">
                    <td class="text-medium-emphasis">{{ $t('revision') }}</td>
                    <td>{{ d.revision }}</td>
                  </tr>
                </tbody>
              </v-table>

              <v-row density="comfortable">
                <v-col cols="12" v-for="[section, text] in Object.entries(d.details ?? {})" :key="section">
                  <v-card variant="outlined" class="pa-0">
                    <v-card-title class="text-subtitle-2 font-weight-bold">
                      {{ section }}
                    </v-card-title>
                    <v-card-text class="pt-0">
                      <pre class="text-caption mb-0" style="white-space: pre-wrap">{{ Array.isArray(text) ? text.join('\n') : String(text ?? '') }}</pre>
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
const pciDevices = ref([]);

onMounted(() => {
  getPciDevices();
});

const getPciDevices = async () => {
  try {
    const res = await fetch(`/api/v1/system/devices/pci`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pci devices could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    pciDevices.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};
</script>
