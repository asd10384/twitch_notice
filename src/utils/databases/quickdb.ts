import "dotenv/config";
import { QuickDB } from "quick.db";
import { PushSubscription } from "web-push";

const qdb = new QuickDB({
  filePath: process.env.DB_FILE_PATH || "./dbfile.sqlite"
});

export interface Data {
  id: string;
  subscription: PushSubscription | "null";
  streamerlist: string[];
}
interface getData {
  id?: string;
  subscription?: PushSubscription | "null";
  streamerlist?: string[];
}

const set = (Id: string, getqdb: getData) => new Promise<boolean>(async (res, rej) => {
  try {
    for (const key of Object.keys(getqdb)) {
      await qdb.table("s"+Id).set(key, (getqdb as any)[key]);
    }
    return res(true);
  } catch (err) {
    return rej(err);
  }
});

const get = (id: string) => new Promise<Data>((res, rej) => {
  qdb.table("s"+id).all().then(async (db) => {
    let output: {[key: string]: any} = {};
    if (db.length === 0 || db.some((val) => val.id !== "id")) {
      let idList: string[] = await qdb.get("ids") || [];
      if (!idList.includes(id)) {
        idList.push(id);
        await qdb.set("ids", idList);
      }
      let data: Data = {
        id: id,
        subscription: "null",
        streamerlist: []
      };
      output = data;
    }
    for (let val of db) {
      output[val.id] = val.value;
    }
    await set(id, output as any);
    return res(output as any);
  }).catch(rej);
});

const del = (id: string, streamerId: string) => new Promise<[ boolean, boolean ]>(async (res, rej) => {
  const db = await get(id);
  const list = db.streamerlist.filter(sid => sid != streamerId);
  if (list.length == 0) {
    qdb.table("s"+id).deleteAll().then(async () => {
      let idList: string[] = await qdb.get("ids") || [];
      await qdb.set("ids", idList.filter(id => id !== id));
      return res([ true, true ]);
    }).catch(rej);
  } else {
    const check = await set(id, { streamerlist: list });
    if (!check) return res([ false, false ]);
    return res([ true, false ]);
  }
});

const all = () => new Promise<Data[]>(async (res, rej) => {
  try {
    let idList: string[] = await qdb.get("ids") || [];
    let output: Data[] = [];
    for (let guildId of idList) {
      let guilddata = await qdb.table("s"+guildId).all();
      let output2: {[key: string]: any} = {};
      for (let val of guilddata) {
        output2[val.id] = val.value;
      }
      output.push(output2 as any);
    }
    return res(output);
  } catch (err) {
    return rej(err);
  }
});

const getId = () => new Promise<string>((async (res, _rej) => {
  let idList: string[] = await qdb.get("ids") || [];
  let id = "";
  while (true) {
    id = Math.random().toString(36).substring(2,12);
    if (!idList.includes(id)) break;
  }
  idList.push(id);
  await qdb.set("ids", idList);
  return res(id);
}));

const getIdList = () => new Promise<string[]>(async (res, _rej) => {
  let idList: string[] = await qdb.get("ids") || [];
  return res(idList);
})


export const QDB = {
  get: get,
  set: set,
  del: del,
  all: all,
  getId: getId,
  getIdList: getIdList
};