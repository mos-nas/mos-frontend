<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <div class="d-flex align-center ga-3 mb-4">
          <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
          <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ t('user profile') }}</h2>
        </div>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card class="px-0" style="margin-bottom: 80px">
          <v-card-text class="pt-2">
            <v-switch v-model="darkMode" :label="$t('dark mode')" :true-value="'dark'" :false-value="'light'" @update:modelValue="setDarkMode($event)" inset density="compact" color="green" />
            <v-select
              v-model="selectedLanguage"
              :items="languages"
              :item-title="(lang) => $t(lang)"
              :item-value="(lang) => lang"
              :label="$t('language')"
              required
              @update:modelValue="changeLanguage()"
            />
            <v-select
              v-model="selectedByteFormat"
              :items="byteFormats"
              :item-title="(opt) => opt.title"
              :item-value="(opt) => opt.value"
              :label="$t('byte unit')"
              required
              @update:modelValue="changeByteUnit()"
            />
            <v-text-field v-model="expiryDays" :label="$t('ui session expiry time (days)')" append-icon="mdi-content-save" type="number" min="1" max="365" @click:append="changeUiSessionExpiry()" />
            <span class="text-title-medium font-weight-medium">{{ $t('mfa') }}</span>
            <br />
            <v-btn color="green" variant="outlined" @click="mfaEnabled ? (mfaDeleteDialog.value = true) : (mfaDialog.value = true)" class="mt-2">
              {{ mfaEnabled ? $t('disable mfa') : $t('enable mfa') }}
            </v-btn>
            <br />
            <br />
            <span class="text-title-medium font-weight-medium pt-4">{{ $t('ui') }}</span>
            <v-switch
              v-model="hideInactiveMenus"
              :label="$t('hide inactive menus')"
              :true-value="true"
              :false-value="false"
              @update:modelValue="setHideInactiveMenus($event)"
              inset
              density="compact"
              hide-details="auto"
              class="pt-2"
              color="green"
            />
            <v-switch v-model="groupMenus" :label="$t('group menus')" :true-value="true" :false-value="false" @update:modelValue="setGroupMenus($event)" inset density="compact" color="green" />
            <span class="text-title-medium font-weight-medium">{{ $t('color scheme') }}</span>
            <v-color-picker v-model="color" show-swatches hide-canvas hide-sliders hide-inputs @update:modelValue="changePrimaryColor" />
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- MFA Setup Dialog -->
  <v-dialog v-model="mfaDialog.value" max-width="400px" persistent>
    <v-card :title="mfaEnabled ? t('disable mfa') : t('enable mfa')" :prepend-icon="mfaEnabled ? 'mdi-lock' : 'mdi-lock-open'">
      <v-card-text>
        <v-text-field v-model="mfaDialog.password" :label="t('password')" type="password" variant="outlined" density="comfortable" hide-details="auto" @keydown.enter="setupMfa()" />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" text @click="mfaDialog.value = false">{{ t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="setupMfa()">{{ t('confirm') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- MFA QR Code Dialog -->
  <v-dialog v-model="mfaQrDialog.value" max-width="400px" persistent>
    <v-card :title="t('mfa qr code')" prepend-icon="mdi-qrcode-scan">
      <v-card-text>
        <div class="d-flex justify-center">
          <v-img :src="mfaQrDialog.qrCode" width="200" height="200" aspect-ratio="1" />
        </div>
        <v-text-field
          v-model="mfaQrDialog.secret"
          :label="$t('key')"
          readonly
          variant="outlined"
          density="compact"
          class="mt-2"
          append-inner-icon="mdi-content-copy"
          @click:append-inner="copyToClipboard(mfaQrDialog.secret)"
        />
        <v-text-field
          v-model="mfaQrDialog.otpauth_url"
          :label="$t('otp auth url')"
          readonly
          variant="outlined"
          density="compact"
          append-inner-icon="mdi-content-copy"
          @click:append-inner="copyToClipboard(mfaQrDialog.otpauth_url)"
        />
        <v-text-field
          v-model="mfaQrDialog.code"
          :label="$t('enter authenticator code to confirm')"
          autocomplete="one-time-code"
          variant="outlined"
          density="compact"
          maxlength="6"
          counter="6"
          inputmode="numeric"
          @keydown.enter="verifyCode()"
          hide-details="auto"
        />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" text @click="mfaQrDialog.value = false">{{ t('cancel') }}</v-btn>
        <v-btn color="onPrimary" text @click="verifyCode()">{{ t('verify') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- MFA Delete Dialog -->
  <v-dialog v-model="mfaDeleteDialog.value" max-width="400px">
    <v-card :title="t('disable mfa')" prepend-icon="mdi-lock">
      <v-card-text>
        <v-text-field
          v-model="mfaDeleteDialog.password"
          :label="t('password')"
          type="password"
          variant="outlined"
          density="comfortable"
          class="mb-4"
          hide-details="auto"
          @keydown.enter="deleteMfa()"
        />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" text @click="mfaDeleteDialog.value = false">{{ t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="deleteMfa()">{{ t('confirm') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Show Recovery Code Dialog -->
  <v-dialog v-model="showRecoveryCodeDialog.value" max-width="400px" persistent>
    <v-card :title="t('mfa recovery code')" prepend-icon="mdi-shield-key">
      <v-card-text>
        <div class="recovery-code-preview text-center text-medium-emphasis mb-2 mt-4 pa-2 mb-2" style="border-style: solid">
          <strong>{{ showRecoveryCodeDialog.recoveryCode }}</strong>
        </div>
        <v-text-field v-model="showRecoveryCodeDialog.recoveryCode2" :label="$t('please enter recovery code here to close this dialog')" variant="outlined" density="compact" />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn :disabled="showRecoveryCodeDialog.recoveryCode2 !== showRecoveryCodeDialog.recoveryCode" color="onPrimary" text @click="showRecoveryCodeDialog.value = false">{{ t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useTheme } from 'vuetify';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { availableLocales, locale, t } = useI18n();
const overlay = ref(false);
const selectedLanguage = ref(locale.value);
const languages = ref(availableLocales);
const byteFormats = ref([
  { value: 'binary', title: t('binary') },
  { value: 'decimal', title: t('decimal') },
]);
const selectedByteFormat = ref('');
const expiryDays = ref(1);
const theme = useTheme();
const color = ref(theme.themes.value[theme.global.name.value].colors.primary || '#1976D2');
const darkMode = ref(false);
const hideInactiveMenus = ref(false);
const groupMenus = ref(false);
const mfaDialog = reactive({
  value: false,
  password: '',
  code: '',
});
const mfaDeleteDialog = reactive({
  value: false,
  password: '',
});
const mfaQrDialog = reactive({
  value: false,
  secret: '',
  otpauth_url: '',
  qrCode: '',
  code: '',
});
const mfaEnabled = ref(false);
const showRecoveryCodeDialog = reactive({
  value: false,
  recoveryCode: '',
  recoveryCode2: '',
});

onMounted(() => {
  getUser();
  getUiSessionExpiry();
});

const getUser = async () => {
  try {
    const res = await fetch(`/api/v1/auth/profile`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('profile could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    const user = await res.json();
    selectedByteFormat.value = user.byte_format || 'binary';
    darkMode.value = user.darkmode ? 'dark' : 'light';
    hideInactiveMenus.value = user.hide_inactive_menus;
    groupMenus.value = user.group_menus;
    mfaEnabled.value = user.mfa_enabled;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const changePrimaryColor = async (newColor) => {
  try {
    const res = await fetch(`/api/v1/auth/users/${localStorage.getItem('userid')}`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ primary_color: newColor }),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('primary color could not be changed')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    color.value = newColor;
    theme.themes.value[theme.global.name.value].colors.primary = newColor;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const changeLanguage = async () => {
  try {
    const res = await fetch(`/api/v1/auth/users/${localStorage.getItem('userid')}`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ language: selectedLanguage.value }),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('language could not be changed')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    locale.value = selectedLanguage.value;
    showSnackbarSuccess(t('language changed'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const changeByteUnit = async () => {
  try {
    const res = await fetch(`/api/v1/auth/users/${localStorage.getItem('userid')}`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ byte_format: selectedByteFormat.value }),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('byte unit could not be changed')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('byte unit changed'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getUiSessionExpiry = async () => {
  try {
    const res = await fetch(`/api/v1/auth/jwt-settings`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('ui session expiry could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    const result = await res.json();
    expiryDays.value = result.expiryDays;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const changeUiSessionExpiry = async () => {
  const daysBody = { expiryDays: parseInt(expiryDays.value) };
  try {
    const res = await fetch(`/api/v1/auth/jwt-settings`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(daysBody),
    });
    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('ui session expiry could not be changed')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('ui session expiry changed'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const setDarkMode = async (targetTheme) => {
  const payload = { darkmode: targetTheme === 'dark' ? true : false };

  try {
    const res = await fetch(`/api/v1/auth/users/${localStorage.getItem('userid')}`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('API-Error');

    const result = await res.json();
    theme.change(result.darkmode ? 'dark' : 'light');
    darkMode.value = theme.global.name.value;
    theme.themes.value[theme.global.name.value].colors.primary = result.primary_color || '#1976D2';
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const setHideInactiveMenus = async (hide) => {
  const payload = { hide_inactive_menus: hide };

  try {
    const res = await fetch(`/api/v1/auth/users/${localStorage.getItem('userid')}`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('API-Error');

    hideInactiveMenus.value = hide;
    localStorage.setItem('hideInactiveMenus', hide ? 'true' : 'false');
    emit('refresh-drawer');
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const setGroupMenus = async (group) => {
  const payload = { group_menus: group };

  try {
    const res = await fetch(`/api/v1/auth/users/${localStorage.getItem('userid')}`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('API-Error');

    groupMenus.value = group;
    localStorage.setItem('groupMenus', group ? 'true' : 'false');
    emit('refresh-drawer');
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const setMfa = async (password, code) => {
  overlay.value = true;
  let payload;
  if (password) {
    payload = { password: password };
  } else {
    payload = { code: code };
  }

  try {
    const res = await fetch(`/api/v1/auth/mfa/setup`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('mfa setup could not be completed')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    const result = await res.json();
    return result;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const deleteMfa = async () => {
  overlay.value = true;
  try {
    const res = await fetch(`/api/v1/auth/mfa`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: mfaDeleteDialog.password }),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('mfa could not be disabled')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    mfaEnabled.value = false;
    mfaDeleteDialog.value = false;
    mfaDeleteDialog.password = '';
    showSnackbarSuccess(t('mfa disabled'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const verifyCode = async () => {
  const result = await setMfa(null, mfaQrDialog.code);
  if (result) {
    showSnackbarSuccess(t('mfa setup completed'));
    mfaQrDialog.value = false;
    mfaDialog.value = false;
    mfaEnabled.value = true;
    showRecoveryCodeDialog.recoveryCode = result.recovery_code;
    showRecoveryCodeDialog.value = true;
  }
};

const setupMfa = async () => {
  mfaQrDialog.value = false;
  mfaQrDialog.qrCode = '';
  const result = await setMfa(mfaDialog.password);
  if (result) {
    mfaDialog.password = '';
    mfaDialog.value = false;
    mfaQrDialog.code = '';
    mfaQrDialog.qrCode = result.qr_code;
    mfaQrDialog.secret = result.secret;
    mfaQrDialog.otpauth_url = result.otpauth_url;
    mfaQrDialog.value = true;
  }
};

const copyToClipboard = async (value) => {
  try {
    if (!window.isSecureContext || !navigator.clipboard) {
      throw new Error(t('clipboard api not available in this context'));
    }
    await navigator.clipboard.writeText(value);
    showSnackbarSuccess(t('value copied to clipboard'));
  } catch (err) {
    try {
      const ta = document.createElement('textarea');
      ta.value = value;
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
        showSnackbarSuccess(t('value copied to clipboard'));
      } else {
        throw new Error(t('execCommand copy failed'));
      }
    } catch (fallbackErr) {
      showSnackbarError(t('failed to copy value') + ': ' + (err?.message || fallbackErr?.message || ''));
    }
  }
};
</script>

<style scoped>
.recovery-code-preview {
  font-size: 1.75rem;
  line-height: 1.2;
  font-weight: 600;
}
</style>
