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
            <v-textarea v-model="composeStack.yaml" :label="$t('compose yaml')" rows="10" required></v-textarea>
            <v-textarea v-model="composeStack.env" :label="$t('environment variables')" rows="5"></v-textarea>
            <v-text-field v-model="composeStack.icon" :label="$t('icon url')"></v-text-field>
            <v-text-field v-model="composeStack.web_ui_url" :label="$t('web ui url')"></v-text-field>
            <v-switch :label="$t('no autoupdate')" v-model="composeStack.no_autoupdate" inset color="green" density="compact"></v-switch>            
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

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useDockerWebSocket } from '@/composables/useDockerWebSocket';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const overlay = ref(false);
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
  getComposeTemplateNames();
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
    composeStack.env = result.env || '';
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
    composeStack.env = result.env || '';
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
</script>
