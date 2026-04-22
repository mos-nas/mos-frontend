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
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('cron jobs') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card v-if="cronJobs.length === 0" fluid class="mb-4 ml-0 mr-0 pa-0">
          <v-card-text class="pa-4">
            {{ $t('no cron jobs have been created yet') }}
          </v-card-text>
        </v-card>
        <v-card v-else fluid style="margin-bottom: 80px" class="pa-0">
          <v-table density="comfortable" style="overflow-x: auto; table-layout: fixed">
            <thead>
              <tr style="background-color: rgba(0, 0, 0, 0.04)">
                <th style="white-space: nowrap; width: 32px">{{ $t('status') }}</th>
                <th style="white-space: nowrap; width: 200px; overflow: hidden; text-overflow: ellipsis">{{ $t('name') }}</th>
                <th style="white-space: nowrap">{{ $t('schedule') }}</th>
                <th style="white-space: nowrap">{{ $t('command') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(cronJob, index) in cronJobs" :key="index">
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                  <v-menu>
                    <template #activator="{ props }">
                      <v-icon v-bind="props" class="cursor-pointer" :style="{ color: cronJob.enabled ? 'green' : 'blue' }">mdi-calendar-clock</v-icon>
                    </template>
                    <v-list>
                      <v-list-item v-if="!cronJob.enabled" @click="changeCronJob(cronJob.id, undefined, undefined, undefined, true)">
                        <template #prepend>
                          <v-icon>mdi-play-circle</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('enable') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item v-if="cronJob.enabled" @click="changeCronJob(cronJob.id, undefined, undefined, undefined, false)">
                        <template #prepend>
                          <v-icon>mdi-stop-circle</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('disable') }}</v-list-item-title>
                      </v-list-item>

                      <v-list-item @click="openChangeCronJobDialog(cronJob)">
                        <template #prepend>
                          <v-icon>mdi-pencil</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('edit') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="openDeleteCronJobDialog(cronJob)">
                        <template #prepend>
                          <v-icon>mdi-delete</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                      </v-list-item>
                      <v-divider></v-divider>
                      <v-list-item @click="openChangeScriptDialog(cronJob)">
                        <template #prepend>
                          <v-icon>mdi-script-text</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('change script') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="startScript(cronJob.id)">
                        <template #prepend>
                          <v-icon>mdi-play</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('start script') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="stopScript(cronJob.id)">
                        <template #prepend>
                          <v-icon>mdi-stop</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('stop script') }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </td>
                <td style="max-width: 200px">
                  <div class="d-flex align-center text-ellipsis" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                    {{ cronJob.name }}
                    <v-chip v-if="cronJob.status === 'running'" class="ml-2" size="x-small" color="green" text-color="white" label>
                      {{ t('running') }}
                    </v-chip>
                  </div>
                </td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ cronJob.schedule }}</td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ cronJob.command }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Create Cron Job Dialog -->
  <v-dialog v-model="createCronJobDialog.value" max-width="600px">
    <v-card class="pa-0">
      <v-card-title>{{ $t('create cron job') }}</v-card-title>
      <v-card-text class="pa-4 pt-2 pb-2 overflow-y-auto" style="max-height: 60vh">
        <v-form>
          <v-switch v-model="createCronJobDialog.enabled" :label="$t('enabled')" inset color="green" density="compact"></v-switch>
          <v-text-field v-model="createCronJobDialog.name" :label="$t('name')" required></v-text-field>
          <v-text-field v-model="createCronJobDialog.schedule" :label="$t('schedule')" required append-inner-icon="mdi-calendar-clock" @click:append-inner="openCronDialog('create')"></v-text-field>
          <v-text-field v-model="createCronJobDialog.command" :label="$t('command')" required></v-text-field>
          <v-textarea v-model="createCronJobDialog.script" :label="$t('script')" rows="5" required></v-textarea>
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" @click="createCronJobDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="createCronJob()">{{ $t('create') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Change Cron Job Dialog -->
  <v-dialog v-model="changeCronJobDialog.value" max-width="600px">
    <v-card class="pa-0">
      <v-card-title>{{ $t('change cron job') }}</v-card-title>
      <v-card-text class="pa-4 pt-2 pb-2 overflow-y-auto" style="max-height: 60vh">
        <v-form>
          <v-switch v-model="changeCronJobDialog.enabled" :label="$t('enabled')" inset color="green" density="compact"></v-switch>
          <v-text-field v-model="changeCronJobDialog.name" :label="$t('name')" required></v-text-field>
          <v-text-field v-model="changeCronJobDialog.schedule" :label="$t('schedule')" required append-inner-icon="mdi-calendar-clock" @click:append-inner="openCronDialog('change')"></v-text-field>
          <v-text-field v-model="changeCronJobDialog.command" :label="$t('command')" required></v-text-field>
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" @click="changeCronJobDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="changeCronJob(changeCronJobDialog.id, changeCronJobDialog.name, changeCronJobDialog.schedule, changeCronJobDialog.command, changeCronJobDialog.enabled)">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Cron Job Dialog -->
  <v-dialog v-model="deleteCronJobDialog.value" max-width="600px">
    <v-card class="pa-0">
      <v-card-title>{{ $t('delete cron job') }} - {{ deleteCronJobDialog.name }}</v-card-title>
      <v-card-text class="pa-4 pt-2 pb-2 overflow-y-auto" style="max-height: 80vh">
        <p>{{ $t('are you sure you want to delete the cron job') }}?</p>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" @click="deleteCronJobDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deleteCronJob()">{{ $t('delete') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Change Script Dialog -->
  <v-dialog v-model="changeScriptDialog.value" max-width="800px">
    <v-card class="pa-0">
      <v-card-title>{{ $t('change script') }} - {{ changeScriptDialog.name }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="changeScriptDialog.path" :label="$t('path')" readonly></v-text-field>
        <v-text-field v-model="changeScriptDialog.size" :label="$t('size')" readonly></v-text-field>
        <v-textarea v-model="changeScriptDialog.content" :label="$t('script')" rows="10"></v-textarea>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" @click="changeScriptDialog.value = false">{{ $t('close') }}</v-btn>
        <v-btn color="onPrimary" @click="changeScript(changeScriptDialog.id)">{{ $t('save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <CronScheduleDialog v-model="cronDialog.value" :schedule="cronDialogSchedule" @apply="applyAndClose" @cancel="resetCronDialogContext" />

  <!-- Floating Action Button -->
  <v-fab @click="openCreateCronJobDialog()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-plus</v-icon>
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
const cronJobs = ref([]);
const overlay = ref(false);
const { t } = useI18n();
const createCronJobDialog = reactive({
  value: false,
  enabled: false,
  name: '',
  schedule: '',
  command: '',
  script: '',
});
const changeCronJobDialog = reactive({
  value: false,
  enabled: false,
  id: '',
  name: '',
  schedule: '',
  command: '',
});
const deleteCronJobDialog = reactive({
  value: false,
  id: '',
  name: '',
});
const changeScriptDialog = reactive({
  value: false,
  id: '',
  name: '',
  path: '',
  size: 0,
  created: '',
  modified: '',
  content: '',
});
const cronValue = ref('* * * * *');
const cronDialogSchedule = ref(cronValue.value);
const cronDialog = reactive({
  value: false,
});
const cronDialogContext = ref(null); // 'create' | 'change' | null

onMounted(() => {
  getCron();
});

const getCron = async () => {
  try {
    const res = await fetch('/api/v1/cron', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('cron jobs could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    cronJobs.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const createCronJob = async () => {
  overlay.value = true;
  const newCronJob = {
    name: createCronJobDialog.name,
    schedule: createCronJobDialog.schedule,
    command: createCronJobDialog.command,
    enabled: createCronJobDialog.enabled,
    script: createCronJobDialog.script,
  };
  try {
    const res = await fetch('/api/v1/cron', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCronJob),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('cron job could not be created')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('cron job created successfully'));
    createCronJobDialog.value = false;
    getCron();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const changeCronJob = async (id, name, schedule, command, enabled) => {
  overlay.value = true;
  const changeCronJob = {};
  if (name !== undefined) changeCronJob.name = name;
  if (schedule !== undefined) changeCronJob.schedule = schedule;
  if (command !== undefined) changeCronJob.command = command;
  if (enabled !== undefined) changeCronJob.enabled = enabled;
  try {
    const res = await fetch('/api/v1/cron/' + encodeURIComponent(id), {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(changeCronJob),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('cron job could not be changed')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('cron job changed successfully'));
    changeCronJobDialog.value = false;
    getCron();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const deleteCronJob = async () => {
  overlay.value = true;
  try {
    const res = await fetch('/api/v1/cron/' + deleteCronJobDialog.id, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('cron jobs could not be deleted')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('cron job deleted successfully'));
    deleteCronJobDialog.value = false;
    getCron();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const getScript = async (cronId) => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/cron/scripts/' + encodeURIComponent(cronId), {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('script could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const data = await res.json();
    return data.script;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const changeScript = async (cronId) => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/cron/scripts/' + encodeURIComponent(cronId), {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: changeScriptDialog.content }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('script could not be changed')}|$| ${error.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('script changed successfully'));
    changeScriptDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const startScript = async (cronId) => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/cron/' + encodeURIComponent(cronId) + '/start', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('script could not be started')}|$| ${error.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('script started successfully'));
    getCron();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const stopScript = async (cronId) => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/cron/' + encodeURIComponent(cronId) + '/stop', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('script could not be stopped')}|$| ${error.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('script stopped successfully'));
    getCron();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const resetCronDialogContext = () => {
  cronDialogContext.value = null;
};

const openCronDialog = (context) => {
  cronDialogContext.value = context;
  const currentSchedule =
    context === 'create' ? createCronJobDialog.schedule : context === 'change' ? changeCronJobDialog.schedule : '';
  cronDialogSchedule.value = currentSchedule && String(currentSchedule).trim().length > 0 ? currentSchedule : cronValue.value;
  cronDialog.value = true;
};

const applyAndClose = (schedule) => {
  cronValue.value = schedule;
  if (cronDialogContext.value === 'create') {
    createCronJobDialog.schedule = schedule;
  } else if (cronDialogContext.value === 'change') {
    changeCronJobDialog.schedule = schedule;
  }
  resetCronDialogContext();
};

watch(
  () => cronDialog.value,
  (isOpen) => {
    if (!isOpen) {
      resetCronDialogContext();
    }
  },
);

const openCreateCronJobDialog = () => {
  createCronJobDialog.value = true;
  createCronJobDialog.enabled = false;
  createCronJobDialog.name = '';
  createCronJobDialog.schedule = '';
  createCronJobDialog.command = '';
  createCronJobDialog.script = '';
};

const openChangeCronJobDialog = (cronJob) => {
  changeCronJobDialog.value = true;
  changeCronJobDialog.id = cronJob.id;
  changeCronJobDialog.enabled = cronJob.enabled;
  changeCronJobDialog.name = cronJob.name;
  changeCronJobDialog.schedule = cronJob.schedule;
  changeCronJobDialog.command = cronJob.command;
};

const openDeleteCronJobDialog = (cronJob) => {
  deleteCronJobDialog.value = true;
  deleteCronJobDialog.id = cronJob.id;
  deleteCronJobDialog.name = cronJob.name;
};

const openChangeScriptDialog = async (cronJob) => {
  changeScriptDialog.value = true;
  try {
    const script = await getScript(cronJob.id);
    changeScriptDialog.id = cronJob.id;
    changeScriptDialog.name = script.name;
    changeScriptDialog.path = script.path;
    changeScriptDialog.size = script.size;
    changeScriptDialog.created = script.created;
    changeScriptDialog.modified = script.modified;
    changeScriptDialog.content = script.content;
  } catch (e) {
    showSnackbarError(e.message);
  }
};
</script>
