
/**
 * ws.send 메세지
 * @returns {string} 메세지
 */
const getmsg = () => {
  return JSON.stringify({ id: "userListData", webPushId: localStorage.getItem("webPushId") });
}

/**
 * 
 * @param {string} wsUrl webSocket Url
 */
function webSocketStart(wsUrl) {
  /**
   * @type {WebSocket}
   */
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log("ws connected!");
    ws.send(getmsg());
    setInterval(() => {
      if (update) ws.send(getmsg());
    }, 5000);
  };
  /**
   * 
   * @param {MessageEvent} e event
   */
  ws.onmessage = (e) => {
    /**
     * @type { { id: string; data: string; } }
     */
    const data = JSON.parse(e.data);
    if (data.id == "userListData") {
      document.querySelector(".userList").innerHTML = data.data;
    } else if (data.id == "userListDataUpdate") {
      ws.send(getmsg());
    }
  }
}
