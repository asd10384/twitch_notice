// import "dotenv/config";
import { Router } from "express";
import { QDB } from "../utils/databases/quickdb";

export default Router().post("/delete", async (req, res) => {
  const ID = req.body.id || undefined;
  const streamerId = req.body.streamerId || undefined;
  if (!ID) return res.status(404).json({ status: false });
  if (!streamerId) return res.status(404).json({ status: false });
  const check = await QDB.del(ID, streamerId);
  return res.status(200).json({ status: check[0], delete: check[1] });
}).post("/tdelete", async (req, res) => {
  const ID = req.body.id || undefined;
  const streamerId = req.body.streamerId || undefined;
  if (!ID) return res.status(404).json({ status: false });
  if (!streamerId) return res.status(404).json({ status: false });
  let db = await QDB.get(ID);
  const check = await QDB.set(ID, { titlelist: db.titlelist.filter(tid => tid != streamerId) });
  return res.status(200).json({ status: check });
});