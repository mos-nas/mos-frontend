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
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('sensors') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
          <v-skeleton-loader v-if="sensorsLoading" type="card" />
          <v-card v-else class="pa-0" style="margin-bottom: 80px">
            <v-row class="pa-4 pb-0">
                <v-col cols="12">
                    <v-text-field v-model="searchQuery"
                                :label="$t('search')"
                                prepend-inner-icon="mdi-magnify"
                                variant="outlined"
                                hide-details
                                single-line
                                clearable />
                </v-col>
            </v-row>
            <v-card-text class="pa-0">
              <v-data-table v-model:sort-by="sortedBy"
                            :headers="allSensorsHeaders"
                            :items="filteredAllSensors"
                            :items-per-page="25"
                            density="compact"
                            class="sensors-table bg-transparent mt-4">
                  <template #item.name="{ item }">
                      <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px">
                          {{ item.name }}
                      </div>
                  </template>
                  <template #item.type="{ item }">
                      {{ item.type }}
                  </template>
                  <template #item.subtype="{ item }">
                      {{ item.subtype || '-' }}
                  </template>
                  <template #item.manufacturer="{ item }">
                      {{ item.manufacturer || '-' }}
                  </template>
                  <template #item.model="{ item }">
                      {{ item.model || '-' }}
                  </template>
                  <template #item.value="{ item }">
                      <span class="text-right">
                          {{ item.value === '' || item.value === null || item.value === undefined ? '-' : formatValue(item.value) }}
                      </span>
                  </template>
                  <template #item.actions="{ item }">
                      <div class="d-flex">
                          <v-btn icon variant="text" size="small" @click="editSensor(item)">
                              <v-icon size="18">mdi-pencil</v-icon>
                          </v-btn>
                          <v-btn icon variant="text" size="small" @click="deleteSensor(item)">
                              <v-icon size="18">mdi-delete</v-icon>
                          </v-btn>
                      </div>
                  </template>
              </v-data-table>
            </v-card-text>
          </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Floating Action Button with Menu -->
  <v-menu location="top">
    <template v-slot:activator="{ props }">
      <v-fab v-bind="props" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
        <v-icon color="onPrimary">mdi-dots-vertical</v-icon>
      </v-fab>
    </template>
    <v-list>
      <v-list-item @click="editView()">
        <template v-slot:prepend>
          <v-icon>mdi-cog</v-icon>
        </template>
        <v-list-item-title>{{ $t('edit view') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="openCreateSensorDialog()">
        <template v-slot:prepend>
          <v-icon>mdi-plus</v-icon>
        </template>
        <v-list-item-title>{{ $t('create sensor') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

  <!-- Create Sensor Dialog -->
  <v-dialog v-model="createSensorDialog.value" max-width="1200">
    <v-card class="pa-0">
      <v-card-title>{{ $t('create sensor') }}</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-form>
                <v-text-field v-model="createSensorDialog.name" clearable>
                    <template #label>
                        <span>{{ $t('name') }} <span style="color: red" aria-hidden="true">*</span></span>
                    </template>
                </v-text-field>
                <v-select v-model="createSensorDialog.type" :items="sensorTypes" density="comfortable">
                    <template #label>
                        <span>{{ $t('type') }} <span style="color: red" aria-hidden="true">*</span></span>
                    </template>
                </v-select>
                <v-select v-model="createSensorDialog.subtype" :items="sensorSubtypes" density="comfortable">
                <template #label>
                        <span>{{ $t('subtype') }} <span style="color: red" aria-hidden="true">*</span></span>
                    </template>
                </v-select>
                <v-autocomplete v-model="createSensorDialog.source"
                                :items="unmappedOptions"
                                item-title="title"
                                item-value="value"
                                density="comfortable"
                                hide-details="auto"
                                clearable
                                :loading="unmappedLoading">
                    <template #label>
                        <span>{{ $t('source') }} <span style="color: red" aria-hidden="true">*</span></span>
                    </template>
                </v-autocomplete>
                <v-text-field v-model="createSensorDialog.unit" clearable class="mt-4">
                    <template #label>
                        <span>{{ $t('unit') }} <span style="color: red" aria-hidden="true">*</span></span>
                    </template>
                </v-text-field>
                <v-text-field v-model="createSensorDialog.multiplier" :label="$t('multiplier')" clearable />
                <v-text-field v-model="createSensorDialog.divisor" :label="$t('divisor')" clearable />
                <v-text-field v-model="createSensorDialog.manufacturer" :label="$t('manufacturer')" clearable />
                <v-text-field v-model="createSensorDialog.model" :label="$t('model')" clearable />
                <div class="text-caption text-medium-emphasis">
                    <small><span style="color: red" aria-hidden="true">*</span> {{ $t('required') }}</small>
                </div>
            </v-form>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis mb-2">
              <strong>{{ $t('unmapped sensors') }}</strong>
            </div>
            <v-textarea
              :model-value="unmappedRawJSON"
              readonly
              variant="outlined"
              rows="25"
              style="font-family: monospace; font-size: 12px;"
              no-resize
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions style="position: sticky; bottom: 0; z-index: 2; background: var(--v-theme-surface, #fff);">
        <v-btn @click="createSensorDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="createSensor()" color="onPrimary">{{ $t('create') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Edit Sensor Dialog -->
  <v-dialog v-model="editSensorDialog.value" max-width="1200">
    <v-card class="pa-0">
      <v-card-title>{{ $t('edit sensor') }}</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-form>
                <v-text-field v-model="editSensorDialog.name" clearable>
                    <template #label>
                        <span>{{ $t('name') }} <span style="color: red" aria-hidden="true">*</span></span>
                    </template>
                </v-text-field>
                <v-select v-model="editSensorDialog.type" :items="sensorTypes" density="comfortable">
                    <template #label>
                        <span>{{ $t('type') }} <span style="color: red" aria-hidden="true">*</span></span>
                    </template>
                </v-select>
                <v-select v-model="editSensorDialog.subtype" :items="sensorSubtypes" density="comfortable">
                <template #label>
                        <span>{{ $t('subtype') }} <span style="color: red" aria-hidden="true">*</span></span>
                    </template>
                </v-select>
                <v-autocomplete v-model="editSensorDialog.source"
                                :items="unmappedOptions"
                                item-title="title"
                                item-value="value"
                                density="comfortable"
                                hide-details="auto"
                                clearable
                                :loading="unmappedLoading">
                    <template #label>
                        <span>{{ $t('source') }} <span style="color: red" aria-hidden="true">*</span></span>
                    </template>
                </v-autocomplete>
                <v-text-field v-model="editSensorDialog.unit" clearable class="mt-4">
                    <template #label>
                        <span>{{ $t('unit') }} <span style="color: red" aria-hidden="true">*</span></span>
                    </template>
                </v-text-field>
                <v-text-field v-model="editSensorDialog.multiplier" :label="$t('multiplier')" clearable />
                <v-text-field v-model="editSensorDialog.divisor" :label="$t('divisor')" clearable />
                <v-text-field v-model="editSensorDialog.manufacturer" :label="$t('manufacturer')" clearable />
                <v-text-field v-model="editSensorDialog.model" :label="$t('model')" clearable />
                <div class="text-caption text-medium-emphasis">
                    <small><span style="color: red" aria-hidden="true">*</span> {{ $t('required') }}</small>
                </div>
            </v-form>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis mb-2">
              <strong>{{ $t('unmapped sensors') }}</strong>
            </div>
            <v-textarea
              :model-value="unmappedRawJSON"
              readonly
              variant="outlined"
              rows="20"
              style="font-family: monospace; font-size: 12px;"
              no-resize
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions style="position: sticky; bottom: 0; z-index: 2; background: var(--v-theme-surface, #fff);">
        <v-btn @click="editSensorDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="updateSensor()" color="onPrimary">{{ $t('save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- View Settings Dialog -->
  <v-dialog v-model="viewSettingsDialog" max-width="600">
    <v-card class="pa-0">
      <v-card-title>{{ $t('edit view') }}</v-card-title>
      <v-card-text>
        <v-form>
            <v-checkbox v-model="viewSettings.index" :label="$t('index')" hide-details />
            <v-checkbox v-model="viewSettings.name" :label="$t('name')" disabled hide-details />
            <v-checkbox v-model="viewSettings.type" :label="$t('type')" hide-details />
            <v-checkbox v-model="viewSettings.subtype" :label="$t('subtype')" hide-details />
            <v-checkbox v-model="viewSettings.manufacturer" :label="$t('manufacturer')" hide-details />
            <v-checkbox v-model="viewSettings.model" :label="$t('model')" hide-details />
            <v-checkbox v-model="viewSettings.value" :label="$t('value')" hide-details />
            <v-checkbox v-model="viewSettings.unit" :label="$t('unit')" hide-details />
            <v-checkbox v-model="viewSettings.actions" :label="$t('actions')" disabled hide-details />
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions style="position: sticky; bottom: 0; z-index: 2; background: var(--v-theme-surface, #fff);">
        <v-btn @click="viewSettingsDialog = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="saveViewSettings()" color="onPrimary">{{ $t('save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { overlay } = useOverlay();
const sensorsLoading = ref(true);
const { t } = useI18n();

const sensors = ref({
  fan: [],
  temperature: [],
  power: [],
  voltage: [],
  psu: [],
  other: [],
});

const preferredOrder = ['fan', 'temperature', 'power', 'voltage', 'psu', 'other'];
const subtypeOrder = ['voltage', 'wattage', 'temperature', 'speed', 'percentage', 'mode'];

const sensorTypes = ['fan', 'temperature', 'power', 'voltage', 'psu', 'other'];
const sensorSubtypes = ['voltage', 'wattage', 'temperature', 'speed', 'percentage', 'mode'];

const createSensorDialog = ref({
  value: false,
  name: '',
  manufacturer: null,
  model: null,
  subtype: null,
  type: null,
  source: '',
  unit: '',
  multiplier: null,
  divisor: null,
  enabled: true,
});

const editSensorDialog = ref({
  value: false,
  id: null,
  name: '',
  manufacturer: null,
  model: null,
  subtype: null,
  type: null,
  source: '',
  unit: '',
  multiplier: null,
  divisor: null,
  enabled: true,
});

const viewSettingsDialog = ref(false);
const viewSettings = ref({
  index: true,
  name: true,
  type: true,
  subtype: true,
  manufacturer: true,
  model: true,
  value: true,
  unit: true,
  actions: true,
});

function formatValue(v) {
  if (v === null || v === undefined) return '-';
  if (typeof v === 'number') {
    if (Number.isNaN(v)) return '-';
    return v.toFixed(1);
  }
  return v;
}

const sortedBy = ref([{ key: 'type', order: 'asc' }])
const searchQuery = ref('');

const allSensors = computed(() => {
    const all = [];
    const obj = sensors.value ?? {};

    for (const [type, items] of Object.entries(obj)) {
        if (Array.isArray(items)) {
            items.forEach(item => {
                all.push({
                    ...item,
                    type: type
                });
            });
        }
    }

    return all.sort((a, b) => {
        const aIndex = typeof a?.index === 'number' ? a.index : Infinity;
        const bIndex = typeof b?.index === 'number' ? b.index : Infinity;
        if (aIndex !== bIndex) return aIndex - bIndex;
        return (a?.name || '').localeCompare(b?.name || '');
    });
});

const filteredAllSensors = computed(() => {
    if (!searchQuery.value) return allSensors.value;

    const query = searchQuery.value.toLowerCase();
    return allSensors.value.filter(sensor => {
        return (
            sensor.name?.toLowerCase().includes(query) ||
            sensor.type?.toLowerCase().includes(query) ||
            sensor.subtype?.toLowerCase().includes(query) ||
            sensor.manufacturer?.toLowerCase().includes(query) ||
            sensor.model?.toLowerCase().includes(query) ||
            sensor.unit?.toLowerCase().includes(query)
        );
    });
});

const allSensorsHeaders = computed(() => {
  const headers = [
    { title: '#', key: 'index', width: 60, visible: viewSettings.value.index },
    { title: t('name'), key: 'name', visible: viewSettings.value.name },
    { title: t('type'), key: 'type', width: 100, visible: viewSettings.value.type },
    { title: t('subtype'), key: 'subtype', width: 120, visible: viewSettings.value.subtype },
    { title: t('manufacturer'), key: 'manufacturer', visible: viewSettings.value.manufacturer },
    { title: t('model'), key: 'model', visible: viewSettings.value.model },
    { title: t('value'), key: 'value', align: 'end', width: 100, visible: viewSettings.value.value },
    { title: t('unit'), key: 'unit', width: 80, visible: viewSettings.value.unit },
    { title: '', key: 'actions', sortable: false, width: 100, visible: viewSettings.value.actions }
  ];

  return headers.filter(h => h.visible);
});

const unmappedLoading = ref(false);
const unmappedRaw = ref(null);

const unmappedRawJSON = computed(() => {
  if (!unmappedRaw.value) return '';
  return JSON.stringify(unmappedRaw.value, null, 2);
});

const unmappedOptions = computed(() => {
  const root = unmappedRaw.value;
  if (!root || typeof root !== 'object') return [];
  const out = [];

  // Recursively traverse the sensor tree structure to extract all leaf nodes
  // Supports arbitrary nesting depth
  const traverse = (obj, path = []) => {
    for (const [key, val] of Object.entries(obj)) {
      const currentPath = [...path, key];

      // Skip "Adapter" keys as they don't contain sensor data
      if (key === 'Adapter') continue;

      // If value is an object, recurse deeper into the tree
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        traverse(val, currentPath);
      } else {
        // Leaf node found - create an option entry
        const pathString = currentPath.join('.');
        const valTxt = typeof val === 'number' ? ` = ${Number(val).toFixed(2).replace(/\.00$/, '')}` : '';

        out.push({
          value: pathString,
          title: `${pathString}${valTxt}`,
        });
      }
    }
  };

  traverse(root);
  return out.sort((a, b) => a.title.localeCompare(b.title));
});

async function getUnmappedSensors() {
  try {
    unmappedLoading.value = true;
    const res = await fetch('/api/v1/mos/sensors/unmapped', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('authToken') },
    });
    if (!res.ok) throw new Error(t('unmapped sensors could not be loaded'));
    unmappedRaw.value = await res.json();
  } catch (e) {
    showSnackbarError(e.message);
  } finally {
    unmappedLoading.value = false;
  }
}

async function openCreateSensorDialog() {
  createSensorDialog.value.value = true;
  if (!unmappedRaw.value) await getUnmappedSensors();
}

const editSourceOptions = computed(() => {
  const cur = (editSensorDialog.value.source || '').trim();
  const base = unmappedOptions.value || [];

  if (!cur) return base;

  const exists = base.some((x) => x?.value === cur);
  if (exists) return base;

  return [{ value: cur, title: cur }, ...base];
});

const getSensorDetails = async (id) => {
  try {
    const res = await fetch('/api/v1/mos/sensors/config', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('authToken') },
    });

    if (!res.ok) throw new Error(t('sensor details could not be loaded'));

    const cfg = await res.json();

    for (const [typeKey, arr] of Object.entries(cfg || {})) {
      if (!Array.isArray(arr)) continue;
      const found = arr.find((x) => String(x?.id) === String(id));
      if (found) return { ...found, type: typeKey };
    }

    throw new Error(t('sensor not found'));
  } catch (e) {
    showSnackbarError(e.message);
    return null;
  }
};

const editSensor = async (s) => {
  if (!s?.id) {
    showSnackbarError(t('missing sensor id'));
    return;
  }

  if (!unmappedRaw.value) await getUnmappedSensors();

  const details = await getSensorDetails(s.id);
  if (!details) return;

  editSensorDialog.value.id = details.id;
  editSensorDialog.value.name = details.name ?? '';
  editSensorDialog.value.manufacturer = details.manufacturer ?? '';
  editSensorDialog.value.model = details.model ?? '';
  editSensorDialog.value.subtype = details.subtype ?? '';
  editSensorDialog.value.type = details.type ?? null;
  editSensorDialog.value.source = details.source ?? '';
  editSensorDialog.value.unit = details.unit ?? '';
  editSensorDialog.value.multiplier = details.multiplier ?? '';
  editSensorDialog.value.divisor = details.divisor ?? '';
  editSensorDialog.value.enabled = details.enabled ?? true;

  editSensorDialog.value.value = true;
};

const updateSensor = async () => {
  const id = editSensorDialog.value.id;
  if (!id) {
    showSnackbarError(t('missing sensor id'));
    return;
  }

  if (!editSensorDialog.value.name?.trim()) {
    showSnackbarError(t('name is required'));
    return;
  }
  if (!editSensorDialog.value.type) {
    showSnackbarError(t('type is required'));
    return;
  }
  if (!editSensorDialog.value.subtype) {
    showSnackbarError(t('subtype is required'));
    return;
  }
  if (!editSensorDialog.value.source?.trim()) {
    showSnackbarError(t('source is required'));
    return;
  }
  if (!editSensorDialog.value.unit?.trim()) {
    showSnackbarError(t('unit is required'));
    return;
  }

  const payload = {
    name: editSensorDialog.value.name.trim(),
    manufacturer: editSensorDialog.value.manufacturer || null,
    model: editSensorDialog.value.model || null,
    subtype: editSensorDialog.value.subtype,
    type: editSensorDialog.value.type,
    source: editSensorDialog.value.source.trim(),
    unit: editSensorDialog.value.unit.trim(),
    multiplier: editSensorDialog.value.multiplier || null,
    divisor: editSensorDialog.value.divisor || null,
    enabled: true,
  };

  try {
    overlay.value = true;

    const res = await fetch(`/api/v1/mos/sensors/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorDetails = await res.json().catch(() => ({}));
      throw new Error(`${t('sensor could not be updated')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('sensor updated successfully'));
    editSensorDialog.value.value = false;
    await getSensors();
  } catch (e) {
    const [userMessage, apiErrorMessage] = String(e.message || e).split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

async function deleteSensor(s) {
  const id = s?.id;
  if (!id) {
    showSnackbarError(t('missing sensor id'));
    return;
  }

  try {
    overlay.value = true;

    const res = await fetch(`/api/v1/mos/sensors/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json().catch(() => ({}));
      throw new Error(`${t('sensor could not be deleted')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('sensor deleted successfully'));
    await getSensors();
  } catch (e) {
    const [userMessage, apiErrorMessage] = String(e.message || e).split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
}

async function createSensor() {
  if (!createSensorDialog.value.name?.trim()) {
    showSnackbarError(t('name is required'));
    return;
  }
  if (!createSensorDialog.value.type) {
    showSnackbarError(t('type is required'));
    return;
  }
  if (!createSensorDialog.value.subtype) {
    showSnackbarError(t('subtype is required'));
    return;
  }
  if (!createSensorDialog.value.source?.trim()) {
    showSnackbarError(t('source is required'));
    return;
  }
  if (!createSensorDialog.value.unit?.trim()) {
    showSnackbarError(t('unit is required'));
    return;
  }

  const payload = [
    {
      name: createSensorDialog.value.name.trim(),
      manufacturer: createSensorDialog.value.manufacturer || null,
      model: createSensorDialog.value.model || null,
      subtype: createSensorDialog.value.subtype || null,
      type: createSensorDialog.value.type,
      source: createSensorDialog.value.source.trim(),
      unit: createSensorDialog.value.unit.trim(),
      multiplier: createSensorDialog.value.multiplier || null,
      divisor: createSensorDialog.value.divisor || null,
      enabled: true,
    },
  ];

  try {
    overlay.value = true;

    const res = await fetch('/api/v1/mos/sensors', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorDetails = await res.json().catch(() => ({}));
      throw new Error(`${t('sensor could not be created')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('sensor created successfully'));

    createSensorDialog.value.value = false;
    createSensorDialog.value.name = '';
    createSensorDialog.value.manufacturer = '';
    createSensorDialog.value.model = '';
    createSensorDialog.value.subtype = '';
    createSensorDialog.value.type = null;
    createSensorDialog.value.source = '';
    createSensorDialog.value.unit = '';
    createSensorDialog.value.multiplier = null;
    createSensorDialog.value.divisor = null;
    createSensorDialog.value.enabled = true;

    await getSensors();
  } catch (e) {
    const [userMessage, apiErrorMessage] = String(e.message || e).split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
}

onMounted(() => {
  getSensors();
  loadViewSettings();
});

const getSensors = async () => {
  try {
    sensorsLoading.value = true;

    const res = await fetch('/api/v1/mos/sensors', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error(t('sensor mappings could not be loaded'));

    sensors.value = await res.json();
  } catch (e) {
    showSnackbarError(e.message);
  } finally {
    sensorsLoading.value = false;
  }
};

const loadViewSettings = async () => {
  try {
    const res = await fetch('/api/v1/mos/sensors/view', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      return;
    }

    const settings = await res.json();

    if (settings && typeof settings === 'object') {
      viewSettings.value = {
        index: settings.index !== undefined ? settings.index : true,
        name: true,
        type: settings.type !== undefined ? settings.type : true,
        subtype: settings.subtype !== undefined ? settings.subtype : true,
        manufacturer: settings.manufacturer !== undefined ? settings.manufacturer : true,
        model: settings.model !== undefined ? settings.model : true,
        value: settings.value !== undefined ? settings.value : true,
        unit: settings.unit !== undefined ? settings.unit : true,
        actions: true,
      };
    }
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const saveViewSettings = async () => {
  try {
    overlay.value = true;

    const res = await fetch('/api/v1/mos/sensors/view', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(viewSettings.value),
    });

    if (!res.ok) {
      throw new Error(t('view settings could not be saved'));
    }

    showSnackbarSuccess(t('view settings saved successfully'));
    viewSettingsDialog.value = false;
  } catch (e) {
    showSnackbarError(e.message);
  } finally {
    overlay.value = false;
  }
};

const editView = () => {
  viewSettingsDialog.value = true;
};

const sections = computed(() => {
  const obj = sensors.value ?? {};
  const keys = Object.keys(obj);

  const ordered = [...preferredOrder.filter((k) => keys.includes(k)), ...keys.filter((k) => !preferredOrder.includes(k))];

  return ordered.map((key) => ({
    key,
    title: key.toUpperCase(),
    items: Array.isArray(obj[key]) ? obj[key] : [],
  }));
});
</script>

<style scoped>
.sensors-table :deep(thead tr) {
  background-color: rgba(0, 0, 0, 0.04);
}

.sensors-table :deep(th) {
  white-space: nowrap;
  padding: 4px 8px !important;
  vertical-align: middle;
}

.sensors-table :deep(td) {
  padding: 4px 8px !important;
  vertical-align: middle;
}

.sensors-table :deep(th:first-child),
.sensors-table :deep(td:first-child) {
  padding-left: 16px !important;
}
</style>
