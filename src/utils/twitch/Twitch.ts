import { ApiClient, HelixPaginatedResult, HelixStream } from "@twurple/api";
import { streamers } from "./streamers";
import { Logger } from "../Logger";
import { registerTwtich } from "./registerTwitch";
import { webSocketServer, wpClass } from "../../index";
import { QDB } from "../databases/quickdb";
import { payload } from "../webPush/WebPush";

interface userData {
  id: string;
  name: string;
  isOnline: boolean;
  gameId: string;
  gameName: string;
  title: string;
  image: string;
};

export class TwitchClass {
  twClient: ApiClient;
  users: Map<string, userData>;

  constructor(twClient: ApiClient) {
    this.twClient = twClient;
    this.users = new Map();
  }

  static async init() {
    let twClient = await registerTwtich();
    let twClass = new TwitchClass(twClient);
    twClass.clientRefresh();
    setInterval(() => {
      twClass.streamCheck();
    }, 1000);
    return twClass;
  }

  getUser(userName: string): userData {
    const user = this.users.get(userName);
    if (user) return user;
    return {
      id: userName,
      name: "",
      isOnline: false,
      gameName: "",
      gameId: "",
      title: "",
      image: ""
    };
  }
  setUser(userData: userData) {
    this.users.set(userData.id, userData);
  }

  clientRefresh() {
    setInterval(() => {
      registerTwtich().then((client) => {
        this.twClient = client;
      }).catch(() => {
        Logger.error("twClient refresh error");
      });
    }, 1000 * 60 * 60 * 24 * 10);
  }

  async getStreamer(streamerId: string) {
    return await this.twClient.users.getUserByName(streamerId).catch(() => {
      // Logger.error(err);
      return null;
    });
  }

  webSocketSend(streamerId: string) {
    webSocketServer.clients.forEach(async (ws) => {
      ws.send(JSON.stringify({
        id: "userListUpdate",
        streamerId: streamerId,
        data: ""
      }));
    });
  }

  async start(streamerId: string, title: string, payload: payload, detail: boolean = false) {
    this.webSocketSend(streamerId);
    for (let ID of await QDB.getIdList()) {
      const db = await QDB.get(ID);
      if (db.subscription != "null" && db.streamerlist.includes(streamerId)) {
        if (detail && !db.titlelist.includes(streamerId)) continue;
        wpClass?.send(db.subscription, {
          title: title,
          payload: {
            ...payload,
            data: streamerId
          }
        });
      }
    }
  }

  async streamCheck() {
    const streams: HelixPaginatedResult<HelixStream> | undefined = await this.twClient.streams.getStreams({
      userName: streamers
    }).catch((err) => {
      console.log(err);
      return undefined;
    });
    if (!streams) return;
    const preUsers = new Set<string>();
    for (const userId of Array.from(this.users.keys())) {
      preUsers.add(userId);
    }
    for (const stream of streams.data) {
      let user = this.getUser(stream.userName);
      user.name = stream.userDisplayName;
      const getUser = await stream.getUser();
      user.image = getUser.profilePictureUrl;
      if (!user.isOnline) {
        user.isOnline = true;
        user.gameId = stream.gameId;
        user.gameName = stream.gameName;
        user.title = stream.title;
        // Logger.log(`${stream.userDisplayName} is now Online`);
        this.start(user.id, `${user.name}님이 방송을 시작하셨습니다.`, {
          icon: user.image,
          body: user.title
        });
      } else {
        if (user.gameId.length != 0 && user.gameId != stream.gameId) {
          user.gameId = stream.gameId;
          let before = user.gameName;
          // Logger.log(`${stream.userDisplayName} 카테고리 바꿈\n${user.gameName} -> ${stream.gameName}`);
          user.gameName = stream.gameName;
          this.start(user.id, `${user.name}님이 카테고리를 변경했습니다.`, {
            icon: user.image,
            body: `${before} -> ${stream.gameName}`
          }, true);
        }
        if (user.title.length != 0 && user.title != stream.title) {
          let before = user.title;
          // Logger.log(`${stream.userDisplayName} 방제 바꿈\n${user.title} -> ${stream.title}`);
          user.title = stream.title;
          this.start(user.id, `${user.name}님이 방제를 변경했습니다.`, {
            icon: user.image,
            body: `${before} -> ${stream.title}`
          }, true);
        }
      }
      this.setUser(user);
      preUsers.delete(user.id);
    }
    for (const preUserId of preUsers.values()) {
      let user = this.getUser(preUserId);
      const getUser = await this.getStreamer(preUserId);
      if (getUser) {
        user.name = getUser.displayName;
        user.image = getUser.profilePictureUrl;
      }
      if (user.isOnline) {
        user.isOnline = false;
        user.gameId = "";
        user.gameName = "";
        user.title = "";
        this.setUser(user);
        // Logger.log(`${user.name.length != 0 ? user.name : user.id} stoped stream`);
        this.start(user.id, `${user.name}님이 방송을 종료하셨습니다.`, {
          icon: user.image
        });
      }
    }
  }
}