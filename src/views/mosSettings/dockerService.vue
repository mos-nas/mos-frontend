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
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('docker service') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader :loading="dockerServiceLoading" type="card" class="w-100">
          <v-card fluid style="margin-bottom: 80px" class="pa-0">
            <v-card-text>
              <v-switch :label="$t('docker service')" inset density="compact" v-model="settingsDocker.enabled" color="green"></v-switch>
              <v-text-field
                v-model="settingsDocker.directory"
                :label="$t('directory')"
                append-inner-icon="mdi-folder"
                @click:append-inner="
                  openFsDialog((item) => {
                    settingsDocker.directory = item.path;
                  })
                "
                required
              ></v-text-field>
              <v-text-field
                v-model="settingsDocker.appdata"
                :label="$t('appdata')"
                append-inner-icon="mdi-folder"
                @click:append-inner="
                  openFsDialog((item) => {
                    settingsDocker.appdata = item.path;
                  })
                "
                required
              ></v-text-field>
              <v-text-field v-model="settingsDocker.filesystem" :label="$t('filesystem')" required></v-text-field>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select v-model="settingsDocker.docker_net.mode" :items="['ipvlan', 'macvlan']" :label="$t('docker network mode')" density="comfortable" hide-details="auto"></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="settingsDocker.docker_options" :label="$t('docker start parameters')"></v-text-field>
                </v-col>
              </v-row>
              <v-text-field v-model.number="settingsDocker.start_wait" :label="$t('start wait')" type="number" min="0" hide-details="auto"></v-text-field>
              <v-divider class="my-4"></v-divider>
              <span class="text-title-medium font-weight-medium">{{ $t('update schedule') }}</span>
              <v-row class="align-center pt-2">
                <v-col cols="12" md="2">
                  <v-switch v-model="settingsDocker.update_check.enabled" :label="$t('update check')" inset color="green" hide-details></v-switch>
                </v-col>
                <v-col cols="12" md="10">
                  <v-text-field
                    v-model="settingsDocker.update_check.update_check_schedule"
                    :label="$t('update check schedule')"
                    :disabled="!settingsDocker.update_check.enabled"
                    density="comfortable"
                    hide-details="auto"
                    append-inner-icon="mdi-calendar-clock"
                    @click:append-inner="openCronDialog(settingsDocker.update_check.update_check_schedule, (schedule) => (settingsDocker.update_check.update_check_schedule = schedule))"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row class="align-center mt-4">
                <v-col cols="12" md="2">
                  <v-switch
                    v-model="settingsDocker.update_check.auto_update.enabled"
                    :label="$t('auto update')"
                    inset
                    density="compact"
                    :disabled="!settingsDocker.update_check.enabled"
                    color="green"
                    hide-details="auto"
                  ></v-switch>
                </v-col>
                <v-col cols="12" md="10">
                  <v-text-field
                    v-model="settingsDocker.update_check.auto_update.auto_update_schedule"
                    :label="$t('auto update schedule')"
                    :disabled="!settingsDocker.update_check.enabled || !settingsDocker.update_check.auto_update.enabled"
                    density="comfortable"
                    hide-details="auto"
                    append-inner-icon="mdi-calendar-clock"
                    @click:append-inner="openCronDialog(settingsDocker.update_check.auto_update.auto_update_schedule, (schedule) => (settingsDocker.update_check.auto_update.auto_update_schedule = schedule))"
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

  <!-- File System Navigator Dialog -->
  <fsNavigatorDialog v-model="fsDialog" :initial-path="'/'" select-type="directory" :title="$t('select directory')" @selected="handleFsSelected" />

  <!-- Floating Action Button -->
  <v-fab @click="setDockerService()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
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
import { useOverlay } from '@/composables/useOverlay';
import fsNavigatorDialog from '@/components/fsNavigatorDialog.vue';
import CronScheduleDialog from '@/components/cronScheduleDialog.vue';

const fsDialog = ref(false);
const fsDialogCallback = ref(null);
const cronDialogApplyCallback = ref(null);
const cronDialog = reactive({
  value: false,
  schedule: '* * * * *',
});
const settingsDocker = ref({
  enabled: false,
  directory: '',
  appdata: '',
  docker_net: {
    mode: '',
    config: [],
  },
  docker_options: '',
  filesystem: '',
  start_wait: 0,
  update_check: {
    enabled: false,
    update_check_schedule: '',
    auto_update: {
      enabled: false,
      auto_update_schedule: '',
    },
  },
});
const dockerServiceLoading = ref(true);
const { overlay } = useOverlay();
const { t } = useI18n();
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);

onMounted(() => {
  getDockerService();
});

const openFsDialog = (cb) => {
  fsDialogCallback.value = cb;
  fsDialog.value = true;
};
const handleFsSelected = (item) => {
  if (typeof fsDialogCallback.value === 'function') {
    fsDialogCallback.value(item);
  }
  fsDialogCallback.value = null;
  fsDialog.value = false;
};

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

const getDockerService = async () => {
  try {
    const res = await fetch('/api/v1/mos/settings/docker', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker service could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    settingsDocker.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    dockerServiceLoading.value = false;
  }
};

const setDockerService = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/settings/docker', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsDocker.value),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker service could not be changed')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('docker service changed successfully'));
    emit('refresh-drawer');
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }

};
</script>
