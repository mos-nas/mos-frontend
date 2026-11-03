<template>
  <v-container fluid class="pa-0 d-flex justify-center" style="height: calc(100vh - var(--v-layout-top, 64px) - var(--v-layout-bottom, 0px)); overflow: hidden">
    <v-container style="width: 100%; max-width: 1920px; display: flex; flex-direction: column; height: 100%; min-height: 0" class="pa-4">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2" style="flex: 0 0 auto">
        <div class="d-flex align-center ga-3 mb-2">
          <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
          <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ t('webterminal') }}</h2>
          <v-spacer></v-spacer>
          <v-btn text class="d-flex align-center" density="compact" @click="openPopupSession()">
            <v-icon small class="mr-1">mdi-powershell</v-icon>
            {{ t('open') }}
          </v-btn>
        </div>
      </v-container>
      <v-container fluid class="pa-0" style="display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0">
        <div id="terminal" style="width: 100%; flex: 1 1 auto; min-height: 0; padding: 8px; background: #000000; overflow: hidden"></div>
      </v-container>
    </v-container>
  </v-container>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { ClipboardAddon } from '@xterm/addon-clipboard';
import { io } from 'socket.io-client';
import { showSnackbarError } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import '@xterm/xterm/css/xterm.css';
import { openTerminalPopup } from '@/composables/terminalpopup';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { t } = useI18n();
const clipboardAddon = new ClipboardAddon();
const fitAddon = new FitAddon();
let socket;
let term;
let resizeObserver;
let joined = false;
const sessions = ref([]);

onMounted(async () => {
  await createTerminalSession();
  term = new Terminal({ cursorBlink: true, fontFamily: 'monospace', fontSize: 14 });
  term.loadAddon(fitAddon);
  term.loadAddon(clipboardAddon);
  const terminalEl = document.getElementById('terminal');
  term.open(terminalEl);
  fitAddon.fit();

  term.onSelectionChange(() => {
    if (!term.hasSelection()) return;
    const selected = term.getSelection();

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(selected);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = selected;
      textarea.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand('copy');
      } catch (e) {}
      document.body.removeChild(textarea);
    }
  });

  // Websocket connection through proxy
  const wsUrl = __WS_BASE_URL__ || '';
  socket = io(wsUrl ? `${wsUrl}/terminal` : '/terminal', { path: '/api/v1/socket.io/' });

  socket.on('connect', () => {
    if (!joined) {
      joined = true;
      term.write(t('connection to mos terminal established') + '\r\n');
      // Session-Infos senden
      socket.emit('join-session', {
        sessionId: sessions.value[0].sessionId,
        token: localStorage.getItem('authToken'),
      });
    }
  });

  // Wait for join confirmation
  socket.on('session-joined', (data) => {
    fitAddon.fit();
    // Aktuelle Größe nach fit() an Server senden
    socket.emit('terminal-resize', { cols: term.cols, rows: term.rows });
  });

  // Display output
  socket.on('terminal-output', (data) => {
    term.write(data);
  });

  // Send input to Server
  term.onData((data) => {
    socket.emit('terminal-input', data);
  });

  // Resize handling
  term.onResize(({ cols, rows }) => {
    socket.emit('terminal-resize', { cols, rows });
  });

  // Window Resize - Resize Terminal
  resizeObserver = new ResizeObserver(() => {
    fitAddon.fit();
  });
  resizeObserver.observe(terminalEl);

  // Error handling
  socket.on('error', (error) => {
    console.error('Terminal WebSocket error:', error);
    showSnackbarError(error.message || 'Terminal connection error');
  });

  // Catch disconnect
  socket.on('disconnect', () => {
    term.write('\r\n' + t('connection closed') + '\r\n');
  });
});

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect();
  if (socket) {
    socket.emit('leave-session');
    socket.disconnect();
  }
  if (term) term.dispose();
  if (fitAddon) fitAddon.dispose();
  if (clipboardAddon) clipboardAddon.dispose();
});

const createTerminalSession = async () => {
  try {
    const res = await fetch('/api/v1/terminal/create', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('failed to create terminal session'));
    }

    const Result = await res.json();
    sessions.value.push(Result);
    return Result;
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const checkExistingTerminals = async () => {
  try {
    const res = await fetch(`/api/v1/terminal/sessions`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('failed to retrieve terminal sessions'));
    }

    const Result = await res.json();
    sessions.value = Result.sessions || [];
    sessions.value = sessions.value.filter((session) => session.command === '/bin/bash');
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const openPopupSession = async () => {
  const result = await createTerminalSession();
  const sessionId = result.sessionId;
  openTerminalPopup(sessionId);
};
</script>
