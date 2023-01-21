import { twClass } from "../../index";
import { QDB } from "../../utils/databases/quickdb";

export const userListData = async (id: string | null, streamerId: string): Promise<string> => {
  const streamer = await twClass?.getStreamer(streamerId);
  if (!streamer) return "";
  const stream = await streamer.getStream();
  let noticeActive = "";
  let titleActive = "";
  if (id) {
    const db = await QDB.get(id);
    if (db.streamerlist.includes(streamerId)) noticeActive = " active";
    if (db.titlelist.includes(streamerId)) titleActive = " active";
  }
  if (stream) {
    return `<div class="user" name="${streamerId}" id="Online"><p class="userOnline" style="color: #00ff00;">●</p><div class="userImage" style="background-image: url('${streamer.profilePictureUrl}');"></div><p class="userId">${streamerId}</p><p class="userName"><a href="https://twitch.tv/${streamerId}" target="_blank" title="${streamer.displayName} 트위치 채널보기">${streamer.displayName}</a></p><p class="userTitle">${stream.title}</p><p class="userGame">${stream.gameName}</p><label for="toggle" title="부가알림 ON|OFF" class="toggleSwitch title${titleActive}" onclick="toggleButtonTitle(this, '${streamerId}');"><span class="toggleButton"></span></label><label for="toggle" title="방송알림 ON|OFF" class="toggleSwitch notice${noticeActive}" onclick="toggleButtonNotice(this, '${streamerId}');"><span class="toggleButton"></span></label></div>`;
  } else {
    const user = twClass?.getUser(streamerId);
    if (user) {
      return `<div class="user" name="${streamerId}" id="Offline"><p class="userOnline" style="color: #969696;">●</p><div class="userImage" style="background-image: url('${streamer.profilePictureUrl}');"></div><p class="userId">${streamerId}</p><p class="userName"><a href="https://twitch.tv/${streamerId}" target="_blank" title="${streamer.displayName} 트위치 채널보기">${streamer.displayName}</a></p><p class="userTitle">${user.title.length != 0 ? user.title : "Offline"}</p><p class="userGame">${user.gameName.length != 0 ? user.gameName : ""}</p><label for="toggle" title="부가알림 ON|OFF" class="toggleSwitch title${titleActive}" onclick="toggleButtonTitle(this, '${streamerId}');"><span class="toggleButton"></span></label><label for="toggle" title="방송알림 ON|OFF" class="toggleSwitch notice${noticeActive}" onclick="toggleButtonNotice(this, '${streamerId}');"><span class="toggleButton"></span></label></div>`;
    } else {
      return `<div class="user" name="${streamerId}" id="Offline"><p class="userOnline" style="color: #969696;">●</p><div class="userImage" style="background-image: url('${streamer.profilePictureUrl}');"></div><p class="userId">${streamerId}</p><p class="userName"><a href="https://twitch.tv/${streamerId}" target="_blank" title="${streamer.displayName} 트위치 채널보기">${streamer.displayName}</a></p><p class="userTitle">${"Offline"}</p><p class="userGame">${""}</p><label for="toggle" title="부가알림 ON|OFF" class="toggleSwitch title${titleActive}" onclick="toggleButtonTitle(this, '${streamerId}');"><span class="toggleButton"></span></label><label for="toggle" title="방송알림 ON|OFF" class="toggleSwitch notice${noticeActive}" onclick="toggleButtonNotice(this, '${streamerId}');"><span class="toggleButton"></span></label></div>`;
    }
  }
}