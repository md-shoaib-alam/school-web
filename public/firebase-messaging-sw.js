/* eslint-disable no-undef */
// FCM background service worker. Config arrives via the registration URL
// (?cfg=<encoded json>) because this static file cannot read Next.js env vars.
importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js');

const cfgParam = new URL(self.location).searchParams.get('cfg');

if (cfgParam) {
  try {
    firebase.initializeApp(JSON.parse(cfgParam));
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      const data = payload.data || {};
      const title = payload.notification?.title || data.title || 'New notification';
      const options = {
        body: payload.notification?.body || data.body || '',
        icon: '/logo.svg',
        badge: '/logo.svg',
        // One tray entry per child; a repeat alert for the same child replaces
        // its own entry instead of stacking.
        tag: data.studentId ? `absence_${data.studentId}` : data.tag || undefined,
        image: payload.notification?.image || data.imageUrl || undefined,
        data,
      };
      self.registration.showNotification(title, options);
    });
  } catch (err) {
    console.error('[firebase-messaging-sw] init failed:', err);
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};

  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      const appClient = allClients.find((c) => new URL(c.url).origin === self.location.origin);
      if (appClient) {
        await appClient.focus();
        appClient.postMessage({ type: 'PUSH_NOTIFICATION_CLICK', data });
      } else {
        await clients.openWindow(`/?push=${encodeURIComponent(JSON.stringify(data))}`);
      }
    })()
  );
});
