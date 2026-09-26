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
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('nut') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card fluid style="margin-bottom: 80px" class="pa-0">
          <v-card-text>
            <!-- UPS Status -->
            <span class="text-title-medium font-weight-medium">{{ $t('ups status') }}</span>
            <v-card v-if="isLoadingStatus" class="mt-4 mb-4" variant="tonal">
              <v-card-text>
                <v-skeleton-loader type="article" :loading="true" class="status-skeleton"></v-skeleton-loader>
              </v-card-text>
            </v-card>

            <v-card v-else class="mt-4 mb-4" :color="statusCardColor" variant="tonal">
              <v-card-text>
                <v-row class="status-grid">
                  <v-col cols="12" sm="6">
                    <p class="status-line">
                      <strong>{{ $t('status') }}:</strong>
                      {{ nutStatus.reachable ? $t('reachable') : $t('unreachable') }}
                    </p>
                    <div v-if="statusChips.length" class="status-line d-flex flex-wrap ga-1">
                      <v-chip v-for="chip in statusChips" :key="chip.token" :color="chip.color" size="small" variant="flat">{{ chip.token }} — {{ chip.label }}</v-chip>
                    </div>
                    <p class="status-line">
                      <strong>{{ $t('ups name') }}:</strong>
                      {{ nutStatus.name || '-' }}
                    </p>
                    <p class="status-line">
                      <strong>{{ $t('manufacturer') }}:</strong>
                      {{ nutStatus.data?.manufacturer || '-' }}
                    </p>
                    <p class="status-line">
                      <strong>{{ $t('model') }}:</strong>
                      {{ nutStatus.data?.model || '-' }}
                    </p>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <p class="status-line">
                      <strong>{{ $t('load') }}:</strong>
                      {{ nutStatus.data?.load ?? '-' }}%
                    </p>
                    <p class="status-line">
                      <strong>{{ $t('battery charge') }}:</strong>
                      {{ nutStatus.data?.battery?.charge ?? '-' }}%
                    </p>
                    <p class="status-line">
                      <strong>{{ $t('battery runtime') }}:</strong>
                      {{ formatRuntime(nutStatus.data?.battery?.runtime) }}
                    </p>
                    <p class="status-line">
                      <strong>{{ $t('input voltage') }}:</strong>
                      {{ nutStatus.data?.input?.voltage ?? '-' }}V
                    </p>
                  </v-col>
                </v-row>

                <!-- Reported raw vars -->
                <v-card v-if="nutStatus.reachable && hasVars" variant="outlined" class="compact-report mt-2">
                  <button type="button" class="compact-report-toggle" @click="showReportedValues = !showReportedValues">
                    <span>{{ $t('reported values') }}</span>
                    <v-icon :icon="showReportedValues ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="small"></v-icon>
                  </button>
                  <v-expand-transition>
                    <div v-show="showReportedValues" class="compact-report-content">
                      <div v-for="[key, value] in reportedVars" :key="key" class="compact-report-item">
                        <span class="compact-report-key text-medium-emphasis">{{ key }}:</span>
                        <span class="compact-report-value">{{ value }}</span>
                      </div>
                    </div>
                  </v-expand-transition>
                </v-card>

                <p v-if="nutStatus.error" class="mb-0 mt-2 text-caption">{{ nutStatus.error }}</p>
              </v-card-text>
            </v-card>

            <v-divider class="my-4"></v-divider>

            <!-- NUT Configuration -->
            <span class="text-title-medium font-weight-medium">{{ $t('nut configuration') }}</span>

            <v-alert type="info" variant="tonal" class="mt-4 mb-4" border="start">
              <div class="d-flex align-center justify-space-between flex-wrap ga-2">
                <span>{{ $t('enabling/disabling nut service is located on the network settings page') }}.</span>
                <v-btn color="onPrimary" size="small" variant="outlined" prepend-icon="mdi-arrow-right" @click="$router.push('/mosSettings/networkServices')">
                  {{ $t('network settings') }}
                </v-btn>
              </div>
            </v-alert>

            <!-- Mode Selection -->
            <v-select :items="['standalone', 'netclient', 'netserver']" :label="$t('mode')" v-model="nutSettings.mode" class="mt-4" @update:model-value="onModeChange" hide-details="auto"></v-select>

            <v-switch :label="$t('spindown disks')" color="green" inset v-model="nutSettings.spindown_disks" hide-details="auto" density="compact" class="mt-4 mb-4"></v-switch>

            <!-- Standalone/Server Mode Configuration -->
            <div v-if="nutSettings.mode === 'standalone' || nutSettings.mode === 'netserver'">
              <v-divider class="my-4"></v-divider>
              <span class="text-title-medium font-weight-medium">{{ $t('server configuration') }}</span>

              <!-- Server Listen Configuration -->
              <v-row class="mt-4">
                <v-col cols="12">
                  <span class="text-subtitle-2 font-weight-medium">{{ $t('listen addresses') }}</span>
                </v-col>
              </v-row>
              <v-row v-for="(listen, i) in nutSettings.server.listen" :key="`listen-${i}`" class="ga-2 mb-2">
                <v-col cols="12" sm="8">
                  <v-text-field :label="$t('address')" v-model="nutSettings.server.listen[i].address" hide-details="auto"></v-text-field>
                </v-col>
                <v-col cols="12" sm="2">
                  <v-text-field :label="$t('port')" type="number" v-model="nutSettings.server.listen[i].port" hide-details="auto"></v-text-field>
                </v-col>
                <v-col cols="12" sm="2" class="d-flex align-center">
                  <v-btn color="red" variant="tonal" icon size="small" @click="nutSettings.server.listen.splice(i, 1)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <div class="d-flex align-center my-2">
                <v-divider class="flex-grow-1"></v-divider>
                <v-btn
                  class="mx-4"
                  color="green"
                  size="small"
                  density="comfortable"
                  variant="tonal"
                  icon
                  aria-label="Add listen address"
                  @click="nutSettings.server.listen.push({ address: '0.0.0.0', port: 3493 })"
                >
                  <v-icon size="18">mdi-plus</v-icon>
                </v-btn>
                <v-divider class="flex-grow-1"></v-divider>
              </div>

              <!-- UPS Configuration -->
              <v-divider class="my-4"></v-divider>
              <span class="text-subtitle-2 font-weight-medium">{{ $t('ups configuration') }}</span>
              <v-text-field :label="$t('ups name')" v-model="nutSettings.server.ups.name" class="mt-4"></v-text-field>
              <v-text-field :label="$t('driver')" v-model="nutSettings.server.ups.driver"></v-text-field>
              <v-text-field :label="$t('port')" v-model="nutSettings.server.ups.port"></v-text-field>
              <v-text-field :label="$t('description')" v-model="nutSettings.server.ups.desc"></v-text-field>

              <!-- UPS Extra Configuration -->
              <div class="mt-4">
                <span class="text-subtitle-2 font-weight-medium">{{ $t('extra configuration') }}</span>
                <v-row v-for="(entry, i) in extraConfigList" :key="`extra-${i}`" class="ga-2 mb-2 mt-2">
                  <v-col cols="12" sm="5">
                    <v-text-field :label="$t('key')" :model-value="entry.key" hide-details="auto" @update:model-value="(newKey) => renameExtraKey(entry.key, newKey)"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="5">
                    <v-text-field
                      :label="$t('value')"
                      :model-value="entry.value"
                      hide-details="auto"
                      @update:model-value="(newValue) => (nutSettings.server.ups.extra[entry.key] = newValue)"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="2" class="d-flex align-center">
                    <v-btn color="red" variant="tonal" icon size="small" @click="deleteExtraConfig(entry.key)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
                <div class="d-flex align-center my-2">
                  <v-divider class="flex-grow-1"></v-divider>
                  <v-btn class="mx-4" color="green" size="small" density="comfortable" variant="tonal" icon aria-label="Add extra config" @click="addExtraConfig">
                    <v-icon size="18">mdi-plus</v-icon>
                  </v-btn>
                  <v-divider class="flex-grow-1"></v-divider>
                </div>
              </div>

              <!-- Users Configuration -->
              <v-divider class="my-4"></v-divider>
              <span class="text-subtitle-2 font-weight-medium">{{ $t('users') }}</span>
              <v-row v-for="(user, i) in nutSettings.server.users" :key="`user-${i}`" class="ga-2 mb-4 mt-2">
                <v-col cols="12">
                  <v-card variant="outlined" class="pa-4">
                    <v-row class="ga-2">
                      <v-col cols="12" sm="6">
                        <v-text-field :label="$t('username')" v-model="nutSettings.server.users[i].username" hide-details="auto"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field :label="$t('password')" type="password" v-model="nutSettings.server.users[i].password" hide-details="auto"></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-select
                          :items="upsmonRoleOptions"
                          item-title="title"
                          item-value="value"
                          :label="$t('upsmon role')"
                          v-model="nutSettings.server.users[i].upsmon"
                          hide-details="auto"
                        ></v-select>
                      </v-col>
                      <v-col cols="12">
                        <v-select :items="availableActions" :label="$t('allowed actions')" v-model="nutSettings.server.users[i].actions" multiple chips hide-details="auto"></v-select>
                      </v-col>
                      <v-col cols="12">
                        <v-select :items="availableCommands" :label="$t('instant commands')" v-model="nutSettings.server.users[i].instcmds" multiple chips hide-details="auto"></v-select>
                      </v-col>
                      <v-col cols="12" class="d-flex justify-end">
                        <v-btn color="red" variant="tonal" size="small" @click="nutSettings.server.users.splice(i, 1)">
                          {{ $t('delete') }}
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
              <div class="d-flex align-center my-2">
                <v-divider class="flex-grow-1"></v-divider>
                <v-btn class="mx-4" color="green" size="small" density="comfortable" variant="tonal" icon aria-label="Add user" @click="addUser">
                  <v-icon size="18">mdi-plus</v-icon>
                </v-btn>
                <v-divider class="flex-grow-1"></v-divider>
              </div>
            </div>

            <!-- Monitor Mode Configuration -->
            <div v-if="nutSettings.mode === 'netclient'">
              <v-divider class="my-4"></v-divider>
              <span class="text-title-medium font-weight-medium">{{ $t('monitor configuration') }}</span>
              <v-text-field :label="$t('ups name')" v-model="nutSettings.monitor.upsname" class="mt-4"></v-text-field>
              <v-text-field :label="$t('host')" v-model="nutSettings.monitor.host"></v-text-field>
              <v-text-field :label="$t('port')" type="number" v-model="nutSettings.monitor.port"></v-text-field>
              <v-text-field :label="$t('power value')" type="number" v-model="nutSettings.monitor.powervalue"></v-text-field>
              <v-text-field :label="$t('username')" v-model="nutSettings.monitor.username"></v-text-field>
              <v-text-field :label="$t('password')" type="password" v-model="nutSettings.monitor.password"></v-text-field>
              <v-select :items="['primary', 'secondary']" :label="$t('role')" v-model="nutSettings.monitor.role" hide-details="auto"></v-select>
            </div>

            <!-- Shutdown Configuration -->
            <v-divider class="my-4"></v-divider>
            <span class="text-title-medium font-weight-medium">{{ $t('shutdown configuration') }}</span>
            <v-text-field :label="$t('shutdown command')" v-model="nutSettings.shutdown.command" class="mt-4"></v-text-field>
            <!--
              Werte "lowbattery" / "timer" aus der Backend-Referenzdoku uebernommen.
              Falls es weitere gueltige Modi gibt, bitte Liste ergaenzen.
            -->
            <v-select :items="['lowbattery', 'timer']" :label="$t('shutdown mode')" v-model="nutSettings.shutdown.mode"></v-select>
            <v-text-field v-if="nutSettings.shutdown.mode === 'timer'" :label="$t('shutdown timer (seconds)')" type="number" v-model="nutSettings.shutdown.timer_seconds"></v-text-field>
            <v-text-field :label="$t('final delay')" type="number" v-model="nutSettings.shutdown.finaldelay"></v-text-field>
            <v-text-field :label="$t('minimum supplies')" type="number" v-model="nutSettings.shutdown.minsupplies"></v-text-field>
            <v-text-field :label="$t('powerdown flag')" v-model="nutSettings.shutdown.powerdownflag" class="mb-4"></v-text-field>

            <!-- Timers Configuration -->
            <v-divider class="my-4"></v-divider>
            <span class="text-title-medium font-weight-medium">{{ $t('timers') }}</span>
            <v-text-field :label="$t('poll frequency')" type="number" v-model="nutSettings.timers.pollfreq" class="mt-4" :suffix="$t('seconds')"></v-text-field>
            <v-text-field :label="$t('poll frequency alert')" type="number" v-model="nutSettings.timers.pollfreqalert" :suffix="$t('seconds')"></v-text-field>
            <v-text-field :label="$t('host sync')" type="number" v-model="nutSettings.timers.hostsync" :suffix="$t('seconds')"></v-text-field>
            <v-text-field :label="$t('dead time')" type="number" v-model="nutSettings.timers.deadtime" :suffix="$t('seconds')"></v-text-field>
            <v-text-field :label="$t('rb warn time')" type="number" v-model="nutSettings.timers.rbwarntime" :suffix="$t('seconds')"></v-text-field>
            <v-text-field :label="$t('no comm warn time')" type="number" v-model="nutSettings.timers.nocommwarntime" :suffix="$t('seconds')" class="mb-4"></v-text-field>

            <!-- Stop Services Configuration -->
            <v-divider class="my-4"></v-divider>
            <span class="text-title-medium font-weight-medium">{{ $t('stop services on battery') }}</span>

            <!-- Docker Services -->
            <div class="mt-4">
              <v-card variant="outlined" class="mb-4">
                <button type="button" class="compact-report-toggle" @click="showDockerServices = !showDockerServices" style="width: 100%; justify-content: space-between;">
                  <span class="text-subtitle-2 font-weight-medium" style="color: inherit;">{{ nutSettings.stop_services.docker.filter(s => s.enabled).length }} / {{ dockerServiceNames.length }} {{ $t('docker') }} - {{ showDockerServices ? $t('hide') : $t('see more') }}</span>
                  <v-icon :icon="showDockerServices ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="small"></v-icon>
                </button>
                <v-expand-transition>
                  <div v-show="showDockerServices">
                    <v-divider></v-divider>
                    <div class="pa-4">
                      <div v-if="dockerServiceNames.length === 0" class="text-center text-medium-emphasis pa-4">
                        {{ $t('no data') }}
                      </div>
                      <v-row v-else class="ga-2">
                        <v-col v-for="(containerName, i) in dockerServiceNames" :key="`docker-${i}`" cols="12" sm="6" md="4" class="d-flex align-center">
                          <div class="d-flex align-center justify-space-between flex-grow-1 pa-2" style="border: 1px solid var(--v-border-color); border-radius: 4px;">
                            <v-switch 
                              :model-value="nutSettings.stop_services.docker.some(s => s.name === containerName && s.enabled)"
                              @update:model-value="(enabled) => toggleDockerService(containerName, enabled)"
                              hide-details 
                              size="small"
                              density="compact"
                              inset
                              color="primary"
                            ></v-switch>
                            <span class="text-body-2 flex-grow-1 ml-2" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ containerName }}</span>
                          </div>
                        </v-col>
                      </v-row>
                    </div>
                  </div>
                </v-expand-transition>
              </v-card>
            </div>

            <!-- LXC Services -->
            <div class="mt-4">
              <v-card variant="outlined" class="mb-4">
                <button type="button" class="compact-report-toggle" @click="showLxcServices = !showLxcServices" style="width: 100%; justify-content: space-between;">
                  <span class="text-subtitle-2 font-weight-medium" style="color: inherit;">{{ nutSettings.stop_services.lxc.filter(s => s.enabled).length }} / {{ lxcServiceNames.length }} {{ $t('lxc') }} - {{ showLxcServices ? $t('hide') : $t('see more') }}</span>
                  <v-icon :icon="showLxcServices ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="small"></v-icon>
                </button>
                <v-expand-transition>
                  <div v-show="showLxcServices">
                    <v-divider></v-divider>
                    <div class="pa-4">
                      <div v-if="lxcServiceNames.length === 0" class="text-center text-medium-emphasis pa-4">
                        {{ $t('no data') }}
                      </div>
                      <v-row v-else class="ga-2">
                        <v-col v-for="(containerName, i) in lxcServiceNames" :key="`lxc-${i}`" cols="12" sm="6" md="4" class="d-flex align-center">
                          <div class="d-flex align-center justify-space-between flex-grow-1 pa-2" style="border: 1px solid var(--v-border-color); border-radius: 4px;">
                            <v-switch 
                              :model-value="nutSettings.stop_services.lxc.some(s => s.name === containerName && s.enabled)"
                              @update:model-value="(enabled) => toggleLxcService(containerName, enabled)"
                              hide-details 
                              size="small"
                              density="compact"
                              inset
                              color="primary"
                            ></v-switch>
                            <span class="text-body-2 flex-grow-1 ml-2" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ containerName }}</span>
                          </div>
                        </v-col>
                      </v-row>
                    </div>
                  </div>
                </v-expand-transition>
              </v-card>
            </div>

            <!-- VMs -->
            <div class="mt-4">
              <v-card variant="outlined" class="mb-4">
                <button type="button" class="compact-report-toggle" @click="showVmServices = !showVmServices" style="width: 100%; justify-content: space-between;">
                  <span class="text-subtitle-2 font-weight-medium" style="color: inherit;">{{ nutSettings.stop_services.vms.filter(s => s.enabled).length }} / {{ vmServiceNames.length }} {{ $t('vms') }} - {{ showVmServices ? $t('hide') : $t('see more') }}</span>
                  <v-icon :icon="showVmServices ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="small"></v-icon>
                </button>
                <v-expand-transition>
                  <div v-show="showVmServices">
                    <v-divider></v-divider>
                    <div class="pa-4">
                      <div v-if="vmServiceNames.length === 0" class="text-center text-medium-emphasis pa-4">
                        {{ $t('no data') }}
                      </div>
                      <v-row v-else class="ga-2">
                        <v-col v-for="(vmName, i) in vmServiceNames" :key="`vm-${i}`" cols="12" sm="6" md="4" class="d-flex align-center">
                          <div class="d-flex align-center justify-space-between flex-grow-1 pa-2" style="border: 1px solid var(--v-border-color); border-radius: 4px;">
                            <v-switch 
                              :model-value="nutSettings.stop_services.vms.some(s => s.name === vmName && s.enabled)"
                              @update:model-value="(enabled) => toggleVmService(vmName, enabled)"
                              hide-details 
                              size="small"
                              density="compact"
                              inset
                              color="primary"
                            ></v-switch>
                            <span class="text-body-2 flex-grow-1 ml-2" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ vmName }}</span>
                          </div>
                        </v-col>
                      </v-row>
                    </div>
                  </div>
                </v-expand-transition>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Floating Action Button -->
  <v-fab @click="saveNutSettings()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-content-save</v-icon>
  </v-fab>
</template>

<script setup>
import { onMounted, ref, reactive, computed, inject } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';

const { overlay } = useOverlay();
const { t } = useI18n();
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const mosServices = inject('mosServices', ref({}));

const defaultMonitor = () => ({
  upsname: '',
  host: '',
  port: 3493,
  powervalue: 1,
  username: '',
  password: '',
  role: 'primary',
});

const defaultServer = () => ({
  listen: [
    {
      address: '0.0.0.0',
      port: 3493,
    },
  ],
  ups: {
    name: '',
    driver: '',
    port: '',
    desc: '',
    extra: {},
  },
  users: [],
});

const nutSettings = ref({
  mode: 'standalone',
  spindown_disks: true,
  server: defaultServer(),
  monitor: defaultMonitor(),
  shutdown: {
    command: '/sbin/shutdown -h +0',
    mode: 'lowbattery',
    timer_seconds: 0,
    finaldelay: 5,
    minsupplies: 1,
    powerdownflag: '',
  },
  timers: {
    pollfreq: 30,
    pollfreqalert: 5,
    hostsync: 15,
    deadtime: 15,
    rbwarntime: 5400,
    nocommwarntime: 300,
  },
  stop_services: {
    docker: [],
    lxc: [],
    vms: [],
  },
});

const dockerServiceNames = ref([]);
const lxcServiceNames = ref([]);
const vmServiceNames = ref([]);

const dockerServiceOptions = computed(() => {
  const currentNames = (nutSettings.value.stop_services.docker || []).map((service) => service?.name).filter(Boolean);
  return [...new Set([...dockerServiceNames.value, ...currentNames])].sort((a, b) => a.localeCompare(b));
});

const lxcServiceOptions = computed(() => {
  const currentNames = (nutSettings.value.stop_services.lxc || []).map((service) => service?.name).filter(Boolean);
  return [...new Set([...lxcServiceNames.value, ...currentNames])].sort((a, b) => a.localeCompare(b));
});

const vmServiceOptions = computed(() => {
  const currentNames = (nutSettings.value.stop_services.vms || []).map((service) => service?.name).filter(Boolean);
  return [...new Set([...vmServiceNames.value, ...currentNames])].sort((a, b) => a.localeCompare(b));
});

const nutStatus = reactive({
  reachable: false,
  name: '',
  status: '',
  data: {
    model: '',
    manufacturer: '',
    serial: '',
    load: 0,
    realpowerNominal: 0,
    battery: {
      charge: 0,
      chargeLow: 0,
      runtime: 0,
      voltage: 0,
      type: '',
    },
    input: {
      voltage: 0,
      frequency: 0,
    },
    output: {
      voltage: 0,
      frequency: 0,
    },
  },
  vars: {},
  error: '',
});

const extraConfigList = computed(() => Object.entries(nutSettings.value.server.ups.extra || {}).map(([key, value]) => ({ key, value })));

const availableActions = computed(() => ['fsd', 'instcmd', 'login', 'logout', 'master', 'monmaster', 'set', 'upsmon_primary', 'upsmon_secondary']);

const availableCommands = computed(() => ['all', 'test.battery.start.quick', 'test.battery.stop', 'test.panel.start', 'test.panel.stop', 'shutdown.return', 'shutdown.stayoff', 'shutdown.stop']);

// upsmon kann laut Referenzdoku auch null sein (reiner Admin-User ohne Monitor-Funktion)
const upsmonRoleOptions = computed(() => [
  { title: t('primary'), value: 'primary' },
  { title: t('secondary'), value: 'secondary' },
  { title: t('none'), value: null },
]);

// Deutsche Klartext-Labels + Farbcodierung fuer ups.status Tokens
const statusLabels = {
  OL: { label: t('online'), color: 'success' },
  OB: { label: t('on battery'), color: 'warning' },
  LB: { label: t('battery low'), color: 'error' },
  HB: { label: t('battery high'), color: 'warning' },
  RB: { label: t('replace battery'), color: 'error' },
  CHRG: { label: t('charging'), color: 'success' },
  DISCHRG: { label: t('discharging'), color: 'warning' },
  BYPASS: { label: t('bypass'), color: 'warning' },
  CAL: { label: t('calibration'), color: 'warning' },
  OFF: { label: t('output off'), color: 'default' },
  OVER: { label: t('overload'), color: 'error' },
  TRIM: { label: t('voltage trim'), color: 'warning' },
  BOOST: { label: t('voltage boost'), color: 'warning' },
  FSD: { label: t('forced shutdown'), color: 'error' },
  ALARM: { label: t('alarm'), color: 'error' },
};

const showReportedValues = ref(false);
const isLoadingStatus = ref(true);
const showDockerServices = ref(false);
const showLxcServices = ref(false);
const showVmServices = ref(false);

const statusChips = computed(() => {
  if (!nutStatus.status || isLoadingStatus.value) return [];
  const ignoredTokens = ['OL', 'CHRG'];

  return nutStatus.status
    .split(' ')
    .filter(Boolean)
    .filter((token) => !ignoredTokens.includes(token))
    .map((token) => ({
      token,
      label: statusLabels[token]?.label || token,
      color: statusLabels[token]?.color || 'default',
    }));
});

const hasVars = computed(() => nutStatus.vars && Object.keys(nutStatus.vars).length > 0);
const reportedVars = computed(() => Object.entries(nutStatus.vars || {}));

const statusCardColor = computed(() => {
  if (isLoadingStatus.value) return 'grey-lighten-4';
  if (!nutStatus.reachable) return 'error';
  const criticalTokens = ['LB', 'RB', 'OVER', 'ALARM', 'FSD'];
  const warningTokens = ['OB', 'HB', 'BYPASS', 'CAL', 'TRIM', 'BOOST', 'DISCHRG'];
  if (statusChips.value.some((c) => criticalTokens.includes(c.token))) return 'error';
  if (statusChips.value.some((c) => warningTokens.includes(c.token))) return 'warning';
  return 'success';
});

const formatRuntime = (seconds) => {
  if (seconds == null) return '-';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const onModeChange = () => {
  if (nutSettings.value.mode === 'netclient') {
    nutSettings.value.server = defaultServer();
  } else {
    nutSettings.value.monitor = defaultMonitor();
  }
};

const addUser = () => {
  nutSettings.value.server.users.push({
    username: '',
    password: '',
    actions: [],
    instcmds: [],
    upsmon: 'primary',
  });
};

const addExtraConfig = () => {
  const existingCount = Object.keys(nutSettings.value.server.ups.extra).length;
  nutSettings.value.server.ups.extra[`extra_${existingCount}`] = '';
};

const renameExtraKey = (oldKey, newKey) => {
  if (!newKey || newKey === oldKey) return;
  if (Object.prototype.hasOwnProperty.call(nutSettings.value.server.ups.extra, newKey)) {
    showSnackbarError(t('key already exists'));
    return;
  }
  const value = nutSettings.value.server.ups.extra[oldKey];
  delete nutSettings.value.server.ups.extra[oldKey];
  nutSettings.value.server.ups.extra[newKey] = value;
};

const deleteExtraConfig = (key) => {
  delete nutSettings.value.server.ups.extra[key];
};

const toggleDockerService = (containerName, enabled) => {
  const existing = nutSettings.value.stop_services.docker.find(s => s.name === containerName);
  if (existing) {
    existing.enabled = enabled;
  } else if (enabled) {
    nutSettings.value.stop_services.docker.push({ name: containerName, enabled: true });
  }
};

const toggleLxcService = (containerName, enabled) => {
  const existing = nutSettings.value.stop_services.lxc.find(s => s.name === containerName);
  if (existing) {
    existing.enabled = enabled;
  } else if (enabled) {
    nutSettings.value.stop_services.lxc.push({ name: containerName, enabled: true });
  }
};

const toggleVmService = (vmName, enabled) => {
  const existing = nutSettings.value.stop_services.vms.find(s => s.name === vmName);
  if (existing) {
    existing.enabled = enabled;
  } else if (enabled) {
    nutSettings.value.stop_services.vms.push({ name: vmName, enabled: true });
  }
};

const getDockerServiceNames = async () => {
  try {
    const res = await fetch('/api/v1/docker/containers/json?all=true', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(`${t('docker containers could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const data = await res.json();
    dockerServiceNames.value = [
      ...new Set(
        (data || [])
          .map((container) => {
            const name = Array.isArray(container.Names) ? container.Names[0] : container.name || container.Name || '';
            return name.startsWith('/') ? name.slice(1) : name;
          })
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getLxcServiceNames = async () => {
  try {
    const res = await fetch('/api/v1/lxc/containers', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(`${t('lxc containers could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const data = await res.json();
    lxcServiceNames.value = [...new Set((data || []).map((container) => container.name).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getVmServiceNames = async () => {
  try {
    const res = await fetch('/api/v1/vm/machines', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(`${t('vm machines could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const data = await res.json();
    vmServiceNames.value = [...new Set((data || []).map((machine) => machine.name).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getContainerServiceNames = async () => {
  const tasks = [];
  
  if (mosServices.value.docker?.running) {
    tasks.push(getDockerServiceNames());
  } else {
    dockerServiceNames.value = [];
  }
  if (mosServices.value.lxc?.enabled) {
    tasks.push(getLxcServiceNames());
  } else {
    lxcServiceNames.value = [];
  }
  if (mosServices.value.vm?.running) {
    tasks.push(getVmServiceNames());
  } else {
    vmServiceNames.value = [];
  }
  
  await Promise.all(tasks);
};

const getNutSettings = async () => {
  try {
    const res = await fetch('/api/v1/nut/settings', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      let errorMessage = t('unknown error');
      try {
        const errorDetails = await res.json();
        errorMessage = errorDetails.error || errorMessage;
      } catch (e) {
        // Ignore JSON parse errors
      }
      throw new Error(`${t('nut settings could not be loaded')}|$| ${errorMessage}`);
    }

    const data = await res.json();
    nutSettings.value = data;
    
    // Ensure stop_services structure is always present
    if (!nutSettings.value.stop_services) {
      nutSettings.value.stop_services = {
        docker: [],
        lxc: [],
        vms: [],
      };
    } else {
      if (!nutSettings.value.stop_services.docker) nutSettings.value.stop_services.docker = [];
      if (!nutSettings.value.stop_services.lxc) nutSettings.value.stop_services.lxc = [];
      if (!nutSettings.value.stop_services.vms) nutSettings.value.stop_services.vms = [];
    }
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getNutStatus = async () => {
  try {
    const res = await fetch('/api/v1/nut/status', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      let errorMessage = t('unknown error');
      try {
        const errorDetails = await res.json();
        errorMessage = errorDetails.error || errorMessage;
      } catch (e) {
        // Ignore JSON parse errors
      }
      throw new Error(`${t('nut status could not be loaded')}|$| ${errorMessage}`);
    }

    const data = await res.json();
    Object.assign(nutStatus, data);
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const saveNutSettings = async () => {
  overlay.value = true;
  try {
    const res = await fetch('/api/v1/nut/settings', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nutSettings.value),
    });

    if (!res.ok) {
      let errorMessage = t('unknown error');
      try {
        const errorDetails = await res.json();
        errorMessage = errorDetails.error || errorMessage;
      } catch (e) {
        // Ignore JSON parse errors
      }
      throw new Error(`${t('nut settings could not be changed')}|$| ${errorMessage}`);
    }

    showSnackbarSuccess(t('nut settings changed successfully'));
    // Refresh status
    await getNutStatus();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

onMounted(async () => {
  isLoadingStatus.value = true;
  await Promise.all([getNutSettings(), getNutStatus(), getContainerServiceNames()]);
  isLoadingStatus.value = false;
  // TODO: auf Websocket-Composable umstellen, sobald bekannt (5s-Takt laut Backend-Doku)
  const statusInterval = setInterval(async () => {
    isLoadingStatus.value = false;
    await getNutStatus();
  }, 5000);
  // Cleanup interval on unmount
  return () => clearInterval(statusInterval);
});
</script>

<style scoped>
.status-grid {
  margin-bottom: 0;
}

.status-line {
  margin: 0 0 6px;
  line-height: 1.4;
}

.status-skeleton {
  min-height: 160px;
}

.compact-report {
  border-radius: 8px;
  overflow: hidden;
}

.compact-report-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border: 0;
  min-height: 34px;
  padding: 6px 10px;
  font: inherit;
  font-size: 0.98rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  color: inherit;
}

.compact-report-content {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 18px;
  row-gap: 2px;
  padding: 0 12px 8px;
  font-size: 0.75rem;
  line-height: 1.1;
}

.compact-report-item {
  display: flex;
  align-items: center;
  min-height: 18px;
  overflow: hidden;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .compact-report-content {
    grid-template-columns: 1fr;
    column-gap: 0;
    row-gap: 2px;
  }
}

.compact-report-key,
.compact-report-value {
  display: inline-block;
  font-size: 0.75rem;
  line-height: 1.1;
  margin: 0;
}

.compact-report-key {
  margin-right: 4px;
}
</style>
