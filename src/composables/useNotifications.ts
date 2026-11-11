import { ref } from 'vue';
import { showSnackbarError, showSnackbarSuccess, showSnackbarInfo, showSnackbarWarning } from './snackbar';
import { useAuth } from './useAuth';

declare const __WS_BASE_URL__: string | undefined;

const RECONNECT_MAX_DELAY = 15000;
const RECONNECT_BASE_DELAY = 1000;
const PUSH_READY_TIMEOUT = 3000;

const notificationsBadge = ref(false);

let ws: WebSocket | null = null;
let reconnectTimer: number | null = null;
let reconnectAttempts = 0;
let connectGeneration = 0;
let pushEnabled = false;
let swListenerAttached = false;

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : String(e));

const withTimeout = <T>(promise: Promise<T>, ms: number) =>
  Promise.race([promise, new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error('timeout')), ms))]);

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

const cleanupWS = (clearTimer = true) => {
  if (ws) {
    ws.onopen = null;
    ws.onerror = null;
    ws.onclose = null;
    ws.onmessage = null;
    try {
      ws.close();
    } catch {}
    ws = null;
  }
  if (clearTimer && reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
};

const scheduleReconnect = () => {
  cleanupWS(false);
  const delay = Math.min(RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts++), RECONNECT_MAX_DELAY);
  reconnectTimer = window.setTimeout(connectWS, delay);
};

const handleMessage = (ev: MessageEvent) => {
  let msg: any;
  try {
    msg = JSON.parse(ev.data);
  } catch {
    return;
  }

  if (msg?.type === 'ping') {
    ws?.send?.(JSON.stringify({ type: 'pong' }));
    return;
  }

  notificationsBadge.value = true;
  window.dispatchEvent(new CustomEvent('notification-received'));
  const text = msg?.message || 'New notification received';
  if (msg?.priority === 'error' || msg?.priority === 'alert') {
    showSnackbarError(text, '', 'mdi-bell-ring', 'top-toaster');
  } else if (msg?.priority === 'warning') {
    showSnackbarWarning(text, 'mdi-bell-ring', 'top-toaster');
  } else if (msg?.priority === 'success') {
    showSnackbarSuccess(text, '', 'mdi-bell-ring', 'top-toaster');
  } else {
    showSnackbarInfo(text, 'mdi-bell-ring', 'top-toaster');
  }
};

async function getWsTicket(): Promise<{ ticket: string | null; authFailed: boolean }> {
  try {
    const resp = await fetch('/api/v1/notifications/ticket', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + localStorage.getItem('authToken') },
    });
    if (resp.status === 401) return { ticket: null, authFailed: true };
    if (!resp.ok) return { ticket: null, authFailed: false };
    const data = await resp.json();
    return { ticket: data.ticket || null, authFailed: false };
  } catch {
    return { ticket: null, authFailed: false };
  }
}

async function connectWS() {
  cleanupWS();
  const generation = ++connectGeneration;

  const { ticket, authFailed } = await getWsTicket();
  if (generation !== connectGeneration) return;
  if (authFailed) return;
  if (!ticket) {
    scheduleReconnect();
    return;
  }

  let wsUrl: string;
  if (__WS_BASE_URL__) {
    wsUrl = `${__WS_BASE_URL__}/api/v1/notify`;
  } else {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    wsUrl = `${protocol}//${window.location.host}/api/v1/notify`;
  }
  ws = new WebSocket(`${wsUrl}?ticket=${encodeURIComponent(ticket)}`);

  ws.onopen = () => {
    reconnectAttempts = 0;
    try {
      ws?.send(JSON.stringify({ type: 'subscribe-notifications' }));
    } catch {}
  };

  ws.onclose = () => {
    scheduleReconnect();
  };

  ws.onmessage = handleMessage;
}

export function useNotifications() {
  const { authHeaders } = useAuth();

  const refreshBadge = async () => {
    try {
      const res = await fetch('/api/v1/notifications?read=false&limit=1', { headers: authHeaders() });
      if (!res.ok) throw new Error('API-Error');
      const notification = await res.json();
      notificationsBadge.value = notification.length > 0;
    } catch (e) {
      showSnackbarError(errorMessage(e));
    }
  };

  const getVapidKey = async () => {
    const res = await fetch('/api/v1/notifications/push/vapid-key', { headers: authHeaders() });
    if (!res.ok) throw new Error('API-Error');
    const result = await res.json();
    return result.publicKey;
  };

  const syncSubscription = async (subscription: PushSubscription) => {
    const res = await fetch('/api/v1/notifications/push/subscribe', {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify(subscription),
    });
    if (!res.ok) throw new Error('API-Error');
  };

  const subscribePush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    try {
      if (Notification.permission === 'denied') return;
      const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
      if (permission !== 'granted') return;

      pushEnabled = true;
      if (!swListenerAttached) {
        swListenerAttached = true;
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (pushEnabled && event.data?.type === 'pushsubscriptionchange') subscribePush();
        });
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const vapidKey = await getVapidKey();
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      await syncSubscription(subscription);
    } catch (e) {
      showSnackbarError('Failed to subscribe for push notifications: ' + errorMessage(e));
    }
  };

  const unsubscribePush = async () => {
    pushEnabled = false;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    const headers = authHeaders(true);

    try {
      const registration = await withTimeout(navigator.serviceWorker.ready, PUSH_READY_TIMEOUT);
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return;

      try {
        await fetch('/api/v1/notifications/push/unsubscribe', {
          method: 'POST',
          headers,
          body: JSON.stringify(subscription),
        });
      } catch {}

      await subscription.unsubscribe();
    } catch (e) {
      showSnackbarError('Failed to unsubscribe from push notifications: ' + errorMessage(e));
    }
  };

  const connect = () => connectWS();
  const disconnect = () => {
    connectGeneration++;
    cleanupWS();
  };
  const reset = () => {
    notificationsBadge.value = false;
  };

  return { notificationsBadge, refreshBadge, connect, disconnect, subscribePush, unsubscribePush, reset };
}