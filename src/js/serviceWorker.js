
self.addEventListener("push", (e) => {
  /**
   * @type { { title: string; payload: any; } }
   */
  const data = e.data?.json() || { title: "알림", payload: {} };
  // Push 정보
  e.waitUntil(self.registration.showNotification(data.title, data.payload));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  if (e.action == "goStream") {
    if (e.notification.data) {
      clients.openWindow(`https://twitch.tv/${e.notification.data}`);
    }
  }
});
