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
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('rsync') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card fluid style="margin-bottom: 80px" class="pa-0">
          <v-card-text>
            <v-alert type="info" variant="tonal" class="mt-4 mb-4" border="start">
              <div class="d-flex align-center justify-space-between flex-wrap ga-2">
                <span>{{ $t('enabling/disabling rsync daemon is located on the network settings page') }}.</span>
                <v-btn color="onPrimary" size="small" variant="outlined" prepend-icon="mdi-arrow-right" @click="$router.push('/mosSettings/networkServices')">
                  {{ $t('network settings') }}
                </v-btn>
              </div>
            </v-alert>

            <label class="text-body2 text-medium-emphasis">{{ $t('content') }}</label>
            <div ref="editorContainer" class="editor-wrapper" style="border: 1px solid rgba(0, 0, 0, 0.12); border-radius: 4px; min-height: 120px; max-height: 240px; overflow-y: auto"></div>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Floating Action Button -->
  <v-fab @click="saveRsyncConfig()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-content-save</v-icon>
  </v-fab>
</template>

<script setup>
import { onMounted, ref, reactive, computed, watch, onUnmounted, nextTick } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify';
import { useOverlay } from '@/composables/useOverlay';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';

const { overlay } = useOverlay();
const { t } = useI18n();
const theme = useTheme();
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);

const rsyncConfig = ref({
  success: false,
  path: '',
  content: '',
  size: 0,
});

onMounted(async () => {
  await nextTick();
  createEditor();
  getRsyncConfig();
});

onUnmounted(() => {
  destroyEditor();
});

const editorContainer = ref(null);
let editorView = null;
const createEditor = () => {
  if (!editorContainer.value) return;

  const isDark = theme.global.current.value.dark;

  const extensions = [
    basicSetup,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        rsyncConfig.value.content = update.state.doc.toString();
      }
    }),
    EditorView.lineWrapping,
  ];

  if (isDark) {
    extensions.push(oneDark);
  }

  const state = EditorState.create({
    doc: rsyncConfig.value.content || '',
    extensions,
  });

  editorView = new EditorView({
    state,
    parent: editorContainer.value,
  });
};

const destroyEditor = () => {
  if (editorView) {
    editorView.destroy();
    editorView = null;
  }
};

const updateEditorContent = () => {
  if (editorView) {
    const currentValue = editorView.state.doc.toString();
    if (rsyncConfig.value.content !== currentValue) {
      editorView.dispatch({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: rsyncConfig.value.content,
        },
      });
    }
  }
};

const getRsyncConfig = async () => {
  try {
    const res = await fetch('/api/v1/mos/settings/network/services/rsync/config', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('rsync config could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const data = await res.json();
    rsyncConfig.value = data;
    updateEditorContent();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const saveRsyncConfig = async () => {
  const payload = rsyncConfig.value;

  try {
    const res = await fetch('/api/v1/mos/settings/network/services/rsync/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('rsync config could not be saved')}|$| ${error.error || t('unknown error')}`);
    }

    const data = await res.json();
    showSnackbarSuccess(t('rsync config saved successfully'));
    return data;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};
</script>
