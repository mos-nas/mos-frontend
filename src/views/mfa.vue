<template>
  <div :class="$vuetify.display.mdAndUp ? 'login-wrap' : 'login-wrap-mobile'" class="d-flex">
    <v-container class="py-10" max-width="1200">
      <v-row align="center" justify="center" no-gutters class="w-100" :style="$vuetify.display.mdAndUp ? 'min-height: 600px;' : ''">
        <!-- Left side -->
        <v-col cols="12" sm="5" class="pa-5 d-flex flex-column justify-center align-center text-center left-col">
          <div class="brand centered">
            <v-img :src="logoColorThemed" alt="MOS Logo" width="200" class="mx-auto mb-6" contain />
            <h1 class="brand__title">{{ t('mos portal') }}</h1>
            <p class="brand__copy">{{ t('secure login') || 'Secure login with TOTP verification' }}</p>
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
              <h2>{{ t('two factor authentication') || 'Two-factor authentication' }}</h2>
              <p class="text-medium-emphasis mb-6 text-body-2">
                {{ t('enter your totp code') || 'Enter the 6-digit code from your authenticator app.' }}
              </p>

              <v-form ref="formRef" v-model="isValid" @submit.prevent="onSubmit" @keydown.enter="onSubmit">
                <v-text-field
                  v-model="totpCode"
                  :label="t('totp code') || 'TOTP Code'"
                  autocomplete="one-time-code"
                  variant="outlined"
                  density="comfortable"
                  maxlength="6"
                  counter="6"
                  inputmode="numeric"
                  :rules="[rules.required, rules.sixDigits]"
                  @update:model-value="onCodeInput"
                  class="mb-4"
                />

                <v-btn type="submit" block size="large" :loading="loading" :disabled="!isValid || loading">
                  {{ t('verify') || 'Verify' }}
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
import mosBlack from '/mos_black.png';
import mosWhite from '/mos_white.png';

const { t } = useI18n();
const theme = useTheme();

const loading = ref(false);
const isValid = ref(false);
const formRef = ref(null);
const totpCode = ref('');

const logoColorThemed = computed(() => {
  return theme.global.name.value === 'dark' ? mosWhite : mosBlack;
});

const rules = {
  required: (v) => !!v || t('required') || 'Required',
  sixDigits: (v) => /^\d{6}$/.test(v || '') || t('must be 6 digits') || 'Code must contain exactly 6 digits',
};

const onCodeInput = (value) => {
  totpCode.value = (value || '').replace(/\D/g, '').slice(0, 6);
};

const onSubmit = async () => {
  const ok = await formRef.value?.validate();
  if (!ok) return;

  // Placeholder action for the actual verification flow.
  loading.value = true;
  loading.value = false;
};

const verifyMfa = async (mfa_token, code) => {
  overlay.value = true;
  const payload = { mfa_token: mfa_token, code: code };

  try {
    const res = await fetch(`/api/v1/auth/mfa`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('mfa verification could not be completed')}|$| ${errorDetails.error || t('unknown error')}`);
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
