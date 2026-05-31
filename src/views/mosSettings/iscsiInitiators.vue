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
        <v-card v-if="initiatorTargets.length === 0" fluid class="mb-4 ml-0 mr-0 pa-0">
          <v-card-text class="pa-4">
            {{ $t('no targets configured') }}
          </v-card-text>
        </v-card>
        <v-card v-else fluid style="margin-bottom: 80px" class="pa-0">
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
                      <v-list-item @click="openEditDialog(i)">
                        <template #prepend>
                          <v-icon>mdi-text-box-edit</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('edit') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item v-if="!target.enabled" @click="toggleEnabled(i)">
                        <template #prepend>
                          <v-icon>mdi-play-circle</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('enable') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item v-else @click="toggleEnabled(i)">
                        <template #prepend>
                          <v-icon>mdi-stop-circle</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('disable') }}</v-list-item-title>
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
  <v-dialog v-model="createDialog.open" max-width="600px">
    <v-card :title="$t('add initiator target')" prepend-icon="mdi-plus">
      <v-card-text>
        <v-switch v-model="createDialog.enabled" :label="$t('enabled')" color="green" inset hide-details="auto" density="compact" class="mb-2"></v-switch>
        <v-text-field v-model="createDialog.name" :label="$t('target iqn')" placeholder="iqn.2024-01.com.example:storage" class="mb-2"></v-text-field>
        <v-row>
          <v-col cols="12" sm="8">
            <v-text-field v-model="createDialog.address" :label="$t('address')" placeholder="10.0.0.1"></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field v-model="createDialog.port" :label="$t('portal port')" placeholder="3260"></v-text-field>
          </v-col>
        </v-row>
        <v-switch v-model="createDialog.automount" :label="$t('automount')" color="green" inset hide-details="auto" density="compact"></v-switch>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="createDialog.open = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" :disabled="!createDialog.name || !createDialog.address" @click="createInitiatorTarget()">{{ $t('add') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Edit Dialog -->
  <v-dialog v-model="editDialog.open" max-width="600px">
    <v-card :title="$t('edit initiator target')" prepend-icon="mdi-text-box-edit">
      <v-card-text>
        <v-switch v-model="editDialog.enabled" :label="$t('enabled')" color="green" inset hide-details="auto" density="compact" class="mb-2"></v-switch>
        <v-text-field v-model="editDialog.name" :label="$t('target iqn')" placeholder="iqn.2024-01.com.example:storage" class="mb-2"></v-text-field>
        <v-row>
          <v-col cols="12" sm="8">
            <v-text-field v-model="editDialog.address" :label="$t('address')" placeholder="10.0.0.1"></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field v-model="editDialog.port" :label="$t('portal port')" placeholder="3260"></v-text-field>
          </v-col>
        </v-row>
        <v-switch v-model="editDialog.automount" :label="$t('automount')" color="green" inset hide-details="auto" density="compact"></v-switch>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="editDialog.open = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" :disabled="!editDialog.name || !editDialog.address" @click="updateInitiatorTarget()">{{ $t('save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Dialog -->
  <v-dialog v-model="deleteDialog.open" max-width="400">
    <v-card :title="$t('confirm delete')" prepend-icon="mdi-delete">
      <v-card-text>{{ $t('are you sure you want to delete this target') }}?</v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="deleteDialog.open = false">{{ $t('cancel') }}</v-btn>
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

const initiatorTargets = ref([]);
const createDialog = reactive({ open: false, name: '', address: '', port: '3260', automount: false, enabled: true });
const editDialog = reactive({ open: false, index: null, id: null, name: '', address: '', port: '3260', automount: false, enabled: true });
const deleteDialog = reactive({ open: false, index: null });

const authHeaders = () => ({
  Authorization: 'Bearer ' + localStorage.getItem('authToken'),
  'Content-Type': 'application/json',
});

const openAddDialog = () => {
  createDialog.open = true;
  createDialog.name = '';
  createDialog.address = '';
  createDialog.port = '3260';
  createDialog.automount = false;
  createDialog.enabled = true;
}

const openDeleteDialog = (index) => {
  deleteDialog.open = true;
  deleteDialog.index = index;
}

const toggleEnabled = async (index) => {
  const target = initiatorTargets.value[index];
  const newEnabled = !target.enabled;
  try {
    const res = await fetch(`/api/v1/iscsi/initiator/targets/${target.id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ enabled: newEnabled }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('unknown error'));
    }
    target.enabled = newEnabled;
  } catch (e) {
    showSnackbarError(t('iscsi config could not be saved'), e.message);
  }
}

const createInitiator = async () => {
  overlay.value = true;

  const payload = {
    name: createDialog.name,
    portal: {
      address: createDialog.address,
      port: createDialog.port,
    },
    connection: {
      automount: createDialog.automount,
    },
    enabled: createDialog.enabled,
  };

  try {
    const res = await fetch('/api/v1/iscsi/initiator/targets', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('unknown error'));
    }
    const data = await res.json();
    initiatorTargets.value.push({
      id: data.id ?? null,
      name: createDialog.value.name,
      portal: { address: createDialog.value.address, port: createDialog.value.port },
      connection: { automount: createDialog.value.automount },
      enabled: createDialog.value.enabled,
    });
    createDialog.value.open = false;
    showSnackbarSuccess(t('iscsi config saved successfully'));
  } catch (e) {
    showSnackbarError(t('iscsi config could not be saved'), e.message);
  } finally {
    overlay.value = false;
  }
};

const confirmDelete = async () => {
  const index = deleteDialog.value.index;
  const target = initiatorTargets.value[index];
  if (target.id !== null) {
    overlay.value = true;
    try {
      const res = await fetch(`/api/v1/iscsi/initiator/targets/${target.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || t('unknown error'));
      }
    } catch (e) {
      showSnackbarError(t('iscsi config could not be saved'), e.message);
      overlay.value = false;
      deleteDialog.value.open = false;
      return;
    } finally {
      overlay.value = false;
    }
  }
  initiatorTargets.value.splice(index, 1);
  deleteDialog.value.open = false;
};

const getInitiators = async () => {
  overlay.value = true;
  try {
    const res = await fetch('/api/v1/iscsi/initiator', {
      method: 'GET',
      headers: authHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('unknown error'));
    }

    const initiatorData = await res.json();

    initiatorTargets.value = (initiatorData.targets ?? []).map((t) => ({
      id: t.id ?? null,
      name: t.name ?? '',
      portal: {
        address: t.portal?.address ?? '',
        port: t.portal?.port ?? '3260',
      },
      connection: {
        automount: t.connection?.automount ?? false,
      },
      enabled: t.enabled ?? true,
    }));
  } catch (e) {
    showSnackbarError(t('iscsi config could not be loaded'), e.message);
  } finally {
    overlay.value = false;
  }
};

onMounted(getInitiators);
</script>
