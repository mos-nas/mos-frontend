import { ref, reactive, watch, nextTick, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';
import { useI18n } from 'vue-i18n';

type DockerWsOptions = {
  onErrorSnackbar?: (text: string, errorText?: string) => void;
  onSuccessSnackbar?: (text: string) => void;
  onCompleted?: () => void;
};

type WsLine = {
  timestamp: string;
  output: string;
};
type DockerWsParams = Record<string, any>;

export function useDockerWebSocket(options: DockerWsOptions = {}) {
  const { t } = useI18n();
  const { onErrorSnackbar = (text: string, errorText?: string) => console.error(text, errorText), onSuccessSnackbar = (text: string) => console.log(text), onCompleted } = options;
  const wsIsConnected = ref(false);
  const wsError = ref<string | null>(null);
  const wsScrollContainer = ref<HTMLElement | null>(null);
  const wsOperationDialog = reactive({
    value: false,
    operationId: '',
    data: [] as WsLine[],
    loading: false,
  });

  let socket: Socket | null = null;

  watch(
    () => wsOperationDialog.data.length,
    () => {
      nextTick(() => {
        const el = wsScrollContainer.value;
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      });
    },
  );

  const clearWsOperationDialog = () => {
    wsOperationDialog.operationId = '';
    wsOperationDialog.data = [];
    wsOperationDialog.loading = false;
  };

  const openWsOperationDialog = () => {
    wsOperationDialog.value = true;
    clearWsOperationDialog();
    wsOperationDialog.loading = true;
  };

  const cleanupSocket = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    wsIsConnected.value = false;
    wsOperationDialog.loading = false;
  };

  const closeWsDialog = () => {
    wsOperationDialog.value = false;
    clearWsOperationDialog();
    cleanupSocket();
  };

  const sendDockerWSCommand = (command: string, params?: DockerWsParams) => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      wsError.value = 'No auth token found';
      onErrorSnackbar(t('docker command error occurred'), t('no auth token found'));
      return;
    }

    if (socket && wsIsConnected.value) {
      onErrorSnackbar(t('docker command is already running'));
      return;
    }

    const wsUrl = (globalThis as any).__WS_BASE_URL__ || '';
    socket = io(wsUrl ? `${wsUrl}/docker` : '/docker', {
      path: '/api/v1/socket.io/',
      transports: ['websocket'],
      upgrade: false,
    });

    socket.on('connect', () => {
      wsIsConnected.value = true;
      wsError.value = null;

      socket?.emit('docker', {
        token: authToken,
        operation: command,
        params: params ?? null,
      });
    });

    socket.on('connect_error', (err: any) => {
      wsError.value = `Connection error: ${err.message}`;
      onErrorSnackbar(t('docker command error occurred'), err.message);
      cleanupSocket();
    });

    socket.on('disconnect', () => {
      wsIsConnected.value = false;
    });

    const apply = (data: any) => {
      if (wsOperationDialog.operationId && data.operationId && data.operationId !== wsOperationDialog.operationId) {
        return;
      }

      if (data.status === 'started') {
        openWsOperationDialog();
        wsOperationDialog.operationId = data.operationId;
        wsOperationDialog.data.push({
          timestamp: data.timestamp,
          output: `${command} ${data.status}\n------------------------------------\n`,
        });
        wsOperationDialog.loading = true;
      } else if (data.status === 'running') {
        wsOperationDialog.data.push({
          timestamp: data.timestamp,
          output: data.output,
        });
        wsOperationDialog.loading = true;
      } else if (data.status === 'error') {
        onErrorSnackbar(t('docker command error occurred'), data.message);
        cleanupSocket();
      } else if (data.status === 'completed') {
        onSuccessSnackbar(t('docker command completed successfully'));
        wsOperationDialog.data.push({
          timestamp: data.timestamp,
          output: `------------------------------------\n${command} ${data.status}`,
        });
        cleanupSocket();

        if (onCompleted) {
          wsOperationDialog.loading = false;
          onCompleted();
        }
      }
    };

    socket.on('docker-update', apply);

    socket.on('error', (err: any) => {
      wsError.value = `Socket error: ${err}`;
      onErrorSnackbar(t('docker command error occurred'), String(err));
      cleanupSocket();
    });
  };

  onUnmounted(() => {
    cleanupSocket();
  });

  return {
    wsIsConnected,
    wsError,
    wsOperationDialog,
    wsScrollContainer,
    sendDockerWSCommand,
    closeWsDialog,
  };
}
