import { twClass } from "../../index";
import { streamers } from "../../utils/twitch/streamers";
import { QDB } from "../../utils/databases/quickdb";

export const userListData = async (id: string | null): Promise<string> => {
  let userListData = [];
  for (let streamerId of streamers) {
    const streamer = await twClass?.getStreamer(streamerId);
    if (!streamer) continue;
    const stream = await streamer.getStream();
    let active = "";
    if (id && (await QDB.get(id)).streamerlist.includes(streamerId)) active = "active";
    if (stream) {
      userListData.push(`<div class="user" id="Online"><p class="userOnline" style="color: #00ff00;">●</p><div class="userImage" style="background-image: url('${streamer.profilePictureUrl}');"></div><p class="userId">${streamerId}</p><p class="userName"><a href="https://twitch.tv/${streamerId}" target="_blank" title="${streamer.displayName} 트위치 채널보기">${streamer.displayName}</a></p><p class="userTitle">${stream.title}</p><p class="userGame">${stream.gameName}</p><label for="toggle" class="toggleSwitch ${active}" onclick="toggleButton(this, '${streamerId}');"><span class="toggleButton"></span></label></div>`);
    } else {
      const user = twClass?.getUser(streamerId);
      if (user) {
        userListData.push(`<div class="user" id="Offline"><p class="userOnline" style="color: #969696;">●</p><div class="userImage" style="background-image: url('${streamer.profilePictureUrl}');"></div><p class="userId">${streamerId}</p><p class="userName"><a href="https://twitch.tv/${streamerId}" target="_blank" title="${streamer.displayName} 트위치 채널보기">${streamer.displayName}</a></p><p class="userTitle">${user.title.length != 0 ? user.title : "Offline"}</p><p class="userGame">${user.gameName.length != 0 ? user.gameName : ""}</p><label for="toggle" class="toggleSwitch ${active}" onclick="toggleButton(this, '${streamerId}');"><span class="toggleButton"></span></label></div>`);
      } else {
        userListData.push(`<div class="user" id="Offline"><p class="userOnline" style="color: #969696;">●</p><div class="userImage" style="background-image: url('${streamer.profilePictureUrl}');"></div><p class="userId">${streamerId}</p><p class="userName"><a href="https://twitch.tv/${streamerId}" target="_blank" title="${streamer.displayName} 트위치 채널보기">${streamer.displayName}</a></p><p class="userTitle">${"Offline"}</p><p class="userGame">${""}</p><label for="toggle" class="toggleSwitch ${active}" onclick="toggleButton(this, '${streamerId}');"><span class="toggleButton"></span></label></div>`);
      }
    }
  }
  return userListData.join("\n    <br/>\n    ");
}