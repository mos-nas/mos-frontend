<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <div class="d-flex align-center ga-3 mb-4">
          <v-icon @click="$router.back()" style="cursor: pointer; vertical-align: middle">mdi-arrow-left</v-icon>
          <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
          <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('iscsi initiators') }}</h2>
        </div>
      </v-container>

      <v-container fluid class="pa-0">
        <!-- Initiator IQN -->
        <v-card class="mb-4 pa-4">
          <div class="text-subtitle-1 font-weight-medium mb-3">{{ $t('initiator iqn') }}</div>
          <div class="d-flex align-center ga-3">
            <v-text-field
              v-model="initiatorName"
              :label="$t('initiator iqn')"
              placeholder="iqn.2025-01.com.example:initiator"
              density="compact"
              hide-details="auto"
              style="max-width: 600px"
            ></v-text-field>
            <v-btn color="primary" variant="tonal" :disabled="!initiatorName" @click="saveInitiator()">{{ $t('save') }}</v-btn>
          </div>

          <v-divider class="my-4" />

          <!-- Targets -->
          <v-table density="comfortable" style="overflow-x: auto">
            <thead>
              <tr style="background-color: rgba(0, 0, 0, 0.04)">
                <th style="white-space: nowrap; width: 32px"></th>
                <th style="white-space: nowrap">{{ $t('target iqn') }}</th>
                <th style="white-space: nowrap">{{ $t('address') }}</th>
                <th style="white-space: nowrap">{{ $t('portal port') }}</th>
                <th style="white-space: nowrap">{{ $t('automount') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(target, i) in initiatorTargets" :key="i">
                <td style="white-space: nowrap">
                  <v-menu>
                    <template #activator="{ props }">
                      <v-icon v-bind="props" style="cursor: pointer">mdi-connection</v-icon>
                    </template>
                    <v-list>
                      <v-list-item @click="loginTarget(target.id)">
                        <template #prepend>
                          <v-icon>mdi-login</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('login') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="logoutTarget(target.id)">
                        <template #prepend>
                          <v-icon>mdi-logout</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('logout') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="testConnection(target.portal.address, target.portal.port, true)">
                        <template #prepend>
                          <v-icon>mdi-lan-connect</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('test connection') }}</v-list-item-title>
                      </v-list-item>
                      <v-divider />
                      <v-list-item @click="openEditDialog(i)">
                        <template #prepend>
                          <v-icon>mdi-text-box-edit</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('edit') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="openDeleteDialog(i)">
                        <template #prepend>
                          <v-icon>mdi-delete</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ target.name }}</td>
                <td style="white-space: nowrap">{{ target.portal.address }}</td>
                <td style="white-space: nowrap">{{ target.portal.port }}</td>
                <td style="white-space: nowrap">
                  <v-chip :color="target.connection.automount ? 'green' : 'grey'" size="small" label>
                    {{ target.connection.automount ? $t('yes') : $t('no') }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Add Dialog -->
  <v-dialog v-model="createDialog.value" max-width="600px">
    <v-card :title="$t('add initiator target')" prepend-icon="mdi-plus">
      <v-card-text>
        <v-text-field v-model="createDialog.name" :label="$t('target iqn')" placeholder="iqn.2024-01.com.example:storage" density="compact" hide-details="auto" class="mb-3"></v-text-field>
        <v-row>
          <v-col cols="12" sm="8">
            <v-text-field v-model="createDialog.portal.address" :label="$t('address')" placeholder="10.0.0.1" density="compact" hide-details="auto"></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field v-model="createDialog.portal.port" :label="$t('portal port')" placeholder="3260" density="compact" hide-details="auto"></v-text-field>
          </v-col>
        </v-row>
        <v-switch v-model="createDialog.connection.automount" :label="$t('automount')" color="green" inset hide-details="auto" density="compact" class="mt-3"></v-switch>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn
          variant="text"
          color="blue"
          prepend-icon="mdi-lan-connect"
          :disabled="!createDialog.portal.address"
          :loading="testingConnection"
          @click="testConnection(createDialog.portal.address, createDialog.portal.port)"
        >
          {{ $t('test connection') }}
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" @click="createDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" :disabled="!createDialog.name || !createDialog.portal.address" @click="createInitiatorTarget()">{{ $t('add') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Edit Dialog -->
  <v-dialog v-model="editDialog.value" max-width="600px">
    <v-card :title="$t('edit initiator target')" prepend-icon="mdi-text-box-edit">
      <v-card-text>
        <v-text-field v-model="editDialog.name" :label="$t('target iqn')" placeholder="iqn.2024-01.com.example:storage" density="compact" hide-details="auto" class="mb-3"></v-text-field>
        <v-row>
          <v-col cols="12" sm="8">
            <v-text-field v-model="editDialog.portal.address" :label="$t('address')" placeholder="10.0.0.1" density="compact" hide-details="auto"></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field v-model="editDialog.portal.port" :label="$t('portal port')" placeholder="3260" density="compact" hide-details="auto"></v-text-field>
          </v-col>
        </v-row>
        <v-switch v-model="editDialog.connection.automount" :label="$t('automount')" color="green" inset hide-details="auto" density="compact" class="mt-3"></v-switch>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn
          variant="text"
          color="blue"
          prepend-icon="mdi-lan-connect"
          :disabled="!editDialog.portal.address"
          :loading="testingConnection"
          @click="testConnection(editDialog.portal.address, editDialog.portal.port)"
        >
          {{ $t('test connection') }}
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" @click="editDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" :disabled="!editDialog.name || !editDialog.portal.address" @click="updateInitiatorTarget()">{{ $t('save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Dialog -->
  <v-dialog v-model="deleteDialog.value" max-width="400">
    <v-card :title="$t('confirm delete')" prepend-icon="mdi-delete">
      <v-card-text>{{ $t('are you sure you want to delete this initiator') }}?</v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" @click="deleteDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="confirmDelete()">{{ $t('delete') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-fab @click="openAddDialog()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-plus</v-icon>
  </v-fab>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';

const { t } = useI18n();
const overlay = ref(false);
const testingConnection = ref(false);
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const initiatorTargets = ref([]);
const initiatorName = ref('');
const createDialog = reactive({ value: false, name: '', portal: { address: '', port: '3260' }, connection: { automount: false } });
const editDialog = reactive({ value: false, index: null, id: null, name: '', portal: { address: '', port: '3260' }, connection: { automount: false } });
const deleteDialog = reactive({ value: false, index: null });

onMounted(() => {
  getInitiators();
});

const testConnection = async (targetIp, targetPort, withOverlay = false) => {
  testingConnection.value = true;
  if (withOverlay) overlay.value = true;
  try {
    const res = await fetch('/api/v1/iscsi/initiator/test-connection', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ targetIp, targetPort }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || t('unknown error'));
    }
    showSnackbarSuccess(data.message || t('connection successful'));
  } catch (e) {
    showSnackbarError(t('connection failed'), e.message);
  } finally {
    testingConnection.value = false;
    overlay.value = false;
  }
};

const saveInitiator = async () => {
  overlay.value = true;
  try {
    const res = await fetch('/api/v1/iscsi/initiator/name', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: initiatorName.value }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('unknown error'));
    }
    showSnackbarSuccess(t('iscsi initiator saved successfully'));
  } catch (e) {
    showSnackbarError(t('iscsi initiator could not be saved'), e.message);
  } finally {
    overlay.value = false;
  }
};

const openAddDialog = () => {
  createDialog.value = true;
  createDialog.name = '';
  createDialog.portal.address = '';
  createDialog.portal.port = '3260';
  createDialog.connection.automount = false;
};

const openEditDialog = (index) => {
  const tgt = initiatorTargets.value[index];
  editDialog.value = true;
  editDialog.index = index;
  editDialog.id = tgt.id;
  editDialog.name = tgt.name;
  editDialog.portal.address = tgt.portal.address;
  editDialog.portal.port = tgt.portal.port;
  editDialog.connection.automount = tgt.connection.automount;
};

const openDeleteDialog = (index) => {
  deleteDialog.value = true;
  deleteDialog.index = index;
};

const createInitiatorTarget = async () => {
  overlay.value = true;

  const payload = {
    name: createDialog.name,
    portal: {
      address: createDialog.portal.address,
      port: createDialog.portal.port,
    },
    connection: {
      automount: createDialog.connection.automount,
    },
  };

  try {
    const res = await fetch('/api/v1/iscsi/initiator/targets', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('unknown error'));
    }
    const data = await res.json();
    getInitiators();
    createDialog.value = false;
    showSnackbarSuccess(t('iscsi initiator saved successfully'));
  } catch (e) {
    showSnackbarError(t('iscsi initiator could not be saved'), e.message);
  } finally {
    overlay.value = false;
  }
};

const updateInitiatorTarget = async () => {
  overlay.value = true;
  const payload = {
    name: editDialog.name,
    portal: {
      address: editDialog.portal.address,
      port: editDialog.portal.port,
    },
    connection: {
      automount: editDialog.connection.automount,
    },
  };
  try {
    const res = await fetch(`/api/v1/iscsi/initiator/targets/${editDialog.id}`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('unknown error'));
    }
    getInitiators();
    editDialog.value = false;
    showSnackbarSuccess(t('iscsi initiator saved successfully'));
  } catch (e) {
    showSnackbarError(t('iscsi initiator could not be saved'), e.message);
  } finally {
    overlay.value = false;
  }
};

const confirmDelete = async () => {
  const index = deleteDialog.index;
  const target = initiatorTargets.value[index];
  if (target.id !== null) {
    overlay.value = true;
    try {
      const res = await fetch(`/api/v1/iscsi/initiator/targets/${target.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('authToken'),
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || t('unknown error'));
      }
      getInitiators();
      showSnackbarSuccess(t('iscsi initiator deleted successfully'));
      deleteDialog.value = false;
    } catch (e) {
      showSnackbarError(t('iscsi initiator could not be deleted'), e.message);
      overlay.value = false;
      deleteDialog.value = false;
      return;
    } finally {
      overlay.value = false;
    }
  }
};

const loginTarget = async (targetId) => {
  overlay.value = true;
  try {
    const res = await fetch(`/api/v1/iscsi/initiator/targets/${targetId}/login`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || t('unknown error'));
    }
    showSnackbarSuccess(data.message || t('login'));
    getInitiators();
  } catch (e) {
    showSnackbarError(t('login failed'), e.message);
  } finally {
    overlay.value = false;
  }
};

const logoutTarget = async (targetId) => {
  overlay.value = true;
  try {
    const res = await fetch(`/api/v1/iscsi/initiator/targets/${targetId}/logout`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || t('unknown error'));
    }
    showSnackbarSuccess(data.message || t('logout'));
    getInitiators();
  } catch (e) {
    showSnackbarError(t('logout'), e.message);
  } finally {
    overlay.value = false;
  }
};

const getInitiators = async () => {
  overlay.value = true;
  try {
    const res = await fetch('/api/v1/iscsi/initiator', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('unknown error'));
    }

    const initiatorData = await res.json();
    initiatorName.value = initiatorData.initiator?.name ?? '';
    initiatorTargets.value = initiatorData.targets ?? [];
  } catch (e) {
    showSnackbarError(t('iscsi initiators could not be loaded'), e.message);
  } finally {
    overlay.value = false;
  }
};
</script>
