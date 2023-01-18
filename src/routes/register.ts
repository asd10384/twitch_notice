// import "dotenv/config";
import { Router } from "express";
import { QDB } from "../utils/databases/quickdb";
import { wpClass, twClass } from "../index";

export default Router().post("/register", async (req, res) => {
  var ID = req.body.id || undefined;
  var streamerId = req.body.streamerId || undefined;
  const subscription = req.body.subscription || undefined;
  if (!streamerId) return res.status(404).json({ status: false });
  if (!subscription) return res.status(404).json({ status: false });
  if (!ID) ID = await QDB.getId();
  var db = await QDB.get(ID);
  if (!db.subscription) db.subscription = subscription;
  if (!db.streamerlist.includes(streamerId)) db.streamerlist.push(streamerId);
  const user = await twClass?.getStreamer(streamerId);
  const check = await QDB.set(ID, {
    streamerlist: db.streamerlist,
    subscription: db.subscription == "null" ? subscription : db.subscription
  });
  wpClass?.send(db.subscription == "null" ? subscription : db.subscription, {
    title: `${user?.name || streamerId}님의 테스트 알림입니다.`,
    payload: {
      body: `${user?.name || streamerId}님의 방송알림: ON`,
      icon: user?.profilePictureUrl,
      data: streamerId
    }
  });
  return res.status(200).json({ status: check, id: ID });
});