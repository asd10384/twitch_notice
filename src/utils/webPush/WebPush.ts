import webPush from "web-push";

export interface payload {
  body?: string;
  icon?: string;
  image?: string;
  badge?: string;
  vibrate?: number[];
  actions?: { action: string; type: "button"; title: string; }[];
  data?: string;
}

export class WebPushClass {
  webPush: typeof webPush;
  
  constructor(getWebPush: typeof webPush) {
    this.webPush = getWebPush;
  }

  send(subscription: webPush.PushSubscription, data: {
    title: string;
    payload: payload;
  }) {
    data.payload = {
      ...data.payload,
      vibrate: data.payload.vibrate || [200, 100, 200, 100, 200, 100, 200],
      badge: data.payload.badge || "/file/images/badge-24x24.png",
      actions: data.payload.actions || [ {
        action: "goStream",
        type: "button",
        title: "방송 보러가기"
      } ]
    };
    const payload = JSON.stringify(data);
    this.webPush.sendNotification(subscription, payload).catch(() => {});
  }
}