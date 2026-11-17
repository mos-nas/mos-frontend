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
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('boot') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card class="pa-0" style="margin-bottom: 80px">
          <v-card-text class="pb-2">
            <span class="text-title-medium font-weight-medium">{{ $t('install to disk') }}</span>
            <p class="text-body-2 text-medium-emphasis mt-1 mb-3">{{ $t('transfer usb data to disk device') }}</p>
            <v-row no-gutters>
              <v-col cols="12" md="4" lg="3">
                <v-btn color="primary" rounded size="large" block prepend-icon="mdi-harddisk-plus" variant="tonal" @click="openInstallToDiskDialog()">
                  {{ $t('install to disk') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider class="my-2"></v-divider>

          <v-card-text class="pt-2">
            <span class="text-title-medium font-weight-medium">{{ $t('grub') }}</span>
            <p class="text-body-2 text-medium-emphasis mt-1 mb-3">{{ $t('edit grub.cfg') }}</p>
            <v-row no-gutters>
              <v-col cols="12" md="4" lg="3">
                <v-btn color="primary" rounded size="large" block prepend-icon="mdi-file-document-edit-outline" variant="tonal" @click="openFileEditor('/boot/grub/grub.cfg')">
                  {{ $t('edit grub.cfg') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Install to Disk Dialog -->
  <v-dialog v-model="installToDiskDialog.value" max-width="500">
    <v-card class="pa-0" :title="$t('install to disk')" prepend-icon="mdi-harddisk-plus">
      <v-card-text>
        <p class="mb-4">{{ $t('transfer usb data to disk device') }}</p>
        <v-select
          v-model="installToDiskDialog.disk"
          :items="
            Array.isArray(unassignedDisks)
              ? unassignedDisks.map((disk) => ({
                  title: `${disk.device} (${disk.size_human})`,
                  value: disk.device,
                }))
              : []
          "
          item-title="title"
          item-value="value"
          :label="$t('device')"
          density="comfortable"
        />
        <v-select v-model="installToDiskDialog.filesystem" :items="['ext4', 'btrfs', 'xfs', 'vfat']" :label="$t('filesystem')" required outlined density="comfortable"></v-select>
        <v-switch v-model="installToDiskDialog.extra_partition" :label="$t('extra partition')" inset color="green" density="compact" hide-details="auto"></v-switch>
        <div class="d-flex align-center">
          <v-switch v-model="installToDiskDialog.backup_label" :label="$t('set backup label on new device')" inset color="green" density="compact" hide-details="auto"></v-switch>
          <v-tooltip :text="$t('new device gets label mos_backup')" open-on-click :open-on-hover="false">
            <template #activator="{ props }">
              <v-icon size="small" icon="mdi-information-outline" color="blue" class="ml-2" v-bind="props"></v-icon>
            </template>
          </v-tooltip>
        </div>
        <v-switch v-model="installToDiskDialog.restore" :label="$t('restore from file (mos backup)')" inset color="green" density="compact" hide-details="auto"></v-switch>
        <v-select
          v-if="bootBackupFiles.length > 0 && bootBackupFiles[0] !== '' && installToDiskDialog.restore"
          v-model="installToDiskDialog.tar_file"
          :items="bootBackupFiles"
          :label="$t('tar file')"
          outlined
          density="comfortable"
          class="mt-4"
          hide-details="auto"
        ></v-select>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="installToDiskDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="installToDisk()">{{ $t('install') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Install Output Dialog (WebSocket) -->
  <v-dialog v-model="installOutputDialog.value" max-width="800" persistent>
    <v-card>
      <v-card-text class="pa-1">
        <div
          ref="installScrollContainer"
          :style="{
            height: 'calc(100vh - 340px)',
            overflow: 'auto',
            whiteSpace: 'pre',
            fontFamily: 'monospace',
            border: '1px solid ' + ($vuetify.theme && $vuetify.theme.name == 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.12)'),
            borderRadius: '4px',
            backgroundColor: $vuetify.theme && $vuetify.theme.name == 'dark' ? '#121212' : '#fafafa',
            color: $vuetify.theme && $vuetify.theme.name == 'dark' ? '#e0e0e0' : '#111',
          }"
        >
          <div v-for="(line, index) in installOutputDialog.data" :key="index" style="padding-left: 4px; padding-right: 4px; white-space: pre-wrap">
            <small>{{ line }}</small>
          </div>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-progress-circular v-if="installOutputDialog.loading" color="primary" class="ma-0" indeterminate />
        <v-spacer />
        <v-btn v-if="installOutputDialog.loading" color="error" text :disabled="installOutputDialog.cancelling || !installOutputDialog.operationId" @click="cancelInstallToDisk()">
          {{ $t('cancel') }}
        </v-btn>
        <v-btn color="onPrimary" text :disabled="installOutputDialog.loading" @click="closeInstallOutputDialog()">
          {{ $t('close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- File Edit Dialog -->
  <FileEditDialog v-model="editFileDialogVisible" :path="selectedFilePath" :createBackup="true" :title="$t('edit file')" />
</template>

<script setup>
import { ref, onMounted, reactive, onUnmounted, watch, nextTick } from 'vue';
import { io } from 'socket.io-client';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';
import FileEditDialog from '@/components/fileEditDialog.vue';

const editFileDialogVisible = ref(false);
const selectedFilePath = ref('');
const { t } = useI18n();
const { overlay } = useOverlay();
const unassignedDisks = ref([]);
const installToDiskDialog = reactive({
  value: false,
  disk: '',
  filesystem: '',
  extra_partition: false,
  restore: false,
  tar_file: '',
  backup_label: false,
});
const bootBackupFiles = ref([]);

const SEPARATOR = '------------------------------------';
const installOutputDialog = reactive({
  value: false,
  operationId: '',
  data: [],
  loading: false,
  cancelling: false,
});
const installScrollContainer = ref(null);
let socket = null;
let stickToBottom = true;

const FINISHED_STATES = ['completed', 'cancelled', 'error'];
let runningOperationIds = null;
let replayBuffer = {};

const onInstallScroll = () => {
  const el = installScrollContainer.value;
  if (el) stickToBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20;
};

watch(installScrollContainer, (el, oldEl) => {
  oldEl?.removeEventListener('scroll', onInstallScroll);
  el?.addEventListener('scroll', onInstallScroll, { passive: true });
  if (el) stickToBottom = true;
});

watch(
  () => installOutputDialog.data.length,
  () => {
    nextTick(() => {
      const el = installScrollContainer.value;
      if (el && stickToBottom) el.scrollTop = el.scrollHeight;
    });
  },
  { flush: 'post' },
);

onMounted(() => {
  getUnassignedDisks();
  connectInstallSocket();
});

onUnmounted(disconnectInstallSocket);

function disconnectInstallSocket() {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}

const resetInstallOutput = () => {
  installOutputDialog.operationId = '';
  installOutputDialog.data = [];
  installOutputDialog.cancelling = false;
  stickToBottom = true;
};

const openInstallOutput = () => {
  if (!installOutputDialog.value) {
    resetInstallOutput();
    installOutputDialog.value = true;
  }
  installOutputDialog.loading = true;
};

const finishInstall = (line) => {
  installOutputDialog.loading = false;
  installOutputDialog.cancelling = false;
  if (line) installOutputDialog.data.push(`${SEPARATOR}\n${line}`);
};

const appendInstallOutput = (operationId, output) => {
  if (!installOutputDialog.operationId) installOutputDialog.operationId = operationId || '';
  openInstallOutput();
  installOutputDialog.data.push(output ?? '');
};

const handleOperationsList = (data) => {
  const operations = Array.isArray(data) ? data : data.operations || [];
  runningOperationIds = new Set(operations.filter((op) => op?.operationId && !FINISHED_STATES.includes(op.status)).map((op) => op.operationId));

  runningOperationIds.forEach((id) => (replayBuffer[id] || []).forEach((output) => appendInstallOutput(id, output)));
  replayBuffer = {};
};

const handleReplayOutput = (data) => {
  if (runningOperationIds) {
    if (runningOperationIds.has(data.operationId)) appendInstallOutput(data.operationId, data.output);
    return;
  }
  (replayBuffer[data.operationId] ||= []).push(data.output);
};

const handleInstallUpdate = (data) => {
  if (!data) return;
  if (installOutputDialog.operationId && data.operationId && data.operationId !== installOutputDialog.operationId) return;

  switch (data.status) {
    case 'started':
      resetInstallOutput();
      installOutputDialog.operationId = data.operationId || '';
      openInstallOutput();
      installOutputDialog.data.push(`mos-install started\n${SEPARATOR}\n`);
      break;
    case 'running':
      if (data.replay) handleReplayOutput(data);
      else appendInstallOutput(data.operationId, data.output);
      break;
    case 'operations-list':
      handleOperationsList(data);
      break;
    case 'cancelling':
      installOutputDialog.cancelling = true;
      installOutputDialog.data.push(`${SEPARATOR}\n${t('cancelling')}...\n`);
      break;
    case 'completed':
      finishInstall(`mos-install completed (exit code ${data.exitCode})`);
      if (data.exitCode === 0) {
        showSnackbarSuccess(t('installation successfully, please make sure to reboot the system from the installed disk'));
      } else {
        showSnackbarError(t('installation failed'), `exit code ${data.exitCode}`);
      }
      break;
    case 'cancelled':
      finishInstall(t('installation cancelled'));
      break;
    case 'error':
      finishInstall();
      showSnackbarError(t('installation failed'), data.message);
      break;
  }
};

function connectInstallSocket() {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) return;

  disconnectInstallSocket();
  runningOperationIds = null;
  replayBuffer = {};
  const wsUrl = __WS_BASE_URL__ || '';
  socket = io(wsUrl ? `${wsUrl}/mos/installtodisk` : '/mos/installtodisk', { path: '/api/v1/socket.io/', transports: ['websocket'], upgrade: false });

  socket.on('connect', () => socket.emit('installtodisk-get-operations', { token: authToken }));
  socket.on('installtodisk-update', handleInstallUpdate);
  socket.on('connect_error', (err) => {
    finishInstall();
    showSnackbarError(t('installation failed'), `Connection error: ${err.message}`);
  });
  socket.on('error', (err) => {
    finishInstall();
    showSnackbarError(t('installation failed'), `Socket error: ${String(err)}`);
  });
}

const closeInstallOutputDialog = () => {
  installOutputDialog.value = false;
  resetInstallOutput();
};

const cancelInstallToDisk = () => {
  if (!socket || !installOutputDialog.operationId) return;
  socket.emit('installtodisk-cancel', { token: localStorage.getItem('authToken'), operationId: installOutputDialog.operationId });
};

const openInstallToDiskDialog = async () => {
  installToDiskDialog.value = true;
  installToDiskDialog.backup_label = false;
  installToDiskDialog.tar_file = '';
  installToDiskDialog.restore = false;
  installToDiskDialog.filesystem = '';
  installToDiskDialog.extra_partition = false;
  overlay.value = true;
  await getBootBackupFiles();
  overlay.value = false;
};

const openFileEditor = (path) => {
  selectedFilePath.value = path;
  editFileDialogVisible.value = true;
};

const installToDisk = () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    showSnackbarError(t('installation failed'), t('no auth token found'));
    return;
  }
  if (!socket || !socket.connected) {
    connectInstallSocket();
    showSnackbarError(t('installation failed'), t('connection error'));
    return;
  }

  installToDiskDialog.value = false;
  resetInstallOutput();
  installOutputDialog.value = true;
  installOutputDialog.loading = true;

  socket.emit('installtodisk-run', {
    token: authToken,
    disk: installToDiskDialog.disk,
    filesystem: installToDiskDialog.filesystem,
    extra_partition: installToDiskDialog.extra_partition,
    tar_file: installToDiskDialog.tar_file,
    backup_label: installToDiskDialog.backup_label,
  });
};

const getUnassignedDisks = async () => {
  try {
    const res = await fetch('/api/v1/disks/unassigned', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('unassigned disks could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    const result = await res.json();
    unassignedDisks.value = result.unassignedDisks || [];
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getBootBackupFiles = async () => {
  try {
    const res = await fetch('/api/v1/mos/bootbackupfiles', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('boot backup files could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    const result = await res.json();
    bootBackupFiles.value = Array.isArray(result) ? result : [];
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};
</script>
