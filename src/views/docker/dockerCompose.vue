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

          <div v-else style="overflow: auto; max-height: calc(100vh - 150px); margin-bottom: 16px">
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
                  <td style="padding: 6px 8px">{{ item.port }}</td>
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
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('docker compose') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card class="px-0" style="margin-bottom: 80px">
          <v-card-text>
            <v-select v-model="selectedTemplate" :items="composeTemplates" :label="$t('template')" @update:modelValue="getComposeTemplate" hide-details="auto"></v-select>
            <v-divider class="my-4"></v-divider>
            <v-text-field v-model="composeStack.name" :label="$t('stack name')" required></v-text-field>
            <div class="mb-4">
              <v-label class="text-body2" style="display: block">{{ $t('compose yaml') }}</v-label>
              <div ref="yamlEditorContainer" style="border: 1px solid rgba(0, 0, 0, 0.12); border-radius: 4px; overflow: hidden"></div>
            </div>
            <div class="d-flex mb-2 mt-2">
              <v-btn variant="text" size="small" class="pa-0" style="min-width: 0" @click="sidePanel.open = true">
                <v-icon size="18" class="mr-1">mdi-eye</v-icon>
                {{ $t('show used ports') }}
              </v-btn>
            </div>
            <div class="mb-4 mt-4">
              <v-label class="text-body2" style="display: block">{{ $t('environment variables') }}</v-label>
              <div ref="envEditorContainer" style="border: 1px solid rgba(0, 0, 0, 0.12); border-radius: 4px; overflow: hidden"></div>
            </div>
            <v-text-field v-model="composeStack.icon" :label="$t('icon url')"></v-text-field>
            <v-text-field v-model="composeStack.web_ui_url" :label="$t('web ui url')"></v-text-field>
            <v-switch :label="$t('no autoupdate')" v-model="composeStack.no_autoupdate" inset color="green" density="compact" hide-details="auto"></v-switch>
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

  <!-- Floating Action Button -->
  <v-fab color="primary" @click="createComposeStack()" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon color="onPrimary">mdi-content-save</v-icon>
  </v-fab>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { yaml } from '@codemirror/lang-yaml';
import { oneDark } from '@codemirror/theme-one-dark';
import { useOverlay } from '@/composables/useOverlay';
import { useDockerWebSocket } from '@/composables/useDockerWebSocket';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { t } = useI18n();
const router = useRouter();
const theme = useTheme();
const { overlay } = useOverlay();
const sidePanel = ref({ open: false });
const usedDockerPorts = ref([]);
const yamlEditorContainer = ref(null);
const envEditorContainer = ref(null);
let yamlEditor = null;
let envEditor = null;

const props = defineProps({
  template: String,
  yaml: String,
  env: String,
  web_ui_url: String,
  no_autoupdate: Boolean,
});
const composeStack = reactive({
  name: '',
  yaml: '',
  env: '',
  icon: '',
  web_ui_url: '',
  no_autoupdate: false,
});
const selectedTemplate = ref('');
const composeTemplates = ref([]);

onMounted(() => {
  initYamlEditor();
  initEnvEditor();
  getComposeTemplateNames();
  getDockerPorts();
  if (props.template || props.yaml || props.env || props.web_ui_url) {
    const template = props.template ? decodeURIComponent(props.template) : props.template;
    const yaml = props.yaml ? decodeURIComponent(props.yaml) : props.yaml;
    const env = props.env ? decodeURIComponent(props.env) : props.env;
    const web_ui_url = props.web_ui_url ? decodeURIComponent(props.web_ui_url) : props.web_ui_url;
    const no_autoupdate = props.no_autoupdate;
    getComposeHubTemplate(template, yaml, env, web_ui_url, no_autoupdate);
  }
});

const { wsIsConnected, wsError, wsOperationDialog, wsScrollContainer, sendDockerWSCommand, closeWsDialog } = useDockerWebSocket({
  onErrorSnackbar: showSnackbarError,
  onSuccessSnackbar: showSnackbarSuccess,
  onCompleted: async () => {},
});

const getEditorTheme = () => {
  return theme.global.name.value === 'dark' ? [oneDark] : [];
};

const initYamlEditor = () => {
  if (!yamlEditorContainer.value) return;

  const startState = EditorState.create({
    doc: composeStack.yaml,
    extensions: [
      basicSetup,
      yaml(),
      ...getEditorTheme(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          composeStack.yaml = update.state.doc.toString();
        }
      }),
    ],
  });

  yamlEditor = new EditorView({
    state: startState,
    parent: yamlEditorContainer.value,
  });
};

const initEnvEditor = () => {
  if (!envEditorContainer.value) return;

  const startState = EditorState.create({
    doc: composeStack.env,
    extensions: [
      basicSetup,
      ...getEditorTheme(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          composeStack.env = update.state.doc.toString();
        }
      }),
    ],
  });

  envEditor = new EditorView({
    state: startState,
    parent: envEditorContainer.value,
  });
};

const updateYamlEditor = (newValue) => {
  if (yamlEditor) {
    const changes = yamlEditor.state.changes({
      from: 0,
      to: yamlEditor.state.doc.length,
      insert: newValue,
    });
    yamlEditor.dispatch({ changes });
  }
};

const updateEnvEditor = (newValue) => {
  if (envEditor) {
    const changes = envEditor.state.changes({
      from: 0,
      to: envEditor.state.doc.length,
      insert: newValue,
    });
    envEditor.dispatch({ changes });
  }
};

const createComposeStack = async () => {
  sendDockerWSCommand('compose-create', composeStack);
};

const getComposeHubTemplate = async (template, yaml, env, web_ui_url, no_autoupdate) => {
  const newFilesBody = { template: template, yaml: yaml, env: env, web_ui_url: web_ui_url, no_autoupdate: no_autoupdate };
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/hub/compose/template', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newFilesBody),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('compose template could not be fetched')}|$| ${error.error || t('unknown error')}`);
    }

    const result = await res.json();
    composeStack.name = result.name || '';
    composeStack.yaml = result.yaml || '';
    updateYamlEditor(composeStack.yaml);
    composeStack.env = result.env || '';
    updateEnvEditor(composeStack.env);
    composeStack.icon = result.icon || '';
    composeStack.web_ui_url = result.web_ui_url || '';
    composeStack.no_autoupdate = result.no_autoupdate || false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const getComposeTemplateNames = async () => {
  try {
    const res = await fetch('/api/v1/docker/mos/compose/templates', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('compose templates could not be fetched')}|$| ${error.error || t('unknown error')}`);
    }

    const result = await res.json();
    composeTemplates.value = [...(result.installed || []), ...(result.removed || [])];
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
    composeTemplates.value = [];
  }
};

const getComposeTemplate = async (templateName) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/mos/compose/templates/${encodeURIComponent(templateName)}`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('compose template could not be fetched')}|$| ${error.error || t('unknown error')}`);
    }

    const result = await res.json();
    composeStack.name = result.name || '';
    composeStack.yaml = result.yaml || '';
    updateYamlEditor(composeStack.yaml);
    composeStack.env = result.env || '';
    updateEnvEditor(composeStack.env);
    composeStack.icon = result.icon || '';
    composeStack.web_ui_url = result.web_ui_url || '';
    composeStack.no_autoupdate = result.no_autoupdate || false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
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

const dockerStateColor = (status) => {
  const state = String(status || '').toLowerCase();
  if (state === 'running') return 'success';
  if (state === 'paused') return 'warning';
  if (state === 'restarting') return 'warning';
  if (state === 'exited') return 'error';
  if (state === 'dead') return 'error';
  return 'grey';
};

const getDockerPorts = async () => {
  try {
    const res = await fetch('/api/v1/docker/mos/ports', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('authToken') },
    });

    if (!res.ok) {
      usedDockerPorts.value = [];
      return;
    }

    usedDockerPorts.value = await res.json();
  } catch {
    usedDockerPorts.value = [];
  }
};
</script>

<style scoped>
:deep(.cm-editor) {
  height: 200px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Roboto Mono', monospace;
  resize: vertical;
  overflow: auto !important;
}

:deep(.cm-gutters) {
  background-color: rgba(0, 0, 0, 0.02);
}
</style>
