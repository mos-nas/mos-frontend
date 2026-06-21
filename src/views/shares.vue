<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <div class="d-flex align-center ga-3 mb-4">
          <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
          <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ t('shares') }}</h2>
        </div>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader v-if="sharesLoading" :loading="true" type="card" />
        <v-card v-else-if="shares.smb.length === 0 && shares.nfs.length === 0 && !sharesLoading" fluid class="mb-4 ml-0 mr-0 pa-0">
          <v-card-text class="pa-4">
            {{ $t('no shares have been created yet') }}
          </v-card-text>
        </v-card>
        <v-card v-else style="margin-bottom: 80px" class="pa-0">
          <v-table density="comfortable" style="overflow-x: auto; table-layout: fixed">
            <thead>
              <tr style="background-color: rgba(0, 0, 0, 0.04)">
                <th style="white-space: nowrap; width: 32px"></th>
                <th style="white-space: nowrap; width: 200px; overflow: hidden; text-overflow: ellipsis">{{ $t('name') }}</th>
                <th style="white-space: nowrap">{{ $t('pool') }}</th>
                <th style="white-space: nowrap">{{ $t('path') }}</th>
                <th style="white-space: nowrap">{{ $t('type') }}</th>
                <th style="white-space: nowrap">{{ $t('read rights') }}</th>
                <th style="white-space: nowrap">{{ $t('write rights') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="share in shares.smb" :key="share.id">
                <td style="white-space: nowrap">
                  <v-menu>
                    <template #activator="{ props }">
                      <v-icon v-bind="props" :color="share.enabled ? 'green' : 'red'" style="cursor: pointer">mdi-share</v-icon>
                    </template>
                    <v-list>
                      <v-list-item @click="openEditSmbDialog(share)">
                        <template #prepend>
                          <v-icon>mdi-text-box-edit</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('edit') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item v-if="checkMergerFs(share.pool)" @click="openTargetDevicesDialog(share)">
                        <template #prepend>
                          <v-icon>mdi-target</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('target devices') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="openDeleteSmbDialog(share)">
                        <template #prepend>
                          <v-icon>mdi-delete</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </td>
                <td style="max-width: 200px">
                  <div class="text-ellipsis" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ share.name }}</div>
                  <div v-if="share.comment" class="text-caption text-medium-emphasis text-ellipsis" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ share.comment }}</div>
                </td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ share.pool }}</td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ share.path }}</td>
                <td style="white-space: nowrap">
                  <v-chip size="small" label>{{ $t('smb') }}</v-chip>
                  <v-chip v-if="share.guest_ok" color="onPrimary" size="x-small" class="ml-1" label>{{ $t('guest ok') }}</v-chip>
                  <v-chip v-if="share.read_only" color="onPrimary" size="x-small" class="ml-1" label>{{ $t('read only') }}</v-chip>
                </td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                  <template v-if="share.valid_users?.length">
                    <v-chip v-for="user in share.valid_users" :key="user" size="small" class="mr-1 mb-1" label>{{ user }}</v-chip>
                  </template>
                  <span v-else>—</span>
                </td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                  <template v-if="share.write_list?.length">
                    <v-chip v-for="user in share.write_list" :key="user" size="small" class="mr-1 mb-1" label>{{ user }}</v-chip>
                  </template>
                  <span v-else>—</span>
                </td>
              </tr>
              <tr v-for="share in shares.nfs" :key="share.id">
                <td style="white-space: nowrap">
                  <v-menu>
                    <template #activator="{ props }">
                      <v-icon v-bind="props" :color="share.enabled ? 'green' : 'red'" style="cursor: pointer">mdi-share</v-icon>
                    </template>
                    <v-list>
                      <v-list-item @click="openEditNfsDialog(share)">
                        <template #prepend>
                          <v-icon>mdi-text-box-edit</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('edit') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item v-if="checkMergerFs(share.pool)" @click="openTargetDevicesDialog(share)">
                        <template #prepend>
                          <v-icon>mdi-target</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('target devices') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="openDeleteNfsDialog(share)">
                        <template #prepend>
                          <v-icon>mdi-delete</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </td>
                <td style="max-width: 200px">
                  <div class="text-ellipsis" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ share.name }}</div>
                </td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ share.pool || '—' }}</td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ share.path }}</td>
                <td style="white-space: nowrap">
                  <v-chip size="small" label>{{ $t('nfs') }}</v-chip>
                  <v-chip v-if="share.read_only" color="onPrimary" size="x-small" class="ml-1" label>{{ $t('read only') }}</v-chip>
                </td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                  <span>{{ share.source || '—' }}</span>
                </td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">—</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Create Smb Dialog -->
  <v-dialog v-model="createSmbDialog.value" max-width="500">
    <v-card class="pa-0" :title="$t('create share')" prepend-icon="mdi-plus">
      <v-card-text style="max-height: 60vh; display: flex; flex-direction: column; overflow: auto" class="pt-2">
        <v-text-field v-model="createSmbDialog.shareName" :label="$t('share name')" required autofocus />
        <v-select v-model="createSmbDialog.poolName" :items="pools" item-title="name" item-value="name" :label="$t('pool')" required clearable />
        <v-text-field
          v-model="createSmbDialog.subPath"
          :label="$t('select directory')"
          append-inner-icon="mdi-folder"
          required
          @click:append-inner="
            openFsDialog(
              (item) => {
                createSmbDialog.subPath = item.path;
              },
              pools.find((p) => p.name === createSmbDialog.poolName)?.mountPoint || '/',
            )
          "
        />
        <v-select v-model="createSmbDialog.valid_users" :items="Array.isArray(smbUsers) ? smbUsers.map((user) => user.username) : []" :label="$t('read rights')" multiple />
        <v-select v-model="createSmbDialog.write_list" :items="Array.isArray(smbUsers) ? smbUsers.map((user) => user.username) : []" :label="$t('write rights')" multiple />
        <v-text-field v-model="createSmbDialog.comment" :label="$t('comment')" clearable />
        <v-divider></v-divider>
        <v-btn variant="text" @click="createSmbDialog.showAdvanced = !createSmbDialog.showAdvanced" class="mb-4">
          {{ createSmbDialog.showAdvanced ? $t('hide advanced options') : $t('show advanced options') }}
        </v-btn>
        <v-slide-y-transition>
          <div v-if="createSmbDialog.showAdvanced">
            <v-text-field v-model="createSmbDialog.create_mask" :label="$t('create mask')" required />
            <v-text-field v-model="createSmbDialog.directory_mask" :label="$t('directory mask')" required />
            <v-switch v-model="createSmbDialog.force_root" :label="$t('force root')" inset hide-details density="compact" class="ml-4" color="green" />
            <v-switch v-model="createSmbDialog.inherit_permissions" :label="$t('inherit permissions')" inset hide-details density="compact" class="ml-4" color="green" />
            <v-switch v-model="createSmbDialog.hide_dot_files" :label="$t('hide dot files')" inset hide-details density="compact" class="ml-4" color="green" />
            <v-switch v-model="createSmbDialog.preserve_case" :label="$t('preserve case')" inset hide-details density="compact" class="ml-4" color="green" />
            <v-switch v-model="createSmbDialog.case_sensitive" :label="$t('case sensitive')" inset hide-details density="compact" class="ml-4" color="green" />
          </div>
        </v-slide-y-transition>
        <v-switch v-model="createSmbDialog.enabled" :label="$t('enabled')" inset hide-details density="compact" class="ml-4" color="green" />
        <v-switch v-model="createSmbDialog.browseable" :label="$t('browseable')" inset hide-details density="compact" class="ml-4" color="green" />
        <v-switch v-model="createSmbDialog.read_only" :label="$t('read only')" inset hide-details density="compact" class="ml-4" color="green" />
        <v-switch v-model="createSmbDialog.guest_ok" :label="$t('guest ok')" inset hide-details density="compact" class="ml-4" color="green" />
        <v-switch v-model="createSmbDialog.allow_execute_always" :label="$t('allow execute always')" inset hide-details density="compact" class="ml-4" color="green" />
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn color="onPrimary" @click="createSmbDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="createShareSmb()">
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Create Nfs Dialog -->
  <v-dialog v-model="createNfsDialog.value" max-width="500">
    <v-card class="pa-0" :title="$t('add nfs share')" prepend-icon="mdi-plus">
      <v-card-text style="max-height: 60vh; display: flex; flex-direction: column; overflow: auto" class="pt-2">
        <v-text-field v-model="createNfsDialog.shareName" :label="$t('share name')" required autofocus />
        <v-select v-model="createNfsDialog.poolName" :items="pools" item-title="name" item-value="name" :label="$t('pool')" required clearable/>
        <v-text-field
          v-model="createNfsDialog.subPath"
          :label="$t('select directory')"
          append-inner-icon="mdi-folder"
          required
          @click:append-inner="
            openFsDialog(
              (item) => {
                createNfsDialog.subPath = item.path;
              },
              pools.find((p) => p.name === createNfsDialog.poolName)?.mountPoint || '/',
            )
          "
        />
        <v-text-field v-model="createNfsDialog.source" :label="$t('source')" required />
        <v-text-field v-model="createNfsDialog.anonuid" :label="$t('anonymous uid')" type="number" />
        <v-text-field v-model="createNfsDialog.anongid" :label="$t('anonymous gid')" type="number" />
        <v-select v-model="createNfsDialog.write_operations" :items="['sync', 'async']" :label="$t('write operations')" clearable/>
        <v-select v-model="createNfsDialog.mapping" :items="['no_root_squash', 'all_squash', 'root_squash']" :label="$t('mapping')" clearable/>
        <v-switch v-model="createNfsDialog.read_only" :label="$t('read only')" inset hide-details density="compact" class="ml-4" color="green" />
        <v-switch v-model="createNfsDialog.secure" :label="$t('secure')" inset hide-details density="compact" class="ml-4" color="green" />
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn color="onPrimary" @click="createNfsDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="createShareNfs()">
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Smb Dialog -->
  <v-dialog v-model="deleteSmbDialog.value" max-width="400">
    <v-card class="pa-0" :title="$t('confirm delete')" prepend-icon="mdi-alert">
      <v-card-text style="max-height: 60vh; display: flex; flex-direction: column; overflow: auto">
        {{ $t('are you sure you want to delete this share?') }}
        <v-checkbox v-model="deleteSmbDialog.deleteDirectory" :label="$t('delete directory')" class="mt-4" density="compact" hide-details="" />
        <v-checkbox v-model="deleteSmbDialog.removePathRule" :label="$t('remove path rule')" density="compact" hide-details="" />
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn color="onPrimary" @click="deleteSmbDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deleteShareSmb(deleteSmbDialog.share, deleteSmbDialog.deleteDirectory)">
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Nfs Dialog -->
  <v-dialog v-model="deleteNfsDialog.value" max-width="400">
    <v-card class="pa-0" :title="$t('confirm delete')" prepend-icon="mdi-alert">
      <v-card-text style="max-height: 60vh; display: flex; flex-direction: column; overflow: auto">
        {{ $t('are you sure you want to delete this nfs share?') }}
        <v-checkbox v-model="deleteNfsDialog.deleteDirectory" :label="$t('delete directory')" class="mt-4" density="compact" hide-details="" />
        <v-checkbox v-model="deleteNfsDialog.removePathRule" :label="$t('remove path rule')" density="compact" hide-details="" />
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn color="onPrimary" @click="deleteNfsDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deleteShareNfs(deleteNfsDialog.share)">
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Edit Smb Dialog -->
  <v-dialog v-model="editSmbDialog.value" max-width="500">
    <v-card class="pa-0" :title="$t('edit share')" prepend-icon="mdi-pencil">
      <v-card-text style="max-height: 60vh; display: flex; flex-direction: column; overflow: auto" class="pt-2">
        <v-text-field v-model="editSmbDialog.name" :label="$t('share name')" readonly />
        <v-text-field v-model="editSmbDialog.path" :label="$t('path')" readonly />
        <v-text-field v-model="editSmbDialog.comment" :label="$t('comment')" clearable />
        <v-select v-model="editSmbDialog.valid_users" :items="Array.isArray(smbUsers) ? smbUsers.map((user) => user.username) : []" :label="$t('read rights')" multiple />
        <v-select v-model="editSmbDialog.write_list" :items="Array.isArray(smbUsers) ? smbUsers.map((user) => user.username) : []" :label="$t('write rights')" multiple />
        <v-switch v-model="editSmbDialog.enabled" :label="$t('enabled')" inset hide-details density="compact" class="ml-4" color="green" />
        <v-switch v-model="editSmbDialog.browseable" :label="$t('browseable')" inset hide-details density="compact" class="ml-4" color="green" />
        <v-switch v-model="editSmbDialog.read_only" :label="$t('read only')" inset hide-details density="compact" class="ml-4" color="green" />
        <v-switch v-model="editSmbDialog.guest_ok" :label="$t('guest ok')" inset hide-details density="compact" class="ml-4" color="green" />
        <v-switch v-model="editSmbDialog.force_root" :label="$t('force root')" inset hide-details density="compact" class="ml-4" color="green" />
        <v-switch v-model="editSmbDialog.inherit_permissions" :label="$t('inherit permissions')" inset hide-details density="compact" class="ml-4" color="green" />
        <v-switch v-model="editSmbDialog.hide_dot_files" :label="$t('hide dot files')" inset hide-details density="compact" class="ml-4" color="green" />
        <v-switch v-model="editSmbDialog.preserve_case" :label="$t('preserve case')" inset hide-details density="compact" class="ml-4" color="green" />
        <v-switch v-model="editSmbDialog.case_sensitive" :label="$t('case sensitive')" inset hide-details density="compact" class="ml-4" color="green" />
        <v-switch v-model="editSmbDialog.allow_execute_always" :label="$t('allow execute always')" inset hide-details density="compact" class="ml-4" color="green" />
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-spacer />
        <v-btn color="onPrimary" @click="editSmbDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="updateShareSmb(editSmbDialog)">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Edit Nfs Dialog -->
  <v-dialog v-model="editNfsDialog.value" max-width="500">
    <v-card class="pa-0" :title="$t('edit nfs share')" prepend-icon="mdi-pencil">
      <v-card-text style="max-height: 60vh; display: flex; flex-direction: column; overflow: auto" class="pt-2">
        <v-text-field v-model="editNfsDialog.name" :label="$t('share name')" readonly />
        <v-text-field v-model="editNfsDialog.path" :label="$t('path')" readonly />
        <v-text-field v-model="editNfsDialog.source" :label="$t('source')" required />
        <v-text-field v-model="editNfsDialog.anonuid" :label="$t('anonymous uid')" type="number" />
        <v-text-field v-model="editNfsDialog.anongid" :label="$t('anonymous gid')" type="number" />
        <v-select v-model="editNfsDialog.write_operations" :items="['sync', 'async']" :label="$t('write operations')" clearable />
        <v-select v-model="editNfsDialog.mapping" :items="['no_root_squash', 'all_squash', 'root_squash']" :label="$t('mapping')" clearable />
        <v-switch v-model="editNfsDialog.read_only" :label="$t('read only')" inset hide-details density="compact" class="ml-4" color="green" />
        <v-switch v-model="editNfsDialog.secure" :label="$t('secure')" inset hide-details density="compact" class="ml-4" color="green" />
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-spacer />
        <v-btn color="onPrimary" @click="editNfsDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="updateShareNfs(editNfsDialog)">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Target Devices Dialog -->
  <v-dialog v-model="targetDevicesDialog.value" max-width="500">
    <v-card class="pa-0">
      <v-card-title>{{ $t('target devices') }}</v-card-title>
      <v-card-text style="max-height: 60vh; display: flex; flex-direction: column; overflow: auto">
        <v-select
          v-model="targetDevicesDialog.selectedDevices"
          :items="targetDevicesDialog.targetDevices"
          item-title="name"
          item-value="value"
          :label="$t('target devices')"
          multiple
          chips
          clearable
          density="comfortable"
        />
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-spacer />
        <v-btn color="onPrimary" @click="targetDevicesDialog.value = false">{{ $t('close') }}</v-btn>
        <v-btn color="onPrimary" @click="setTargetDevicesSmb(targetDevicesDialog.share, targetDevicesDialog.selectedDevices)">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- File System Navigator Dialog -->
  <fsNavigatorDialog
    v-model="fsDialog"
    :initial-path="fsDialogInitialPath"
    :roots="fsDialogInitialPath != '' ? fsDialogInitialPath : ''"
    select-type="directory"
    :title="$t('select directory')"
    @selected="handleFsSelected"
  />

  <!-- Floating Action Button -->
  <v-menu location="top">
    <template v-slot:activator="{ props }">
      <v-fab v-bind="props" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
        <v-icon color="onPrimary">mdi-plus</v-icon>
      </v-fab>
    </template>
    <v-list>
      <v-list-item @click="openCreateSmbDialog()">
        <template v-slot:prepend>
          <v-icon>mdi-plus</v-icon>
        </template>
        <v-list-item-title>{{ $t('add smb share') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="openCreateNfsDialog()">
        <template v-slot:prepend>
          <v-icon>mdi-plus</v-icon>
        </template>
        <v-list-item-title>{{ $t('add nfs share') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';
import fsNavigatorDialog from '@/components/fsNavigatorDialog.vue';

const fsDialog = ref(false);
const fsDialogCallback = ref(null);
const fsDialogInitialPath = ref('/');
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { t } = useI18n();
const { overlay } = useOverlay();
const shares = ref([
  {
    smb: [],
    nfs: [],
  },
]);
const pools = ref([]);
const smbUsers = ref([]);
const createSmbDialog = reactive({
  value: false,
  shareName: '',
  poolName: null,
  subPath: '',
  write_list: [],
  valid_users: [],
  comment: '',
  enabled: true,
  browseable: true,
  read_only: false,
  guest_ok: false,
  force_root: false,
  create_mask: '0664',
  directory_mask: '0775',
  inherit_permissions: true,
  hide_dot_files: false,
  preserve_case: true,
  case_sensitive: true,
  policies: [],
  createDirectory: true,
  showAdvanced: false,
  allow_execute_always: false,
});
const createNfsDialog = reactive({
  value: false,
  shareName: '',
  poolName: '',
  subPath: '',
  source: '',
  enabled: true,
  read_only: false,
  anonuid: null,
  anongid: null,
  write_operations: '',
  mapping: '',
  secure: true,
});
const editSmbDialog = reactive({
  value: false,
  share: null,
  name: '',
  enabled: true,
  browseable: true,
  read_only: false,
  guest_ok: false,
  force_root: false,
  inherit_permissions: true,
  hide_dot_files: false,
  preserve_case: true,
  case_sensitive: true,
  write_list: [],
  valid_users: [],
  allow_execute_always: false,
});
const editNfsDialog = reactive({
  value: false,
  id: '',
  name: '',
  path: '',
  source: '',
  enabled: true,
  read_only: false,
  anonuid: null,
  anongid: null,
  write_operations: '',
  mapping: '',
  secure: true,
  pool: '',
});
const deleteSmbDialog = reactive({
  value: false,
  share: null,
  deleteDirectory: false,
  removePathRule: false,
});
const deleteNfsDialog = reactive({
  value: false,
  share: null,
  deleteDirectory: false,
  removePathRule: false,
});
const sharesLoading = ref(true);
const openFsDialog = (cb, mntPoint = '/') => {
  fsDialogCallback.value = cb;
  fsDialog.value = true;
  fsDialogInitialPath.value = mntPoint;
};
const handleFsSelected = (item) => {
  if (typeof fsDialogCallback.value === 'function') {
    if (fsDialogInitialPath.value === '' || fsDialogInitialPath.value === '/') {
      fsDialogCallback.value(item);
    } else {
      const relativePath = item.path.replace(fsDialogInitialPath.value, '');
      const trimmedPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
      fsDialogCallback.value({ ...item, path: trimmedPath });
    }
  }
  fsDialogCallback.value = null;
  fsDialog.value = false;
};
const targetDevicesDialog = reactive({
  value: false,
  share: null,
  selectedDevices: [],
  targetDevices: [{ name: '', value: '' }],
});

onMounted(async () => {
  await getShares();
  await getPools();
  sharesLoading.value = false;
  getSmbUsers();
});

const getShares = async () => {
  try {
    const res = await fetch('/api/v1/shares', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('shares could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const result = await res.json();
    shares.value.smb = result.smb || [];
    shares.value.nfs = result.nfs || [];
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getPools = async () => {
  try {
    const res = await fetch('/api/v1/pools', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('pools could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }
    const result = await res.json();
    pools.value = result;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
    return [];
  }
};

const getSmbUsers = async () => {
  try {
    const res = await fetch('/api/v1/auth/users?samba_user=true', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('smb users could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }
    smbUsers.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
    return [];
  }
};

const createShareSmb = async () => {
  const newShare = {
    shareName: createSmbDialog.shareName,
    poolName: createSmbDialog.poolName,
    subPath: createSmbDialog.subPath,
    comment: createSmbDialog.comment,
    enabled: createSmbDialog.enabled,
    browseable: createSmbDialog.browseable,
    read_only: createSmbDialog.read_only,
    guest_ok: createSmbDialog.guest_ok,
    force_root: createSmbDialog.force_root,
    valid_users: createSmbDialog.valid_users,
    write_list: createSmbDialog.write_list,
    create_mask: createSmbDialog.create_mask,
    directory_mask: createSmbDialog.directory_mask,
    inherit_permissions: createSmbDialog.inherit_permissions,
    hide_dot_files: createSmbDialog.hide_dot_files,
    preserve_case: createSmbDialog.preserve_case,
    case_sensitive: createSmbDialog.case_sensitive,
    policies: createSmbDialog.policies,
    createDirectory: createSmbDialog.createDirectory,
    allow_execute_always: createSmbDialog.allow_execute_always,
  };

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/shares/smb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(newShare),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('share could not be created')}|$| ${error.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('share created successfully'));

    createSmbDialog.value = false;
    clearCreateSmbDialog();
    getShares();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const createShareNfs = async () => {
  const newShare = {
    shareName: createNfsDialog.shareName,
    poolName: createNfsDialog.poolName,
    subPath: createNfsDialog.subPath,
    source: createNfsDialog.source,
    enabled: createNfsDialog.enabled,
    read_only: createNfsDialog.read_only,
    anonuid: createNfsDialog.anonuid,
    anongid: createNfsDialog.anongid,
    write_operations: createNfsDialog.write_operations,
    mapping: createNfsDialog.mapping,
    secure: createNfsDialog.secure,
  };

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/shares/nfs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(newShare),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('nfs share could not be created')}|$| ${error.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('nfs share created successfully'));

    createNfsDialog.value = false;
    clearCreateNfsDialog();

    getShares();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const updateShareSmb = async (shareDialog) => {
  const payload = {
    comment: shareDialog.comment,
    enabled: shareDialog.enabled,
    read_only: shareDialog.read_only,
    browseable: shareDialog.browseable,
    guest_ok: shareDialog.guest_ok,
    force_root: shareDialog.force_root,
    inherit_permissions: shareDialog.inherit_permissions,
    hide_dot_files: shareDialog.hide_dot_files,
    preserve_case: shareDialog.preserve_case,
    case_sensitive: shareDialog.case_sensitive,
    write_list: shareDialog.write_list,
    valid_users: shareDialog.valid_users,
    allow_execute_always: shareDialog.allow_execute_always,
  };
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/shares/smb/${encodeURIComponent(shareDialog.share.id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('share could not be updated')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('share updated successfully'));
    clearEditSmbDialog();
    getShares();
    editSmbDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const updateShareNfs = async (shareDialog) => {
  const payload = {
    source: shareDialog.source,
    enabled: shareDialog.enabled,
    read_only: shareDialog.read_only,
    anonuid: shareDialog.anonuid,
    anongid: shareDialog.anongid,
    write_operations: shareDialog.write_operations,
    mapping: shareDialog.mapping,
    secure: shareDialog.secure,
  };
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/shares/nfs/${encodeURIComponent(shareDialog.id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('nfs share could not be updated')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('nfs share updated successfully'));
    clearEditNfsDialog();
    getShares();
    editNfsDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const deleteShareSmb = async () => {
  const payload = deleteSmbDialog.deleteDirectory ? { deleteDirectory: true } : {};

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/shares/smb/${encodeURIComponent(deleteSmbDialog.share.id)}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('nfs share could not be deleted')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('share deleted successfully'));
    getShares();
    clearDeleteSmbDialog();
    deleteSmbDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const deleteShareNfs = async () => {
  const payload = {
    deleteDirectory: deleteNfsDialog.deleteDirectory,
    removePathRule: deleteNfsDialog.removePathRule,
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/shares/nfs/${encodeURIComponent(deleteNfsDialog.share.id)}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('nfs share could not be deleted')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('nfs share deleted successfully'));
    getShares();
    clearDeleteNfsDialog();
    deleteNfsDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const getTargetDevicesSmb = async (share) => {
  try {
    const res = await fetch(`/api/v1/shares/smb/${encodeURIComponent(share.id)}/target-devices`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('target devices could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const result = await res.json();
    if (result.data != null && result.data.pathRule != null && result.data.pathRule.targetDevices.length > 0) {
      return result.data.pathRule.targetDevices;
    } else {
      return [];
    }
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
    return [];
  }
};

const setTargetDevicesSmb = async (share, devices) => {
  const payload = {
    targetDevices: devices,
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/shares/smb/${encodeURIComponent(share.id)}/target-devices`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('target devices could not be set')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('target devices set successfully'));
    targetDevicesDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const checkMergerFs = (pool) => {
  const mergerFsPools = pools.value.filter((p) => p.type === 'mergerfs').map((p) => p.name);
  return mergerFsPools.includes(pool);
};

const getDevicesOfPool = async (pool) => {
  try {
    const localPool = pools.value.find((p) => p.name === pool);
    const dataDevices = Array.isArray(localPool?.data_devices) ? localPool.data_devices : [];

    const normalize = (d) => {
      if (typeof d === 'string') return { name: d, value: d };
      const value = parseInt(d?.slot) || '';
      const name = d?.device + ' (' + d?.storage.totalSpace_human + ')' || '';
      return { name, value };
    };

    return dataDevices.map(normalize);
  } catch (e) {
    return [];
  }
};

const openCreateSmbDialog = () => {
  createSmbDialog.value = true;
  clearCreateSmbDialog();
};
const openCreateNfsDialog = () => {
  createNfsDialog.value = true;
  clearCreateNfsDialog();
};
const openDeleteSmbDialog = (share) => {
  deleteSmbDialog.value = true;
  deleteSmbDialog.share = share;
  deleteSmbDialog.deleteDirectory = false;
  deleteSmbDialog.removePathRule = false;
};
const openDeleteNfsDialog = (share) => {
  deleteNfsDialog.value = true;
  deleteNfsDialog.share = share;
  deleteNfsDialog.deleteDirectory = false;
  deleteNfsDialog.removePathRule = false;
};
const openEditSmbDialog = (share) => {
  editSmbDialog.value = true;
  editSmbDialog.share = share;
  editSmbDialog.name = share.name;
  editSmbDialog.path = share.path;
  editSmbDialog.enabled = share.enabled;
  editSmbDialog.read_only = share.read_only;
  editSmbDialog.browseable = share.browseable;
  editSmbDialog.write_list = share.write_list || [];
  editSmbDialog.valid_users = share.valid_users || [];
  editSmbDialog.guest_ok = share.guest_ok || false;
  editSmbDialog.force_root = share.force_root || false;
  editSmbDialog.inherit_permissions = share.inherit_permissions || true;
  editSmbDialog.hide_dot_files = share.hide_dot_files || false;
  editSmbDialog.preserve_case = share.preserve_case || true;
  editSmbDialog.case_sensitive = share.case_sensitive || true;
  editSmbDialog.comment = share.comment || '';
  editSmbDialog.allow_execute_always = share.allow_execute_always || false;
};
const openEditNfsDialog = (share) => {
  editNfsDialog.value = true;
  editNfsDialog.id = share.id;
  editNfsDialog.name = share.name;
  editNfsDialog.path = share.path;
  editNfsDialog.source = share.source;
  editNfsDialog.enabled = share.enabled;
  editNfsDialog.read_only = share.read_only;
  editNfsDialog.anonuid = share.anonuid;
  editNfsDialog.anongid = share.anongid;
  editNfsDialog.write_operations = share.write_operations;
  editNfsDialog.mapping = share.mapping;
  editNfsDialog.secure = share.secure;
  editNfsDialog.pool = share.pool;
};
const openTargetDevicesDialog = async (share) => {
  targetDevicesDialog.value = true;
  targetDevicesDialog.share = share;
  targetDevicesDialog.selectedDevices = [];
  targetDevicesDialog.targetDevices = [];
  targetDevicesDialog.targetDevices = await getDevicesOfPool(share.pool);
  targetDevicesDialog.selectedDevices = await getTargetDevicesSmb(share);
};
const clearCreateSmbDialog = () => {
  createSmbDialog.shareName = '';
  createSmbDialog.poolName = null;
  createSmbDialog.subPath = '';
  createSmbDialog.valid_users = [];
  createSmbDialog.write_list = [];
  createSmbDialog.comment = '';
  createSmbDialog.enabled = true;
  createSmbDialog.browseable = true;
  createSmbDialog.read_only = false;
  createSmbDialog.guest_ok = false;
  createSmbDialog.force_root = false;
  createSmbDialog.create_mask = '0664';
  createSmbDialog.directory_mask = '0775';
  createSmbDialog.inherit_permissions = true;
  createSmbDialog.hide_dot_files = false;
  createSmbDialog.preserve_case = true;
  createSmbDialog.case_sensitive = true;
  createSmbDialog.policies = [];
  createSmbDialog.createDirectory = true;
  createSmbDialog.allow_execute_always = false;
};
const clearEditSmbDialog = () => {
  editSmbDialog.value = false;
  editSmbDialog.share = null;
  editSmbDialog.name = '';
  editSmbDialog.comment = '';
  editSmbDialog.enabled = false;
  editSmbDialog.browseable = false;
  editSmbDialog.read_only = false;
  editSmbDialog.write_list = [];
  editSmbDialog.valid_users = [];
  editSmbDialog.allow_execute_always = false;
};
const clearEditNfsDialog = () => {
  editNfsDialog.value = false;
  editNfsDialog.id = '';
  editNfsDialog.name = '';
  editNfsDialog.path = '';
  editNfsDialog.source = '';
  editNfsDialog.enabled = true;
  editNfsDialog.read_only = false;
  editNfsDialog.anonuid = null;
  editNfsDialog.anongid = null;
  editNfsDialog.write_operations = '';
  editNfsDialog.mapping = '';
  editNfsDialog.secure = true;
  editNfsDialog.pool = '';
};
const clearDeleteSmbDialog = () => {
  deleteSmbDialog.value = false;
  deleteSmbDialog.share = null;
  deleteSmbDialog.deleteDirectory = false;
};
const clearDeleteNfsDialog = () => {
  deleteNfsDialog.value = false;
  deleteNfsDialog.share = null;
};
const clearCreateNfsDialog = () => {
  createNfsDialog.shareName = '';
  createNfsDialog.poolName = '';
  createNfsDialog.subPath = '';
  createNfsDialog.source = '';
  createNfsDialog.enabled = true;
  createNfsDialog.read_only = false;
  createNfsDialog.anonuid = null;
  createNfsDialog.anongid = null;
  createNfsDialog.write_operations = '';
  createNfsDialog.mapping = '';
  createNfsDialog.secure = true;
};
</script>
