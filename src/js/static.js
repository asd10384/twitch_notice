
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

var update = true;

/**
 * togglebutton
 * @param {Element} element element
 * @param {string} userId streamer id
 */
function toggleButton(element, userId) {
  update = false;
  if (!("Notification" in window)) {
    update = true;
    element.classList.remove("active");
    alert("알림을 지원하지 않는 브라우저입니다.");
  } else if (Notification.permission == "granted") {
    notiRun(element, userId);
  } else {
    Notification.requestPermission().then(async (result) => {
      update = false;
      if (result == "granted") {
        notiRun(element, userId);
      } else {
        element.classList.remove("active");
        update = true;
        alert("알림설정이 꺼져있습니다.");
      }
    });
  }
}

/**
 * 
 * @param {Element} element element
 * @param {string} userId streamer id
 */
async function notiRun(element, userId) {
  if (element.classList.contains("active")) {
    await webPushDelete(userId).then(() => {
      element.classList.remove("active");
      update = true;
    }).catch((err) => {
      update = true;
      alert(err);
    });
  } else {
    await webPushregister(userId).then(() => {
      element.classList.add("active");
      update = true;
    }).catch((err) => {
      element.classList.remove("active");
      update = true;
      alert(err);
    });
  }
}