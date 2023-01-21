// import "dotenv/config";
import { Router } from "express";
import { publicKey } from "../../webPushKey";

export default Router().get("/", async (req, res) => {
  const domain = `${req.protocol}://${req.headers.host}`;
  const wsUrl = `wss://${req.headers.host}`;

  return res.status(200).render("main", {
    domain: domain,
    wsUrl: wsUrl,
    publicKey: publicKey
  });
});