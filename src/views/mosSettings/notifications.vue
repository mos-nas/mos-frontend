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
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('notifications') }}</h2>
          </div>
        </v-row>
      </v-container>

      <v-container fluid class="pa-0">
        <v-card class="pa-0" style="margin-bottom: 80px">
          <v-card-text class="pt-0">
            <v-tabs v-if="providerNames.length > 0" v-model="selectedProvider" bg-color="transparent" color="primary" class="mb-3" show-arrows>
              <v-tab v-for="provider in providerNames" :key="`tab-${provider}`" :value="provider">
                <div class="d-flex align-center ga-2">
                  <span>{{ provider }}</span>
                  <v-chip size="x-small" :color="providers[provider]?.enabled ? 'green' : 'default'" variant="tonal">
                    {{ providers[provider]?.enabled ? $t('enabled') : $t('disabled') }}
                  </v-chip>
                </div>
              </v-tab>
              <v-tab value="add-provider" @click="showAddProviderDialog = true" class="ml-2">
                <v-icon>mdi-plus</v-icon>
              </v-tab>
            </v-tabs>

            <v-window v-if="providerNames.length > 0" v-model="selectedProvider">
              <v-window-item v-for="provider in providerNames" :key="`window-${provider}`" :value="provider">
                <v-switch v-model="providers[provider].enabled" :label="$t('enabled')" color="green" density="compact" inset hide-details="auto"></v-switch>
                <v-text-field v-model="providers[provider].user" :label="$t('user')" class="mt-4" hide-details="auto"></v-text-field>
                <v-text-field v-model="providers[provider].token" :label="$t('token')" class="mt-4" hide-details="auto"></v-text-field>
                <v-text-field v-model="providers[provider].url" :label="$t('url')" class="mt-4" hide-details="auto"></v-text-field>
                <v-select v-model="providers[provider].method" :items="getMethodOptions(provider)" :label="$t('method')" class="mt-4" hide-details="auto"></v-select>
                <v-textarea
                  v-model="jsonEditors[provider].headers"
                  :label="$t('headers (json)')"
                  class="mt-4"
                  rows="4"
                  auto-grow
                  density="compact"
                  hide-details="auto"
                  :error="!isJsonValid(provider, 'headers')"
                  :error-messages="!isJsonValid(provider, 'headers') ? $t('invalid json') : ''"
                ></v-textarea>
                <v-textarea
                  v-model="jsonEditors[provider].body"
                  :label="$t('body (json)')"
                  class="mt-4"
                  rows="7"
                  auto-grow
                  density="compact"
                  hide-details="auto"
                  :error="!isJsonValid(provider, 'body')"
                  :error-messages="!isJsonValid(provider, 'body') ? $t('invalid json') : ''"
                ></v-textarea>
                <v-textarea
                  v-model="jsonEditors[provider].alert_mapping"
                  :label="$t('alert mapping (json)')"
                  class="mt-4"
                  rows="4"
                  auto-grow
                  density="compact"
                  hide-details="auto"
                  :error="!isJsonValid(provider, 'alert_mapping')"
                  :error-messages="!isJsonValid(provider, 'alert_mapping') ? $t('invalid json') : ''"
                ></v-textarea>
                <v-textarea
                  v-model="jsonEditors[provider].color_prio"
                  :label="$t('color priority (json)')"
                  class="mt-4"
                  rows="4"
                  auto-grow
                  density="compact"
                  hide-details="auto"
                  :error="!isJsonValid(provider, 'color_prio')"
                  :error-messages="!isJsonValid(provider, 'color_prio') ? $t('invalid json') : ''"
                ></v-textarea>

                <div class="mt-6">
                  <v-btn color="red" variant="text" size="small" @click="confirmDeleteProvider(provider)" prepend-icon="mdi-delete">
                    {{ $t('delete provider') }}
                  </v-btn>
                </div>
              </v-window-item>
            </v-window>

            <v-alert v-else type="info" variant="tonal" density="comfortable">
              {{ $t('no providers available') }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <v-fab @click="setNotificationProviders()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-content-save</v-icon>
  </v-fab>

  <v-dialog v-model="showAddProviderDialog" max-width="500">
    <v-card :title="$t('create new provider')" prepend-icon="mdi-plus">
      <v-card-text>
        <v-text-field
          v-model="newProviderName"
          :label="$t('provider name')"
          outlined
          hide-details="auto"
          @keyup.enter="createNewProvider()"
        ></v-text-field>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" variant="text" @click="showAddProviderDialog = false; newProviderName = ''">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="createNewProvider()">{{ $t('create') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showDeleteDialog" max-width="500">
    <v-card :title="$t('delete provider')" prepend-icon="mdi-delete">
      <v-card-text>
        {{ $t('are you sure you want to delete provider') }} <strong>{{ providerToDelete }}</strong>?
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" variant="text" @click="showDeleteDialog = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deleteProvider()">{{ $t('delete') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { t } = useI18n();

const overlay = ref(false);
const providers = ref({});
const jsonEditors = ref({});
const selectedProvider = ref(null);
const showAddProviderDialog = ref(false);
const newProviderName = ref('');
const showDeleteDialog = ref(false);
const providerToDelete = ref(null);
const originalProviderNames = ref(new Set());
const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const providerNames = computed(() => Object.keys(providers.value));

const templates = () => ({
  Discord: {
    enabled: false,
    user: '',
    token: '',
    url: 'https://discord.com/api/webhooks/123456789012345678/ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      embeds: [
        {
          title: '{{.Title}}',
          description: '{{.Message}}',
          color: {
            $number: '{{.Color}}',
          },
        },
      ],
    },
    alert_mapping: {},
    color_prio: {
      normal: '5763719',
      warning: '16776960',
      alert: '15158332',
    },
  },
  Pushbits: {
    enabled: false,
    user: '',
    token: 'yourToken',
    url: 'http://pushbits.yourserver.net/message?token={{.Token}}',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      title: '{{.Title}}',
      message: '{{.Message}}',
      priority: {
        $number: '{{.Priority}}',
      },
    },
    alert_mapping: {},
    color_prio: {},
  },
});

onMounted(() => {
  getNotificationProviders();
  document.documentElement.style.overflowY = 'scroll';
});

const initializeEditors = (data) => {
  providers.value = JSON.parse(JSON.stringify(data || {}));
  originalProviderNames.value = new Set(Object.keys(providers.value));
  const nextEditors = {};

  for (const providerName of Object.keys(providers.value)) {
    const provider = providers.value[providerName] || {};
    nextEditors[providerName] = {
      headers: JSON.stringify(provider.headers ?? {}, null, 2),
      body: JSON.stringify(provider.body ?? {}, null, 2),
      alert_mapping: JSON.stringify(provider.alert_mapping ?? {}, null, 2),
      color_prio: JSON.stringify(provider.color_prio ?? {}, null, 2),
    };
  }

  jsonEditors.value = nextEditors;
  const names = Object.keys(providers.value);
  if (names.length > 0 && (!selectedProvider.value || !providers.value[selectedProvider.value])) {
    selectedProvider.value = names[0];
  }
};

const applyDefaultTemplate = () => {
  initializeEditors(templates());
  showSnackbarSuccess(t('provider template applied'));
};

const createNewProvider = async () => {
  if (!newProviderName.value.trim()) {
    showSnackbarError(t('provider name required'));
    return;
  }

  const name = newProviderName.value.trim();
  const nameLower = name.toLowerCase();

  if (providers.value[nameLower]) {
    showSnackbarError(t('provider already exists'));
    return;
  }

  try {
    overlay.value = true;
    const newProvider = {
      name: nameLower,
      enabled: false,
      user: '',
      token: '',
      url: '',
      method: 'POST',
      headers: {},
      body: {},
      alert_mapping: {},
      color_prio: {},
    };

    const res = await fetch('/api/v1/mos/settings/notifications/providers', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProvider),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('unknown error'));
    }

    providers.value[nameLower] = newProvider;
    originalProviderNames.value.add(nameLower);
    jsonEditors.value[nameLower] = {
      headers: JSON.stringify({}, null, 2),
      body: JSON.stringify({}, null, 2),
      alert_mapping: JSON.stringify({}, null, 2),
      color_prio: JSON.stringify({}, null, 2),
    };

    selectedProvider.value = nameLower;
    showAddProviderDialog.value = false;
    newProviderName.value = '';
    showSnackbarSuccess(t('provider created'));
  } catch (e) {
    showSnackbarError(t('provider could not be created'), e.message);
  } finally {
    overlay.value = false;
  }
};

const confirmDeleteProvider = (providerName) => {
  providerToDelete.value = providerName;
  showDeleteDialog.value = true;
};

const deleteProvider = async () => {

  try {
    overlay.value = true;
    const providerName = providerToDelete.value;

    const res = await fetch(`/api/v1/mos/settings/notifications/providers/${providerName}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('unknown error'));
    }

    // Remove from local state
    delete providers.value[providerName];
    delete jsonEditors.value[providerName];
    originalProviderNames.value.delete(providerName);

    if (selectedProvider.value === providerName) {
      const remainingProviders = Object.keys(providers.value);
      selectedProvider.value = remainingProviders.length > 0 ? remainingProviders[0] : null;
    }

    showDeleteDialog.value = false;
    providerToDelete.value = null;
    showSnackbarSuccess(t('provider deleted'));
  } catch (e) {
    showSnackbarError(t('provider could not be deleted'), e.message);
  } finally {
    overlay.value = false;
  }
};

const safeParse = (value) => {
  try {
    return { value: JSON.parse(value), valid: true };
  } catch {
    return { value: null, valid: false };
  }
};

const isJsonValid = (providerName, fieldName) => {
  const providerEditor = jsonEditors.value[providerName];
  if (!providerEditor || typeof providerEditor[fieldName] !== 'string') {
    return true;
  }
  return safeParse(providerEditor[fieldName]).valid;
};

const getMethodOptions = (providerName) => {
  const currentMethod = providers.value[providerName]?.method;
  if (currentMethod && !httpMethods.includes(currentMethod)) {
    return [currentMethod, ...httpMethods];
  }
  return httpMethods;
};

const buildPayload = () => {
  const payloads = [];
  const invalidFields = [];

  for (const providerName of Object.keys(providers.value)) {
    const provider = providers.value[providerName];
    const editorFields = jsonEditors.value[providerName] || {};
    const parseHeaders = safeParse(editorFields.headers ?? '{}');
    const parseBody = safeParse(editorFields.body ?? '{}');
    const parseAlertMapping = safeParse(editorFields.alert_mapping ?? '{}');
    const parseColorPrio = safeParse(editorFields.color_prio ?? '{}');

    if (!parseHeaders.valid) invalidFields.push(`${providerName}: headers`);
    if (!parseBody.valid) invalidFields.push(`${providerName}: body`);
    if (!parseAlertMapping.valid) invalidFields.push(`${providerName}: alert_mapping`);
    if (!parseColorPrio.valid) invalidFields.push(`${providerName}: color_prio`);

    if (invalidFields.length === 0) {
      payloads.push({
        name: providerName.toLowerCase(),
        enabled: provider.enabled ?? false,
            user: provider.user ?? '',
        token: provider.token ?? '',
        url: provider.url ?? '',
        method: provider.method ?? 'POST',
        headers: parseHeaders.value,
        body: parseBody.value,
        alert_mapping: parseAlertMapping.value,
        color_prio: parseColorPrio.value,
      });
    }
  }

  if (invalidFields.length > 0) {
    throw new Error(`${t('invalid provider json')}|$|${invalidFields.join(', ')}`);
  }

  return payloads;
};

const getNotificationProviders = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/settings/notifications/providers', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('notification providers could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const data = await res.json();
    let providersData = {};

    if (Array.isArray(data)) {
      for (const provider of data) {
        const name = provider.name || Object.keys(provider)[0];
        providersData[name] = provider;
      }
    } else if (data && typeof data === 'object') {
      providersData = data;
    }

    if (!providersData || Object.keys(providersData).length === 0) {
      initializeEditors(templates());
      return;
    }

    initializeEditors(providersData);
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const setNotificationProviders = async () => {
  try {
    overlay.value = true;
    const payloads = buildPayload();

    for (const payload of payloads) {
      const providerName = payload.name;
      const res = await fetch(`/api/v1/mos/settings/notifications/providers/${providerName}`, {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('authToken'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(`${t('notification providers could not be saved')}|$| ${error.error || t('unknown error')}`);
      }
    }

    showSnackbarSuccess(t('notification providers saved successfully'));
    emit('refresh-drawer');
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

watch(
  providerNames,
  (names) => {
    if (names.length === 0) {
      selectedProvider.value = null;
      return;
    }

    if (!selectedProvider.value || !providers.value[selectedProvider.value]) {
      selectedProvider.value = names[0];
    }
  },
  { immediate: true },
);
</script>
