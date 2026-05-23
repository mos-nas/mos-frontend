<template>
  <v-container fluid class="d-flex justify-center">
    <v-navigation-drawer v-model="sidePanel.open" location="right" temporary width="400" :scrim="false" scrollable>
      <template #prepend>
        <v-toolbar density="compact" class="bg-transparent">
          <v-btn icon size="small" @click="sidePanel.open = false" class="ml-auto">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <div class="pa-4">
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="text-subtitle-2 font-weight-medium">{{ $t('used docker ports') }}</div>
            {{ usedDockerPorts.length }}
          </div>

          <v-alert v-if="!usedDockerPorts.length" type="info" variant="tonal" density="compact" class="mt-2">
            {{ $t('no occupied ports found') }}
          </v-alert>

          <div v-else style="overflow-x: auto">
            <v-table density="compact" class="bg-transparent">
              <thead>
                <tr style="background-color: rgba(0, 0, 0, 0.04)">
                  <th style="width: 78px; padding: 4px 8px">{{ $t('port') }}</th>
                  <th style="padding: 4px 8px">{{ $t('container') }}</th>
                  <th style="width: 108px; padding: 4px 8px">{{ $t('status') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in usedDockerPorts" :key="`${item.name}-${item.port}-${item.proto}-${index}`">
                  <td style="padding: 6px 8px">
                    {{ item.port }}
                  </td>
                  <td style="padding: 6px 8px" class="font-weight-medium">{{ item.name || $t('unknown') }}</td>
                  <td style="padding: 6px 8px">
                    <v-chip size="x-small" :color="dockerStateColor(item.status)" variant="tonal">
                      {{ item.status }}
                    </v-chip>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </div>
      </template>
    </v-navigation-drawer>
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <v-row>
          <v-col cols="auto" class="d-flex align-center justify-center" style="height: 40px">
            <v-icon @click="$router.back()" class="mr-2" style="vertical-align: middle">mdi-arrow-left</v-icon>
          </v-col>
          <div class="d-flex align-center ga-3 mb-4" style="height: 40px">
            <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('change docker containers') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card class="px-0" style="margin-bottom: 80px">
          <v-card-text>
            <v-text-field :label="$t('name')" v-model="form.name" readonly></v-text-field>
            <v-text-field :label="$t('repository')" v-model="form.repo" required></v-text-field>
            <v-select
              :label="$t('network')"
              v-model="networkMode"
              :items="networkOptions"
              item-title="name"
              item-value="name"
              :loading="loadingNetworks"
              clearable
              @update:model-value="onNetworkChange"
            ></v-select>
            <v-select
              v-if="networkMode === 'container-network'"
              :label="$t('container')"
              v-model="selectedContainer"
              :items="containerOptions"
              item-title="name"
              item-value="name"
              :loading="loadingContainers"
              clearable
              @update:model-value="onContainerChange"
            ></v-select>

            <v-text-field :label="$t('custom ip')" v-model="form.custom_ip"></v-text-field>
            <v-text-field :label="$t('default shell')" v-model="form.default_shell"></v-text-field>
            <v-select :label="$t('gpu')" v-model="form.gpus" :items="gpuIds" item-title="value" item-value="key" multiple clearable chips hide-selected></v-select>
            <v-switch :label="$t('privileged')" v-model="form.privileged" inset color="green" density="compact" hide-details="auto"></v-switch>
            <v-switch :label="$t('no autoupdate')" v-model="form.no_autoupdate" inset color="green" density="compact"></v-switch>
            <v-text-field :label="$t('extra parameters')" v-model="form.extra_parameters"></v-text-field>
            <v-text-field :label="$t('post parameters')" v-model="form.post_parameters"></v-text-field>
            <v-text-field :label="$t('web ui url')" v-model="form.web_ui_url"></v-text-field>
            <v-text-field :label="$t('icon')" v-model="form.icon" hide-details="auto"></v-text-field>
          </v-card-text>
          <v-divider :color="$vuetify.theme.name === 'dark' ? 'white' : 'black'"></v-divider>
          <v-card-text>
            <v-row>
              <v-col cols="12" class="d-flex align-center justify-space-between">
                <span class="text-title-medium font-weight-medium">{{ $t('paths') }}</span>
                <v-btn
                  variant="text"
                  size="small"
                  class="ma-1 pa-0 float-right"
                  style="min-width: 0; color: green"
                  @click="form.paths.push({ _uid: uid(), name: '', mode: '', host: '', container: '' })"
                  title="Add path"
                  aria-label="add path"
                >
                  <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                  {{ $t('add') }}
                </v-btn>
              </v-col>
            </v-row>
            <div v-for="(path, i) in form.paths" :key="path._uid">
              <v-divider v-if="i > 0" class="my-2"></v-divider>
              <v-row>
                <v-col cols="1" class="d-flex flex-column justify-center align-center">
                  <div class="d-flex flex-column align-center">
                    <v-btn
                      icon
                      size="x-small"
                      color="green"
                      class="pa-0"
                      style="width: 24px; height: 24px; min-width: 24px; margin-bottom: 6px"
                      @click="form.paths.splice(i + 1, 0, { _uid: uid(), name: '', mode: '', host: '', container: '' })"
                      title="Add path"
                      aria-label="add path"
                    >
                      <v-icon size="18">mdi-plus</v-icon>
                    </v-btn>
                    <v-btn icon size="x-small" color="error" class="pa-0" style="width: 24px; height: 24px; min-width: 24px" @click="removePath(i)" title="Remove path" aria-label="remove path">
                      <v-icon size="18">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </v-col>
                <v-col cols="11">
                  <v-row>
                    <v-col cols="6">
                      <v-text-field :label="$t('name')" v-model="path.name" density="compact"></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field :label="$t('mode')" v-model="path.mode" density="compact"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="mt-n2">
                    <v-col cols="6">
                      <v-text-field
                        :label="$t('host')"
                        v-model="path.host"
                        density="compact"
                        append-inner-icon="mdi-folder"
                        @click:append-inner="
                          openFsDialog((item) => {
                            path.host = item.path;
                          })
                        "
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field :label="$t('container')" v-model="path.container" density="compact"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="mt-n2">
                    <v-col cols="12">
                      <v-text-field :label="$t('description')" v-model="path.description" density="compact" hide-details></v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </div>
            <v-divider class="my-2"></v-divider>
            <v-row>
              <v-col cols="12" class="d-flex align-center justify-space-between">
                <span class="text-title-medium font-weight-medium">{{ $t('ports') }}</span>
                <v-spacer />
                <v-btn variant="text" size="small" class="ma-1 pa-0 float-right" style="min-width: 0; color: green" @click="sidePanel.open = true" title="inspect" aria-label="inspect">
                  <v-icon size="18" class="mr-1">mdi-eye</v-icon>
                  {{ $t('inspect') }}
                </v-btn>
                <v-btn
                  variant="text"
                  size="small"
                  class="ma-1 pa-0 float-right"
                  style="min-width: 0; color: green"
                  @click="form.ports.push({ _uid: uid(), name: '', protocol: '', host: '', container: '' })"
                  title="Add port"
                  aria-label="add port"
                >
                  <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                  {{ $t('add') }}
                </v-btn>
              </v-col>
            </v-row>
            <div v-for="(port, i) in form.ports" :key="port._uid">
              <v-divider v-if="i > 0" class="my-2"></v-divider>
              <v-row>
                <v-col cols="1" class="d-flex flex-column justify-center align-center">
                  <div class="d-flex flex-column align-center">
                    <v-btn
                      icon
                      size="x-small"
                      color="green"
                      class="pa-0"
                      style="width: 24px; height: 24px; min-width: 24px; margin-bottom: 6px"
                      @click="form.ports.splice(i + 1, 0, { _uid: uid(), name: '', protocol: '', host: '', container: '' })"
                      title="Add port"
                      aria-label="add port"
                    >
                      <v-icon size="18">mdi-plus</v-icon>
                    </v-btn>
                    <v-btn icon size="x-small" color="error" class="pa-0" style="width: 24px; height: 24px; min-width: 24px" @click="removePort(i)" title="Remove port" aria-label="remove port">
                      <v-icon size="18">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </v-col>
                <v-col cols="11">
                  <v-row>
                    <v-col cols="6">
                      <v-text-field :label="$t('name')" v-model="port.name" density="compact"></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field :label="$t('protocol')" v-model="port.protocol" density="compact"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="mt-n2">
                    <v-col cols="6">
                      <v-text-field :label="$t('host')" type="text" v-model="port.host" density="compact" :error="!!port.host && !/^[0-9.\-:]+$/.test(port.host)"></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field :label="$t('container')" type="text" v-model="port.container" density="compact" :error="!!port.container && !/^[0-9.\-:]+$/.test(port.container)"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="mt-n2">
                    <v-col cols="12">
                      <v-text-field :label="$t('description')" v-model="port.description" density="compact" hide-details></v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </div>
            <v-divider class="my-2"></v-divider>
            <v-row>
              <v-col cols="12" class="d-flex align-center justify-space-between">
                <span class="text-title-medium font-weight-medium">{{ $t('devices') }}</span>
                <v-btn
                  variant="text"
                  size="small"
                  class="ma-1 pa-0 float-right"
                  style="min-width: 0; color: green"
                  @click="form.devices.push({ _uid: uid(), name: '', host: '', container: '' })"
                  title="Add device"
                  aria-label="add device"
                >
                  <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                  {{ $t('add') }}
                </v-btn>
              </v-col>
            </v-row>
            <div v-for="(device, i) in form.devices" :key="device._uid">
              <v-divider v-if="i > 0" class="my-2"></v-divider>
              <v-row>
                <v-col cols="1" class="d-flex flex-column justify-center align-center">
                  <div class="d-flex flex-column align-center">
                    <v-btn
                      icon
                      size="x-small"
                      color="green"
                      class="pa-0"
                      style="width: 24px; height: 24px; min-width: 24px; margin-bottom: 6px"
                      @click="form.devices.splice(i + 1, 0, { _uid: uid(), name: '', host: '', container: '' })"
                      title="Add device"
                      aria-label="add device"
                    >
                      <v-icon size="18">mdi-plus</v-icon>
                    </v-btn>
                    <v-btn icon size="x-small" color="error" class="pa-0" style="width: 24px; height: 24px; min-width: 24px" @click="removeDevice(i)" title="Remove device" aria-label="remove device">
                      <v-icon size="18">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </v-col>
                <v-col cols="11">
                  <v-row>
                    <v-col cols="6">
                      <v-text-field :label="$t('name')" v-model="device.name" density="compact"></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field :label="$t('host')" v-model="device.host" density="compact"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="mt-n2">
                    <v-col cols="12">
                      <v-text-field :label="$t('container')" v-model="device.container" density="compact"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="mt-n2">
                    <v-col cols="12">
                      <v-text-field :label="$t('description')" v-model="device.description" density="compact" hide-details></v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </div>
            <v-divider class="my-2"></v-divider>
            <v-row>
              <v-col cols="12" class="d-flex align-center justify-space-between">
                <span class="text-title-medium font-weight-medium">{{ $t('variables') }}</span>
                <v-btn
                  variant="text"
                  size="small"
                  class="ma-1 pa-0 float-right"
                  style="min-width: 0; color: green"
                  @click="form.variables.push({ _uid: uid(), name: '', key: '', value: '', mask: false })"
                  title="Add variable"
                  aria-label="add variable"
                >
                  <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                  {{ $t('add') }}
                </v-btn>
              </v-col>
            </v-row>
            <div v-for="(variable, i) in form.variables" :key="variable._uid">
              <v-divider v-if="i > 0" class="my-2"></v-divider>
              <v-row>
                <v-col cols="1" class="d-flex flex-column justify-center align-center">
                  <div class="d-flex flex-column align-center">
                    <v-btn
                      icon
                      size="x-small"
                      color="green"
                      class="pa-0"
                      style="width: 24px; height: 24px; min-width: 24px; margin-bottom: 6px"
                      @click="form.variables.splice(i + 1, 0, { _uid: uid(), name: '', key: '', value: '', mask: false })"
                      title="Add variable"
                      aria-label="add variable"
                    >
                      <v-icon size="18">mdi-plus</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      size="x-small"
                      color="error"
                      class="pa-0"
                      style="width: 24px; height: 24px; min-width: 24px"
                      @click="removeVariable(i)"
                      title="Remove variable"
                      aria-label="remove variable"
                    >
                      <v-icon size="18">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </v-col>
                <v-col cols="11">
                  <v-row>
                    <v-col cols="6">
                      <v-text-field :label="$t('name')" v-model="variable.name" density="compact"></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-switch :label="$t('masked')" v-model="variable.mask" inset color="green" density="compact"></v-switch>
                    </v-col>
                  </v-row>
                  <v-row class="mt-n2">
                    <v-col cols="6">
                      <v-text-field :label="$t('key')" v-model="variable.key" density="compact"></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field :label="$t('value')" v-model="variable.value" density="compact" :type="variable.mask ? 'password' : 'text'"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="mt-n2">
                    <v-col cols="12">
                      <v-text-field :label="$t('description')" v-model="variable.description" density="compact" hide-details></v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </div>
            <v-divider class="my-2"></v-divider>
            <v-row>
              <v-col cols="12" class="d-flex align-center justify-space-between">
                <span class="text-title-medium font-weight-medium">{{ $t('labels') }}</span>
                <v-btn
                  variant="text"
                  size="small"
                  class="ma-1 pa-0 float-right"
                  style="min-width: 0; color: green"
                  @click="form.labels.push({ _uid: uid(), name: '', key: '', value: '', mask: false })"
                  title="Add label"
                  aria-label="add label"
                >
                  <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                  {{ $t('add') }}
                </v-btn>
              </v-col>
            </v-row>
            <div v-for="(label, i) in form.labels" :key="label._uid">
              <v-divider v-if="i > 0" class="my-2"></v-divider>
              <v-row>
                <v-col cols="1" class="d-flex flex-column justify-center align-center">
                  <div class="d-flex flex-column align-center">
                    <v-btn
                      icon
                      size="x-small"
                      color="green"
                      class="pa-0"
                      style="width: 24px; height: 24px; min-width: 24px; margin-bottom: 6px"
                      @click="form.labels.splice(i + 1, 0, { _uid: uid(), name: '', key: '', value: '', mask: false })"
                      title="Add label"
                      aria-label="add label"
                    >
                      <v-icon size="18">mdi-plus</v-icon>
                    </v-btn>
                    <v-btn icon size="x-small" color="error" class="pa-0" style="width: 24px; height: 24px; min-width: 24px" @click="removeLabel(i)" title="Remove label" aria-label="remove label">
                      <v-icon size="18">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </v-col>
                <v-col cols="11">
                  <v-row>
                    <v-col cols="6">
                      <v-text-field :label="$t('name')" v-model="label.name" density="compact"></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-switch :label="$t('masked')" v-model="label.mask" inset color="green" density="compact"></v-switch>
                    </v-col>
                  </v-row>
                  <v-row class="mt-n2">
                    <v-col cols="6">
                      <v-text-field :label="$t('key')" v-model="label.key" density="compact"></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field :label="$t('value')" v-model="label.value" density="compact" :type="label.mask ? 'password' : 'text'"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="mt-n2">
                    <v-col cols="12">
                      <v-text-field :label="$t('description')" v-model="label.description" density="compact" hide-details></v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- WebSocket Operation Dialog -->
  <v-dialog v-model="wsOperationDialog.value" max-width="800" persistent>
    <v-card>
      <v-card-text class="pa-1">
        <div
          ref="wsScrollContainer"
          :style="{
            flexGrow: 1,
            height: 'calc(100vh - 340px)',
            overflow: 'auto',
            whiteSpace: 'pre',
            fontFamily: 'monospace',
            border: '1px solid ' + ($vuetify.theme && $vuetify.theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.12)'),
            borderRadius: '4px',
            backgroundColor: $vuetify.theme && $vuetify.theme.name == 'dark' ? '#121212' : '#fafafa',
            color: $vuetify.theme && $vuetify.theme.name == 'dark' ? '#e0e0e0' : '#111',
          }"
        >
          <div
            v-for="(line, index) in wsOperationDialog.data"
            :key="index"
            :style="{
              paddingLeft: '4px',
              paddingRight: '4px',
              whiteSpace: 'pre-wrap',
              backgroundColor: $vuetify.theme && $vuetify.theme.name == 'dark' ? 'transparent' : '#fafafa',
              color: $vuetify.theme && $vuetify.theme.name == 'dark' ? '#e0e0e0' : '#111',
            }"
          >
            <small>{{ line.output }}</small>
          </div>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-progress-circular v-if="wsOperationDialog.loading" color="primary" class="ma-0" indeterminate />
        <v-spacer />
        <v-btn
          color="onPrimary"
          text
          @click="
            closeWsDialog();
            goBackSafely();
          "
        >
          {{ $t('close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- File System Navigator Dialog -->
  <fsNavigatorDialog v-model="fsDialog" :initial-path="'/mnt'" :roots="'/mnt'" select-type="all" :title="$t('select file or directory')" @selected="handleFsSelected" />

  <!-- Floating Action Button -->
  <v-fab color="primary" @click="updateDocker()" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon color="onPrimary">mdi-content-save</v-icon>
  </v-fab>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { ref, onMounted, reactive, nextTick } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useDockerWebSocket } from '@/composables/useDockerWebSocket';
import fsNavigatorDialog from '@/components/fsNavigatorDialog.vue';

const fsDialog = ref(false);
const fsDialogCallback = ref(null);
const router = useRouter();
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { t } = useI18n();
const overlay = ref(false);
const gpus = ref({});
const gpuIds = ref([]);
const getDocker = ref({});
const networkOptions = ref([]);
const loadingNetworks = ref(false);
const containerOptions = ref([]);
const loadingContainers = ref(false);
const selectedContainer = ref('');
const networkMode = ref('');
const form = reactive({
  name: '',
  repo: '',
  network: '',
  custom_ip: '',
  default_shell: '',
  privileged: false,
  no_autoupdate: false,
  extra_parameters: '',
  post_parameters: '',
  web_ui_url: '',
  icon: '',
  ports: [],
  paths: [],
  devices: [],
  variables: [],
  gpus: [],
  labels: [],
});
let _uidCounter = 0;
const uid = () => ++_uidCounter;
const sidePanel = ref({ open: false });
const usedDockerPorts = ref([]);

const props = defineProps({
  docker: String,
});

onMounted(async () => {
  window.scrollTo(0, 0);
  await getDockerContainers();
  getDockerTemplate();
  getDockerNetworks();
  getGPUs();
  getDockerPorts();
});
const { wsIsConnected, wsError, wsOperationDialog, wsScrollContainer, sendDockerWSCommand, closeWsDialog } = useDockerWebSocket({
  onErrorSnackbar: showSnackbarError,
  onSuccessSnackbar: showSnackbarSuccess,
  onCompleted: async () => {},
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

const getDockerTemplate = async () => {
  try {
    overlay.value = true;

    const res = await fetch(`/api/v1/docker/mos/templates/${props.docker}?edit=true`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker container could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    getDocker.value = await res.json();

    form.name = getDocker.value.name;
    form.repo = getDocker.value.repo;

    if (getDocker.value.network && getDocker.value.network.startsWith('container:')) {
      networkMode.value = 'container-network';
      form.network = getDocker.value.network;
      const containerName = getDocker.value.network.replace('container:', '');
      selectedContainer.value = containerName;
      await nextTick();
      validateContainerExists(containerName);
    } else {
      networkMode.value = getDocker.value.network;
      form.network = getDocker.value.network;
      selectedContainer.value = '';
    }

    form.custom_ip = getDocker.value.custom_ip;
    form.default_shell = getDocker.value.default_shell;
    form.privileged = getDocker.value.privileged;
    form.no_autoupdate = getDocker.value.no_autoupdate || false;
    form.extra_parameters = getDocker.value.extra_parameters;
    form.post_parameters = getDocker.value.post_parameters;
    form.web_ui_url = getDocker.value.web_ui_url;
    form.icon = getDocker.value.icon;
    form.paths = Array.isArray(getDocker.value.paths)
      ? getDocker.value.paths.map((path) => ({
          _uid: uid(),
          name: path.name,
          mode: path.mode,
          host: path.host,
          container: path.container,
          description: path.description || '',
        }))
      : [];
    form.ports = Array.isArray(getDocker.value.ports)
      ? getDocker.value.ports.map((port) => ({
          _uid: uid(),
          name: port.name,
          protocol: port.protocol,
          host: port.host,
          container: port.container,
          description: port.description || '',
        }))
      : [];
    form.variables = Array.isArray(getDocker.value.variables)
      ? getDocker.value.variables.map((variable) => ({
          _uid: uid(),
          name: variable.name,
          key: variable.key,
          value: variable.value,
          mask: variable.mask || false,
          description: variable.description || '',
        }))
      : [];
    form.devices = Array.isArray(getDocker.value.devices)
      ? getDocker.value.devices.map((device) => ({
          _uid: uid(),
          name: device.name,
          host: device.host,
          container: device.container,
          description: device.description || '',
        }))
      : [];
    form.labels = Array.isArray(getDocker.value.labels)
      ? getDocker.value.labels.map((label) => ({
          _uid: uid(),
          name: label.name,
          key: label.key,
          value: label.value,
          mask: label.mask || false,
          description: label.description || '',
        }))
      : [];
    await nextTick();
    form.gpus = Array.isArray(getDocker.value.gpus) ? getDocker.value.gpus : [];
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const getDockerNetworks = async () => {
  try {
    loadingNetworks.value = true;
    const res = await fetch('/api/v1/docker/networks', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker networks could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const networks = await res.json();
    networkOptions.value = networks.map((network) => ({
      name: network.Name,
      id: network.Id,
    }));
    networkOptions.value.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      if (nameA === 'bridge') return -1;
      if (nameB === 'bridge') return 1;

      const isEthBrA = nameA.startsWith('eth') || nameA.startsWith('br');
      const isEthBrB = nameB.startsWith('eth') || nameB.startsWith('br');

      if (isEthBrA && !isEthBrB) return -1;
      if (!isEthBrA && isEthBrB) return 1;

      return nameA.localeCompare(nameB);
    });
    networkOptions.value.push({ name: 'container-network', id: 'container-network' });
  } catch (e) {
    networkOptions.value = [
      { name: 'container-network', id: 'container-network' },
      { name: 'none', id: 'none' },
    ];
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    loadingNetworks.value = false;
  }
};

const getDockerContainers = async () => {
  try {
    loadingContainers.value = true;
    const authHeaders = {
      Authorization: 'Bearer ' + localStorage.getItem('authToken'),
    };

    const res = await fetch('/api/v1/docker/containers/json?all=true', {
      headers: authHeaders,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker containers could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const containers = await res.json();
    containerOptions.value = containers.map((container) => ({
      name: container.Names[0].startsWith('/') ? container.Names[0].slice(1) : container.Names[0],
      id: container.Id,
    }));

    containerOptions.value.sort((a, b) => a.name.localeCompare(b.name));
  } catch (e) {
    containerOptions.value = [];
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    loadingContainers.value = false;
  }
};

const getDockerPorts = async () => {
  try {
    const res = await fetch('/api/v1/docker/mos/ports', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker ports could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    usedDockerPorts.value = await res.json();
  } catch (e) {
    usedDockerPorts.value = [];
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const updateDocker = async () => {
  const changeDocker = getDocker.value;
  changeDocker.name = form.name;
  changeDocker.repo = form.repo;
  changeDocker.network = form.network;
  changeDocker.custom_ip = form.custom_ip;
  changeDocker.default_shell = form.default_shell;
  changeDocker.privileged = form.privileged;
  changeDocker.no_autoupdate = form.no_autoupdate;
  changeDocker.extra_parameters = form.extra_parameters;
  changeDocker.post_parameters = form.post_parameters;
  changeDocker.web_ui_url = form.web_ui_url;
  changeDocker.icon = form.icon;
  changeDocker.gpus = form.gpus;
  changeDocker.paths = form.paths.map((path) => ({
    name: path.name,
    mode: path.mode,
    host: path.host,
    container: path.container,
    description: path.description,
  }));
  changeDocker.ports = form.ports.map((port) => ({
    name: port.name,
    protocol: port.protocol,
    host: port.host,
    container: port.container,
    description: port.description,
  }));
  changeDocker.devices = form.devices.map((device) => ({
    name: device.name,
    host: device.host,
    container: device.container,
    description: device.description,
  }));
  changeDocker.variables = form.variables.map((variable) => ({
    name: variable.name,
    key: variable.key,
    value: variable.value,
    mask: variable.mask,
    description: variable.description,
  }));
  changeDocker.labels = form.labels.map((label) => ({
    name: label.name,
    key: label.key,
    value: label.value,
    mask: label.mask,
    description: label.description,
  }));
  const newDocker = { template: changeDocker };
  sendDockerWSCommand('create', newDocker);
};

const getGPUs = async () => {
  try {
    const res = await fetch('/api/v1/system/gpus', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('gpus could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }
    gpus.value = await res.json();

    gpuIds.value = [];
    const vendors = ['Intel', 'AMD', 'NVIDIA'];
    const seen = new Set();
    vendors.forEach((vendor) => {
      const list = gpus.value?.[vendor];
      if (!Array.isArray(list)) return;
      list.forEach((gpu) => {
        if (!gpu) return;
        const pci = gpu.pci;
        const name = gpu.name;
        if (!pci || seen.has(pci)) return;
        seen.add(pci);
        gpuIds.value.push({ key: pci, value: pci + ' | ' + name });
      });
    });
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const goBackSafely = () => {
  const canGoBack = window.history.length > 1 && document.referrer && new URL(document.referrer).origin === window.location.origin;

  if (canGoBack) {
    router.back();
  } else {
    router.push('/docker');
  }
};

const removePath = (index) => {
  form.paths.splice(index, 1);
};
const removePort = (index) => {
  form.ports.splice(index, 1);
};
const removeDevice = (index) => {
  form.devices.splice(index, 1);
};
const removeVariable = (index) => {
  form.variables.splice(index, 1);
};
const removeLabel = (index) => {
  form.labels.splice(index, 1);
};

const onNetworkChange = (value) => {
  if (value !== 'container-network') {
    selectedContainer.value = '';
    form.network = value;
  } else {
    form.network = 'container-network';
  }
};

const onContainerChange = (containerName) => {
  if (containerName) {
    form.network = `container:${containerName}`;
  } else {
    form.network = 'container-network';
  }
};

const validateContainerExists = (containerName) => {
  const containerExists = containerOptions.value.some((container) => container.name === containerName);

  if (!containerExists) {
    selectedContainer.value = '';
    form.network = 'container-network';
  }
};

const dockerStateColor = (status) => {
  const state = String(status || '').toLowerCase();
  if (state === 'running') return 'success';
  if (state === 'paused') return 'warning';
  if (state === 'restarting') return 'warning';
  if (state === 'exited') return 'error';
  if (state === 'dead') return 'error';
  return 'grey';
};
</script>
