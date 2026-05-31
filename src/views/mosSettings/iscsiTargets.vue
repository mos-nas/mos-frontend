<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <div class="d-flex align-center ga-3 mb-4">
          <v-icon @click="$router.back()" style="cursor: pointer; vertical-align: middle">mdi-arrow-left</v-icon>
          <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
          <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('iscsi targets') }}</h2>
        </div>
      </v-container>

      <v-container fluid class="pa-0">
        <v-card v-if="targets.length === 0" fluid class="mb-4 ml-0 mr-0 pa-0">
          <v-card-text class="pa-4">
            {{ $t('no targets configured') }}
          </v-card-text>
        </v-card>
        <v-card v-else fluid style="margin-bottom: 80px" class="pa-0">
          <v-table density="comfortable" style="overflow-x: auto">
            <thead>
              <tr style="background-color: rgba(0, 0, 0, 0.04)">
                <th style="white-space: nowrap; width: 32px"></th>
                <th style="white-space: nowrap">{{ $t('name') }}</th>
                <th style="white-space: nowrap">{{ $t('target iqn') }}</th>
                <th style="white-space: nowrap">{{ $t('portal') }}</th>
                <th style="white-space: nowrap">{{ $t('authentication method') }}</th>
                <th style="white-space: nowrap">{{ $t('status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(target, i) in targets" :key="i">
                <td style="white-space: nowrap">
                  <v-menu>
                    <template #activator="{ props }">
                      <v-icon v-bind="props" :color="target.isActive ? 'green' : 'blue'" style="cursor: pointer">mdi-server</v-icon>
                    </template>
                    <v-list>
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
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ target.iqn }}</td>
                <td style="white-space: nowrap">{{ target.portal }}</td>
                <td style="white-space: nowrap">
                  <v-chip size="small" label>{{ target.authentication.method.toUpperCase() }}</v-chip>
                </td>
                <td style="white-space: nowrap">
                  <v-chip :color="target.isActive ? 'green' : 'blue'" size="small" label>
                    {{ target.isActive ? $t('active') : $t('inactive') }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Create Dialog -->
  <v-dialog v-model="createDialog.value" max-width="700px" scrollable>
    <v-card :title="$t('add target')" prepend-icon="mdi-plus">
      <v-card-text style="max-height: 70vh">
        <v-text-field v-model="createDialog.name" :label="$t('name')" density="compact" class="mt-2"></v-text-field>
        <v-text-field v-model="createDialog.portal" :label="$t('portal')" placeholder="0.0.0.0:3260" density="compact"></v-text-field>
        <v-text-field v-model="createDialog.iqn" :label="$t('target iqn')" placeholder="iqn.2024-01.com.example:storage" density="compact"></v-text-field>
        <v-divider class="my-4"></v-divider>
        <div class="d-flex align-center mb-3">
          <span class="font-weight-medium">{{ $t('chap authentication') }}</span>
        </div>
        <v-select
          v-model="createDialog.authentication.method"
          :label="$t('authentication method')"
          :items="authMethods"
          item-title="label"
          item-value="value"
          density="compact"
          hide-details="auto"
        ></v-select>
        <v-expand-transition>
          <div v-if="createDialog.authentication.method === 'chap'">
            <v-text-field v-model="createDialog.authentication.username" :label="$t('chap username')" class="mt-3" density="compact" hide-details="auto"></v-text-field>
            <v-text-field v-model="createDialog.authentication.password" :label="$t('chap password')" type="password" class="mt-3" density="compact" hide-details="auto"></v-text-field>
          </div>
        </v-expand-transition>

        <v-divider class="my-4"></v-divider>
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="font-weight-medium">{{ $t('luns') }}</span>
          <v-btn size="small" variant="text" color="green" prepend-icon="mdi-plus" @click="addLun(createDialog)">{{ $t('add') }}</v-btn>
        </div>
        <v-table v-if="createDialog.luns.length > 0" density="compact" class="rounded border dialog-table">
          <thead>
            <tr>
              <th>{{ $t('lun id') }}</th>
              <th>{{ $t('path') }}</th>
              <th>{{ $t('backing store') }}</th>
              <th>{{ $t('mode') }}</th>
              <th>{{ $t('size') }}</th>
              <th style="width: 48px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(lun, li) in createDialog.luns" :key="li">
              <td><v-text-field v-model.number="lun.id" density="compact" variant="plain" type="number" hide-details style="min-width: 60px; max-width: 80px"></v-text-field></td>
              <td><v-text-field v-model="lun.path" density="compact" variant="plain" placeholder="/dev/sda" hide-details></v-text-field></td>
              <td><v-select v-model="lun.backing_store" density="compact" variant="plain" :items="backingStores" hide-details style="min-width: 90px"></v-select></td>
              <td><v-text-field v-model="lun.mode" density="compact" variant="plain" hide-details style="min-width: 90px"></v-text-field></td>
              <td><v-text-field v-model="lun.size" density="compact" variant="plain" placeholder="1G" hide-details style="min-width: 60px"></v-text-field></td>
              <td>
                <v-btn icon size="x-small" variant="text" color="red" @click="createDialog.luns.splice(li, 1)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>

        <v-divider class="my-4"></v-divider>
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="font-weight-medium">{{ $t('allowed initiators') }}</span>
          <v-btn size="small" variant="text" color="green" prepend-icon="mdi-plus" @click="createDialog.initiators.push({ iqn: '', authentication: { method: 'none' } })">{{ $t('add') }}</v-btn>
        </div>
        <v-table v-if="createDialog.initiators.length > 0" density="compact" class="rounded border dialog-table">
          <thead>
            <tr>
              <th>{{ $t('initiator iqn') }}</th>
              <th>{{ $t('authentication method') }}</th>
              <th style="width: 48px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(initiator, ii) in createDialog.initiators" :key="ii">
              <td><v-text-field v-model="initiator.iqn" density="compact" variant="plain" placeholder="iqn.2024-01.com.client:host" hide-details></v-text-field></td>
              <td>
                <v-select
                  v-model="initiator.authentication.method"
                  density="compact"
                  variant="plain"
                  :items="authMethods"
                  item-title="label"
                  item-value="value"
                  hide-details
                  style="min-width: 100px"
                ></v-select>
              </td>
              <td>
                <v-btn icon size="x-small" variant="text" color="red" @click="createDialog.initiators.splice(ii, 1)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" @click="createDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" :disabled="!createDialog.name" @click="createTarget()">{{ $t('add') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Edit Dialog -->
  <v-dialog v-model="editDialog.value" max-width="700px" scrollable>
    <v-card :title="$t('edit target')" prepend-icon="mdi-text-box-edit">
      <v-card-text style="max-height: 70vh">
        <v-text-field v-model="editDialog.name" :label="$t('name')" density="compact"></v-text-field>
        <v-text-field v-model="editDialog.portal" :label="$t('portal')" placeholder="0.0.0.0:3260" density="compact"></v-text-field>
        <v-text-field v-model="editDialog.iqn" :label="$t('target iqn')" placeholder="iqn.2024-01.com.example:storage" density="compact" hide-details="auto"></v-text-field>
        <v-divider class="my-4"></v-divider>
        <div class="d-flex align-center mb-3">
          <span class="font-weight-medium">{{ $t('chap authentication') }}</span>
        </div>
        <v-select
          v-model="editDialog.authentication.method"
          :label="$t('authentication method')"
          :items="authMethods"
          item-title="label"
          item-value="value"
          density="compact"
          hide-details="auto"
        ></v-select>
        <v-expand-transition>
          <div v-if="editDialog.authentication.method === 'chap'">
            <v-text-field v-model="editDialog.authentication.username" :label="$t('chap username')" class="mt-3" density="compact" hide-details="auto"></v-text-field>
            <v-text-field v-model="editDialog.authentication.password" :label="$t('chap password')" type="password" class="mt-3" density="compact" hide-details="auto"></v-text-field>
          </div>
        </v-expand-transition>
        <v-divider class="my-4"></v-divider>
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="font-weight-medium">{{ $t('luns') }}</span>
          <v-btn size="small" variant="text" color="green" prepend-icon="mdi-plus" @click="addLun(editDialog)">{{ $t('add') }}</v-btn>
        </div>
        <v-table v-if="editDialog.luns.length > 0" density="compact" class="rounded border dialog-table">
          <thead>
            <tr>
              <th>{{ $t('lun id') }}</th>
              <th>{{ $t('path') }}</th>
              <th>{{ $t('backing store') }}</th>
              <th>{{ $t('mode') }}</th>
              <th>{{ $t('size') }}</th>
              <th style="width: 48px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(lun, li) in editDialog.luns" :key="li">
              <td><v-text-field v-model.number="lun.id" density="compact" variant="plain" type="number" hide-details style="min-width: 60px; max-width: 80px"></v-text-field></td>
              <td><v-text-field v-model="lun.path" density="compact" variant="plain" placeholder="/dev/sda" hide-details></v-text-field></td>
              <td><v-select v-model="lun.backing_store" density="compact" variant="plain" :items="backingStores" hide-details style="min-width: 90px"></v-select></td>
              <td><v-text-field v-model="lun.mode" density="compact" variant="plain" hide-details style="min-width: 90px"></v-text-field></td>
              <td><v-text-field v-model="lun.size" density="compact" variant="plain" placeholder="1G" hide-details style="min-width: 60px"></v-text-field></td>
              <td>
                <v-btn icon size="x-small" variant="text" color="red" @click="editDialog.luns.splice(li, 1)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-divider class="my-4"></v-divider>
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="font-weight-medium">{{ $t('allowed initiators') }}</span>
          <v-btn size="small" variant="text" color="green" prepend-icon="mdi-plus" @click="editDialog.initiators.push({ iqn: '', authentication: { method: 'none' } })">{{ $t('add') }}</v-btn>
        </div>
        <v-table v-if="editDialog.initiators.length > 0" density="compact" class="rounded border dialog-table">
          <thead>
            <tr>
              <th>{{ $t('initiator iqn') }}</th>
              <th>{{ $t('authentication method') }}</th>
              <th style="width: 48px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(initiator, ii) in editDialog.initiators" :key="ii">
              <td><v-text-field v-model="initiator.iqn" density="compact" variant="plain" placeholder="iqn.2024-01.com.client:host" hide-details></v-text-field></td>
              <td>
                <v-select
                  v-model="initiator.authentication.method"
                  density="compact"
                  variant="plain"
                  :items="authMethods"
                  item-title="label"
                  item-value="value"
                  hide-details
                  style="min-width: 100px"
                ></v-select>
              </td>
              <td>
                <v-btn icon size="x-small" variant="text" color="red" @click="editDialog.initiators.splice(ii, 1)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" @click="editDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" :disabled="!editDialog.name" @click="updateTarget()">{{ $t('save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Dialog -->
  <v-dialog v-model="deleteDialog.value" max-width="400">
    <v-card :title="$t('confirm delete')" prepend-icon="mdi-delete">
      <v-card-text>{{ $t('are you sure you want to delete this target') }}?</v-card-text>
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
import { onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { t } = useI18n();
const overlay = ref(false);
const targets = ref([]);
const authMethods = [
  { label: 'None', value: 'none' },
  { label: 'CHAP', value: 'chap' },
];
const backingStores = ['rdwr', 'rdonly'];

const emptyCreateState = () => {
  return {
    open: false,
    name: '',
    iqn: '',
    portal: '0.0.0.0:3260',
    authentication: { method: 'none', username: '', password: '' },
    luns: [],
    initiators: [],
  };
};

const emptyEditState = () => {
  return {
    open: false,
    index: null,
    id: null,
    name: '',
    iqn: '',
    portal: '0.0.0.0:3260',
    authentication: { method: 'none', username: '', password: '' },
    luns: [],
    initiators: [],
  };
};

const createDialog = reactive(emptyCreateState());
const editDialog = reactive(emptyEditState());
const deleteDialog = reactive({ value: false, index: null });

onMounted(() => {
  getTargets();
});

const openAddDialog = () => {
  Object.assign(createDialog, emptyCreateState());
  createDialog.value = true;
};

const openEditDialog = (index) => {
  const tgt = targets.value[index];
  Object.assign(editDialog, {
    value: true,
    index,
    id: tgt.id,
    name: tgt.name,
    iqn: tgt.iqn,
    portal: tgt.portal,
    authentication: { method: tgt.authentication.method, username: tgt.authentication.username ?? '', password: tgt.authentication.password ?? '' },
    luns: tgt.luns.map((l) => ({ ...l })),
    initiators: tgt.initiators.map((i) => ({ iqn: i.iqn, authentication: { method: i.authentication.method } })),
  });
};

const openDeleteDialog = (index) => {
  deleteDialog.value = true;
  deleteDialog.index = index;
};

const addLun = (dialog) => {
  dialog.luns.push({
    id: dialog.luns.length + 1,
    path: '',
    backing_store: 'rdwr',
    mode: 'logicalunit',
    size: '',
  });
};

const createTarget = async () => {
  overlay.value = true;
  const payload = {
    id: targets.value.length > 0 ? Math.max(...targets.value.map((t) => t.id ?? 0)) + 1 : 1,
    name: createDialog.name,
    iqn: createDialog.iqn,
    portal: createDialog.portal,
    authentication:
      createDialog.authentication.method === 'chap' ? { method: 'chap', username: createDialog.authentication.username, password: createDialog.authentication.password } : { method: 'none' },
    luns: createDialog.luns.map((l) => ({ id: l.id, path: l.path, backing_store: l.backing_store, mode: l.mode, size: l.size })),
    initiators: createDialog.initiators.map((i) => ({ iqn: i.iqn, authentication: { method: i.authentication.method } })),
  };

  try {
    const res = await fetch('/api/v1/iscsi/targets', {
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
    getTargets();
    createDialog.value = false;
    showSnackbarSuccess(t('iscsi target saved successfully'));
  } catch (e) {
    showSnackbarError(t('iscsi target could not be saved'), e.message);
  } finally {
    overlay.value = false;
  }
};

const updateTarget = async () => {
  overlay.value = true;
  const payload = {
    name: editDialog.name,
    iqn: editDialog.iqn,
    portal: editDialog.portal,
    authentication: editDialog.authentication.method === 'chap' ? { method: 'chap', username: editDialog.authentication.username, password: editDialog.authentication.password } : { method: 'none' },
    luns: editDialog.luns.map((l) => ({ id: l.id, path: l.path, backing_store: l.backing_store, mode: l.mode, size: l.size })),
    initiators: editDialog.initiators.map((i) => ({ iqn: i.iqn, authentication: { method: i.authentication.method } }))
  };

  try {
    const res = await fetch(`/api/v1/iscsi/targets/${editDialog.id}`, {
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
    const data = await res.json();
    getTargets();

    editDialog.value = false;
    showSnackbarSuccess(t('iscsi target saved successfully'));
  } catch (e) {
    showSnackbarError(t('iscsi target could not be saved'), e.message);
  } finally {
    overlay.value = false;
  }
};

const confirmDelete = async () => {
  const index = deleteDialog.index;
  const target = targets.value[index];
  overlay.value = true;
  try {
    const res = await fetch(`/api/v1/iscsi/targets/${target.id}`, {
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
    getTargets();
    deleteDialog.value = false;
  } catch (e) {
    showSnackbarError(t('iscsi target could not be deleted'), e.message);
    overlay.value = false;
    deleteDialog.value = false;
    return;
  } finally {
    overlay.value = false;
  }
};

const getTargets = async () => {
  overlay.value = true;
  try {
    const res = await fetch('/api/v1/iscsi/targets', {
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

    const targetsData = await res.json();
    targets.value = targetsData;
  } catch (e) {
    showSnackbarError(t('iscsi targets could not be loaded'), e.message);
  } finally {
    overlay.value = false;
  }
};
</script>

<style scoped>
.dialog-table :deep(.v-table__wrapper) {
  overflow: visible;
}
</style>
