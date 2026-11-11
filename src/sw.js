import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

const resolve = (path) => new URL(path, self.registration.scope).href;

const resolveTarget = (url) => {
  const target = new URL(url || 'notifications', self.registration.scope);
  return target.origin === self.location.origin ? target.href : resolve('notifications');
};

const isSafari = /^((?!chrome|chromium|android).)*safari/i.test(self.navigator.userAgent);

const getOwnClients = async () => {
  const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  return clientList.filter((client) => client.url.startsWith(self.registration.scope));
};

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { message: event.data.text() };
    }
  }

  const title = data.title || 'MOS';
  const options = {
    body: data.message || data.body || '',
    icon: resolve('icons/icon_light_small.png'),
    badge: resolve('icons/icon_light_small.png'),
    tag: data.tag || data.id || undefined,
    renotify: Boolean(data.tag || data.id),
    data: { ...data, url: data.url || 'notifications' },
  };

  event.waitUntil(
    (async () => {
      if (!isSafari) {
        const ownClients = await getOwnClients();
        if (ownClients.some((client) => client.visibilityState === 'visible')) return;
      }
      await self.registration.showNotification(title, options);
    })(),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = resolveTarget(event.notification.data?.url);

  event.waitUntil(
    (async () => {
      const ownClients = await getOwnClients();
      const own = ownClients.find((client) => client.visibilityState === 'visible') ?? ownClients[0];

      if (!own) {
        await clients.openWindow(target);
        return;
      }

      await own.focus();
      if (own.url !== target && 'navigate' in own) {
        try {
          await own.navigate(target);
        } catch {
          await clients.openWindow(target);
        }
      }
    })(),
  );
});

self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    getOwnClients().then((clientList) => {
      clientList.forEach((client) => client.postMessage({ type: 'pushsubscriptionchange' }));
    }),
  );
});