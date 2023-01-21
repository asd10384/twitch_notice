import "dotenv/config";
import express from "express";
import cors from "cors";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import path, { join } from "path";
import { Logger } from "./utils/Logger";
import { TwitchClass } from "./utils/twitch/Twitch";
import { streamers } from "./utils/twitch/streamers";
import { userListData } from "./utils/twitch/userListData";
import * as WebSocket from "ws";
import webPush from "web-push";
import https from "https";
import { publicKey, privateKey } from "../webPushKey";
import { WebPushClass } from "./utils/webPush/WebPush";

const REDIRECTPORT = process.env.REDIRECTPORT || 7778;
const redirectapp = express();
redirectapp.all("*", (req, res) => {
  const domain = `${req.protocol}s://${req.headers.host}`;
  console.log("redirecting : " + domain);
  res.redirect(domain);
});
redirectapp.listen(REDIRECTPORT, () => {
  Logger.ready("redirecting page : http://localhost:"+REDIRECTPORT);
});

const app = express();

app.use(cors({
  origin: "*"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname + "/ejs"));
app.use('/favicon.ico', express.static(join(__dirname, "images", "favicon.ico")));
app.use('/serviceWorker.js', express.static(join(__dirname, "js", "serviceWorker.js")));
app.use('/.well-known', express.static(join(__dirname, ".well-known")));
app.use('/file', express.static(__dirname + "/"));

const route = readdirSync(join(__dirname, 'routes')).filter(file => file.endsWith('.js') || file.endsWith('.ts'));
route.forEach((file) => {
  app.use(require(join(__dirname, "routes", file.replace(/\.js|\.ts/, ''))).default);
});

app.use((_req, res) => {
  return res.status(404).json({ err: "Page Not Found" });
});

if (!existsSync(join(__dirname, "..", "webPushKey.ts"))) {
  const { publicKey, privateKey } = webPush.generateVAPIDKeys();
  writeFileSync(join(__dirname, "..", "webPushKey.ts"), `export const publicKey = "${publicKey}";\nexport const privateKey = "${privateKey}";`, "utf8");
}

webPush.setVapidDetails("mailto:tmdgks0466@naver.com", publicKey, privateKey);

export var twClass: TwitchClass | undefined = undefined;
export var wpClass: WebPushClass | undefined = undefined;
const PORT = process.env.PORT || 7777;

// app.listen(PORT, async () => {
//   Logger.ready("사이트: OPEN\nhttp://localhost:"+PORT);
  
//   twClass = await TwitchClass.init();
//   wpClass = new WebPushClass(webPush);
// });

const server = https.createServer({
  key: readFileSync("./ssl/private.key", "utf-8"),
  cert: readFileSync("./ssl/certificate.crt", "utf-8")
}, app).listen(PORT, async () => {
  Logger.ready("사이트: OPEN\nhttps://localhost:"+PORT);
  
  twClass = await TwitchClass.init();
  wpClass = new WebPushClass(webPush);
});

export const webSocketServer = new WebSocket.Server({
  server: server
});

webSocketServer.on("connection", async (ws, _req) => {
  // const ip = req.socket.remoteAddress;
  // Logger.log("새로운 클라이언트 접속: {\n  " + ip + "\n}");

  ws.setMaxListeners(0);

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.id == "userListData") {
        if (data.streamerId.length != 0) {
          ws.send(JSON.stringify({
            id: "userListData",
            streamerId: data.streamerId,
            data: await userListData(data.webPushId, data.streamerId)
          }));
        } else {
          ws.send(JSON.stringify({
            id: "userListStart",
            streamerId: "",
            data: streamers.join("#@#")
          }));
          for (const streamerId of streamers) {
            ws.send(JSON.stringify({
              id: "userListData",
              streamerId: streamerId,
              data: await userListData(data.webPushId, streamerId)
            }));
          }
          ws.send(JSON.stringify({
            id: "userListEnd",
            streamerId: "",
            data: streamers.join("#@#")
          }));
        }
      }
    } catch {}
  });

  ws.on("close", () => {
    ws.close();
  });
});
