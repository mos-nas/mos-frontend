<template>
  <v-dialog v-model="internalVisible" max-width="800" persistent>
    <v-card class="pa-0" :title="$t('all operations')" prepend-icon="mdi-progress-clock">
      <v-card-text class="pa-0">
        <div v-if="!runningOperationsLoaded || (runningOperationsLoaded && runningOperations > 0 && operations.length === 0)" class="d-flex justify-center align-center pa-8">
          <v-progress-circular indeterminate size="64" color="primary" />
        </div>
        <v-list v-else>
          <v-list-item v-if="operations.length === 0" class="text-center">
            <v-list-item-title class="text-medium-emphasis">{{ $t('no running operations') }}</v-list-item-title>
          </v-list-item>
          <v-list-item v-else v-for="operation in operations" :key="operation.id" class="mb-4">
            <div style="width: 100%">
              <div class="d-flex align-center justify-space-between mb-2">
                <div>
                  <v-list-item-title>{{ $t(operation.operation) }}</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">{{ $t('from') }}: {{ operation.source }}</v-list-item-subtitle>
                  <v-list-item-subtitle class="text-caption">{{ $t('to') }}: {{ operation.destination }}</v-list-item-subtitle>
                </div>
                <div class="d-flex align-center ga-2">
                  <v-chip :color="operation.status === 'completed' ? 'success' : operation.status === 'error' ? 'error' : 'warning'" size="small" variant="tonal">
                    {{ $t(operation.status) }}
                  </v-chip>
                  <v-btn
                    v-if="operation.status === 'running'"
                    icon="mdi-stop"
                    size="x-small"
                    color="error"
                    variant="tonal"
                    :title="$t('cancel operation')"
                    @click="cancelOperation(operation.id)"
                  />
                </div>
              </div>
              <div class="d-flex align-center ga-2 mb-2">
                <v-progress-linear :model-value="operation.progress" :color="operation.status === 'error' ? 'error' : 'primary'" height="6" />
                <span class="text-caption font-weight-bold" style="min-width: 40px">{{ operation.progress }}%</span>
              </div>
              <div class="d-flex justify-space-between text-caption">
                <span>{{ operation.bytesTransferred_human }} / {{ operation.bytesTotal_human }}</span>
                <span>{{ operation.speed_human }}</span>
                <span v-if="operation.eta">{{ $t('eta') }}: {{ operation.eta }}</span>
              </div>
            </div>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="internalVisible = false">{{ $t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { io } from 'socket.io-client';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();
const runningOperations = ref(0);
const runningOperationsLoaded = ref(false);
const operations = ref([]);
const dataReceived = ref(false);
let socket = null;

onMounted(() => {
  getRunningOperations();
});

const internalVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const cleanupSocket = () => {
  if (socket) {
    socket.off();
    socket.disconnect();
    socket = null;
  }
};

const apply = (data) => {
  if (data && data.id) {
    dataReceived.value = true;
    const index = operations.value.findIndex((op) => op.id === data.id);
    if (index !== -1) {
      operations.value.splice(index, 1, { ...operations.value[index], ...data });
    } else {
      operations.value.push(data);
    }
  }
};

const connect = () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) return;

  cleanupSocket();

  socket = io('/fileoperations', { path: '/api/v1/socket.io/', transports: ['websocket'], upgrade: false });

  socket.on('connect', () => {
    socket.emit('subscribe-all', { token: authToken });
  });

  socket.on('fileoperations-list', apply);
  socket.on('fileoperations-update', apply);
  socket.on('fileoperations-subscription-confirmed', apply);
  socket.on('fileoperations-unsubscription-confirmed', apply);
  socket.on('preferences-updated', apply);
};

watch(internalVisible, async (visible) => {
  if (visible) {
    runningOperationsLoaded.value = false;
    dataReceived.value = false;
    operations.value = [];
    await getRunningOperations();
    connect();
  } else {
    cleanupSocket();
    operations.value = [];
    dataReceived.value = false;
    runningOperations.value = 0;
    runningOperationsLoaded.value = false;
  }
});

const getRunningOperations = async () => {
  try {
    const res = await fetch(`/api/v1/mos/runningfsoperations`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });
    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('could not fetch running operations')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    const data = await res.json();
    runningOperations.value = data.count || 0;
    runningOperationsLoaded.value = true;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
    runningOperationsLoaded.value = true;
    return [];
  }
};

const cancelOperation = async (id) => {
  try {
    const res = await fetch(`/api/v1/mos/fileoperations/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });
    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('operation could not be cancelled')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('operation cancelled successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

defineExpose({ cleanupSocket, getRunningOperations });
</script>
