<template>
  <v-dialog v-model="internalVisible" :persistent="persistent" max-width="900">
    <v-card class="pa-0">
      <v-card-title class="d-flex align-center">
        <span class="text-h6">{{ titleComputed }}</span>
      </v-card-title>
      <v-card-text class="pa-2" style="max-height: 70vh; overflow: auto">
        <v-row density="comfortable">
          <v-col cols="12" md="6">
            <v-sheet rounded="lg" variant="tonal" class="pa-2">
              <div class="text-title-medium font-weight-medium mb-1">{{ t('info') }}</div>
              <v-list density="compact" class="bg-transparent pa-0">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon class="mr-2" color="grey-darken-1">mdi-heart-pulse</v-icon>
                  </template>
                  <v-list-item-title class="d-flex align-center justify-space-between">
                    <span class="text-body-2">{{ t('state') }}</span>
                    <v-chip size="small" :color="dockerStateColor" variant="tonal" class="ml-2">
                      {{ dockerState || '-' }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item>
                <v-divider class="my-2" />
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon class="mr-2" color="grey-darken-1">mdi-docker</v-icon>
                  </template>
                  <v-list-item-title class="d-flex align-center justify-space-between">
                    <span class="text-body-2">{{ t('image') }}</span>
                    <span class="text-body-2 text-truncate ml-2" style="max-width: 260px" :title="docker?.Image">
                      {{ docker?.Image || '-' }}
                    </span>
                  </v-list-item-title>
                </v-list-item>
                <v-divider class="my-2" />
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon class="mr-2" color="grey-darken-1">mdi-lan</v-icon>
                  </template>
                  <v-list-item-title class="d-flex align-center justify-space-between">
                    <span class="text-body-2">{{ t('network') }}</span>
                    <v-chip size="small" color="primary" variant="tonal" class="ml-2">
                      {{ docker?.HostConfig?.NetworkMode || '-' }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-sheet>
          </v-col>
          <v-col cols="12" md="6">
            <v-sheet rounded="lg" variant="tonal" class="pa-2">
              <div class="text-title-medium font-weight-medium mb-1">{{ t('ports') }}</div>
              <div v-if="portsFlat.length">
                <v-row no-gutters>
                  <v-col cols="6">
                    <v-list density="compact" class="pa-0">
                      <v-list-item v-for="(p, idx) in portsLeft" :key="`pl-${idx}`" class="px-0">
                        <div class="text-body-2">{{ p }}</div>
                      </v-list-item>
                    </v-list>
                  </v-col>
                  <v-col cols="6">
                    <v-list density="compact" class="pa-0">
                      <v-list-item v-for="(p, idx) in portsRight" :key="`pr-${idx}`" class="px-0">
                        <div class="text-body-2">{{ p }}</div>
                      </v-list-item>
                    </v-list>
                  </v-col>
                </v-row>
              </div>
              <div v-else class="text-body-2 text-medium-emphasis">-</div>
            </v-sheet>
          </v-col>
          <v-col cols="12">
            <v-sheet rounded="lg" variant="tonal" class="pa-2">
              <div class="text-title-medium font-weight-medium mb-1">{{ t('stats') }}</div>
              <v-row density="comfortable">
                <v-col cols="12" md="3">
                  <div class="text-subtitle-2 font-weight-bold mb-1">{{ t('cpu') }}</div>
                  <div class="text-body-2">Usage: {{ stats?.cpu_percent ?? '-' }}%</div>
                </v-col>
                <v-col cols="12" md="3">
                  <div class="text-subtitle-2 font-weight-bold mb-1">{{ t('memory') }}</div>
                  <div class="text-body-2">Used: {{ stats?.memory_usage_human ?? '-' }}</div>
                  <div class="text-body-2">Limit: {{ stats?.memory_limit_human ?? '-' }}</div>
                  <div class="text-body-2">Percent: {{ stats?.memory_percent ?? '-' }}</div>
                </v-col>
                <v-col cols="12" md="3">
                  <div class="text-subtitle-2 font-weight-bold mb-1">{{ t('network') }}</div>
                  <div class="text-body-2">Rx: {{ stats?.network_rx_human ?? '-' }}</div>
                  <div class="text-body-2">Tx: {{ stats?.network_tx_human ?? '-' }}</div>
                  <div class="text-body-2">Total: {{ stats?.network_total_human ?? '-' }}</div>
                </v-col>
                <v-col cols="12" md="3">
                  <div class="text-subtitle-2 font-weight-bold mb-1">{{ t('disk') }}</div>
                  <div class="text-body-2">Read: {{ stats?.block_read_human ?? '-' }}</div>
                  <div class="text-body-2">Write: {{ stats?.block_write_human ?? '-' }}</div>
                  <div class="text-body-2">Total: {{ stats?.block_total_human ?? '-' }}</div>
                </v-col>
              </v-row>
            </v-sheet>
          </v-col>
          <v-col cols="12">
            <v-sheet rounded="lg" variant="tonal" class="pa-2">
              <div class="text-title-medium font-weight-medium mb-1">{{ t('mounts') }}</div>
              <div v-if="mounts.length">
                <v-expansion-panels variant="accordion" class="bg-transparent">
                  <v-expansion-panel v-for="(mount, idx) in mounts" :key="idx">
                    <v-expansion-panel-title>
                      <div class="d-flex align-center justify-space-between w-100">
                        <div class="text-body-2 text-truncate" style="max-width: 520px">{{ mount.Source || '-' }} → {{ mount.Destination || '-' }}</div>
                        <v-chip size="x-small" :color="mount.RW ? 'green' : 'red'" variant="tonal" class="ml-2">
                          {{ mount.RW ? t('read/write') : t('read only') }}
                        </v-chip>
                      </div>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-list density="compact" class="bg-transparent pa-0">
                        <v-list-item class="px-0">
                          <v-list-item-title class="d-flex justify-space-between">
                            <span class="text-body-2">{{ t('type') }}</span>
                            <span class="text-body-2 text-medium-emphasis">{{ mount.Type || '-' }}</span>
                          </v-list-item-title>
                        </v-list-item>
                        <v-divider class="my-2" />
                        <v-list-item class="px-0">
                          <v-list-item-title class="d-flex justify-space-between">
                            <span class="text-body-2">{{ t('mode') }}</span>
                            <span class="text-body-2 text-medium-emphasis">{{ mount.Mode || '-' }}</span>
                          </v-list-item-title>
                        </v-list-item>
                        <v-divider class="my-2" />
                        <v-list-item class="px-0">
                          <v-list-item-title class="d-flex justify-space-between">
                            <span class="text-body-2">{{ t('propagation') }}</span>
                            <span class="text-body-2 text-medium-emphasis">{{ mount.Propagation || '-' }}</span>
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>
              <div v-else class="text-body-2 text-medium-emphasis">-</div>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" text @click="onClose">
          {{ t('close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';
import { useI18n } from 'vue-i18n';

type DockerPort = { PublicPort?: number; PrivatePort?: number; Type?: string };
type DockerMount = { Source?: string; Destination?: string; RW?: boolean; Type?: string; Mode?: string; Propagation?: string };

type DockerLike = {
  Names?: string[];
  Id?: string;
  State?: string;
  Image?: string;
  Ports?: DockerPort[];
  HostConfig?: { NetworkMode?: string };
  Mounts?: DockerMount[];
};

const stats = ref<any>(null);

const props = defineProps<{
  modelValue: boolean;
  docker: DockerLike | null;
  title?: string;
  persistent?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'closed'): void;
  (e: 'stats', payload: any): void;
}>();

const { t } = useI18n();

const internalVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

let connecting = false;
let activeContainer: string | null = null;

const persistent = computed(() => props.persistent ?? false);
const dockerName = computed(() => props.docker?.Names?.[0] ?? null);
const dockerState = computed(() => props.docker?.State ?? null);
const dockerStateColor = computed(() => (dockerState.value === 'running' ? 'green' : 'red'));
const titleComputed = computed(() => props.title || (dockerName.value ? dockerName.value : t('info')));

const wsStatsIsConnected = ref(false);
const wsStatsError = ref<string | null>(null);
const loading = ref(false);
const errorMessage = ref('');

let socket: Socket | null = null;

const cleanupSocket = () => {
  try {
    if (socket) {
      socket.off();
      socket.disconnect();
    }
  } catch {
  } finally {
    socket = null;
    wsStatsIsConnected.value = false;
    loading.value = false;
  }
};

const stopStats = () => {
  cleanupSocket();
  connecting = false;
  activeContainer = null;
};

const connectStats = (containerName: string) => {
  if (!containerName) return;
  if (connecting) return;
  if (activeContainer === containerName && wsStatsIsConnected.value) return;

  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    wsStatsError.value = 'No auth token found';
    errorMessage.value = t('no auth token found');
    return;
  }

  cleanupSocket();

  connecting = true;
  activeContainer = containerName;

  stats.value = null;
  errorMessage.value = '';
  wsStatsError.value = null;
  loading.value = true;

  socket = io('/docker', {
    path: '/api/v1/socket.io/',
    transports: ['websocket'],
    upgrade: false,
    forceNew: true,
  });

  socket.on('connect', () => {
    wsStatsIsConnected.value = true;
    loading.value = false;
    connecting = false;

    socket?.emit('docker-stats-subscribe', {
      token: authToken,
      params: { name: containerName },
    });
  });

  socket.on('connect_error', (err: any) => {
    wsStatsError.value = err?.message ?? 'Connection error';
    errorMessage.value = wsStatsError.value ?? '';
    connecting = false;
    loading.value = false;
  });

  socket.on('disconnect', () => {
    wsStatsIsConnected.value = false;
  });

  socket.on('docker-update', (data: any) => {
    if (data.status === 'running') {
        stats.value = data.stats;
    }
    emit('stats', data);
  });

  socket.on('error', (err: any) => {
    wsStatsError.value = String(err);
    errorMessage.value = String(err);
    connecting = false;
    loading.value = false;
  });
};

const onClose = () => {
  internalVisible.value = false;
  stopStats();
  emit('closed');
};

watch(
  () => internalVisible.value,
  (v) => {
    if (!v) {
      stopStats();
      return;
    }
    if (dockerName.value) connectStats(dockerName.value);
  }
);
watch(
  () => dockerName.value,
  (name, old) => {
    if (!internalVisible.value) return;
    if (!name || name === old) return;

    activeContainer = null;
    connectStats(name);
  }
);

onUnmounted(() => {
  stopStats();
});

const portsFlat = computed(() => {
  const arr = props.docker?.Ports || [];
  return arr
    .filter((p) => p.PrivatePort)
    .map((p) => {
      const left = p.PublicPort ? `${p.PublicPort}:${p.PrivatePort}` : `${p.PrivatePort}`;
      const typ = p.Type ? ` (${p.Type})` : '';
      return `${left}${typ}`;
    });
});

const portsLeft = computed(() => portsFlat.value.filter((_, i) => i % 2 === 0));
const portsRight = computed(() => portsFlat.value.filter((_, i) => i % 2 === 1));

const mounts = computed(() => props.docker?.Mounts ?? []);
</script>
