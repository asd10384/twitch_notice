
/**
 * sleep
 * @param {number} ms mil sec
 * @returns sleep
 */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

if (localStorage.getItem("webPushId")) {
  fetch("/idcheck", {
    method: "POST",
    body: JSON.stringify({ id: localStorage.getItem("webPushId") }),
    headers: {
      "content-type": "application/json"
    }
  }).then(res => res.json()).then((val) => {
    if (!val?.status) localStorage.removeItem("webPushId");
  });
}

if (localStorage.getItem("Theme") != "dark" || localStorage.getItem("Theme") != "light") {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    localStorage.setItem("Theme", "dark");
  } else {
    localStorage.setItem("Theme", "light");
  }
}

function ThemeCheck() {
  if (localStorage.getItem("Theme") == "dark") document.documentElement.classList.add("dark");
};

function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  if (localStorage.getItem("Theme") == "dark") {
    localStorage.setItem("Theme", "light");
  } else {
    localStorage.setItem("Theme", "dark");
  }
};

/**
 * @type {boolean}
 */
let update = true;

/**
 * update update
 * @param {boolean} getUpdate update
 */
async function setUpdate(getUpdate) {
  if (getUpdate) await sleep(150);
  update = getUpdate;
  ButtonUpdate();
}

function ButtonUpdate() {
  if (update) {
    for (let element of document.querySelectorAll("label.toggleSwitch")) {
      element.removeAttribute("id");
    }
  } else {
    for (let element of document.querySelectorAll("label.toggleSwitch")) {
      element.setAttribute("id", "disable");
    }
  }
}

/**
 * toggleButtonTitle
 * @param {Element} element element
 * @param {string} userId streamer id
 */
async function toggleButtonTitle(element, userId) {
  if (!update) {
    alert("너무 빨리 클릭함");
    return;
  }
  if (element.getAttribute("id")?.includes("disable")) {
    alert("너무 빨리 클릭함");
    return;
  }
  setUpdate(false);
  titleRun(element, userId);
}

/**
 * toggleButtonNotice
 * @param {Element} element element
 * @param {string} userId streamer id
 */
async function toggleButtonNotice(element, userId) {
  if (!update) return;
  if (element.getAttribute("id")?.includes("disable")) return;
  setUpdate(false);
  if (!("Notification" in window)) {
    element.classList.remove("active");
    alert("알림을 지원하지 않는 브라우저입니다.");
    setUpdate(true);
  } else if (Notification.permission == "granted") {
    notiRun(element, userId);
  } else {
    Notification.requestPermission().then(async (result) => {
      setUpdate(false);
      if (result == "granted") {
        notiRun(element, userId);
      } else {
        element.classList.remove("active");
        alert("알림설정이 꺼져있습니다.");
        setUpdate(true);
      }
    }).catch(() => {
      element.classList.remove("active");
      alert("알림을 지원하지 않는 브라우저입니다.");
      setUpdate(true);
    });
  }
}

/**
 * titleRun
 * @param {Element} element element
 * @param {string} userId streamer id
 */
async function titleRun(element, userId) {
  if (element.classList.contains("active")) {
    await titleDelete(userId).then(() => {
      element.classList.remove("active");
      setUpdate(true);
    }).catch((err) => {
      alert(err);
      setUpdate(true);
    });
  } else {
    await titleRegister(userId).then(() => {
      element.classList.add("active");
      setUpdate(true);
    }).catch((err) => {
      element.classList.remove("active");
      alert(err);
      setUpdate(true);
    });
  }
}
/**
 * notiRun
 * @param {Element} element element
 * @param {string} userId streamer id
 */
async function notiRun(element, userId) {
  if (element.classList.contains("active")) {
    await webPushDelete(userId).then(() => {
      element.classList.remove("active");
      setUpdate(true);
    }).catch((err) => {
      setUpdate(true);
      alert(err);
    });
  } else {
    await webPushRegister(userId).then(() => {
      element.classList.add("active");
      setUpdate(true);
    }).catch((err) => {
      element.classList.remove("active");
      alert(err);
      setUpdate(true);
    });
  }
}