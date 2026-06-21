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
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('logs') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card fluid style="margin-bottom: 80px" class="pa-0">
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-select v-model="selectedLog" :items="logs" :label="$t('select log file')" outlined hide-details="auto" @update:modelValue="getLogFileContent(selectedLog, lines)" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="lines" :label="$t('lines')" type="number" outlined hide-details="auto" @keyup.enter="getLogFileContent(selectedLog)" />
              </v-col>
            </v-row>
            <div class="mt-4" style="flex-grow: 1; height: calc(100vh - 340px); overflow: auto; white-space: pre; font-family: monospace; border: 1px solid rgba(0, 0, 0, 0.12); border-radius: 4px">
              <div
                v-for="(line, idx) in logFileContent.split('\n')"
                :key="idx"
                :style="
                  /error/i.test(line)
                    ? { background: '#ffebee', color: '#b71c1c', padding: '2px 6px', display: 'block' }
                    : /warn(?:ing)?/i.test(line)
                    ? { background: '#fff8e1', color: '#ff6f00', padding: '2px 6px', display: 'block' }
                    : { padding: '2px 6px', display: 'block' }
                "
              >
                {{ line }}
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Floating Action Button -->
  <v-fab :disabled="!selectedLog" @click="getLogFileContent(selectedLog)" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-refresh</v-icon>
  </v-fab>

</template>

<script setup>
import { onMounted, ref } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const logs = ref([]);
const selectedLog = ref('');
const logFileContent = ref('');
const lines = ref(10000);
const { overlay } = useOverlay();
const { t } = useI18n();

onMounted(() => {
  getLogFiles();
});

const getLogFiles = async () => {
  try {
    const res = await fetch('/api/v1/system/logs', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error(t('log files could not be loaded'));
    logs.value = await res.json();
  } catch (error) {
    showSnackbarError(error.message);
  }
};

const getLogFileContent = async (logFile) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/system/logs/content?path=${logFile}&tail=true&lines=${lines.value}`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error(t('log files could not be loaded'));
    const result = await res.json();
    logFileContent.value = result.content.join('\n');
    logFileContent.value = logFileContent.value.split('\n').reverse().join('\n');

    overlay.value = false;
  } catch (error) {
    overlay.value = false;
    showSnackbarError(error.message);
  }
};
</script>
