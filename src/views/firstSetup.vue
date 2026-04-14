<template>
  <v-container>
    <v-stepper :items="[$t('root password'), $t('web login & settings')]" v-model="step" hide-actions>
      <template v-slot:item.1>
        <v-card :title="$t('root password')" flat>
          <v-card-text>
            <v-text-field
              v-model="rootpwd"
              :label="$t('root password')"
              required
              type="password"
              :error="rootpwd === '' && step1Error"
              :error-messages="rootpwd === '' && step1Error ? [$t('this field is required')] : []"
            ></v-text-field>
            <v-text-field
              v-model="rootpwd2"
              :label="$t('confirm root password')"
              required
              type="password"
              :error="rootpwd2 === '' && step1Error"
              :error-messages="rootpwd2 === '' && step1Error ? [$t('this field is required')] : rootpwd2 !== rootpwd && step1Error ? [$t('password is not the same')] : []"
            ></v-text-field>
          </v-card-text>
        </v-card>
      </template>

      <template v-slot:item.2>
        <v-card :title="$t('web login & settings')" flat>
          <v-card-text>
            <v-text-field
              v-model="username"
              :label="$t('username')"
              required
              :error="username === '' && step1Error"
              :error-messages="username === '' && step2Error ? [$t('this field is required')] : []"
            ></v-text-field>
            <v-text-field
              v-model="password"
              :label="$t('web password')"
              required
              type="password"
              :error="password === '' && step2Error"
              :error-messages="password === '' && step2Error ? [$t('this field is required')] : []"
            ></v-text-field>
            <v-text-field
              v-model="password2"
              :label="$t('web password')"
              required
              type="password"
              :error="password2 === '' && step2Error"
              :error-messages="password2 === '' && step2Error ? [$t('this field is required')] : password2 !== password && step2Error ? [$t('password is not the same')] : []"
            ></v-text-field>
            <v-switch v-model="sambaUser" :label="$t('samba user')" inset color="green" />
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
            <v-switch
              v-model="darkMode"
              :label="$t('dark mode')"
              :true-value="'dark'"
              :false-value="'light'"
              inset color="green"
              @update:modelValue="setDarkMode()"
            />
            <span class="text-title-medium font-weight-medium">{{ $t('uicolor') }}</span>
            <v-color-picker v-model="color" show-swatches hide-canvas hide-sliders hide-inputs @update:modelValue="changePrimaryColor" />
          </v-card-text>
        </v-card>
      </template>
      <v-stepper-actions :disabled="false" :next-text="step > 1 ? t('finish') : t('next')" :prev-text="t('back')" @click:next="nextStep()" @click:prev="step = step - 1">
        <template v-slot:prev>
          <v-btn v-if="step > 1" variant="text" @click="step = step - 1">{{ t('back') }}</v-btn>
          <span v-else></span>
        </template>
      </v-stepper-actions>
    </v-stepper>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useRouter } from 'vue-router';

const router = useRouter();
const { t } = useI18n();
const theme = useTheme();
const overlay = ref(false);
const emit = defineEmits(['setup-complete']);
const props = defineProps({
  token: String,
});
const username = ref('');
const rootpwd = ref('');
const rootpwd2 = ref('');
const password = ref('');
const password2 = ref('');
const sambaUser = ref(true);
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const darkMode = ref(prefersDark ? 'dark' : 'light');
const languages = ['en', 'de'];
const selectedLanguage = ref('en');
const byteFormats = ref([
  { value: 'binary', title: t('binary') },
  { value: 'decimal', title: t('decimal') },
]);
const selectedByteFormat = ref('binary');
const color = ref('#1976D2');
let step = ref(1);
const step1Error = ref(false);
const step2Error = ref(false);

onMounted(() => {
  if (!props.token || props.token === '') {
    router.push('/');
  }
});

const setDarkMode = async () => {
  theme.change(darkMode.value);
};

const changePrimaryColor = async (newColor) => {
    color.value = newColor;
    theme.themes.value[theme.global.name.value].colors.primary = newColor;
};

const addUser = async () => {
  const newUser = {
    username: username.value,
    password: password.value,
    samba_user: sambaUser.value,
    role: 'admin',
    darkmode: darkMode.value === 'dark',
    language: selectedLanguage.value,
    byte_format: selectedByteFormat.value,
  };

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/auth/users', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + props.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    });
    overlay.value = false;

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('Failed to create user'));
    }
    return true;
  } catch (e) {
    throw e;
  }
};

const setRootPassword = async () => {
  const newRootPwd = {
    password: rootpwd.value,
  };

  try {
    const res = await fetch('/api/v1/users/root', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + props.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRootPwd),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('failed to set root password'));
    }
    return true;
  } catch (e) {
    throw e;
  }
};

async function nextStep() {
  // Root password step
  if (step.value === 1 && (rootpwd.value === '' || rootpwd2.value === '' || rootpwd.value !== rootpwd2.value)) {
    step1Error.value = true;
    return;
  } else {
    if (step.value === 1) {
      overlay.value = true;
      try {
        await setRootPassword();
        overlay.value = false;
      } catch (e) {
        overlay.value = false;
        showSnackbarError(e.message);
        step1Error.value = true;
        return;
      }
    }
    step1Error.value = false;
  }

  // Web user step
  if (step.value === 2 && (username.value === '' || password.value === '' || password.value !== password2.value)) {
    step2Error.value = true;
    return;
  } else {
    step2Error.value = false;
    if (step.value === 2) {
      overlay.value = true;
      try {
        await addUser();
      } catch (e) {
        overlay.value = false;
        showSnackbarError(e.message);
        step2Error.value = true;
        return;
      }
      showSnackbarSuccess(t('first setup successfully completed'));
      emit('setup-complete');
    }
  }

  step.value = step.value + 1;
}
</script>
