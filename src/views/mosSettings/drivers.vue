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
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('drivers') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <div v-for="(categories, driverType) in installedDrivers" :key="driverType">
          <v-card style="margin-bottom: 80px" class="pa-0 mb-4">
            <v-card-title>{{ driverType }}</v-card-title>
            <v-card-text>
              <v-list class="pa-0" style="background-color: transparent">
                <template v-for="(versions, category, index) in categories" :key="category">
                  <v-list-item>
                    <v-list-item-title>{{ category }}</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip v-for="version in versions" :key="version" class="ma-1" small>
                        {{ version }}
                      </v-chip>
                    </v-list-item-subtitle>
                    <template v-slot:append>
                      <v-btn variant="text" icon color="red" @click="removeDriver(category, versions[0])">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                  <v-divider v-if="index < Object.keys(categories).length - 1"></v-divider>
                </template>
              </v-list>
            </v-card-text>
          </v-card>
        </div>
        <v-card v-if="Object.keys(installedDrivers).length === 0" class="mb-4 ml-0 mr-0 pa-0">
          <v-card-text class="pa-4">
            <v-list class="pa-0" style="background-color: transparent">
              <v-list-item>
                <v-list-item-title>{{ $t('no drivers installed') }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Install Drivers Dialog -->
  <v-dialog v-model="updateDriversDialog.value" width="auto">
    <v-card max-width="600" prepend-icon="mdi-update" :title="t('install drivers')">
      <v-card-text>
        <p class="mb-4">{{ t('please select the driver you want to install!') }}</p>
        <v-select
          v-model="updateDriversDialog.driver"
          :items="getDrivers()"
          :label="t('driver')"
          @update:model-value="
            (val) => {
              updateDriversDialog.name = null;
              updateDriversDialog.version = null;
            }
          "
        />
        <v-select
          v-model="updateDriversDialog.name"
          :items="getNamesOfDriver()"
          :label="t('name')"
          @update:model-value="
            (val) => {
              updateDriversDialog.version = null;
            }
          "
        ></v-select>
        <v-select v-model="updateDriversDialog.version" :items="getVersionOfName()" :label="t('version')"></v-select>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" :text="t('cancel')" @click="updateDriversDialog.value = false"></v-btn>
        <v-btn color="onPrimary" :text="t('ok')" @click="updateDrivers()"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Floating Action Button -->
  <v-fab @click="openUpdateDriversDialog()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-plus</v-icon>
  </v-fab>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const installedDrivers = ref({});
const { t } = useI18n();
const mosDrivers = ref({});
const updateDriversDialog = reactive({
  value: false,
  driver: null,
  name: null,
  version: null,
});
const { overlay } = useOverlay();

onMounted(async () => {
  getInstalledDrivers();
  getMosDrivers();
});

const getInstalledDrivers = async () => {
  try {
    const res = await fetch('/api/v1/mos/installeddrivers', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('failed to fetch installed drivers')}|$| ${error.error || t('unknown error')}`);
    }

    const data = await res.json();
    installedDrivers.value = data;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getMosDrivers = async () => {
  try {
    const res = await fetch('/api/v1/mos/getdrivers', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('failed to fetch drivers')}|$| ${error.error || t('unknown error')}`);
    }

    const data = await res.json();
    mosDrivers.value = data;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const updateDrivers = async () => {
  const updateBody = {
    drivername: updateDriversDialog.name,
    driverversion: updateDriversDialog.version,
  };

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/drivers', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('driver install could not be initiated')}|$| ${error.error || t('unknown error')}`);
    }

    const result = await res.json();
    updateDriversDialog.value = false;
    showSnackbarSuccess(t('driver install initiated successfully'));
    getMosDrivers();
    getInstalledDrivers();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const removeDriver = async (driverName, driverVersion) => {
  const removeBody = {
    drivername: driverName,
    driverversion: driverVersion,
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/mos/drivers`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(removeBody),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('failed to remove driver')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('driver removed successfully'));
    getInstalledDrivers();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const getDrivers = () => {
  return Object.keys(mosDrivers.value);
};
const getNamesOfDriver = () => {
  return Object.keys(mosDrivers.value[updateDriversDialog.driver] || {});
};
const getVersionOfName = () => {
  if (!updateDriversDialog.driver || !updateDriversDialog.name) return [];
  const drivers = mosDrivers.value[updateDriversDialog.driver] || [];
  const names = drivers[updateDriversDialog.name] || [];
  return mosDrivers.value[updateDriversDialog.driver][updateDriversDialog.name] || [];
};

const openUpdateDriversDialog = () => {
  updateDriversDialog.value = true;
  clearUpdateDriversDialog();
};
const clearUpdateDriversDialog = () => {
  updateDriversDialog.driver = null;
  updateDriversDialog.name = null;
  updateDriversDialog.version = null;
};
</script>
