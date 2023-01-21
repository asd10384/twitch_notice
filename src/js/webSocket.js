
/**
 * ws.send 메세지
 * @param {string} streamerId 
 * @returns {string} 메세지
 */

const getmsg = (streamerId = "") => {
  return JSON.stringify({ id: "userListData", streamerId: streamerId, webPushId: localStorage.getItem("webPushId") });
}

/**
 * @type {string[]}
 */
let streamers = [];

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
    }, 1000 * 60 * 3);
  };
  /**
   * 
   * @param {MessageEvent} e event
   */
  ws.onmessage = (e) => {
    /**
     * @type { { id: string; data: string; streamerId: string; } }
     */
    const data = JSON.parse(e.data);
    if (data.id == "userListStart") {
      streamers = data.data.split("#@#");
    } else if (data.id == "userListData") {
      streamers = streamers.filter(sid => sid != data.streamerId);
      if (data.data.length != 0) {
        let doc = document.querySelector(`div.userList div[name="${data.streamerId}"]`);
        if (doc) {
          doc.innerHTML = data.data;
        } else {
          document.querySelector('div[name="userListLoding"]')?.remove();
          document.querySelector("div.userList").insertAdjacentHTML("beforeend", `${data.data}`);
        }
      }
    } else if (data.id == "userListEnd") {
      const streamerlist = data.data.split("#@#");
      for (const streamerId of streamers) {
        if (streamerlist.includes(streamerId)) streamers = streamers.filter(sid => sid != streamerId);
      }
      if (streamers.length > 0) {
        for (const streamerId of streamers) {
          document.querySelector(`div.userList div[name="${streamerId}"]`)?.remove();
        }
      }
    } else if (data.id == "userListUpdate") {
      ws.send(getmsg(data.streamerId));
    }
  }
}
