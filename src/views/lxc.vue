<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <div class="d-flex align-center ga-3 mb-4">
          <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
          <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ t('lxc containers') }}</h2>
          <v-spacer />
          <v-text-field v-model="searchTerm" :placeholder="t('search')" density="compact" hide-details clearable class="search-field" prepend-inner-icon="mdi-magnify" />
        </div>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader v-if="lxcsLoading" type="card" :width="'100%'" :height="'60px'" class="mb-2" />
        <v-card v-else fluid style="margin-bottom: 80px" class="pa-0">
          <v-card-text class="pa-0">
            <v-table class="bg-transparent">
              <thead>
                <tr style="cursor: pointer; background-color: rgba(0, 0, 0, 0.04)">
                  <th style="width: 42px; padding: 4px 8px; vertical-align: middle"></th>
                  <th style="min-width: 160px; padding: 4px 8px; vertical-align: middle">{{ $t('name') }}</th>
                  <th style="min-width: 120px; padding: 4px 8px; vertical-align: middle">{{ $t('distribution') }}</th>
                  <th style="min-width: 160px; padding: 4px 8px; vertical-align: middle">{{ $t('backups') }} / {{ $t('snapshots') }}</th>
                  <th style="min-width: 100px; padding: 4px 8px; vertical-align: middle">{{ $t('cpu') }}</th>
                  <th style="min-width: 90px; padding: 4px 8px; vertical-align: middle">{{ $t('memory') }}</th>
                  <th style="min-width: 90px; padding: 4px 8px; vertical-align: middle">{{ $t('storage') }}</th>
                  <th style="min-width: 90px; padding: 4px 8px; vertical-align: middle">{{ $t('ip') }}</th>
                  <th style="width: 90px; padding: 4px 8px; vertical-align: middle">{{ $t('autostart') }}</th>
                  <th style="width: 42px; padding: 4px 8px; vertical-align: middle"></th>
                </tr>
              </thead>

              <draggable v-model="lxcs" tag="tbody" item-key="Id" @end="onDragEnd" handle=".drag-handle">
                <template #item="{ element: lxc }">
                  <tr v-if="filteredLxcs.includes(lxc)" :id="lxc.Id">
                    <td style="padding: 4px 8px; vertical-align: middle">
                      <v-menu>
                        <template #activator="{ props }">
                          <v-img v-if="!lxc.invalid_config" class="drag-handle" v-bind="props" :src="getLxcIconSrc(lxc)" alt="lxc image" width="24" height="24" style="cursor: pointer">
                            <template #error>
                              <v-sheet class="d-flex align-center justify-center" height="100%" width="100%">
                                <v-icon color="grey-darken-1">mdi-image-off</v-icon>
                              </v-sheet>
                            </template>
                          </v-img>
                          <v-sheet v-else class="d-flex align-center justify-center" height="100%" width="100%">
                            <v-icon color="red" v-bind="props" class="drag-handle" alt="lxc image" width="24" height="24" style="cursor: pointer">mdi-file-alert</v-icon>
                          </v-sheet>
                        </template>

                        <v-list>
                          <v-list-item v-if="checkWebui(lxc)" @click="showWebui(lxc)" :disabled="lxc.invalid_config">
                            <template #prepend><v-icon>mdi-web</v-icon></template>
                            <v-list-item-title>{{ $t('web ui') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item v-if="lxc.state === 'running'" @click="openTerminal(lxc.name)" :disabled="lxc.invalid_config">
                            <template #prepend><v-icon>mdi-console</v-icon></template>
                            <v-list-item-title>{{ $t('terminal') }}</v-list-item-title>
                          </v-list-item>
                          <v-divider />
                          <v-list-item v-if="lxc.state !== 'running'" @click="startLXC(lxc.name)" :disabled="lxc.invalid_config">
                            <template #prepend><v-icon>mdi-play-circle</v-icon></template>
                            <v-list-item-title>{{ $t('start') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item v-if="lxc.state === 'running'" @click="stopLXC(lxc.name)" :disabled="lxc.invalid_config">
                            <template #prepend><v-icon>mdi-stop-circle</v-icon></template>
                            <v-list-item-title>{{ $t('stop') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item v-if="lxc.state === 'running'" @click="killLXC(lxc.name)" :disabled="lxc.invalid_config">
                            <template #prepend><v-icon>mdi-close-octagon</v-icon></template>
                            <v-list-item-title>{{ $t('kill') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item v-if="lxc.state === 'running'" @click="restartLXC(lxc.name)" :disabled="lxc.invalid_config">
                            <template #prepend><v-icon>mdi-restart</v-icon></template>
                            <v-list-item-title>{{ $t('restart') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item v-if="lxc.state === 'running'" @click="freezeLXC(lxc.name)" :disabled="lxc.invalid_config">
                            <template #prepend><v-icon>mdi-snowflake</v-icon></template>
                            <v-list-item-title>{{ $t('freeze') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item v-if="lxc.state === 'frozen'" @click="unfreezeLXC(lxc.name)" :disabled="lxc.invalid_config">
                            <template #prepend><v-icon>mdi-snowflake-off</v-icon></template>
                            <v-list-item-title>{{ $t('unfreeze') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="openDeleteDialog(lxc)" :disabled="lxc.invalid_config">
                            <template #prepend><v-icon>mdi-delete</v-icon></template>
                            <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item v-if="lxc.state === 'stopped'" @click="openMountsDialog(lxc)" :disabled="lxc.invalid_config">
                            <template #prepend><v-icon>mdi-database</v-icon></template>
                            <v-list-item-title>{{ $t('mounts') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item v-if="lxc.config && lxc.config != ''" @click="openFileEditor(lxc.config)">
                            <template #prepend><v-icon>mdi-text-box-edit</v-icon></template>
                            <v-list-item-title>{{ $t('edit config') }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </td>

                    <td style="padding: 4px 8px; vertical-align: middle">
                      <div class="text-caption-2">
                        {{ lxc.name }}
                        <v-chip v-if="lxc.unprivileged" :style="{ fontSize: '10px' }" size="little" class="mr-2">{{ $t('unprivileged') }}</v-chip>
                        <v-chip v-if="lxc.active_operation" :style="{ fontSize: '10px' }" size="little" class="mr-2">{{ lxc.active_operation }} {{ $t('running') }}</v-chip>
                      </div>
                      <div class="text-caption" :style="{ color: lxc.state === 'running' ? 'green' : 'red' }">{{ lxc.state }}</div>
                    </td>

                    <td style="padding: 4px 8px; vertical-align: middle">
                      {{ lxc.distribution || '-' }}
                      <v-chip :style="{ fontSize: '10px', color: lxc.architecture === 'amd64' ? 'green' : 'blue' }" size="small">{{ lxc.architecture }}</v-chip>
                    </td>

                    <td style="padding: 4px 8px; vertical-align: middle">
                      <v-btn :disabled="!lxc.name" color="primary" size="x-small" @click.stop="$router.push(`/lxc/backups/${lxc.name}`)">
                        {{ $t('manage') }}
                      </v-btn>
                    </td>

                    <td style="padding: 4px 8px; vertical-align: middle">{{ lxc.cpu.usage ? lxc.cpu.usage.toFixed(2) : '0' }} {{ lxc.cpu.unit ? lxc.cpu.unit : '%' }}</td>

                    <td style="padding: 4px 8px; vertical-align: middle">
                      {{ lxc.memory.formatted ? lxc.memory.formatted : '-' }}
                    </td>

                    <td style="padding: 4px 8px; vertical-align: middle">
                      <div class="d-flex align-center ga-1">
                        <span v-if="lxc.storage_size_human" class="text-caption">{{ lxc.storage_size_human }}</span>
                        <v-btn
                          variant="text"
                          icon
                          size="x-small"
                          :loading="lxc.calculating_storage"
                          :disabled="lxc.invalid_config"
                          @click.stop="calculateContainerSize(lxc)"
                          :title="$t('calculate directory size')"
                          color="primary"
                        >
                          <v-icon size="16">mdi-calculator</v-icon>
                        </v-btn>
                      </div>
                    </td>

                    <td style="padding: 4px 8px; vertical-align: middle">
                      <div class="text-caption-2 mt-1" v-if="Array.isArray(lxc.ipv4) && lxc.ipv4.length">
                        {{ Array.isArray(lxc.ipv4) && lxc.ipv4.length ? lxc.ipv4.join(', ') : '' }}
                      </div>
                      <div class="text-caption-2 mt-1" v-if="Array.isArray(lxc.ipv6) && lxc.ipv6.length">
                        {{ Array.isArray(lxc.ipv6) && lxc.ipv6.length ? lxc.ipv6.join(', ') : '' }}
                      </div>
                    </td>

                    <td style="padding: 4px 8px; vertical-align: middle">
                      <v-switch v-model="lxc.autostart" color="green" hide-details density="compact" @change="switchAutostart(lxc)" />
                    </td>

                    <td style="padding: 4px 8px; vertical-align: middle"></td>
                  </tr>
                </template>
              </draggable>
            </v-table>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Create LXC Dialog -->
  <v-dialog v-model="createDialog.value" max-width="700">
    <v-card class="pa-0" :title="$t('create lxc container')" prepend-icon="mdi-plus">
      <v-card-text>
        <v-text-field v-model="createDialog.name" :label="$t('name')" required />
        <v-select v-model="createDialog.distribution" :items="images.map((image) => image.name)" :label="$t('distribution')" :loading="lxcImagesLoading" required />
        <v-select v-model="createDialog.release" :items="getReleasesfromDistribution(createDialog.distribution)" :label="$t('release')" :loading="lxcImagesLoading" required />
        <v-select
          v-model="createDialog.arch"
          :items="getArchitectuesfromDistribution(createDialog.distribution, createDialog.release)"
          :label="$t('architecture')"
          :loading="lxcImagesLoading"
          required
        />
        <v-textarea v-model="createDialog.description" :label="$t('description')" rows="2" />
        <v-divider class="my-3"></v-divider>

        <div class="d-flex align-center justify-space-between mb-2">
          <span class="text-subtitle-2">{{ $t('mounts') }}</span>
          <v-btn variant="text" color="success" size="small" prepend-icon="mdi-plus" @click="createDialog.mounts.push({ source: '', destination: '', readonly: false, type: 'file' })">
            {{ $t('add') }}
          </v-btn>
        </div>

        <v-sheet v-if="!createDialog.mounts.length" border rounded class="pa-4 text-center text-medium-emphasis mb-2">
          {{ $t('no mounts defined') }}
        </v-sheet>

        <v-sheet v-for="(mount, i) in createDialog.mounts" :key="i" border rounded class="pa-3 mb-2">
          <v-row align="center">
            <v-col cols="12" sm="3">
              <v-text-field
                v-model="mount.source"
                :label="$t('source')"
                density="compact"
                variant="outlined"
                hide-details
                append-inner-icon="mdi-folder-open"
                @click:append-inner="
                  () => {
                    currentCreateMountIndex = i;
                    fsDialogVisibleCreate = true;
                  }
                "
              />
            </v-col>
            <v-col cols="12" sm="3">
              <v-text-field v-model="mount.destination" :label="$t('destination')" density="compact" variant="outlined" hide-details />
            </v-col>
            <v-col cols="6" sm="2">
              <v-select v-model="mount.type" :items="['file', 'directory']" :label="$t('type')" density="compact" variant="outlined" hide-details />
            </v-col>
            <v-col cols="4" sm="3" class="d-flex justify-center">
              <v-checkbox v-model="mount.readonly" :label="$t('readonly')" density="compact" hide-details class="flex-grow-0" style="white-space: nowrap" />
            </v-col>
            <v-col cols="2" sm="1" class="d-flex justify-end">
              <v-btn icon="mdi-delete-outline" variant="text" color="error" size="small" @click="createDialog.mounts.splice(i, 1)" />
            </v-col>
          </v-row>
        </v-sheet>

        <v-divider class="my-3"></v-divider>
        <v-switch v-model="createDialog.unprivileged" :label="$t('unprivileged')" class="mt-2" inset density="compact" hide-details="auto" color="green" />
        <v-switch v-model="createDialog.autostart" :label="$t('autostart')" class="mt-2" inset density="compact" hide-details="auto" color="green" />
        <v-switch v-model="createDialog.start_after_creation" :label="$t('start after creation')" class="mt-2" inset density="compact" hide-details="auto" color="green" />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="createDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="createLXC()">
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete LXC Dialog -->
  <v-dialog v-model="deleteDialog.value" max-width="500">
    <v-card class="pa-0">
      <v-card-title class="text-h6">{{ $t('delete') }} {{ deleteDialog.lxc ? deleteDialog.lxc.name : '' }}</v-card-title>
      <v-card-text>
        {{ $t('are you sure you want to delete this lxc container?') }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="deleteDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="removeLXC(deleteDialog.lxc.name)">
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Mounts Dialog -->
  <v-dialog v-model="mountsDialog.value" max-width="700">
    <v-card class="pa-0" :title="$t('mounts')" prepend-icon="mdi-database">
      <v-card-text>
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="text-subtitle-2"></span>
          <v-btn variant="text" color="success" size="small" prepend-icon="mdi-plus" @click="mountsDialog.lxc?.mounts?.push({ source: '', destination: '', readonly: false, type: 'file' })">
            {{ $t('add') }}
          </v-btn>
        </div>

        <v-sheet v-if="!mountsDialog.lxc || !mountsDialog.lxc.mounts || !mountsDialog.lxc.mounts.length" border rounded class="pa-4 text-center text-medium-emphasis mb-2">
          {{ $t('no mounts defined') }}
        </v-sheet>

        <v-sheet v-for="(mount, i) in mountsDialog.lxc ? mountsDialog.lxc.mounts : []" :key="i" border rounded class="pa-3 mb-2">
          <v-row align="center">
            <v-col cols="12" sm="3">
              <v-text-field
                v-model="mount.source"
                :label="$t('source')"
                density="compact"
                variant="outlined"
                hide-details
                append-inner-icon="mdi-folder-open"
                @click:append-inner="
                  () => {
                    currentMountIndex = i;
                    fsDialogVisible = true;
                  }
                "
              />
            </v-col>
            <v-col cols="12" sm="3">
              <v-text-field v-model="mount.destination" :label="$t('destination')" density="compact" variant="outlined" hide-details />
            </v-col>
            <v-col cols="6" sm="2">
              <v-select v-model="mount.type" :items="['file', 'directory']" :label="$t('type')" density="compact" variant="outlined" hide-details />
            </v-col>
            <v-col cols="4" sm="3" class="d-flex justify-center">
              <v-checkbox v-model="mount.readonly" :label="$t('readonly')" density="compact" hide-details class="flex-grow-0" style="white-space: nowrap" />
            </v-col>
            <v-col cols="2" sm="1" class="d-flex justify-end">
              <v-btn icon="mdi-delete-outline" variant="text" color="error" size="small" @click="mountsDialog.lxc?.mounts?.splice(i, 1)" />
            </v-col>
          </v-row>
        </v-sheet>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="mountsDialog.value = false" color="onPrimary">{{ $t('close') }}</v-btn>
        <v-btn color="onPrimary" @click="saveMounts(mountsDialog.lxc)" :disabled="!mountsDialog.lxc || !mountsDialog.lxc.mounts || mountsDialog.lxc.mounts.length <= 0">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- File Edit Dialog -->
  <FileEditDialog v-model="editFileDialogVisible" :path="selectedFilePath" :createBackup="true" :title="$t('edit file')" @saved="onFileSaved" />

  <!-- File System Navigator Dialog -->
  <FsNavigatorDialog
    v-model="fsDialogVisible"
    :initialPath="currentMountIndex >= 0 && mountsDialog.lxc?.mounts?.[currentMountIndex]?.source ? mountsDialog.lxc.mounts[currentMountIndex].source : '/'"
    :selectType="currentMountIndex >= 0 && mountsDialog.lxc?.mounts?.[currentMountIndex]?.type ? mountsDialog.lxc.mounts[currentMountIndex].type : 'directory'"
    :title="$t('select path')"
    @selected="
      (item) => {
        if (currentMountIndex >= 0 && mountsDialog.lxc?.mounts?.[currentMountIndex]) {
          mountsDialog.lxc.mounts[currentMountIndex].source = item.path;
          fsDialogVisible = false;
        }
      }
    "
  />

  <!-- File System Navigator Dialog for Create -->
  <FsNavigatorDialog
    v-model="fsDialogVisibleCreate"
    :initialPath="currentCreateMountIndex >= 0 && createDialog.mounts?.[currentCreateMountIndex]?.source ? createDialog.mounts[currentCreateMountIndex].source : '/'"
    :selectType="currentCreateMountIndex >= 0 && createDialog.mounts?.[currentCreateMountIndex]?.type ? createDialog.mounts[currentCreateMountIndex].type : 'directory'"
    :title="$t('select path')"
    @selected="
      (item) => {
        if (currentCreateMountIndex >= 0 && createDialog.mounts?.[currentCreateMountIndex]) {
          createDialog.mounts[currentCreateMountIndex].source = item.path;
          fsDialogVisibleCreate = false;
        }
      }
    "
  />

  <!-- Floating Action Button -->
  <v-fab @click="openCreateDialog()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-plus</v-icon>
  </v-fab>
</template>

<script setup>
import { ref, onMounted, reactive, onUnmounted, computed } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import draggable from 'vuedraggable';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';
import { useApi } from '@/composables/useApi';
import { openTerminalPopup } from '@/composables/terminalpopup';
import FileEditDialog from '@/components/fileEditDialog.vue';
import FsNavigatorDialog from '@/components/fsNavigatorDialog.vue';
import { io } from 'socket.io-client';

const editFileDialogVisible = ref(false);
const selectedFilePath = ref('');
const fsDialogVisible = ref(false);
const currentMountIndex = ref(-1);
const fsDialogVisibleCreate = ref(false);
const currentCreateMountIndex = ref(-1);
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const lxcs = ref([]);
const images = ref([]);
const { call } = useApi();
const { t } = useI18n();
const createDialog = reactive({
  value: false,
  name: '',
  distribution: null,
  arch: null,
  release: null,
  architectures: null,
  autostart: false,
  description: '',
  start_after_creation: false,
  mounts: [],
});
const deleteDialog = reactive({
  value: false,
  lxc: null,
});
const mountsDialog = reactive({
  value: false,
  lxc: null,
});
const lxcsLoading = ref(true);
const lxcImagesLoading = ref(true);
const searchTerm = ref('');
const filteredLxcs = computed(() => {
  const term = (searchTerm.value || '').trim().toLowerCase();
  if (!term) return lxcs.value;
  return lxcs.value.filter((lxc) => lxc.name && lxc.name.toLowerCase().includes(term));
});
let socket = null;

onMounted(() => {
  getLXCs();
  getLXCWS();
});

onUnmounted(() => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
});

const openFileEditor = (path) => {
  selectedFilePath.value = path;
  editFileDialogVisible.value = true;
};
const onFileSaved = (file) => {};

const getLXCs = async () => {
  try {
    const [result, mosResult, usageResult] = await Promise.all([
      call('/api/v1/lxc/containers', {
        errorLabel: t('lxc containers could not be loaded'),
      }),
      call('/api/v1/lxc/mos/containers', {
        errorLabel: t('lxc mos data could not be loaded'),
      }),
      call('/api/v1/lxc/containers/usage', {
        errorLabel: t('lxc usage data could not be loaded'),
      }),
    ]);

    if (Array.isArray(mosResult)) {
      result.sort((a, b) => {
        const objA = mosResult.find((item) => item.name === a.name);
        const objB = mosResult.find((item) => item.name === b.name);
        const idxA = objA ? objA.index : Number.MAX_SAFE_INTEGER;
        const idxB = objB ? objB.index : Number.MAX_SAFE_INTEGER;
        return idxA - idxB;
      });
    }

    result.forEach((lxc) => {
      const mos = mosResult.find((item) => item.name === lxc.name);
      lxc.autostart = mos ? mos.autostart : false;
    });

    result.forEach((lxc) => {
      const usage = usageResult.find((item) => item.name === lxc.name);
      lxc.cpu = usage && usage.cpu ? usage.cpu : {};
      lxc.memory = usage && usage.memory ? usage.memory : {};
    });

    lxcs.value = result;
  } catch (e) {
  } finally {
    lxcsLoading.value = false;
  }
};

const getImages = async () => {
  try {
    const imagesResult = await call('/api/v1/lxc/images', {
      errorLabel: t('lxc images could not be loaded'),
    });

    images.value = Object.keys(imagesResult.distributions).map((key) => ({
      name: key,
      releases: imagesResult.distributions[key],
    }));
  } catch (e) {}
};

const stopLXC = async (name) => {
  try {
    await call(`/api/v1/lxc/containers/${name}/stop`, {
      method: 'POST',
      errorLabel: t('lxc container could not be stopped'),
      successLabel: t('lxc container stopped successfully'),
    });
    getLXCs();
  } catch (e) {}
};

const startLXC = async (name) => {
  try {
    await call(`/api/v1/lxc/containers/${name}/start`, {
      method: 'POST',
      errorLabel: t('lxc container could not be started'),
      successLabel: t('lxc container started successfully'),
    });
    getLXCs();
  } catch (e) {}
};

const killLXC = async (name) => {
  try {
    await call(`/api/v1/lxc/containers/${name}/kill`, {
      method: 'POST',
      errorLabel: t('lxc container could not be killed'),
      successLabel: t('lxc container killed successfully'),
    });
    getLXCs();
  } catch (e) {}
};

const createLXC = async () => {
  const newLXC = {
    name: createDialog.name,
    distribution: createDialog.distribution,
    release: createDialog.release,
    arch: createDialog.arch,
    unprivileged: createDialog.unprivileged,
    autostart: createDialog.autostart,
    description: createDialog.description,
    start_after_creation: createDialog.start_after_creation,
    mounts: createDialog.mounts.map((mount) => ({
      source: mount.source,
      destination: mount.destination,
      readonly: mount.readonly,
      type: mount.type,
    })),
  };

  try {
    await call('/api/v1/lxc/containers/create', {
      method: 'POST',
      body: newLXC,
      errorLabel: t('lxc container could not be created'),
      successLabel: t('lxc container created successfully'),
    });
    getLXCs();
    createDialog.value = false;
  } catch (e) {}
};

const removeLXC = async (name) => {
  try {
    await call(`/api/v1/lxc/containers/${name}`, {
      method: 'DELETE',
      errorLabel: t('lxc container could not be removed'),
      successLabel: t('lxc container removed successfully'),
    });
    getLXCs();
    deleteDialog.value = false;
  } catch (e) {}
};

const openTerminal = async (lxcName) => {
  const sessionId = await createLXCTerminalSession(lxcName);
  if (sessionId) {
    openTerminalPopup(sessionId);
  } else {
    showSnackbarError(t('failed to create terminal session'));
  }
};

const createLXCTerminalSession = async (lxcName) => {
  try {
    const result = await call('/api/v1/terminal/create', {
      method: 'POST',
      body: {
        command: 'lxc-attach',
        args: ['-n', lxcName],
      },
      errorLabel: t('failed to create terminal session'),
    });
    return result?.sessionId;
  } catch (e) {}
};

const switchAutostart = async (lxc) => {
  const autostart = [{ name: lxc.name, autostart: lxc.autostart }];

  try {
    await call(`/api/v1/lxc/mos/containers`, {
      method: 'POST',
      body: autostart,
      errorLabel: t('autostart setting could not be saved'),
      successLabel: t('autostart setting saved successfully'),
    });
  } catch (e) {}
};

const calculateContainerSize = async (lxc) => {
  try {
    lxc.calculating_storage = true;
    const result = await call(`/api/v1/lxc/containers/${lxc.name}/calc`, {
      errorLabel: t('error calculating directory size'),
      successLabel: t('directory size calculated'),
    });
    lxc.storage_size_human = result.size_human;
  } catch (e) {
  } finally {
    lxc.calculating_storage = false;
  }
};

const onDragEnd = async () => {
  const newOrder = lxcs.value.map((lxc, idx) => ({
    name: lxc.name,
    index: idx + 1,
    autostart: lxc.autostart,
  }));

  try {
    await call('/api/v1/lxc/mos/containers', {
      method: 'POST',
      body: newOrder,
      errorLabel: t('lxc container order could not be saved'),
      successLabel: t('lxc container order saved successfully'),
    });
  } catch (e) {}
};

const restartLXC = async (name) => {
  try {
    await call(`/api/v1/lxc/containers/${name}/restart`, {
      method: 'POST',
      errorLabel: t('lxc container could not be restarted'),
      successLabel: t('lxc container restarted successfully'),
    });
    getLXCs();
  } catch (e) {}
};

const freezeLXC = async (name) => {
  try {
    await call(`/api/v1/lxc/containers/${name}/freeze`, {
      method: 'POST',
      errorLabel: t('lxc container could not be freezed'),
      successLabel: t('lxc container freezed successfully'),
    });
    getLXCs();
  } catch (e) {}
};

const unfreezeLXC = async (name) => {
  try {
    await call(`/api/v1/lxc/containers/${name}/unfreeze`, {
      method: 'POST',
      errorLabel: t('lxc container could not be unfreezed'),
      successLabel: t('lxc container unfreezed successfully'),
    });
    getLXCs();
  } catch (e) {}
};

const openDeleteDialog = (lxc) => {
  deleteDialog.value = true;
  deleteDialog.lxc = lxc;
};

const openCreateDialog = async () => {
  createDialog.value = true;
  createDialog.name = '';
  createDialog.distribution = null;
  createDialog.release = null;
  createDialog.arch = null;
  await getImages();
  lxcImagesLoading.value = false;
};

const openMountsDialog = async (lxc) => {
  mountsDialog.value = true;
  mountsDialog.lxc = lxc;
  if (!mountsDialog.lxc.mounts) {
    mountsDialog.lxc.mounts = (await getMounts(lxc)) || [];
  }
};

const getMounts = async (lxc) => {
  try {
    return await call(`/api/v1/lxc/containers/${lxc.name}/mounts`, {
      errorLabel: t('mounts could not be loaded'),
    });
  } catch (e) {
    return [];
  }
};

const saveMounts = async (lxc) => {
  try {
    await call(`/api/v1/lxc/containers/${lxc.name}/mounts`, {
      method: 'PUT',
      body: lxc.mounts,
      errorLabel: t('mounts could not be saved'),
      successLabel: t('mounts saved successfully'),
    });
    mountsDialog.value = false;
    getLXCs();
  } catch (e) {}
};

const getLxcIconSrc = (lxc) => {
  if (lxc.custom_icon) {
    return `/lxc_custom/${lxc.name}.png`;
  } else {
    return `/os_icons/${lxc.distribution}.png`;
  }
};

const getReleasesfromDistribution = (distribution) => {
  const image = images.value.find((img) => img.name === distribution);
  return image ? Object.keys(image.releases) : [];
};

const getArchitectuesfromDistribution = (distribution, release) => {
  const image = images.value.find((img) => img.name === distribution);
  if (image && image.releases && image.releases[release]) {
    return image.releases[release].architectures || [];
  }
  return image ? image.architectures : [];
};

const checkWebui = (lxc) => {
  if (lxc.state === 'running' && lxc.webui) {
    return true;
  }
  return false;
};

const showWebui = (lxc) => {
  if (!lxc.webui) return;
  let webui = lxc.webui;

  const addressMatch = webui.match(/\[ADDRESS\]/g);
  if (addressMatch) {
    const ipv4 = Array.isArray(lxc.ipv4) && lxc.ipv4.length > 0 ? lxc.ipv4[0] : '';
    webui = webui.replace(/\[ADDRESS\]/g, ipv4);
  }

  window.open(webui, '_blank');
};

const getLXCWS = () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    showSnackbarError(t('unknown error'), 'No auth token found');
    return;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  const wsUrl = __WS_BASE_URL__ || '';
  socket = io(wsUrl ? `${wsUrl}/lxc` : '/lxc', { path: '/api/v1/socket.io/', transports: ['websocket'], upgrade: false });

  socket.on('connect', () => {
    socket.emit('subscribe-container-usage', { token: authToken });
  });

  socket.on('connect_error', (err) => {
    showSnackbarError(t('unknown error'), `Connection error: ${err}`);
  });

  const apply = (data) => {
    if (!data) return;

    const updates = Array.isArray(data) ? data : data.containers && Array.isArray(data.containers) ? data.containers : [data];

    updates.forEach((update) => {
      if (!update || !update.name) return;

      const lxc = lxcs.value.find((x) => x.name === update.name);
      if (!lxc) return;

      if (update.cpu) lxc.cpu = update.cpu;
      if (update.memory) lxc.memory = update.memory;
      if (update.network) {
        if (Array.isArray(update.network.ipv4)) lxc.ipv4 = update.network.ipv4;
        if (Array.isArray(update.network.ipv6)) lxc.ipv6 = update.network.ipv6;
      }

      if (typeof update.state === 'string') lxc.state = update.state;
      if (typeof update.autostart === 'boolean') lxc.autostart = update.autostart;
    });
  };

  socket.on('container-usage-update', apply);
  socket.on('error', (err) => {
    console.log(err);
    showSnackbarError(t('unknown error'), `Socket error: ${String(err)}`);
  });
};
</script>
