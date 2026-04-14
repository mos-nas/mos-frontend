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
            <v-switch
              v-model="darkMode"
              :label="$t('dark mode')"
              :true-value="'dark'"
              :false-value="'light'"
              @update:modelValue="setDarkMode( $event )"
              inset
              density="compact"
              color="green"
            />
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
            <span class="text-title-medium font-weight-medium">{{ $t('ui') }}</span>
            <v-switch
              v-model="hideInactiveMenus"
              :label="$t('hide inactive menus')"
              :true-value="true"
              :false-value="false"
              @update:modelValue="setHideInactiveMenus( $event )"
              inset
              density="compact"
              hide-details="auto"
              class="pt-2"
              color="green"
            />
            <v-switch
              v-model="groupMenus"
              :label="$t('group menus')"
              :true-value="true"
              :false-value="false"
              @update:modelValue="setGroupMenus( $event )"
              inset
              density="compact"
              color="green"
            />
            <span class="text-title-medium font-weight-medium">{{ $t('color scheme') }}</span>
            <v-color-picker v-model="color" show-swatches hide-canvas hide-sliders hide-inputs @update:modelValue="changePrimaryColor"/>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

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
    theme.change(result.darkmode ? 'dark' : 'light')
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

</script>
