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
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('mos hub settings') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader :loading="mosHubLoading" type="card" class="w-100">
          <v-card fluid style="margin-bottom: 80px" class="pa-0">
            <v-card-text>
              <v-switch :label="$t('mos hub')" color="green" inset density="compact" v-model="settingsMosHub.enabled" hide-details="auto"></v-switch>
              <v-switch :label="$t('initial update')" color="green" inset density="compact" v-model="settingsMosHub.initial_update"></v-switch>
              <v-text-field
                :label="$t('update schedule')"
                v-model="settingsMosHub.schedule"
                append-inner-icon="mdi-calendar-clock"
                @click:append-inner="openCronDialog(settingsMosHub.schedule, (schedule) => (settingsMosHub.schedule = schedule))"
              ></v-text-field>
              <v-text-field :label="$t('page entries')" v-model="settingsMosHub.page_entries" type="number" hide-details="auto"></v-text-field>
              <v-divider class="my-4"></v-divider>
              <span class="text-title-medium font-weight-medium">{{ $t('plugin update schedule') }}</span>
              <v-row class="align-center pt-2">
                <v-col cols="12" md="2">
                  <v-switch v-model="settingsMosHub.update_check.enabled" :label="$t('update check')" inset color="green" hide-details></v-switch>
                </v-col>
                <v-col cols="12" md="10">
                  <v-text-field
                    v-model="settingsMosHub.update_check.update_check_schedule"
                    :label="$t('update check schedule')"
                    :disabled="!settingsMosHub.update_check.enabled"
                    density="comfortable"
                    hide-details="auto"
                    append-inner-icon="mdi-calendar-clock"
                    @click:append-inner="openCronDialog(settingsMosHub.update_check.update_check_schedule, (schedule) => (settingsMosHub.update_check.update_check_schedule = schedule))"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row class="align-center mt-4">
                <v-col cols="12" md="2">
                  <v-switch
                    v-model="settingsMosHub.update_check.auto_update.enabled"
                    :label="$t('auto update')"
                    inset
                    density="compact"
                    :disabled="!settingsMosHub.update_check.enabled"
                    color="green"
                    hide-details="auto"
                  ></v-switch>
                </v-col>
                <v-col cols="12" md="10">
                  <v-text-field
                    v-model="settingsMosHub.update_check.auto_update.auto_update_schedule"
                    :label="$t('auto update schedule')"
                    :disabled="!settingsMosHub.update_check.enabled || !settingsMosHub.update_check.auto_update.enabled"
                    density="comfortable"
                    hide-details="auto"
                    append-inner-icon="mdi-calendar-clock"
                    @click:append-inner="openCronDialog(settingsMosHub.update_check.auto_update.auto_update_schedule, (schedule) => (settingsMosHub.update_check.auto_update.auto_update_schedule = schedule))"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-skeleton-loader>
      </v-container>
    </v-container>
  </v-container>

  <CronScheduleDialog v-model="cronDialog.value" :schedule="cronDialog.schedule" @apply="applyCronSchedule" @cancel="resetCronDialog" />

  <!-- Floating Action Button -->
  <v-fab @click="setMosHubSettings()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-content-save</v-icon>
  </v-fab>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { onMounted, ref, reactive, watch } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import CronScheduleDialog from '@/components/cronScheduleDialog.vue';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const cronDialogApplyCallback = ref(null);
const cronDialog = reactive({
  value: false,
  schedule: '* * * * *',
});
const settingsMosHub = ref({
  enabled: false,
  initial_update: false,
  schedule: '',
  page_entries: 24,
  update_check: {
    enabled: false,
    update_check_schedule: '10 1 * * *',
    auto_update: {
      enabled: false,
      auto_update_schedule: '10 2 * * *',
    }
  },
});
const overlay = ref(false);
const { t } = useI18n();
const mosHubLoading = ref(true);

onMounted(() => {
  getMosHubSettings();
});

const resetCronDialog = () => {
  cronDialogApplyCallback.value = null;
};

const openCronDialog = (schedule, applyCallback) => {
  cronDialog.schedule = schedule && String(schedule).trim().length > 0 ? schedule : '* * * * *';
  cronDialogApplyCallback.value = applyCallback;
  cronDialog.value = true;
};

const applyCronSchedule = (schedule) => {
  if (typeof cronDialogApplyCallback.value === 'function') {
    cronDialogApplyCallback.value(schedule);
  }
  resetCronDialog();
};

watch(
  () => cronDialog.value,
  (isOpen) => {
    if (!isOpen) {
      resetCronDialog();
    }
  },
);

const getMosHubSettings = async () => {
  try {
    const res = await fetch('/api/v1/mos/hub/settings', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('mos hub settings could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }
    settingsMosHub.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    mosHubLoading.value = false;
  }
};

const setMosHubSettings = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/hub/settings', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsMosHub.value),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('mos hub settings could not be changed')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('mos hub settings changed successfully'));
    emit('refresh-drawer');
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};
</script>
