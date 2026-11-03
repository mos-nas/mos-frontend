<template>
  <div id="terminal" style="position: fixed; inset: 0; box-sizing: border-box; padding: 8px; background: #000000; overflow: hidden"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { Terminal } from '@xterm/xterm';
import { io } from 'socket.io-client';
import { FitAddon } from '@xterm/addon-fit';
import { ClipboardAddon } from '@xterm/addon-clipboard';
import { useI18n } from 'vue-i18n';
import '@xterm/xterm/css/xterm.css';

let socket, term;
let resizeObserver;
let rafId = 0;
let previousStyles = null;
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { t } = useI18n();

const fitAddon = new FitAddon();
const clipboardAddon = new ClipboardAddon();

const fit = () => {
  if (!term || !term.element) return;
  try {
    fitAddon.fit();
  } catch (e) {}
};

onMounted(() => {
  previousStyles = {
    htmlOverflow: document.documentElement.style.overflow,
    bodyOverflow: document.body.style.overflow,
    bodyMargin: document.body.style.margin,
  };
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.margin = '0';

  const terminalEl = document.getElementById('terminal');

  term = new Terminal({ cursorBlink: true, fontFamily: 'monospace', fontSize: 14 });
  term.loadAddon(fitAddon);
  term.loadAddon(clipboardAddon);
  term.open(terminalEl);
  term.focus();
  fit();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fit);
  }

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

  const wsUrl = __WS_BASE_URL__ || '';
  socket = io(wsUrl ? `${wsUrl}/terminal` : '/terminal', { path: '/api/v1/socket.io/' });

  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('sessionId');

  socket.on('connect', () => {
    term.write(t('connection to mos terminal established') + '\r\n');
    socket.emit('join-session', {
      sessionId: sessionId,
      token: localStorage.getItem('authToken'),
    });
  });

  socket.on('session-joined', () => {
    fit();
    socket.emit('terminal-resize', { cols: term.cols, rows: term.rows });
  });

  socket.on('terminal-output', (data) => {
    term.write(data);
  });

  term.onData((data) => {
    socket.emit('terminal-input', data);
  });

  term.onResize(({ cols, rows }) => {
    socket.emit('terminal-resize', { cols, rows });
  });

  socket.on('disconnect', () => {
    term.write('\r\n' + t('connection closed') + '\r\n');
  });

  resizeObserver = new ResizeObserver(() => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(fit);
  });
  resizeObserver.observe(terminalEl);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId);
  if (resizeObserver) resizeObserver.disconnect();
  if (socket) socket.disconnect();
  if (term) term.dispose();
  if (fitAddon) fitAddon.dispose();
  if (clipboardAddon) clipboardAddon.dispose();
  if (previousStyles) {
    document.documentElement.style.overflow = previousStyles.htmlOverflow;
    document.body.style.overflow = previousStyles.bodyOverflow;
    document.body.style.margin = previousStyles.bodyMargin;
  }
});
</script>
