<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <div class="d-flex align-center ga-3 mb-4">
          <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
          <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ t('disks') }}</h2>
        </div>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader v-if="!disksLoaded" type="table-heading, table-row@5" :loading="!disksLoaded" class="mb-4" />
        <v-card v-else-if="disksLoaded && disks.length === 0" fluid class="pa-4 mb-4">
          <v-card-text class="pa-0">
            {{ $t('no disks found') }}
          </v-card-text>
        </v-card>
        <v-card v-else-if="disksLoaded && disks.length > 0" fluid style="margin-bottom: 80px" class="pa-0">
          <v-table density="comfortable" style="overflow-x: auto; table-layout: fixed">
            <thead>
              <tr style="background-color: rgba(0, 0, 0, 0.04)">
                <th style="white-space: nowrap; width: 32px"></th>
                <th style="white-space: nowrap; width: 200px; overflow: hidden; text-overflow: ellipsis">{{ $t('device') }}</th>
                <th style="white-space: nowrap">{{ $t('size') }}</th>
                <th style="white-space: nowrap">{{ $t('usage') }}</th>
                <th style="white-space: nowrap">{{ $t('model') }}</th>
                <th style="white-space: nowrap">{{ $t('partitions') }}</th>
                <th style="white-space: nowrap">{{ $t('type') }}</th>
                <th style="white-space: nowrap">{{ $t('filesystem') }}</th>
                <th style="white-space: nowrap">{{ $t('temperature') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="disk in disks" :key="disk.device">
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                  <v-menu>
                    <template #activator="{ props }">
                      <v-icon
                        v-bind="props"
                        class="cursor-pointer"
                        :style="{
                          color: disk.powerStatus === 'active' ? 'green' : disk.powerStatus === 'standby' ? '#1976d2' : 'red',
                        }"
                      >
                        {{ getDiskIcon(disk.type) }}
                      </v-icon>
                    </template>
                    <v-list>
                      <v-list-item @click="sleepDisk(disk)">
                        <template #prepend>
                          <v-icon>mdi-motion-pause</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('sleep') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="wakeDisk(disk)">
                        <template #prepend>
                          <v-icon>mdi-motion-play</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('wake up') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="mountDisk(disk)">
                        <template #prepend>
                          <v-icon>mdi-play</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('mount') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="unmountDisk(disk)">
                        <template #prepend>
                          <v-icon>mdi-eject</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('unmount') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="openFormatDialog(disk)">
                        <template #prepend>
                          <v-icon>mdi-broom</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('format') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="openSmartInfosDialog(disk)">
                        <template #prepend>
                          <v-icon>mdi-chart-timeline-variant-shimmer</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('smart infos') }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </td>
                <td style="max-width: 200px">
                  <div class="text-ellipsis" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ disk.device }}</div>
                  <div v-if="disk.serial" class="text-caption text-medium-emphasis text-ellipsis" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ disk.serial }}</div>
                </td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ disk.size_human }}</td>
                <td style="min-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                  <template v-if="disk.partitions?.some((p) => p.status?.mounted)">
                    <div v-for="p in disk.partitions.filter((p) => p.status?.mounted)" :key="p.device" class="my-1">
                      <v-progress-linear
                        :model-value="p.status.totalSpace ? (p.status.usedSpace / p.status.totalSpace) * 100 : 0"
                        :color="p.status.totalSpace && p.status.usedSpace / p.status.totalSpace > 0.9 ? 'red' : p.status.usedSpace / p.status.totalSpace > 0.7 ? 'orange' : 'green'"
                        height="16"
                        rounded
                      >
                        <template #default>
                          <span class="text-caption">{{ p.status.totalSpace ? Math.round((p.status.usedSpace / p.status.totalSpace) * 100) : 0 }}%</span>
                        </template>
                      </v-progress-linear>
                    </div>
                  </template>
                  <span v-else>—</span>
                </td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ disk.model }}</td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                  <template v-if="disk.partitions?.length">
                    <div v-for="p in disk.partitions" :key="p.device" class="text-caption" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                      {{ p.device || '—' }}
                      <v-chip v-if="p.status?.mounted" size="x-small" color="green" label class="ml-2">
                        {{ $t('mounted') }}
                      </v-chip>
                      <v-chip v-if="disk.powerStatus === 'standby'" size="x-small" color="blue" label class="ml-2">
                        {{ $t('sleep') }}
                      </v-chip>
                    </div>
                  </template>
                </td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                  <v-chip size="small" label>{{ disk.type?.toUpperCase() }}</v-chip>
                  <v-chip v-if="disk.partitions?.some((p) => p.mountpoint === '/boot')" color="onPrimary" size="x-small" class="ml-1" label>
                    {{ $t('boot') }}
                  </v-chip>
                  <v-chip v-if="disk.preclearRunning" color="onPrimary" size="x-small" class="ml-1" label>
                    {{ $t('preclear running') }}
                  </v-chip>
                </td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                  <template v-if="disk.partitions?.length">
                    <v-chip v-for="p in disk.partitions" :key="p.device" size="small" class="mr-1 mb-1" label>
                      {{ p.filesystem || '—' }}
                    </v-chip>
                  </template>
                  <span v-else>—</span>
                </td>
                <td colspan="10" class="text-center text-caption text-medium-emphasis" style="line-height: 1; overflow: hidden">
                  <v-icon v-if="disk.temperatureStatus === 'warning'" size="small" color="warning" style="flex: 0 0 auto">mdi-alert</v-icon>
                  <v-icon v-else-if="disk.temperatureStatus === 'error'" size="small" color="error" style="flex: 0 0 auto">mdi-alert-circle</v-icon>
                  <v-icon v-else size="small" color="success" style="flex: 0 0 auto">mdi-check-circle</v-icon>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Confirm Format Dialog -->
  <v-dialog v-model="formatDialog.value" max-width="400">
    <v-card class="pa-0" :title="$t('confirm format')" prepend-icon="mdi-broom">
      <v-card-text style="overflow: auto">
        {{ $t('are you sure you want to format this disk?') }}
        <v-select v-model="formatDialog.filesystem" :items="filesystems" :label="$t('filesystem')" density="comfortable" :rules="[(v) => !!v || $t('filesystem is required')]" class="pt-4" />
        <v-switch v-model="formatDialog.partition" :label="$t('create partition')" inset hide-details density="compact" color="green" />
        <v-switch v-model="formatDialog.wipeExisting" :label="$t('wipe existing data')" inset hide-details density="compact" color="green" />
        <v-switch v-model="formatDialog.preClearEnabled" :label="$t('preclear')" inset density="compact" color="green" />
        <template v-if="formatDialog.preClearEnabled">
          <v-select v-model="formatDialog.preClear.algorithm" :items="formatAlgorithms" :label="$t('preclear algorithm')" density="comfortable" />
          <v-text-field v-model.number="formatDialog.preClear.wipes" :label="$t('number of wipes')" type="number" min="1" density="comfortable" />
          <v-switch v-model="formatDialog.preClear.readCheck" :label="$t('read check after wipe')" inset hide-details density="compact" color="green" />
          <v-switch v-model="formatDialog.preClear.log" :label="$t('log preclear output')" inset hide-details density="compact" color="green" />
        </template>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-spacer />
        <v-btn color="onPrimary" @click="formatDialog.value = false">
          {{ $t('cancel') }}
        </v-btn>
        <v-btn color="red" :disabled="!formatDialog.filesystem" @click="formatDisk(formatDialog.disk)">
          {{ $t('format') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Confirm S.M.A.R.T. Dialog -->
  <v-dialog v-model="smartDialog.value" max-width="800">
    <v-card class="pa-0" :title="$t('smart infos')" prepend-icon="mdi-chart-timeline-variant-shimmer">
      <v-card-text style="overflow: auto">
        <div v-if="smartDialog.loading">
          <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
        </div>
        <div v-else>
          <div class="mb-0">
            {{ $t('device') }}:
            {{ smartDialog.smartInfos.device }}
          </div>
          <div class="mb-0">
            {{ $t('model') }}:
            {{ smartDialog.smartInfos.model }}
          </div>
          <div class="mb-0">
            {{ $t('serial') }}:
            {{ smartDialog.smartInfos.serial }}
          </div>
          <div class="mb-0">{{ $t('type') }}: {{ smartDialog.smartInfos.diskType }}</div>
          <div class="mb-0">
            {{ $t('status') }}:
            <v-chip
              v-if="smartDialog.smartInfos.smartStatus && smartDialog.smartInfos.smartStatus !== '' && smartDialog.smartInfos.smartStatus !== null"
              :color="smartDialog.smartInfos.smartStatus === 'PASSED' ? 'green' : 'red'"
              size="small"
            >
              {{ smartDialog.smartInfos.smartStatus }}
            </v-chip>
            <v-chip v-else-if="smartDialog.smartInfos.sleeping" color="blue" size="small" class="ml-2">
              {{ $t('sleep') }}
            </v-chip>
          </div>
          <div v-if="smartDialog.smartInfos.temperature" class="mb-0">
            {{ $t('temperature') }}: {{ smartDialog.smartInfos.temperature.current }}°C
            <span v-if="smartDialog.smartInfos.temperature.min">(Min: {{ smartDialog.smartInfos.temperature.min }}°C)</span>
            <span v-if="smartDialog.smartInfos.temperature.max">(Max: {{ smartDialog.smartInfos.temperature.max }}°C)</span>
          </div>
          <div class="mb-0">
            {{ $t('power on hours') }}:
            {{ smartDialog.smartInfos.powerOnHours }}
          </div>
          <div class="mb-0">
            {{ $t('power cycle count') }}:
            {{ smartDialog.smartInfos.powerCycleCount }}
          </div>
          <div class="mb-0">
            {{ $t('error count') }}:
            {{ smartDialog.smartInfos.errorCount }}
          </div>
          <div v-if="smartDialog.smartInfos.warning" class="mb-0">
            <v-chip color="orange" size="small">{{ $t('warning') }}</v-chip>
          </div>
          <v-divider class="my-4" />
          <span class="text-title-medium font-weight-medium">{{ $t('monitoring config') }}</span>
          <v-row class="pt-4">
            <v-col cols="12" md="6">
              <v-text-field v-model.number="smartDialog.smartDiskConfig.temperatureWarning" :label="$t('temperature warning')" type="number" density="compact" hide-details="auto" suffix="°C" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model.number="smartDialog.smartDiskConfig.temperatureCritical" :label="$t('temperature critical')" type="number" density="compact" hide-details="auto" suffix="°C" />
            </v-col>
          </v-row>
          <v-row class="pt-0 mt-4 ga-1">
            <v-col cols="12" sm="6">
              <v-checkbox v-model="smartDialog.smartDiskConfig.monitoredAttributes" :value="5" label="5 - Reallocated Sectors" density="compact" hide-details />
            </v-col>
            <v-col cols="12" sm="6">
              <v-checkbox v-model="smartDialog.smartDiskConfig.monitoredAttributes" :value="187" label="187 - Reported Uncorrectable Errors" density="compact" hide-details />
            </v-col>
            <v-col cols="12" sm="6">
              <v-checkbox v-model="smartDialog.smartDiskConfig.monitoredAttributes" :value="198" label="198 - Offline Uncorrectable Sectors" density="compact" hide-details />
            </v-col>
            <v-col cols="12" sm="6">
              <v-checkbox v-model="smartDialog.smartDiskConfig.monitoredAttributes" :value="199" label="199 - UDMA CRC Errors" density="compact" hide-details />
            </v-col>
          </v-row>
          <v-text-field
            v-model.number="smartDialog.smartDiskConfig.attributeNotificationCooldown"
            :label="$t('attribute notification cooldown')"
            type="number"
            min="0"
            density="compact"
            hide-details="auto"
            class="mt-4"
          />
          <div v-if="smartDialog.smartInfos.attributes?.length" class="mt-4">
            <strong>{{ $t('attributes') }}:</strong>
            <v-table density="compact" class="mt-2">
              <thead>
                <tr>
                  <th>{{ $t('id') }}</th>
                  <th>{{ $t('name') }}</th>
                  <th>{{ $t('value') }}</th>
                  <th>{{ $t('worst') }}</th>
                  <th>{{ $t('threshold') }}</th>
                  <th>{{ $t('raw value') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="attr in smartDialog.smartInfos.attributes" :key="attr.id">
                  <td>{{ attr.id }}</td>
                  <td>{{ attr.name }}</td>
                  <td>{{ attr.value }}</td>
                  <td>{{ attr.worst }}</td>
                  <td>{{ attr.threshold }}</td>
                  <td>{{ attr.rawValue }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-spacer />
        <v-btn color="onPrimary" @click="smartDialog.value = false">
          {{ $t('close') }}
        </v-btn>
        <v-btn color="onPrimary" :disabled="smartDialog.loading" @click="saveSmartDiskConfig()">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Floating Action Button with Menu -->
  <v-menu location="top">
    <template v-slot:activator="{ props }">
      <v-fab v-bind="props" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
        <v-icon color="onPrimary">mdi-dots-vertical</v-icon>
      </v-fab>
    </template>
    <v-list>
      <v-list-item @click="sleepAll()">
        <template v-slot:prepend>
          <v-icon>mdi-sleep</v-icon>
        </template>
        <v-list-item-title>{{ $t('sleep all') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="wakeAll()">
        <template v-slot:prepend>
          <v-icon>mdi-sleep-off</v-icon>
        </template>
        <v-list-item-title>{{ $t('wake all') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';

const disks = ref([]);
const { t } = useI18n();
const { overlay } = useOverlay();
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const disksLoaded = ref(false);
const formatAlgorithms = ['zero', 'one-zero', 'random', 'one'];
const formatDialog = reactive({
  value: false,
  disk: null,
  filesystem: '',
  partition: true,
  wipeExisting: true,
  preClearEnabled: false,
  preClear: {
    wipes: 2,
    algorithm: 'zero',
    readCheck: false,
    log: false,
  },
});
const filesystems = ref([]);
const smartDialog = reactive({
  value: false,
  disk: null,
  smartInfos: {
    device: '',
    deviceName: '',
    serial: '',
    model: '',
    diskType: 'hdd',
    sleeping: false,
    warning: false,
    smartStatus: 'PASSED',
    temperature: {
      current: null,
      min: null,
      max: null,
    },
    powerOnHours: null,
    powerCycleCount: null,
    errorCount: null,
    attributes: [],
    source: 'smartctl_live',
    monitoringConfig: {
      temperatureWarning: 0,
      temperatureCritical: 0,
    },
  },
  smartDiskConfig: {
    temperatureWarning: 0,
    temperatureCritical: 0,
    monitoredAttributes: [5, 187, 198, 199],
    attributeNotificationCooldown: 0,
    lastSeen: '2026-04-08T12:14:07.437Z',
    model: 'WDC WD40EFRX-68N32N0',
    diskType: 'hdd',
    warning: false,
  },
  loading: false,
});

onMounted(() => {
  getDisks();
  getFilesystems();
});

const openFormatDialog = (disk) => {
  formatDialog.value = true;
  formatDialog.disk = disk;
};

const getDisks = async () => {
  try {
    const res = await fetch('/api/v1/disks', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('disks could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    disks.value = (await res.json()) || [];
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    disksLoaded.value = true;
  }
};

const getDiskIcon = (type) => {
  switch (type) {
    case 'ssd':
      return 'mdi-harddisk';
    case 'hdd':
      return 'mdi-harddisk';
    case 'usb':
      return 'mdi-usb-flash-drive';
    case 'nvme':
      return 'mdi-chip';
    case 'ramdisk':
      return 'mdi-memory';
    case 'emmc':
      return 'mdi-micro-sd';
    default:
      return 'mdi-help-circle';
  }
};

const wakeDisk = async (disk) => {
  overlay.value = true;
  try {
    const res = await fetch(`/api/v1/disks/${disk.name}/wake`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('disk could not be woken up')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('disk successfully woken up'));
    getDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const sleepDisk = async (disk) => {
  overlay.value = true;
  try {
    const res = await fetch(`/api/v1/disks/${disk.name}/sleep`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('disk could not be put to sleep')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('disk successfully put to sleep'));
    getDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const sleepAll = async () => {
  overlay.value = true;
  const payload = {
    devices: [...disks.value.map((disk) => disk.name)],
    mode: 'standby',
  };

  try {
    const res = await fetch(`/api/v1/disks/sleep`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('disks could not be put to sleep')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('disks successfully put to sleep'));
    getDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const wakeAll = async () => {
  overlay.value = true;
  const payload = {
    devices: [...disks.value.map((disk) => disk.name)],
  };

  try {
    const res = await fetch(`/api/v1/disks/wake`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('disks could not be woken up')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('disks successfully woken up'));
    getDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const formatDisk = async (disk) => {
  const payload = {
    device: formatDialog.disk.name,
    filesystem: formatDialog.filesystem,
    partition: formatDialog.partition,
    wipeExisting: formatDialog.wipeExisting,
    preClear: formatDialog.preClearEnabled
      ? {
          algorithm: formatDialog.preClear.algorithm,
          wipes: formatDialog.preClear.wipes,
          readCheck: formatDialog.preClear.readCheck,
          log: formatDialog.preClear.log,
        }
      : null,
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/disks/format`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('disk could not be formatted')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('disk formatted successfully'));
    clearFormatDialog();
    getDisks();
    formatDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const getFilesystems = async () => {
  try {
    const res = await fetch('/api/v1/disks/availablefilesystems', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('filesystems could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    const Result = await res.json();
    filesystems.value = Result || [];
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const mountDisk = async (disk) => {
  overlay.value = true;
  try {
    const res = await fetch(`/api/v1/disks/${disk.name}/mount`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('disk could not be mounted')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('disk mounted successfully'));
    getDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const unmountDisk = async (disk) => {
  overlay.value = true;
  try {
    const res = await fetch(`/api/v1/disks/${disk.name}/unmount`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('disk could not be unmounted')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('disk unmounted successfully'));
    getDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const getSmartInfos = async (disk, wakeUp) => {
  try {
    const res = await fetch(`/api/v1/disks/${disk.name}/smart?wakeUp=${wakeUp}`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('smart infos could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    return await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
    return null;
  }
};

const getSmartDiskConfig = async (disk) => {
  try {
    const res = await fetch(`/api/v1/disks/smart/config/disks/${disk.name}`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('smart disk config could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    return await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
    return null;
  }
};

const clearFormatDialog = () => {
  formatDialog.value = false;
  formatDialog.disk = null;
  formatDialog.filesystem = '';
  formatDialog.partition = true;
  formatDialog.wipeExisting = true;
};
const saveSmartDiskConfig = async () => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/disks/smart/config/disks/${smartDialog.disk.name}`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(smartDialog.smartDiskConfig),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('smart disk config could not be saved')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('smart disk config saved successfully'));
    smartDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const openSmartInfosDialog = async (disk) => {
  smartDialog.value = true;
  smartDialog.disk = disk;
  smartDialog.smartInfos = {};
  smartDialog.smartDiskConfig = {};
  smartDialog.loading = true;
  smartDialog.smartInfos = await getSmartInfos(disk, true);
  smartDialog.smartDiskConfig = await getSmartDiskConfig(disk);
  smartDialog.loading = false;
};
</script>
