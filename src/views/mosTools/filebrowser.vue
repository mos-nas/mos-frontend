<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <v-row>
          <div class="d-flex align-center ga-3 mb-4" style="height: 40px">
            <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('filebrowser') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card class="pa-0">
          <v-card-title class="pa-0 pl-2 pr-2">
            <div class="d-flex align-center ga-2" style="width: 100%">
              <v-btn variant="text" icon="mdi-home" @click="goRoot()" color="primary" :disabled="loading" />
              <v-btn variant="text" icon="mdi-arrow-up" @click="goUp()" color="primary" :disabled="!canGoUp || loading" />
              <v-btn variant="text" icon="mdi-refresh" @click="reload()" color="primary" :disabled="loading" />
              <v-chip class="ml-2" variant="tonal">
                {{ currentPath || '/' }}
              </v-chip>
              <v-spacer />
              <v-progress-circular v-if="loading" indeterminate size="20" color="primary" />
              <v-btn variant="flat" @click="openAllOperationsDialog()" color="primary" :disabled="loading" size="small">
                <span class="text-caption">{{ runningProcesses }} {{ $t('operations') }}</span>
              </v-btn>
            </div>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-0" style="min-height: 300px; max-height: 75vh; overflow-y: auto">
            <v-table density="compact">
              <thead>
                <tr style="cursor: pointer; background-color: rgba(0, 0, 0, 0.04)">
                  <th style="width: 20%">{{ t('name') }}</th>
                  <th style="width: 20%">{{ t('path') }}</th>
                  <th style="width: 10%; min-width: 100px">{{ t('size') }}</th>
                  <th style="width: 10%; min-width: 100px">{{ t('owner') }}</th>
                  <th style="min-width: 30px">{{ t('permissions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!loading && items.length === 0">
                  <td colspan="5" class="text-center text-medium-emphasis">
                    {{ t('no entries') }}
                  </td>
                </tr>

                <tr
                  v-for="item in items"
                  :key="item.path"
                  :class="['cursor-pointer', activeItem && activeItem.path === item.path ? 'bg-primary bg-opacity-10' : '']"
                  @click="setActiveItem(item)"
                  @dblclick.stop.prevent="handleRowDblClick(item)"
                  @contextmenu.prevent="openContextMenu($event, item)"
                >
                  <!-- ...Tabelleninhalt wie gehabt... -->
                  <td>
                    <div class="d-flex align-center ga-2">
                      <v-icon size="18">
                        {{ item.type === 'directory' ? 'mdi-folder' : 'mdi-file' }}
                      </v-icon>
                      <span>{{ item.name }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="text-caption">{{ item.displayPath || item.path }}</span>
                  </td>
                  <td>
                    <span class="text-caption">{{ item.type === 'directory' ? '-' : item.size_human}}</span>
                  </td>
                  <td>
                    <span class="text-caption">{{ item.permissions.owner }}:{{ item.permissions.group }}</span>
                  </td>
                  <td>
                    <span class="text-caption">{{ item.permissions.octal }}</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
          <v-divider />
          <v-card-actions class="actions-toolbar pa-2">
            <v-tooltip :text="$t('create folder')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon @click="openCreateFolderDialog(currentPath)">
                  <v-icon size="20">mdi-folder-plus</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('create file')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon @click="openCreateFileDialog(currentPath)">
                  <v-icon size="20">mdi-file-plus</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-divider vertical class="mx-1 align-self-center" style="height: 24px" />
            <v-tooltip :text="$t('edit')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon :disabled="!activeItem || activeItem.type === 'directory'" @click="openEditFileDialog(activeItem)">
                  <v-icon size="20">mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('rename')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon :disabled="!activeItem" @click="openRenameFileDialog(activeItem)">
                  <v-icon size="20">mdi-rename</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('delete')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon :disabled="!activeItem" @click="openDeleteFileDialog(activeItem)">
                  <v-icon size="20">mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('download')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon :disabled="!activeItem || activeItem.type === 'directory'" @click="downloadFile(activeItem.path)">
                  <v-icon size="20">mdi-download</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('upload')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon :disabled="loading" @click="openUploadPicker()">
                  <v-icon size="20">mdi-upload</v-icon>
                </v-btn>
              </template>
            </v-tooltip>               
            <v-divider vertical class="mx-1 align-self-center" style="height: 24px" />
            <v-tooltip :text="$t('copy')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon :disabled="!activeItem" @click="openOperationDialog(activeItem, 'copy')">
                  <v-icon size="20">mdi-content-copy</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('move')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon :disabled="!activeItem" @click="openOperationDialog(activeItem, 'move')">
                  <v-icon size="20">mdi-arrow-right-bold</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-divider vertical class="mx-1 align-self-center" style="height: 24px" />
            <v-tooltip :text="$t('adjust permissions')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon :disabled="!activeItem" @click="openChModDialog(activeItem)">
                  <v-icon size="20">mdi-shield-key-outline</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('adjust ownership')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon :disabled="!activeItem" @click="openChOwnDialog(activeItem)">
                  <v-icon size="20">mdi-account-key</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-spacer />
              <v-checkbox v-model="includeHiddenFiles" :label="$t('hidden files')" :disabled="loading" hide-details="auto" density="compact" @update:modelValue="loadPath(currentPath)" />
          </v-card-actions>

          <input ref="uploadInput" class="d-none" type="file" @change="onUploadPicked" />
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Delete File Dialog -->
  <v-dialog v-model="deleteFileDialog.value" max-width="500" persistent>
    <v-card class="pa-0" :title="`${$t('delete')} - ${deleteFileDialog.path}`" prepend-icon="mdi-delete">
      <v-card-text>
        <v-container class="pb-4 pt-0 px-0">{{ $t('are you sure you want to delete this file') }}?</v-container>
        <v-checkbox v-if="deleteFileDialog.pathType === 'directory'" v-model="deleteFileDialog.recursive" :label="$t('recursive')" :disabled="loading" hide-details="auto" density="compact" />
        <v-checkbox v-model="deleteFileDialog.force" :label="$t('force')" :disabled="loading" hide-details="auto" density="compact" />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="deleteFileDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deleteFile(deleteFileDialog.path, deleteFileDialog.force, deleteFileDialog.recursive)">
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Create Folder Dialog -->
  <v-dialog v-model="createFolderDialog.value" max-width="500" persistent>
    <v-card class="pa-0" :title="$t('create folder')" prepend-icon="mdi-folder-plus">
      <v-card-text class="py-0">
        <v-container class="px-0">
          <v-text-field v-model="createFolderDialog.folderName" :label="$t('folder name')" :disabled="loading" />
          <v-select
            v-model="createFolderDialog.userddsel"
            :label="$t('user')"
            :items="createFolderDialog.userdd"
            :disabled="loading"
            @update:modelValue="
              (val) => {
                if (val === 'mos') createFolderDialog.user = createFolderDialog.group = '500';
                else if (val === 'root') createFolderDialog.user = createFolderDialog.group = '0';
                else createFolderDialog.user = createFolderDialog.group = '';
              }
            "
          />
          <v-text-field v-if="createFolderDialog.userddsel === 'custom'" v-model="createFolderDialog.user" :label="$t('user')" :disabled="loading" />
          <v-text-field v-if="createFolderDialog.userddsel === 'custom'" v-model="createFolderDialog.group" :label="$t('group')" :disabled="loading" />
          <v-text-field v-model="createFolderDialog.permissions" :label="$t('permissions')" :disabled="loading" />
        </v-container>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="createFolderDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" @click="createFolder(createFolderDialog.currentPath, createFolderDialog.folderName, createFolderDialog.user, createFolderDialog.group, createFolderDialog.permissions)">
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Create File Dialog -->
  <v-dialog v-model="createFileDialog.value" max-width="600" persistent>
    <v-card class="pa-0" :title="$t('create file')" prepend-icon="mdi-file-plus">
      <v-card-text class="py-0">
        <v-container class="px-0">
          <v-text-field v-model="createFileDialog.fileName" :label="$t('file name')" :disabled="loading" />
          <v-textarea v-model="createFileDialog.content" :label="$t('content')" :disabled="loading" rows="6" />
          <v-select
            v-model="createFileDialog.userddsel"
            :label="$t('user')"
            :items="createFileDialog.userdd"
            :disabled="loading"
            @update:modelValue="
              (val) => {
                if (val === 'mos') createFileDialog.user = createFileDialog.group = '500';
                else if (val === 'root') createFileDialog.user = createFileDialog.group = '0';
                else createFileDialog.user = createFileDialog.group = '';
              }
            "
          />
          <v-text-field v-if="createFileDialog.userddsel === 'custom'" v-model="createFileDialog.user" :label="$t('user')" :disabled="loading" />
          <v-text-field v-if="createFileDialog.userddsel === 'custom'" v-model="createFileDialog.group" :label="$t('group')" :disabled="loading" />
          <v-text-field v-model="createFileDialog.permissions" :label="$t('permissions')" :disabled="loading" />
        </v-container>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="createFileDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn
          color="primary"
          @click="createFile(createFileDialog.currentPath, createFileDialog.fileName, createFileDialog.content, createFileDialog.user, createFileDialog.group, createFileDialog.permissions)"
        >
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Chmod Dialog -->
  <v-dialog v-model="setChmodDialog.value" max-width="500" persistent>
    <v-card class="pa-0" :title="$t('adjust permissions')" prepend-icon="mdi-lock">
      <v-card-text class="py-0">
        <v-container class="px-0">
          <v-text-field v-model="setChmodDialog.permissions" :label="$t('permissions')" :disabled="loading" />
          <v-checkbox v-model="setChmodDialog.recursive" :label="$t('recursive')" :disabled="loading" hide-details="auto" density="compact" />
        </v-container>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="setChmodDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" @click="setChmod(setChmodDialog.path, setChmodDialog.permissions, setChmodDialog.recursive)">
          {{ $t('adjust') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Chown Dialog -->
  <v-dialog v-model="setChownDialog.value" max-width="500" persistent>
    <v-card class="pa-0" :title="$t('adjust ownership')" prepend-icon="mdi-account-lock">
      <v-card-text class="py-0">
        <v-container class="px-0">
          <v-select
            v-model="setChownDialog.userddsel"
            :label="$t('user')"
            :items="setChownDialog.userdd"
            :disabled="loading"
            @update:modelValue="
              (val) => {
                if (val === 'mos') setChownDialog.user = setChownDialog.group = '500';
                else if (val === 'root') setChownDialog.user = setChownDialog.group = '0';
                else setChownDialog.user = setChownDialog.group = '';
              }
            "
          />
          <v-text-field v-if="setChownDialog.userddsel === 'custom'" v-model="setChownDialog.user" :label="$t('user')" :disabled="loading" />
          <v-text-field v-if="setChownDialog.userddsel === 'custom'" v-model="setChownDialog.group" :label="$t('group')" :disabled="loading" />
          <v-checkbox v-model="setChownDialog.recursive" :label="$t('recursive')" :disabled="loading" hide-details="auto" density="compact" />
        </v-container>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="setChownDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" @click="setChown(setChownDialog.path, setChownDialog.user, setChownDialog.group, setChownDialog.recursive)">
          {{ $t('adjust') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Operation Dialog -->
  <v-dialog v-model="operationDialog.value" max-width="500" persistent>
    <v-card class="pa-0" :title="operationDialog.operation === 'copy' ? $t('copy') : $t('move')" :prepend-icon="operationDialog.operation === 'copy' ? 'mdi-content-copy' : 'mdi-arrow-right-bold'">
      <v-card-text class="py-0">
        <v-container class="px-0">
          <v-text-field v-model="operationDialog.source" :label="$t('source path')" readonly />
          <v-text-field
            v-model="operationDialog.destination"
            :label="$t('destination path')"
            append-inner-icon="mdi-folder"
            @click:append-inner="
              openFsDialog((item) => {
                operationDialog.destination = item.path;
              })
            "
            required
          />
          <v-checkbox
            v-if="operationDialog.operation == 'copy'"
            :model-value="operationDialog.onConflict === 'overwrite'"
            @update:model-value="(val) => (operationDialog.onConflict = val ? 'overwrite' : 'fail')"
            :label="$t('overwrite')"
            hide-details="auto"
            density="compact"
          />
        </v-container>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="operationDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" @click="startFileOperation(operationDialog.operation, operationDialog.source, operationDialog.destination, operationDialog.onConflict)">
          {{ operationDialog.operation === 'copy' ? $t('copy') : $t('move') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Rename File Dialog -->
  <v-dialog v-model="renameFileDialog.value" max-width="500" persistent>
    <v-card class="pa-0" :title="$t('rename')" prepend-icon="mdi-rename">
      <v-card-text class="py-0">
        <v-container class="px-0">
          <v-text-field v-model="renameFileDialog.new_name" :label="$t('new name')" :disabled="loading" />
        </v-container>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="renameFileDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" @click="renameFile({ path: renameFileDialog.destination }, renameFileDialog.new_name)">
          {{ $t('rename') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Kontextmenü für Datei/Ordner -->
  <v-menu
    v-model="contextMenu.visible"
    :target="[contextMenu.x, contextMenu.y]"
    :close-on-content-click="true"
  >
    <v-list>
      <v-list-item v-if="contextMenu.item" density="compact" style="background: rgba(var(--v-theme-primary), 0.08); pointer-events: none">
        <template #prepend>
          <v-icon color="primary">{{ contextMenu.item?.type === 'directory' ? 'mdi-folder' : 'mdi-file' }}</v-icon>
        </template>
        <v-list-item-title style="color: rgb(var(--v-theme-primary))">{{ contextMenu.item?.name }}</v-list-item-title>
      </v-list-item>
      <v-divider />
      <v-list-item v-if="contextMenu.item && contextMenu.item.type !== 'directory'" @click="openEditFileDialog(contextMenu.item)" density="compact">
        <template #prepend><v-icon>mdi-pencil</v-icon></template>
        <v-list-item-title>{{ $t('edit') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="openRenameFileDialog(contextMenu.item)" density="compact">
        <template #prepend><v-icon>mdi-rename</v-icon></template>
        <v-list-item-title>{{ $t('rename') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="openDeleteFileDialog(contextMenu.item)" density="compact">
        <template #prepend><v-icon>mdi-delete</v-icon></template>
        <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
      </v-list-item>
      <v-list-item v-if="contextMenu.item && contextMenu.item.type !== 'directory'" @click="downloadFile(contextMenu.item.path)" density="compact">
        <template #prepend><v-icon>mdi-download</v-icon></template>
        <v-list-item-title>{{ $t('download') }}</v-list-item-title>
      </v-list-item>
      <v-divider />
      <v-list-item @click="openOperationDialog(contextMenu.item, 'copy')" density="compact">
        <template #prepend><v-icon>mdi-content-copy</v-icon></template>
        <v-list-item-title>{{ $t('copy') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="openOperationDialog(contextMenu.item, 'move')" density="compact">
        <template #prepend><v-icon>mdi-arrow-right-bold</v-icon></template>
        <v-list-item-title>{{ $t('move') }}</v-list-item-title>
      </v-list-item>
      <v-divider />
      <v-list-item @click="openChModDialog(contextMenu.item)" density="compact">
        <template #prepend><v-icon>mdi-shield-key-outline</v-icon></template>
        <v-list-item-title>{{ $t('adjust permissions') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="openChOwnDialog(contextMenu.item)" density="compact">
        <template #prepend><v-icon>mdi-account-key</v-icon></template>
        <v-list-item-title>{{ $t('adjust ownership') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

  <!-- All Operations Dialog -->
  <fsOperationsDialog v-model="allOperationsDialogVisible" persistent />

  <!-- Edit File Dialog -->
  <FileEditDialog v-model="editFileDialogVisible" :path="selectedFilePath" :createBackup="true" :title="$t('edit file')" persistent @saved="onFileSaved" />

  <!-- File System Navigator Dialog -->
  <fsNavigatorDialog v-model="fsDialog" :initial-path="'/'" select-type="directory" :title="$t('select directory')" persistent @selected="handleFsSelected" />
</template>

<script setup>
import { ref, computed, watch, onMounted, reactive, onBeforeUnmount, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import FileEditDialog from '@/components/fileEditDialog.vue';
import fsNavigatorDialog from '@/components/fsNavigatorDialog.vue';
import fsOperationsDialog from '@/components/fsOperationsDialog.vue';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const modelValue = ref(true);
const selectType = ref('all');
const roots = ref('');
const { t } = useI18n();
const loading = ref(false);
const currentPath = ref('/');
const items = ref([]);
const canGoUp = ref(false);
const parentPath = ref(null);
const activeItem = ref(null);
const { overlay } = useOverlay();
const editFileDialogVisible = ref(false);
const fsDialog = ref(false);
const fsDialogCallback = ref(null);
const uploadInput = ref(null);
const selectedFilePath = ref('');
const runningProcesses = ref(0);
const allOperationsDialogVisible = ref(false);
const includeHiddenFiles = ref(false);
const deleteFileDialog = reactive({
  value: false,
  path: null,
  pathType: '',
  recursive: false,
  force: false,
});
const createFolderDialog = reactive({
  value: false,
  folderName: '',
  currentPath: '',
  userddsel: 'mos',
  userdd: ['mos', 'root', 'custom'],
  user: '500',
  group: '500',
  permissions: '777',
});
const createFileDialog = reactive({
  value: false,
  fileName: '',
  currentPath: '',
  content: '',
  userddsel: 'mos',
  userdd: ['mos', 'root', 'custom'],
  user: '500',
  group: '500',
  permissions: '777',
});
const setChmodDialog = reactive({
  value: false,
  path: '',
  permissions: '777',
  recursive: false,
});
const setChownDialog = reactive({
  value: false,
  path: '',
  userddsel: 'mos',
  userdd: ['mos', 'root', 'custom'],
  user: '500',
  group: '500',
  recursive: false,
});
const operationDialog = reactive({
  value: false,
  operation: '',
  source: '',
  destination: '',
  onConflict: 'fail',
});
const renameFileDialog = reactive({
  value: false,
  destination: '',
  new_name: '',
});
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  item: null,
});
let pollInterval = null;

onMounted(() => {
  loadPath(currentPath.value);
  getRunningOperations();
  pollInterval = setInterval(() => {
    getRunningOperations();
  }, 3000);
});

onBeforeUnmount(() => {
  clearInterval(pollInterval);
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

const loadPath = async (path = '/') => {
  loading.value = true;
  try {
    const url = new URL('/api/v1/mos/fsnavigator', window.location.origin);
    if (path && path !== '/') {
      url.searchParams.set('path', path);
    }
    if (includeHiddenFiles.value) {
      url.searchParams.set('includeHidden', 'true');
    }

    const typeParam = selectType.value === 'directory' ? 'directories' : 'all';
    url.searchParams.set('type', typeParam);

    if (roots.value !== '' && roots.value !== '/') {
      url.searchParams.set('roots', roots.value);
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('filesystem could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const data = await res.json();

    currentPath.value = data.currentPath || path || '/';
    canGoUp.value = !!data.canGoUp;
    parentPath.value = data.parentPath;
    items.value = Array.isArray(data.items) ? data.items : [];
    activeItem.value = null;
  } catch (e) {
    const [mainMessage, detailMessage] = e.message.split('|$|');
    showSnackbarError(t(mainMessage.trim()), detailMessage ? detailMessage.trim() : '');
  } finally {
    loading.value = false;
  }
};

const deleteFile = async (path, force = false, recursive = false) => {
  const payload = { path: path, force: force, recursive: recursive };
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/mos/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('file could not be deleted')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('successfully deleted'));
    reload();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    clearDeleteDialog();
    overlay.value = false;
  }
};

const createFolder = async (path, folderName, user = '500', group = '500', permissions = '777') => {
  if (!folderName || folderName.trim() === '') {
    showSnackbarError(t('folder name cannot be empty'));
    return;
  }
  if (!path || path.trim() === '') {
    showSnackbarError(t('path cannot be empty'));
    return;
  }
  const payload = { path: path + '/' + folderName, user: user, group: group, permissions: permissions };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/mos/createfolder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('folder could not be created')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('successfully created folder'));
    reload();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    createFolderDialog.value = false;
    overlay.value = false;
  }
};

const createFile = async (path, fileName, content = '', user = '500', group = '500', permissions = '777') => {
  if (!fileName || fileName.trim() === '') {
    showSnackbarError(t('file name cannot be empty'));
    return;
  }
  if (!path || path.trim() === '') {
    showSnackbarError(t('path cannot be empty'));
    return;
  }
  const payload = { path: path + '/' + fileName, content: content, user: user, group: group, permissions: permissions };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/mos/createfile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('file could not be created')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('successfully created file'));
    reload();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    createFileDialog.value = false;
    overlay.value = false;
  }
};

const setChmod = async (path, permissions = '777', recursive = false) => {
  if (!path || path.trim() === '') {
    showSnackbarError(t('path cannot be empty'));
    return;
  }
  const payload = { path: path, permissions: permissions, recursive: recursive };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/mos/chmod`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('permissions could not be set')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('permissions successfully set'));
    reload();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    setChmodDialog.value = false;
    overlay.value = false;
  }
};

const setChown = async (path, user = '500', group = '500', recursive = false) => {
  if (!path || path.trim() === '') {
    showSnackbarError(t('path cannot be empty'));
    return;
  }
  const payload = { path: path, user: user, group: group, recursive: recursive };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/mos/chown`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('ownership could not be set')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('ownership successfully set'));
    reload();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    setChownDialog.value = false;
    overlay.value = false;
  }
};

const startFileOperation = async (operation, source, destination, onConflict = 'fail') => {
  if (!source || source.trim() === '') {
    showSnackbarError(t('source path cannot be empty'));
    return;
  }
  if (!destination || destination.trim() === '') {
    showSnackbarError(t('destination path cannot be empty'));
    return;
  }

  const payload = {
    operation: operation,
    source: source,
    destination: destination,
    onConflict: onConflict,
  };

  try {
    const res = await fetch(`/api/v1/mos/fileoperations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('process could not be started')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    const result = await res.json();
    if (result.instantMove === true) {
      showSnackbarSuccess(t('file operation completed successfully'));
      reload();
      return;
    } else {
      showSnackbarSuccess(`${t('process successfully started')}. ${t('it may take a while')}`);
    }
    reload();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    operationDialog.value = false;
  }
};

const getRunningOperations = async () => {
  try {
    const res = await fetch(`/api/v1/mos/runningfsoperations`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });
    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('could not fetch running operations')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    const data = await res.json();
    runningProcesses.value = data.count;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
    return [];
  }
};

const renameFile = async (item, newName) => {
  if (!item || !newName || newName.trim() === '') {
    showSnackbarError(t('new name cannot be empty'));
    return;
  }
  const payload = { destination: item.path, new_name: newName };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/mos/rename`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('file could not be renamed')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('successfully renamed'));
    reload();
    renameFileDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    editFileDialogVisible.value = false;
    overlay.value = false;
  }
};

const downloadFile = async (filePath) => {
  overlay.value = true;

  try {
    const res = await fetch(`/api/v1/mos/download?path=${encodeURIComponent(filePath)}`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('file could not be downloaded')}|$| ${error.error || t('unknown error')}`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    let filename = filePath.split('/').pop() || 'download';
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const openUploadPicker = () => {
  if (loading.value) return;
  uploadInput.value?.click?.();
};

const onUploadPicked = async (e) => {
  const input = e?.target;
  const file = input?.files?.[0];
  if (!file) return;
  await uploadFile(file, currentPath.value);
  if (input) input.value = '';
};

const uploadFile = async (file, path = currentPath.value) => {
  if (!file) {
    showSnackbarError(t('file cannot be empty'));
    return;
  }
  if (!path || path.trim() === '') {
    showSnackbarError(t('path cannot be empty'));
    return;
  }

  try {
    overlay.value = true;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    const res = await fetch('/api/v1/mos/upload', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: formData,
    });

    if (!res.ok) {
      const errorDetails = await res.json().catch(() => ({}));
      throw new Error(`${t('file could not be uploaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    const result = await res.json().catch(() => null);
    showSnackbarSuccess(t('file uploaded successfully'));
    reload();
    return result;
  } catch (e) {
    const [userMessage, apiErrorMessage] = String(e?.message || e).split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const isSelectable = (item) => {
  if (!item) return false;
  if (selectType.value === 'directory') return item.type === 'directory';
  if (selectType.value === 'file') return item.type !== 'directory';
  return true;
};

const setActiveItem = (item) => {
  activeItem.value = item;
  selectedFilePath.value = item?.path || '';
};

const navigateInto = (item) => {
  if (!item || item.type !== 'directory') return;
  loadPath(item.path);
};

const handleRowDblClick = (item) => {
  if (!item) return;
  if (item.type === 'directory') {
    navigateInto(item);
  } else if (isSelectable(item)) {
    confirmSelect(item);
  }
};

const goRoot = () => {
  loadPath('/');
};

const goUp = () => {
  if (!canGoUp.value || !parentPath.value) return;
  loadPath(parentPath.value);
};

const reload = () => {
  loadPath(currentPath.value || '/');
};

const onFileSaved = () => {
  loadPath(currentPath.value || '/');
};

const confirmSelect = (explicitItem) => {
  const item = explicitItem || activeItem.value;
  if (!item || !isSelectable(item)) return;
};

watch(
  () => modelValue.value,
  (visible) => {
    if (visible) {
      const startPath = initialPath.value || '/';
      loadPath(startPath);
    }
  },
);

const openDeleteFileDialog = (item) => {
  if (!item) return;
  deleteFileDialog.value = true;
  deleteFileDialog.path = item.path;
  deleteFileDialog.pathType = item.type;
};
const clearDeleteDialog = () => {
  deleteFileDialog.value = false;
  deleteFileDialog.path = null;
  deleteFileDialog.pathType = '';
  deleteFileDialog.recursive = false;
  deleteFileDialog.force = false;
};
const openEditFileDialog = (item) => {
  if (!item || item.type === 'directory') return;
  selectedFilePath.value = item.path;
  editFileDialogVisible.value = true;
};
const openCreateFolderDialog = (currentPath) => {
  createFolderDialog.value = true;
  createFolderDialog.currentPath = currentPath;
  createFolderDialog.folderName = '';
  createFolderDialog.userddsel = 'mos';
  createFolderDialog.user = '500';
  createFolderDialog.group = '500';
  createFolderDialog.permissions = '777';
};
const openCreateFileDialog = (currentPath) => {
  createFileDialog.value = true;
  createFileDialog.currentPath = currentPath;
  createFileDialog.fileName = '';
  createFileDialog.content = '';
  createFileDialog.userddsel = 'mos';
  createFileDialog.user = '500';
  createFileDialog.group = '500';
  createFileDialog.permissions = '777';
};
const openChModDialog = (item) => {
  setChmodDialog.value = true;
  setChmodDialog.path = item.path;
  setChmodDialog.permissions = item.permissions.octal;
  setChmodDialog.recursive = false;
};
const openChOwnDialog = (item) => {
  setChownDialog.value = true;
  setChownDialog.path = item.path;
  setChownDialog.userddsel = item.permissions.owner === 'mos' ? 'mos' : item.permissions.owner === 'root' ? 'root' : 'custom';
  setChownDialog.user = item.permissions.owner == 'mos' ? '500' : item.permissions.owner == 'root' ? '0' : '';
  setChownDialog.group = item.permissions.owner == 'mos' ? '500' : item.permissions.owner == 'root' ? '0' : '';
  setChownDialog.recursive = false;
};
const openOperationDialog = (item, operation) => {
  operationDialog.value = true;
  operationDialog.source = item.path;
  operationDialog.destination = '';
  operationDialog.operation = operation;
  operationDialog.onConflict = 'fail';
};
const openRenameFileDialog = (item) => {
  renameFileDialog.value = true;
  renameFileDialog.destination = item.path;
  renameFileDialog.new_name = '';
};
const openAllOperationsDialog = () => {
  allOperationsDialogVisible.value = true;
};

const openContextMenu = (e, item) => {
  e.preventDefault();
  contextMenu.x = e.clientX;
  contextMenu.y = e.clientY;
  contextMenu.item = item;
  contextMenu.visible = true;
}

</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.actions-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}
</style>
