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
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('system') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card fluid style="margin-bottom: 80px" class="pa-0">
          <v-card-text>
            <v-text-field :label="$t('hostname')" v-model="settingsSystem.hostname"></v-text-field>
            <v-select :items="keymaps" :label="$t('keymap')" v-model="settingsSystem.keymap" item-title="keymap" item-value="keymap"></v-select>
            <v-select :items="timezones" :label="$t('timezone')" v-model="settingsSystem.timezone" item-title="timezone" item-value="timezone"></v-select>
            <v-select :items="governors" :label="$t('cpu governor')" v-model="settingsSystem.cpufreq.governor" item-title="governor" item-value="governor"></v-select>
            <v-text-field :label="$t('global spindown (min)')" type="number" v-model="settingsSystem.global_spindown" hide-details="auto"></v-text-field>
            <v-switch :label="$t('persist history')" color="green" inset v-model="settingsSystem.persist_history" hide-details="auto"></v-switch>
            <v-divider class="my-2"></v-divider>
            <span class="text-subtitle-1 font-weight-medium">{{ $t('web ui') }}</span>
            <v-switch :label="$t('https enabled')" color="green" inset v-model="settingsSystem.webui.https_enabled" density="compact" class="pt-4 pb-4" hide-details="auto"></v-switch>
            <v-btn color="primary" variant="outlined" @click="openShowCertificatesDialog()" :disabled="!settingsSystem.webui.https_enabled">{{ $t('show certificates') }}</v-btn>
            <v-btn color="primary" variant="outlined" class="ml-2" @click="recreateCertificates()" :disabled="!settingsSystem.webui.https_enabled">{{ $t('recreate certificates') }}</v-btn>
            <v-btn color="primary" variant="outlined" class="ml-2" @click="downloadCertificate()" :disabled="!settingsSystem.webui.https_enabled">{{ $t('download root ca') }}</v-btn>
            <v-text-field class="mt-6" :label="$t('http port')" type="number" v-model="settingsSystem.webui.ports.http"></v-text-field>
            <v-text-field :label="$t('https port')" type="number" v-model="settingsSystem.webui.ports.https"></v-text-field>
            <v-text-field :label="$t('local dns searchname')" v-model="settingsSystem.webui.local_dns_searchname" class="mb-4" hide-details="auto"></v-text-field>
            <v-select :items="listenInterfaces" :label="$t('network interfaces')" v-model="settingsSystem.webui.listen_interfaces" multiple chips></v-select>
            <v-divider class="my-2"></v-divider>
            <span class="text-subtitle-1 font-weight-medium">{{ $t('update settings') }}</span>
            <v-switch :label="$t('update checks')" color="green" inset v-model="settingsSystem.update_check.enabled" class="pt-4" density="compact"></v-switch>
            <v-text-field :label="$t('update check schedule (cron)')" v-model="settingsSystem.update_check.update_check_schedule" :disabled="!settingsSystem.update_check.enabled"></v-text-field>
            <v-divider class="my-2"></v-divider>
            <span class="text-subtitle-1 font-weight-medium">{{ $t('display settings') }}</span>
            <v-switch :label="$t('powersave')" color="green" inset v-model="settingsSystem.display.powersave" :true-value="'on'" :false-value="'off'" class="pt-4" density="compact" />
            <v-text-field :label="$t('powerdown (min)')" type="number" v-model="settingsSystem.display.powerdown"></v-text-field>
            <v-text-field :label="$t('timeout (min)')" type="number" v-model="settingsSystem.display.timeout" class="mb-4"></v-text-field>
            <v-divider class="my-2"></v-divider>
            <span class="text-subtitle-1 font-weight-medium">{{ $t('notification sounds') }}</span>
            <v-switch class="pt-2" :label="$t('sound on reboot')" color="green" inset v-model="settingsSystem.notification_sound.reboot" hide-details="auto" density="compact"></v-switch>
            <v-switch :label="$t('sound on shutdown')" color="green" inset v-model="settingsSystem.notification_sound.shutdown" density="compact" hide-details="auto"></v-switch>
            <v-switch :label="$t('sound on startup')" color="green" inset v-model="settingsSystem.notification_sound.startup" density="compact"></v-switch>
            <v-divider class="my-2"></v-divider>
            <span class="text-subtitle-1 font-weight-medium">{{ $t('swapfile') }}</span>
            <v-switch class="pt-2" :label="$t('enable swapfile')" color="green" inset v-model="settingsSystem.swapfile.enabled" density="compact"></v-switch>
            <v-text-field
              :label="$t('swapfile path')"
              v-model="settingsSystem.swapfile.path"
              :disabled="!settingsSystem.swapfile.enabled"
              append-inner-icon="mdi-folder"
              @click:append-inner="
                openFsDialog((item) => {
                  settingsSystem.swapfile.path = item.path;
                })
              "
            ></v-text-field>
            <v-text-field :label="$t('swapfile size')" v-model="settingsSystem.swapfile.size" :disabled="!settingsSystem.swapfile.enabled"></v-text-field>
            <v-text-field :label="$t('swapfile priority')" type="number" v-model="settingsSystem.swapfile.priority" :disabled="!settingsSystem.swapfile.enabled" hide-details="auto"></v-text-field>
            <v-switch
              class="pt-2"
              :label="$t('zswap enabled')"
              color="green"
              inset
              v-model="settingsSystem.swapfile.config.zswap"
              :disabled="!settingsSystem.swapfile.enabled"
              hide-details="auto"
              density="compact"
            ></v-switch>
            <v-switch
              class="pb-2"
              :label="$t('shrinker enabled')"
              color="green"
              inset
              v-model="settingsSystem.swapfile.config.shrinker"
              :disabled="!settingsSystem.swapfile.enabled"
              density="compact"
            ></v-switch>
            <v-text-field :label="$t('zswap max pool percent')" type="number" v-model="settingsSystem.swapfile.config.max_pool_percent" :disabled="!settingsSystem.swapfile.enabled"></v-text-field>
            <v-select
              :items="zswapAlgorithms"
              :label="$t('zswap compressor')"
              v-model="settingsSystem.swapfile.config.compressor"
              :disabled="!settingsSystem.swapfile.enabled"
              density="comfortable"
              outlined
            ></v-select>
            <v-text-field
              :label="$t('zswap accept threshold percent')"
              type="number"
              v-model="settingsSystem.swapfile.config.accept_threshold_percent"
              :disabled="!settingsSystem.swapfile.enabled"
            ></v-text-field>
            <v-divider class="my-4"></v-divider>
            <span class="text-subtitle-1 font-weight-medium">{{ $t('binfmt') }}</span>
            <v-switch :label="$t('enable binfmt')" color="green" inset v-model="settingsSystem.binfmt.enabled" hide-details="auto" class="mb-2 mt-2" density="compact"></v-switch>
            <v-select multiple chips :items="architectures" :label="$t('binfmt architectures')" v-model="settingsSystem.binfmt.architectures" :disabled="!settingsSystem.binfmt.enabled"></v-select>
            <v-divider class="my-4"></v-divider>
            <span class="text-subtitle-1 font-weight-medium">{{ $t('date & time') }}</span>
            <v-text-field class="mt-4" :label="$t('currently')" :model-value="`${currentTimeDate.date} ${currentTimeDate.time}`" readonly></v-text-field>
            <v-text-field
              v-if="!settingsSystem.ntp.enabled"
              :label="$t('set date or leave empty to keep current')"
              v-model="timedate.date"
              placeholder="YYYY-MM-DD"
              hint="Format: YYYY-MM-DD"
            ></v-text-field>
            <v-text-field
              v-if="!settingsSystem.ntp.enabled"
              :label="$t('set time or leave empty to keep current')"
              v-model="timedate.time"
              placeholder="HH:mm:ss"
              hint="Format: HH:mm:ss"
            ></v-text-field>
            <v-switch :label="$t('ntp enabled')" color="green" inset v-model="settingsSystem.ntp.enabled" density="compact"></v-switch>
            <v-text-field :label="$t('ntp mode')" v-model="settingsSystem.ntp.mode" :disabled="!settingsSystem.ntp.enabled"></v-text-field>
            <v-row>
              <v-col cols="12" v-for="(server, i) in settingsSystem.ntp.servers" :key="`ntp-${i}`">
                <v-text-field
                  :label="$t('ntp servers')"
                  v-model="settingsSystem.ntp.servers[i]"
                  :disabled="!settingsSystem.ntp.enabled"
                  :hint="i === 0 ? 'First NTP server' : undefined"
                  append-inner-icon="mdi-delete"
                  @click:append-inner="settingsSystem.ntp.servers.splice(i, 1)"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="py-0 mb-2">
                <div class="d-flex align-center my-2">
                  <v-divider class="flex-grow-1"></v-divider>
                  <v-btn
                    class="mx-4"
                    color="green"
                    size="small"
                    density="comfortable"
                    variant="tonal"
                    icon
                    aria-label="Add NTP server"
                    @click="settingsSystem.ntp.servers.push('')"
                    :disabled="!settingsSystem.ntp.enabled"
                  >
                    <v-icon size="18">mdi-plus</v-icon>
                  </v-btn>
                  <v-divider class="flex-grow-1"></v-divider>
                </div>
              </v-col>
            </v-row>
            <span class="text-subtitle-1 font-weight-medium">{{ $t('proxy') }}</span>
            <v-text-field :label="$t('http proxy')" v-model="proxies.http_proxy" :placeholder="proxies.http_proxy" class="mt-4"></v-text-field>
            <v-text-field :label="$t('https proxy')" v-model="proxies.https_proxy" :placeholder="proxies.https_proxy"></v-text-field>
            <v-text-field :label="$t('ftp proxy')" v-model="proxies.ftp_proxy" :placeholder="proxies.ftp_proxy"></v-text-field>
            <v-text-field :label="$t('no proxy')" v-model="proxies.no_proxy" :placeholder="proxies.no_proxy"></v-text-field>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Show Certificates Dialog -->
  <v-dialog v-model="showCertificatesDialog.value" max-width="600px">
    <v-card :title="$t('certificates')" prepend-icon="mdi-certificate">
      <v-card-text class="py-0">
        <div v-for="(cert, name) in showCertificatesDialog.certificates" :key="name" class="mb-4">
          <h3 class="subtitle ma-0 mb-2">{{ name }}</h3>
          <p class="ma-0">
            <strong>{{ $t('subject') }}:</strong>
            {{ cert.subject.C }}, {{ cert.subject.ST }}, {{ cert.subject.L }}, {{ cert.subject.O }}, {{ cert.subject.OU }}, {{ cert.subject.CN }}
          </p>
          <p class="ma-0">
            <strong>{{ $t('issuer') }}:</strong>
            {{ cert.issuer.C }}, {{ cert.issuer.ST }}, {{ cert.issuer.L }}, {{ cert.issuer.O }}, {{ cert.issuer.OU }}, {{ cert.issuer.CN }}
          </p>
          <p class="ma-0">
            <strong>{{ $t('valid from') }}:</strong>
            {{ cert.not_before }}
          </p>
          <p class="ma-0">
            <strong>{{ $t('valid until') }}:</strong>
            {{ cert.not_after }}
          </p>
          <p class="ma-0">
            <strong>{{ $t('serial number') }}:</strong>
            {{ cert.serial }}
          </p>
          <p class="ma-0">
            <strong>{{ $t('fingerprint (sha-256)') }}:</strong>
            {{ cert.fingerprint_sha256 }}
          </p>
          <p v-if="cert.san && cert.san.length" class="ma-0">
            <strong>{{ $t('subject alternative names') }}:</strong>
            {{ cert.san.join(', ') }}
          </p>
          <p class="ma-0">
            <strong>{{ $t('days remaining') }}:</strong>
            {{ cert.days_remaining }}
          </p>
          <p class="ma-0">
            <strong>{{ $t('expired') }}:</strong>
            {{ cert.expired ? $t('yes') : $t('no') }}
          </p>
        </div>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="showCertificatesDialog.value = false">{{ $t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- File System Navigator Dialog -->
  <fsNavigatorDialog v-model="fsDialog" :initial-path="'/mnt'" :roots="'/mnt'" select-type="directory" :title="$t('select directory')" @selected="handleFsSelected" />

  <!-- Floating Action Button -->
  <v-fab @click="setSystemSettings()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-content-save</v-icon>
  </v-fab>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { onMounted, onUnmounted, ref, reactive } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import fsNavigatorDialog from '@/components/fsNavigatorDialog.vue';

const fsDialog = ref(false);
const fsDialogCallback = ref(null);
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const settingsSystemOriginal = ref(null);
const settingsSystem = ref({
  hostname: '',
  keymap: '',
  timezone: '',
  persist_history: true,
  ntp: {
    enabled: false,
    mode: '',
    servers: [],
  },
  global_spindown: 0,
  cpufreq: {
    governor: '',
  },
  notification_sound: {
    reboot: false,
    shutdown: false,
    startup: false,
  },
  display: {
    powerdown: 60,
    powersave: 'on',
    timeout: 30,
  },
  swapfile: {
    enabled: true,
    path: '/mnt/backup',
    size: '10G',
    priority: 0,
    config: {
      zswap: true,
      shrinker: true,
      max_pool_percent: 20,
      compressor: 'zstd',
      accept_threshold_percent: 90,
    },
  },
  update_check: {
    enabled: true,
    update_check_schedule: '0 1 * * *',
  },
  binfmt: {
    enabled: false,
    architectures: [],
  },
  webui: {
    ports: {
      http: 80,
      https: 443,
    },
    https_enabled: false,
    local_dns_searchname: 'local',
    listen_interfaces: [],
  },
});
const listenInterfaces = ref([]);
const zswapAlgorithms = ref([]);
const keymaps = ref([]);
const timezones = ref([]);
const proxies = ref({
  http_proxy: '',
  https_proxy: '',
  ftp_proxy: '',
  no_proxy: '',
});
const governors = ref([]);
const architectures = ref([]);
const overlay = ref(false);
const { t } = useI18n();
const timedate = ref({
  date: '',
  time: '',
});
const showCertificatesDialog = reactive({
  value: false,
  certificates: {
    nginx: {
      subject: {
        C: '',
        ST: '',
        L: '',
        O: '',
        OU: '',
        CN: '',
      },
      issuer: {
        C: '',
        ST: '',
        L: '',
        O: '',
        OU: '',
        CN: '',
      },
      not_before: '',
      not_after: '',
      serial: '',
      fingerprint_sha256: '',
      san: [''],
      days_remaining: 0,
      expired: false,
      file: '',
    },
    root_ca: {
      subject: {
        C: '',
        ST: '',
        L: '',
        O: '',
        OU: '',
        CN: '',
      },
      issuer: {
        C: '',
        ST: '',
        L: '',
        O: '',
        OU: '',
        CN: '',
      },
      not_before: '',
      not_after: '',
      serial: '',
      fingerprint_sha256: '',
      san: null,
      days_remaining: 0,
      expired: false,
      file: '',
    },
  },
});
let dateTimeInterval = null;

onMounted(() => {
  getSystemSettings();
  getKeymaps();
  getTimezones();
  getProxies();
  getGovernors();
  getZswapAlgorithms();
  getBinFmtArchitectures();
  getInterfaces();
  dateTimeInterval = setInterval(updateDateTime, 1000);
});

onUnmounted(() => {
  if (dateTimeInterval) {
    clearInterval(dateTimeInterval);
  }
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

const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const currentTimeDate = ref({
  date: getCurrentDate(),
  time: getCurrentTime(),
});

const updateDateTime = () => {
  if (settingsSystem.value.ntp.enabled) {
    currentTimeDate.value.date = getCurrentDate();
    currentTimeDate.value.time = getCurrentTime();
  } else {
    getTimeDate();
  }
};

const getSystemSettings = async () => {
  try {
    const res = await fetch('/api/v1/mos/settings/system', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('system settings could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    settingsSystemOriginal.value = settingsSystem.value = await res.json();

    if (!settingsSystem.value.ntp.enabled) {
      await getTimeDate();
    }
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getZswapAlgorithms = async () => {
  try {
    const res = await fetch('/api/v1/mos/zswap/algorithms', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('zswap algorithms could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    zswapAlgorithms.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getTimeDate = async () => {
  try {
    const res = await fetch('/api/v1/system/timedate', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('time and date could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    const data = await res.json();
    currentTimeDate.value.date = data.date;
    currentTimeDate.value.time = data.time;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const setTimeDate = async () => {
  try {
    const res = await fetch('/api/v1/system/timedate', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: timedate.value.date,
        time: timedate.value.time,
      }),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('time and date could not be changed')}|$| ${errorDetails.error || t('unknown error')}`);
    }
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const setSystemSettings = async () => {
  overlay.value = true;
  try {
    const resProxy = await fetch('/api/v1/system/proxy', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proxies.value),
    });
    const res = await fetch('/api/v1/mos/settings/system', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsSystem.value),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('system settings could not be changed')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    if (!resProxy.ok) {
      const errorDetails = await resProxy.json();
      throw new Error(`${t('proxies could not be changed')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    if (!settingsSystem.value.ntp.enabled) {
      if (timedate.value.date || timedate.value.time) {
        await setTimeDate();
      }
    }

    showSnackbarSuccess(t('system settings changed successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const getKeymaps = async () => {
  try {
    const res = await fetch('/api/v1/system/keymaps', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('keymaps could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    keymaps.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getTimezones = async () => {
  try {
    const res = await fetch('/api/v1/system/timezones', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('timezones could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    timezones.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getProxies = async () => {
  try {
    const res = await fetch('/api/v1/system/proxy', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('proxies could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    proxies.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getGovernors = async () => {
  try {
    const res = await fetch('/api/v1/system/governors', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('governors could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    governors.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getBinFmtArchitectures = async () => {
  try {
    const res = await fetch('/api/v1/vm/binfmt_architectures', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('binfmt architectures could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    architectures.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getInterfaces = async () => {
  try {
    const res = await fetch('/api/v1/mos/system/network/interfaces', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('network interfaces could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    const data = await res.json();
    listenInterfaces.value = data.map((iface) => iface.name);
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getCertificates = async () => {
  try {
    const res = await fetch('/api/v1/mos/certificates', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('certificates could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    return await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const recreateCertificates = async () => {
  overlay.value = true;
  try {
    const res = await fetch('/api/v1/mos/recreatecerts', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('certificates could not be recreated')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('certificates recreated successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const downloadCertificate = async () => {
  overlay.value = true;

  try {
    const res = await fetch(`/api/v1/mos/download?path=${encodeURIComponent('/boot/config/system/ssl/root/ca.crt')}`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('certificate could not be downloaded')}|$| ${error.error || t('unknown error')}`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    let filename = `ca.crt`;
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

const openShowCertificatesDialog = async () => {
  showCertificatesDialog.value = true;
  const certs = await getCertificates();
  if (certs) {
    showCertificatesDialog.certificates = certs;
    showCertificatesDialog.value = true;
  }
};
</script>
