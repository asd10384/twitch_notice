// import "dotenv/config";
import { Router } from "express";
import { QDB } from "../utils/databases/quickdb";

export default Router().post("/idcheck", async (req, res) => {
  const ID = req.body.id || undefined;
  if (!ID) return res.status(200).json({ status: false });
  const ids = await QDB.getIdList();
  if (ids.includes(ID)) return res.status(200).json({ status: true });
  return res.status(200).json({ status: false });
});