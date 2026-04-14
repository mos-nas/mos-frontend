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
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ props.lxc }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <span class="text-title-medium font-weight-medium">{{ $t('backups') }}</span>
        <v-skeleton-loader v-if="backupsLoading" type="card" :loading="backupsLoading" class="mb-4" style="margin-bottom: 20px" />
        <v-card v-if="!backupsLoading && backups.length === 0" fluid class="mb-4 ml-0 mr-0 pa-0" style="margin-bottom: 20px">
          <v-card-text class="pa-4">
            {{ $t('no backups have been created yet') }}
          </v-card-text>
        </v-card>
        <v-card v-else fluid style="margin-bottom: 20px" class="pa-0">
          <v-card-text class="pa-0">
            <v-list>
              <template v-if="backups.length > 0" v-for="(backup, index) in backups" :key="backup.container">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon class="cursor-pointer">mdi-zip-disk</v-icon>
                  </template>
                  <v-list-item-title>{{ new Date(backup.created).toLocaleString() }}</v-list-item-title>
                  <v-list-item-subtitle>{{ backup.filename }} - {{ backup.size_human }}</v-list-item-subtitle>
                  <template v-slot:append>
                    <v-menu>
                      <template #activator="{ props }">
                        <v-btn variant="text" icon v-bind="props" color="onPrimary">
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item @click="openRestoreBackupDialog(backup)">
                          <v-list-item-title>{{ $t('restore') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="openDeleteBackupDialog(backup)">
                          <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </template>
                </v-list-item>
                <v-divider v-if="index < backups.length - 1" />
              </template>
            </v-list>
          </v-card-text>
        </v-card>
        <span class="text-title-medium font-weight-medium">{{ $t('snapshots') }}</span>
        <v-skeleton-loader v-if="snapshotsLoading" type="card" :loading="snapshotsLoading" class="mb-4" style="margin-bottom: 80px" />
        <v-card v-if="!snapshotsLoading && snapshots.length === 0" fluid class="mb-4 ml-0 mr-0 pa-0" style="margin-bottom: 80px">
          <v-card-text class="pa-4">
            {{ $t('no snapshots have been created yet') }}
          </v-card-text>
        </v-card>
        <v-card v-else fluid style="margin-bottom: 80px" class="pa-0">
          <v-card-text class="pa-0">
            <v-list>
              <template v-for="(snapshot, index) in snapshots" :key="snapshot.name">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon class="cursor-pointer">mdi-camera</v-icon>
                  </template>
                  <v-list-item-title>{{ new Date(snapshot.timestamp).toLocaleString() }}</v-list-item-title>
                  <v-list-item-subtitle>{{ snapshot.name }}</v-list-item-subtitle>
                  <template v-slot:append>
                    <v-menu>
                      <template #activator="{ props }">
                        <v-btn variant="text" icon v-bind="props" color="onPrimary">
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item @click="openRestoreSnapshotDialog(snapshot)">
                          <v-list-item-title>{{ $t('restore') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="openCloneSnapshotDialog(snapshot)">
                          <v-list-item-title>{{ $t('clone') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="openDeleteSnapshotDialog(snapshot)">
                          <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </template>
                </v-list-item>
                <v-divider v-if="index < snapshots.length - 1" />
              </template>
            </v-list>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Create Backup Dialog -->
  <v-dialog v-model="createBackupDialog.value" max-width="600px">
    <v-card class="pa-0" :title="$t('create backup')" prepend-icon="mdi-plus">
      <v-card-text class="py-0 pb-4" style="max-height: 60vh; overflow-y: auto">
        <div class="pb-2">{{ $t('container will be restarted') }}</div>
        <v-switch v-model="createBackupDialog.use_snapshot" :label="$t('use snapshot for backups')" inset density="compact" color="green"></v-switch>
        <v-text-field v-model.number="createBackupDialog.threads" :label="$t('threads')" type="number" min="0"></v-text-field>
        <v-slider v-model="createBackupDialog.compression" :min="0" :max="9" step="1" :label="$t('compression')" thumb-label hide-details="auto" />
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" text @click="createBackupDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="createBackup(createBackupDialog.use_snapshot, createBackupDialog.compression, createBackupDialog.threads)">
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Backup Dialog -->
  <v-dialog v-model="deleteBackupDialog.value" max-width="600px">
    <v-card class="pa-0" :title="$t('delete backup') + ' - ' + (deleteBackupDialog.backup ? deleteBackupDialog.backup.filename : '')" prepend-icon="mdi-delete">
      <v-card-text class="py-0 pt-2 pb-4" style="max-height: 60vh; overflow-y: auto">{{ $t('are you sure you want to delete the backup') }}?</v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" text @click="deleteBackupDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deleteBackup(deleteBackupDialog.backup)">{{ $t('delete') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Restore Backup Dialog -->
  <v-dialog v-model="restoreBackupDialog.value" max-width="600px">
    <v-card class="pa-0" :title="$t('restore backup') + ' - ' + (restoreBackupDialog.backup ? restoreBackupDialog.backup.filename : '')" prepend-icon="mdi-backup-restore">
      <v-card-text class="py-0 pt-2 pb-2" style="max-height: 60vh; overflow-y: auto">
        <div class="py-0 pt-2">{{ $t('are you sure you want to restore this backup') }}?</div>
        <div class="py-0 pt-2">
          <v-text-field v-model="restoreBackupDialog.new_name" :label="$t('new container name')"></v-text-field>
        </div>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" text @click="restoreBackupDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="restoreBackup(restoreBackupDialog.backup, restoreBackupDialog.new_name)">{{ $t('restore') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Create Snapshot Dialog -->
  <v-dialog v-model="createSnapshotDialog.value" max-width="600px">
    <v-card class="pa-0" :title="$t('create snapshot')" prepend-icon="mdi-camera-plus">
      <v-card-text class="py-0 pt-2 pb-4" style="max-height: 60vh; overflow-y: auto">{{ $t('are you sure you want to create a new snapshot') }}? <br /> {{ $t('container will be restarted') }}</v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" text @click="createSnapshotDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="createSnapshot()">{{ $t('create') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Snapshot Dialog -->
  <v-dialog v-model="deleteSnapshotDialog.value" max-width="600px">
    <v-card class="pa-0" :title="$t('delete snapshot') + ' - ' + (deleteSnapshotDialog.snapshot ? deleteSnapshotDialog.snapshot.name : '')" prepend-icon="mdi-delete">
      <v-card-text class="py-0 pt-2 pb-4" style="max-height: 60vh; overflow-y: auto">{{ $t('are you sure you want to delete the snapshot') }}?</v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" text @click="deleteSnapshotDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deleteSnapshot(deleteSnapshotDialog.snapshot)">{{ $t('delete') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Restore Snapshot Dialog -->
  <v-dialog v-model="restoreSnapshotDialog.value" max-width="600px">
    <v-card class="pa-0" :title="$t('restore snapshot') + ' - ' + (restoreSnapshotDialog.snapshot ? restoreSnapshotDialog.snapshot.name : '')" prepend-icon="mdi-backup-restore">
      <v-card-text class="py-0 pt-2 pb-4" style="max-height: 60vh; overflow-y: auto">{{ $t('are you sure you want to restore this snapshot') }}?</v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" text @click="restoreSnapshotDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="restoreSnapshot(restoreSnapshotDialog.snapshot)">{{ $t('restore') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Clone Snapshot Dialog -->
  <v-dialog v-model="cloneSnapshotDialog.value" max-width="600px">
    <v-card class="pa-0" :title="$t('clone snapshot') + ' - ' + (cloneSnapshotDialog.snapshot ? cloneSnapshotDialog.snapshot.name : '')" prepend-icon="mdi-content-copy">
      <v-card-text class="py-0 pt-2 pb-4" style="max-height: 60vh; overflow-y: auto">
        <div class="py-0 pt-2">{{ $t('are you sure you want to clone this snapshot') }}?</div>
        <div class="py-0 pt-2">
          <v-text-field v-model="cloneSnapshotDialog.new_name" :label="$t('new container name')"></v-text-field>
        </div>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" text @click="cloneSnapshotDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="cloneSnapshot(cloneSnapshotDialog.snapshot, cloneSnapshotDialog.new_name)">{{ $t('clone') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Floating Action Button with Menu -->
  <v-menu location="top">
    <template v-slot:activator="{ props }">
      <v-fab v-bind="props" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
        <v-icon>mdi-plus</v-icon>
      </v-fab>
    </template>
    <v-list>
      <v-list-item @click="openCreateBackupDialog()">
        <template v-slot:prepend>
          <v-icon>mdi-plus</v-icon>
        </template>
        <v-list-item-title>{{ $t('create backup') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="openCreateSnapshotDialog()">
        <template v-slot:prepend>
          <v-icon>mdi-camera-plus</v-icon>
        </template>
        <v-list-item-title>{{ $t('create snapshot') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { ref, onMounted, reactive, h } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const props = defineProps({
  lxc: String,
});

const router = useRouter();
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { t } = useI18n();
const overlay = ref(false);
const backups = ref([]);
const backupsLoading = ref(true);
const snapshots = ref([]);
const snapshotsLoading = ref(true);
const createBackupDialog = reactive({
  value: false,
  use_snapshot: true,
  compression: 0,
  threads: 0,
});
const deleteBackupDialog = reactive({
  value: false,
  backup: null,
});
const restoreBackupDialog = reactive({
  value: false,
  backup: null,
  backup_file: '',
  new_name: '',
});
const createSnapshotDialog = reactive({
  value: false,
});
const deleteSnapshotDialog = reactive({
  value: false,
  snapshot: null,
});
const restoreSnapshotDialog = reactive({
  value: false,
  snapshot: null,
});
const cloneSnapshotDialog = reactive({
  value: false,
  snapshot: null,
  new_name: '',
});

onMounted(() => {
  getLxcBackups();
  getLxcSnapshots();
});

const getLxcBackups = async () => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/lxc/containers/${props.lxc}/backups`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('lxc backups could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    backups.value = await res.json();
  } catch (error) {
    const [userMessage, apiErrorMessage] = error.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    backupsLoading.value = false;
    overlay.value = false;
  }
};

const createBackup = async (use_snapshot, compression, threads) => {
  const payload = {
    use_snapshot: use_snapshot,
    compression: compression,
    threads: threads,
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/lxc/containers/${props.lxc}/backups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('backup could not be created')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('backup creation started successfully'));
    getLxcBackups();
    createBackupDialog.value = false;
  } catch (error) {
    const [userMessage, apiErrorMessage] = error.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const deleteBackup = async (backup) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/lxc/containers/${props.lxc}/backups/${backup.filename}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('backup could not be deleted')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('backup deleted successfully'));
    getLxcBackups();
    deleteBackupDialog.value = false;
  } catch (error) {
    const [userMessage, apiErrorMessage] = error.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const restoreBackup = async (backup, newName) => {
  const payload = {
    backup_file: backup.filename,
    new_name: newName,
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/lxc/containers/${props.lxc}/backups/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('backup could not be restored')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('backup restore started successfully'));
    getLxcBackups();
    restoreBackupDialog.value = false;
  } catch (error) {
    const [userMessage, apiErrorMessage] = error.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const getLXCService = async () => {
  try {
    const res = await fetch('/api/v1/mos/settings/lxc', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('lxc service could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const lxcSettings = await res.json();
    return lxcSettings;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getLxcSnapshots = async () => {
  try {
    const res = await fetch(`/api/v1/lxc/containers/${props.lxc}/snapshots`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('lxc snapshots could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    snapshots.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    snapshotsLoading.value = false;
  }
};

const createSnapshot = async () => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/lxc/containers/${props.lxc}/snapshots`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('snapshot could not be created')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('snapshot created successfully'));
    getLxcSnapshots();
    createSnapshotDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const deleteSnapshot = async (snapshot) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/lxc/containers/${props.lxc}/snapshots/${snapshot.name}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('snapshot could not be deleted')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('snapshot deleted successfully'));
    getLxcSnapshots();
    deleteSnapshotDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const restoreSnapshot = async (snapshot) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/lxc/containers/${props.lxc}/snapshots/${snapshot.name}/restore`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('snapshot could not be restored')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('snapshot restore started successfully'));
    getLxcSnapshots();
    restoreSnapshotDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const cloneSnapshot = async (snapshot, newName) => {
  const payload = {
    new_name: newName,
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/lxc/containers/${props.lxc}/snapshots/${snapshot.name}/clone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('snapshot could not be cloned')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('snapshot cloned successfully'));
    getLxcSnapshots();
    cloneSnapshotDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const openCreateBackupDialog = async () => {
  createBackupDialog.value = true;
  overlay.value = true;
  const lxcSettings = await getLXCService();
  overlay.value = false;
  createBackupDialog.use_snapshot = lxcSettings.use_snapshot || true;
  createBackupDialog.compression = lxcSettings.compression || 0;
  createBackupDialog.threads = lxcSettings.threads || 0;
};
const openDeleteBackupDialog = (backup) => {
  deleteBackupDialog.value = true;
  deleteBackupDialog.backup = backup;
};
const openRestoreBackupDialog = (backup) => {
  restoreBackupDialog.value = true;
  restoreBackupDialog.backup = backup;
  restoreBackupDialog.new_name = '';
};
const openCreateSnapshotDialog = () => {
  createSnapshotDialog.value = true;
};
const openRestoreSnapshotDialog = (snapshot) => {
  restoreSnapshotDialog.value = true;
  restoreSnapshotDialog.snapshot = snapshot;
};
const openCloneSnapshotDialog = (snapshot) => {
  cloneSnapshotDialog.value = true;
  cloneSnapshotDialog.snapshot = snapshot;
  cloneSnapshotDialog.new_name = '';
};
const openDeleteSnapshotDialog = (snapshot) => {
  deleteSnapshotDialog.value = true;
  deleteSnapshotDialog.snapshot = snapshot;
};
</script>
