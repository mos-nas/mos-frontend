<template>
  <div :class="$vuetify.display.mdAndUp ? 'login-wrap' : 'login-wrap-mobile'" class="d-flex">
    <v-container class="py-10" max-width="1200">
      <v-row align="center" justify="center" no-gutters class="w-100" :style="$vuetify.display.mdAndUp ? 'min-height: 600px;' : ''">
        <!-- Left side -->
        <v-col cols="12" sm="5" class="pa-5 d-flex flex-column justify-center align-center text-center left-col">
          <div class="brand centered">
            <v-img :src="logoColorThemed" alt="MOS Logo" width="200" class="mx-auto mb-6" contain />
            <h1 class="brand__title">{{ t('mos portal') }}</h1>
            <p class="brand__copy">{{ t('secure login') }}</p>
          </div>
        </v-col>

        <!-- Vertical Divider -->
        <v-col cols="auto" class="d-none d-sm-flex align-self-stretch px-0">
          <v-divider vertical />
        </v-col>

        <!-- Right side -->
        <v-col cols="12" sm="5" class="pa-5 d-flex align-center">
          <v-card class="elevated" elevation="8" style="width: 100%">
            <v-card-text class="pa-6">
              <h2>{{ t('two factor authentication') }}</h2>
              <p class="text-medium-emphasis mb-6 text-body-2">
                {{ t('enter your totp code') }}
              </p>
              <v-form ref="formRef" v-model="isValid" @submit.prevent="onSubmit" @keydown.enter="onSubmit">
                <v-text-field
                  v-model="totpCode"
                  :label="t('authenticator code')"
                  autocomplete="one-time-code"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  class="mb-4"
                />
                <v-btn type="submit" block size="large" :disabled="!isValid || overlay">
                  {{ t('verify') }}
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>

</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify';
import { useRouter } from 'vue-router';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import mosBlack from '/mos_black.png';
import mosWhite from '/mos_white.png';
import { useOverlay } from '@/composables/useOverlay';

const props = defineProps({
  mfaToken: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['login-success', 'refresh-drawer', 'refresh-notifications-badge']);

const { locale, t } = useI18n();
const theme = useTheme();
const router = useRouter();
const loading = ref(false);
const isValid = ref(false);
const formRef = ref(null);
const totpCode = ref('');
const { overlay } = useOverlay();

const logoColorThemed = computed(() => {
  return theme.global.name.value === 'dark' ? mosWhite : mosBlack;
});

const rules = {
  required: (v) => !!v || t('required') || 'Required',
};

const onSubmit = async () => {
  const ok = await formRef.value?.validate();
  if (!ok) return;

  await verifyMfa(props.mfaToken, totpCode.value);
};

const verifyMfa = async (mfa_token, code) => {
  overlay.value = true;
  const payload = { mfa_token: mfa_token, code: code };

  try {
    const res = await fetch(`/api/v1/auth/mfa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('mfa verification could not be completed')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    const result = await res.json();
    localStorage.setItem('authToken', result.token);
    localStorage.setItem('userid', result.user.id);
    localStorage.setItem('byte_format', result.user.byte_format || 'binary');
    localStorage.setItem('username', result.user.username || '');
    localStorage.setItem('hideInactiveMenus', result.user.hide_inactive_menus ? 'true' : 'false');
    localStorage.setItem('groupMenus', result.user.group_menus ? 'true' : 'false');

    if (result.user.darkmode) {
      theme.change('dark');
    } else {
      theme.change('light');
    }

    locale.value = result.user.language || 'en';
    theme.themes.value[theme.global.name.value].colors.primary = result.user.primary_color || '#1976D2';

    if (result.message != null && result.message !== '') {
      showSnackbarSuccess?.(t('logged in successfully'), result.message);
    } else {
    showSnackbarSuccess?.(t('logged in successfully'));
    }

    emit('login-success');
    await router.push('/dashboard');

    return result;
  } catch (e) {
    const [userMessage, apiErrorMessage] = (e.message || '').split('|$|');
    showSnackbarError?.(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};
</script>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--v-theme-primary) 6%, transparent) 0%, transparent 30%),
    linear-gradient(90deg, color-mix(in oklab, var(--v-theme-secondary) 5%, transparent) 0%, transparent 40%);
}

.login-wrap-mobile {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--v-theme-primary) 6%, transparent) 0%, transparent 30%),
    linear-gradient(90deg, color-mix(in oklab, var(--v-theme-secondary) 5%, transparent) 0%, transparent 40%);
}

.elevated {
  border-radius: 16px;
  background: var(--v-theme-surface);
  border: 1px solid color-mix(in oklab, var(--v-theme-on-surface) 10%, transparent);
}

.brand__title {
  font-weight: 700;
  font-size: clamp(24px, 3vw, 36px);
  line-height: 1.1;
}

.brand__copy {
  opacity: 0.8;
  max-width: 40ch;
}

@media (min-width: 800px) {
  .left-col {
    border-right: 1px solid color-mix(in oklab, var(--v-theme-on-surface) 10%, transparent);
  }
}
</style>
