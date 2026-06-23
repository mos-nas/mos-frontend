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
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('zram') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card fluid style="margin-bottom: 80px" class="pa-0">
          <v-card-text class="pb-0">
            <v-switch :label="$t('zram enabled')" color="green" inset v-model="zram.enabled" hide-details="auto" @update:model-value="setZram()" density="compact"></v-switch>
          </v-card-text>
          <v-card-text class="pa-0">
            <v-list>
              <v-list-item v-if="zram.devices.length > 0" v-for="(device, index) in zram.devices" :key="index">
                <template v-slot:prepend>
                  <v-icon class="cursor-pointer">mdi-memory</v-icon>
                </template>
                <v-list-item-title class="d-flex align-center">
                  {{ device.name }}
                </v-list-item-title>
                <v-list-item-subtitle>{{ device.size }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn variant="text" icon v-bind="props" color="onPrimary">
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="openChangeZramDeviceDialog(device)">
                        <v-list-item-title>{{ $t('edit') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="openDeleteZramDeviceDialog(device)">
                        <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-list-item>
              <v-list-item v-else>
                <v-list-item-title>{{ $t('no zram devices available') }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Create Zram Dialog -->
  <v-dialog v-model="createZramDeviceDialog.value" max-width="600px">
    <v-card class="pa-0">
      <v-card-title>{{ $t('create zram device') }}</v-card-title>
      <v-card-text class="py-0" style="overflow-y: auto">
        <v-switch v-model="createZramDeviceDialog.enabled" :label="$t('enabled')" inset color="green" density="compact"></v-switch>
        <v-text-field v-model="createZramDeviceDialog.name" :label="$t('name')" required></v-text-field>
        <v-select v-model="createZramDeviceDialog.type" :label="$t('type')" :items="['swap', 'ramdisk']" required></v-select>
        <v-select v-model="createZramDeviceDialog.algorithm" :label="$t('algorithm')" :items="zramAlgorithms" required></v-select>
        <v-text-field v-model="createZramDeviceDialog.size" :label="$t('size')" required></v-text-field>
        <v-text-field v-model="createZramDeviceDialog.config.priority" :label="$t('priority')" type="number"></v-text-field>
        <v-text-field v-model="createZramDeviceDialog.config.uuid" :label="$t('uuid')" readonly></v-text-field>
        <v-select v-if="createZramDeviceDialog.type === 'ramdisk'" v-model="createZramDeviceDialog.config.filesystem" :label="$t('filesystem')" :items="['ext4', 'xfs', 'btrfs']"></v-select>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" @click="createZramDeviceDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="createZramDevice()">{{ $t('create') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Change Zram Dialog -->
  <v-dialog v-model="changeZramDeviceDialog.value" max-width="600px">
    <v-card class="pa-0">
      <v-card-title>{{ $t('change zram device') }}</v-card-title>
      <v-card-text class="py-0" style="overflow-y: auto">
        <v-switch v-model="changeZramDeviceDialog.enabled" :label="$t('enabled')" inset color="green" density="compact"></v-switch>
        <v-text-field v-model="changeZramDeviceDialog.name" :label="$t('name')"></v-text-field>
        <v-select v-model="changeZramDeviceDialog.type" :label="$t('type')" :items="['swap', 'ramdisk']" required></v-select>
        <v-select v-model="changeZramDeviceDialog.algorithm" :label="$t('algorithm')" :items="zramAlgorithms" required></v-select>
        <v-text-field v-model="changeZramDeviceDialog.size" :label="$t('size')" required></v-text-field>
        <v-text-field v-model="changeZramDeviceDialog.config.priority" :label="$t('priority')" type="number"></v-text-field>
        <v-text-field v-model="changeZramDeviceDialog.config.uuid" :label="$t('uuid')" readonly></v-text-field>
        <v-select v-if="changeZramDeviceDialog.type === 'ramdisk'" v-model="changeZramDeviceDialog.config.filesystem" :label="$t('filesystem')" :items="['ext4', 'xfs', 'btrfs']"></v-select>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" @click="changeZramDeviceDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="changeZramDevice()">{{ $t('save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Cron Job Dialog -->
  <v-dialog v-model="deleteZramDeviceDialog.value" max-width="600px">
    <v-card class="pa-0">
      <v-card-title>{{ $t('delete zram device') }} - {{ deleteZramDeviceDialog.device.name }}</v-card-title>
      <v-card-text>
        <p>{{ $t('are you sure you want to delete the zram device') }}?</p>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" @click="deleteZramDeviceDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deleteZramDevice()">{{ $t('delete') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Floating Action Button -->
  <v-fab @click="openCreateZramDeviceDialog()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-plus</v-icon>
  </v-fab>

</template>

<script setup>
import { onMounted, ref, reactive } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const zram = ref({
  enabled: false,
  zram_devices: 0,
  devices: [],
});
const { overlay } = useOverlay();
const { t } = useI18n();
const createZramDeviceDialog = reactive({
  value: false,
  name: '',
  enabled: true,
  index: null,
  algorithm: 'zstd',
  size: '1G',
  type: 'swap',
  config: {
    priority: -2,
    uuid: null,
    filesystem: 'ext4',
  },
});
const changeZramDeviceDialog = reactive({
  value: false,
  id: '',
  name: '',
  enabled: true,
  index: null,
  algorithm: 'zstd',
  size: '1G',
  type: 'swap',
  config: {
    priority: -2,
    uuid: null,
    filesystem: 'ext4',
  },
});
const deleteZramDeviceDialog = reactive({
  value: false,
  device: null,
});
const zramAlgorithms = ref([]);

onMounted(() => {
  getZram();
  getZramAlogorithms();
});

const getZram = async () => {
  try {
    const res = await fetch('/api/v1/mos/zram', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('cron jobs could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }
    zram.value = await res.json();
  } catch (e) {
    zram.value.enabled = false;
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const createZramDevice = async () => {
  overlay.value = true;
  const payload = {
    name: createZramDeviceDialog.name,
    index: createZramDeviceDialog.index,
    algorithm: createZramDeviceDialog.algorithm,
    size: createZramDeviceDialog.size,
    type: createZramDeviceDialog.type,
    config: createZramDeviceDialog.config,
    enabled: createZramDeviceDialog.enabled,
  };
  try {
    const res = await fetch('/api/v1/mos/zram/devices', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('zram device could not be created')}|$| ${error.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('zram device created successfully'));
    createZramDeviceDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    getZram();
    overlay.value = false;
  }
};

const setZram = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/zram', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(zram.value),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('zram settings could not be set')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('zram settings set successfully'));

  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    getZram();
    overlay.value = false;
  }
};

const changeZramDevice = async () => {
  overlay.value = true;
  const payload = {
    name: changeZramDeviceDialog.name,
    algorithm: changeZramDeviceDialog.algorithm,
    size: changeZramDeviceDialog.size,
    config: changeZramDeviceDialog.config,
    enabled: changeZramDeviceDialog.enabled,
  };
  try {
    const res = await fetch('/api/v1/mos/zram/devices/' + changeZramDeviceDialog.id, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('zram device could not be changed')}|$| ${error.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('zram device changed successfully'));
    changeZramDeviceDialog.value = false;
    getZram();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const deleteZramDevice = async () => {
  overlay.value = true;
  try {
    const res = await fetch('/api/v1/mos/zram/devices/' + deleteZramDeviceDialog.device.id, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('zram device could not be deleted')}|$| ${error.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('zram device deleted successfully'));
    deleteZramDeviceDialog.value = false;
    getZram();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const getZramAlogorithms = async () => {
  try {
    const res = await fetch('/api/v1/mos/zram/algorithms', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('zram algorithms could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }
    zramAlgorithms.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const openCreateZramDeviceDialog = () => {
  createZramDeviceDialog.value = true;
  createZramDeviceDialog.name = '';
  createZramDeviceDialog.enabled = true;
  createZramDeviceDialog.index = null;
  createZramDeviceDialog.algorithm = 'zstd';
  createZramDeviceDialog.size = '1G';
  createZramDeviceDialog.type = 'ramdisk';
  createZramDeviceDialog.config = {
    priority: -2,
    uuid: null,
    filesystem: 'ext4',
  };
};

const openChangeZramDeviceDialog = (device) => {
  changeZramDeviceDialog.value = true;
  changeZramDeviceDialog.id = device.id;
  changeZramDeviceDialog.name = device.name;
  changeZramDeviceDialog.enabled = device.enabled;
  changeZramDeviceDialog.index = device.index;
  changeZramDeviceDialog.algorithm = device.algorithm;
  changeZramDeviceDialog.size = device.size;
  changeZramDeviceDialog.type = device.type;
  changeZramDeviceDialog.config = {
    priority: device.config.priority,
    uuid: device.config.uuid,
    filesystem: device.config.filesystem,
  };
};

const openDeleteZramDeviceDialog = (device) => {
  deleteZramDeviceDialog.value = true;
  deleteZramDeviceDialog.device = device;
};
</script>
