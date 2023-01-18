import "dotenv/config";
import { StaticAuthProvider, getAppToken } from "@twurple/auth";
import { ApiClient } from "@twurple/api";

const TWITCH_CLIENTID = process.env.TWITCH_CLIENTID;
const TWITCH_SECRET = process.env.TWITCH_SECRET;

export const registerTwtich = () => new Promise<ApiClient>(async (res, rej) => {
  if (!TWITCH_CLIENTID) return rej("No twitch clientid provided");
  if (!TWITCH_SECRET) return rej("No twitch secret provided");
  const getToken = await getAppToken(TWITCH_CLIENTID, TWITCH_SECRET).catch(() => {
    return undefined;
  });
  if (!getToken) return rej("Invalid twitch token");
  const authProvider = new StaticAuthProvider(TWITCH_CLIENTID, getToken.accessToken, getToken.scope);
  return res(new ApiClient({ authProvider }));
});