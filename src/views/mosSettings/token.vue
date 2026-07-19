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
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('token') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <v-card class="px-0" style="margin-bottom: 80px">
          <v-card-text class="pt-0">
            <v-row class="mt-2">
              <v-col cols="12" class="d-flex align-center justify-space-between py-0">
                <span class="text-title-medium font-weight-medium">{{ $t('mos admin api token') }}</span>
                <v-btn
                  variant="text"
                  size="small"
                  color="green"
                  class="ma-1 pa-0 float-right"
                  style="min-width: 0"
                  @click="openAdminTokenDialog()"
                  :title="$t('add admin api token')"
                  :aria-label="$t('add admin api token')"
                >
                  <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                  {{ $t('add') }}
                </v-btn>
              </v-col>
            </v-row>
            <v-card v-for="token in adminToken" :key="token.id" class="mt-4 pa-0">
              <v-card-title class="d-flex justify-space-between align-center">
                <div>
                  {{ token.name }}
                  <v-chip v-if="token.description" class="ml-2" size="small">{{ token.permissions.mode}}</v-chip>
                </div>
              </v-card-title>
              <v-card-subtitle v-if="token.description" class="pt-0 pb-0">{{ token.description }}</v-card-subtitle>
              <v-divider class="my-2"></v-divider>
              <v-card-text class="pb-0">
                <v-text-field
                  v-model="token.token"
                  :type="showPassword ? 'text' : 'password'"
                  readonly
                  :label="$t('token')"
                  hide-details="auto"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPassword = !showPassword"
                />
              </v-card-text>
              <v-card-actions>
                <v-row class="d-flex justify-end">
                  <v-btn variant="text" color="onPrimary" size="small" @click="copyAuthToken(token.token)" class="mr-4" prepend-icon="mdi-content-copy">
                    {{ $t('copy') }}
                  </v-btn>
                  <v-btn color="red" size="small" @click="deleteAdminToken(token.id)" class="mr-4" prepend-icon="mdi-delete">
                    {{ $t('delete') }}
                  </v-btn>
                </v-row>
              </v-card-actions>
            </v-card>
            <div class="mt-4" v-if="adminToken.length === 0">{{ $t('no admin api token created') }}</div>
          </v-card-text>

          <v-divider class="my-2"></v-divider>

          <v-card-text class="pt-0 pb-0">
            <v-row class="mt-2 mb-4">
              <v-col cols="12" class="d-flex align-center justify-space-between py-0">
                <span class="text-title-medium font-weight-medium">{{ $t('client token') }}</span>
              </v-col>
            </v-row>
            <v-text-field
              v-model="clientToken.github"
              :type="showPasswortGithub ? 'text' : 'password'"
              :label="$t('github token')"
              :append-inner-icon="showPasswortGithub ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPasswortGithub = !showPasswortGithub"
            />
            <v-text-field
              v-model="clientToken.dockerhub"
              :type="showPasswortDockerhub ? 'text' : 'password'"
              :label="$t('dockerhub token')"
              hide-details="auto"
              :append-inner-icon="showPasswortDockerhub ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPasswortDockerhub = !showPasswortDockerhub"
            />
          </v-card-text>
          <v-card-actions>
            <v-row class="d-flex justify-end mt-0">
              <v-btn variant="text" color="onPrimary" size="small" @click="validateClientToken()" class="mr-4" prepend-icon="mdi-check">
                {{ $t('validate') }}
              </v-btn>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Create Admin Token Dialog -->
  <v-dialog v-model="createAdminTokenDialog.value" max-width="600" scrollable>
    <v-card class="pa-0" :title="$t('create admin api token')" prepend-icon="mdi-key">
      <v-card-text class="pt-2">
        <v-text-field v-model="createAdminTokenDialog.name" :label="$t('name')" required></v-text-field>
        <v-text-field v-model="createAdminTokenDialog.description" :label="$t('description')"></v-text-field>
        <v-select v-model="createAdminTokenDialog.permissions.mode" :label="$t('mode')" :items="permissionModes"></v-select>
        <div v-if="createAdminTokenDialog.permissions.mode === 'custom'">
          <v-select v-model="createAdminTokenDialog.permissions.resources.docker" :label="$t('docker')" :items="resourcesValueModes"></v-select>
          <v-select v-model="createAdminTokenDialog.permissions.resources.vm" :label="$t('vm')" :items="resourcesValueModes"></v-select>
          <v-select v-model="createAdminTokenDialog.permissions.resources.system" :label="$t('system')" :items="resourcesValueModes"></v-select>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-spacer />
        <v-btn color="onPrimary" variant="text" size="small" @click="createAdminTokenDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" size="small" @click="createAdminToken()">{{ $t('create') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Token Validation Dialog -->
  <v-dialog v-model="showValidateResult.value" max-width="600">
    <v-card class="pa-0" :title="$t('client token validation')" prepend-icon="mdi-key">
      <v-card-text class="py-0" style="max-height: 60vh; overflow-y: auto; padding-right: 12px">
          <div>
            <h3 class="ma-0 mb-2">{{ $t('github') }}</h3>
            <div v-if="showValidateResult.github.configured">
              <p class="ma-0">{{ $t('configured') }}: {{ showValidateResult.github.configured ? $t('yes') : $t('no') }}</p>
              <p class="ma-0">{{ $t('valid') }}: {{ showValidateResult.github.valid ? $t('yes') : $t('no') }}</p>
              <p class="ma-0">{{ $t('rate limit') }}: {{ showValidateResult.github.rate.limit }}</p>
              <p class="ma-0">{{ $t('rate used') }}: {{ showValidateResult.github.rate.used }}</p>
              <p class="ma-0">{{ $t('rate remaining') }}: {{ showValidateResult.github.rate.remaining }}</p>
              <p class="ma-0">{{ $t('rate reset') }}: {{ new Date(showValidateResult.github.rate.reset * 1000).toLocaleString() }}</p>
            </div>
            <div v-else>
              {{ $t('github token not configured') }}
            </div>
          </div>
          <v-divider class="my-4"></v-divider>
          <div>
            <h3 class="ma-0 mb-2">{{ $t('dockerhub') }}</h3>
            <div v-if="showValidateResult.dockerhub.configured">
              <p class="ma-0">{{ $t('configured') }}: {{ showValidateResult.dockerhub.configured ? $t('yes') : $t('no') }}</p>
              <p class="ma-0">{{ $t('valid') }}: {{ showValidateResult.dockerhub.valid ? $t('yes') : $t('no') }}</p>
              <p class="ma-0">{{ $t('username') }}: {{ showValidateResult.dockerhub.username }}</p>
              <p class="ma-0">{{ $t('rate limit') }}: {{ showValidateResult.dockerhub.rate.limit }}</p>
              <p class="ma-0">{{ $t('rate remaining') }}: {{ showValidateResult.dockerhub.rate.remaining }}</p>
            </div>
            <div v-else>
              {{ $t('dockerhub token not configured') }}
            </div>
          </div>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" variant="text" size="small" @click="showValidateResult.value = false">{{ $t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Floating Action Button -->
  <v-fab @click="setClientToken()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-content-save</v-icon>
  </v-fab>

</template>

<script setup>
import { onMounted, ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { t } = useI18n();
const adminToken = ref([]);
const { overlay } = useOverlay();
const showPassword = ref(false);
const showPasswortGithub = ref(false);
const showPasswortDockerhub = ref(false);
const permissionModes = ['full', 'custom', 'readonly'];
const resourcesValueModes = ['read', 'write'];
const createAdminTokenDialog = reactive({
  value: false,
  name: '',
  description: '',
  "permissions": {
    "mode": "full",
    "resources": {
      "docker": "read",
      "vm": "read",
      "system": "read"
    }
  }
});
const clientToken = ref({
  github: '',
  dockerhub: '',
});
const showValidateResult = reactive({
  value: false,
  github: {
    configured: false,
    valid: false,
    rate: {
      limit: 0,
      used: 0,
      remaining: 0,
      reset: 0,
    },
  },
  dockerhub: {
    configured: false,
    valid: false,
    username: '',
    rate: {
      limit: 0,
      remaining: 0,
    },
  },
});

onMounted(() => {
  getAdminToken();
  getClientToken();
});

const openAdminTokenDialog = () => {
  createAdminTokenDialog.value = true;
  createAdminTokenDialog.name = '';
  createAdminTokenDialog.description = '';
};

const getAdminToken = async () => {
  try {
    const res = await fetch(`/api/v1/auth/admin-tokens`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('admin api token could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    adminToken.value = await res.json();
    createAdminTokenDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getClientToken = async () => {
  try {
    const res = await fetch(`/api/v1/mos/tokens`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('client token could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    clientToken.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const setClientToken = async () => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/mos/tokens`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientToken.value),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('client token could not be set')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('client token set successfully'));
    getClientToken();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const createAdminToken = async (name) => {
  const payload = {
    name: createAdminTokenDialog.name,
    description: createAdminTokenDialog.description,
    permissions: {
      mode: createAdminTokenDialog.permissions.mode,
    },
  };

  if (createAdminTokenDialog.permissions.mode === 'custom') {
    payload.permissions.resources = createAdminTokenDialog.permissions.resources;
  }

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/auth/admin-tokens`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('admin api token could not be created')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('admin api token created'));
    getAdminToken();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const deleteAdminToken = async (id) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/auth/admin-tokens/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('admin api token could not be deleted')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('admin api token deleted'));
    getAdminToken();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const validateClientToken = async () => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/mos/validatetokens`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('client token could not be validated')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    const result = await res.json();
    showValidateResult.value = true;
    showValidateResult.github = result.github;
    showValidateResult.dockerhub = result.dockerhub;

    showSnackbarSuccess(t('client token validated successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const copyAuthToken = async (token) => {
  try {
    if (!window.isSecureContext || !navigator.clipboard) {
      throw new Error(t('clipboard api not available in this context'));
    }
    await navigator.clipboard.writeText(token);
    showSnackbarSuccess(t('api token copied to clipboard'));
  } catch (err) {
    try {
      const ta = document.createElement('textarea');
      ta.value = token;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);

      if (ok) {
        showSnackbarSuccess(t('api token copied to clipboard'));
      } else {
        throw new Error(t('execCommand copy failed'));
      }
    } catch (fallbackErr) {
      showSnackbarError(t('failed to copy api token') + ': ' + (err?.message || fallbackErr?.message || ''));
    }
  }
};
</script>
