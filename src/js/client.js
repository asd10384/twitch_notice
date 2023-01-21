/**
 * @type {ServiceWorkerRegistration | undefined}
 */
let register = undefined;

async function serviceWorkerRegister() {
  if ("serviceWorker" in navigator) {
    console.log("serviceWorker 등록중...");
    register = await navigator.serviceWorker.register("/serviceWorker.js", { scope: "/" }).catch((err) => {
      console.log(err);
      return undefined;
    });
  }
  return !!register;
}

/**
 * webPushRegister
 * @param {string} userId streamerId
 * @returns {boolean} true or false
 */
function webPushRegister(userId) {
  return new Promise(async (res, rej) => {
    if (!register) return rej("serviceWorker 등록 오류");
    console.log("serviceWorker 등록 완료");
    console.log("푸시 가입중...");
    const subscription = await register.pushManager?.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    }).catch((err) => {
      console.log(err);
      return undefined;
    });
    if (!subscription) return rej("푸시 가입 오류");
    const ID = localStorage.getItem("webPushId");
    await fetch("/register", {
      method: "POST",
      body: JSON.stringify({
        id: ID,
        streamerId: userId,
        subscription: subscription
      }),
      headers: {
        "content-type": "application/json"
      }
    }).then(res => res.json()).then((val) => {
      if (!val?.status) return rej("푸시 전송 테스트 오류");
      localStorage.setItem("webPushId", val.id);
      return res(true);
    });
    return res(true);
  });
}

/**
 * webPushDelete
 * @param {string} userId streamerId
 * @returns {boolean} true or false
 */
function webPushDelete(userId) {
  return new Promise(async (res, rej) => {
    let ID = localStorage.getItem("webPushId");
    if (!ID) return res(false);
    await fetch("/delete", {
      method: "POST",
      body: JSON.stringify({ id: ID, streamerId: userId }),
      headers: {
        "content-type": "application/json"
      }
    }).then(res => res.json()).then((val) => {
      if (!val?.status) return rej("delete error");
      if (val?.delete) localStorage.removeItem("webPushId");
      return res(true);
    });
  });
}

/**
 * titleRegister
 * @param {string} userId streamerId
 * @returns {boolean} true or false
 */
function titleRegister(userId) {
  return new Promise(async (res, rej) => {
    const ID = localStorage.getItem("webPushId");
    await fetch("/tregister", {
      method: "POST",
      body: JSON.stringify({
        id: ID,
        streamerId: userId
      }),
      headers: {
        "content-type": "application/json"
      }
    }).then(res => res.json()).then((val) => {
      if (!val?.status) return rej("먼저 방송알림을 켜고\n부가알림을 켜주세요.");
      localStorage.setItem("webPushId", val.id);
      return res(true);
    });
    return res(true);
  });
}

/**
 * webPushDelete
 * @param {string} userId streamerId
 * @returns {boolean} true or false
 */
function titleDelete(userId) {
  return new Promise(async (res, rej) => {
    let ID = localStorage.getItem("webPushId");
    if (!ID) return res(false);
    await fetch("/tdelete", {
      method: "POST",
      body: JSON.stringify({ id: ID, streamerId: userId }),
      headers: {
        "content-type": "application/json"
      }
    }).then(res => res.json()).then((val) => {
      if (!val?.status) return rej("delete error");
      return res(true);
    });
  });
}

/**
 * 
 * @param {string} base64String publicKey
 * @returns {Uint8Array} convert
 */
function urlBase64ToUint8Array(base64String) {
  var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  var base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
