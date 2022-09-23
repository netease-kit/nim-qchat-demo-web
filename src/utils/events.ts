/* eslint-disable */
// const eventList = [
//   // 登陆完成事件
//   "logined",
//   "willReconnect",
//   "disconnect",
//   "multiSpotLogin",
//   "kicked",
//   "syncdone",
//   "message",
//   "messageUpdate",
//   "unreadInfo",
//   "systemNotification",
//   "systemNotificationUpdate",
// ];

import { Store } from "vuex";
import QChatSDK from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK";
import NIMSDK from "nim-web-sdk-ng/dist/NIM_BROWSER_SDK";
import { UserNameCard } from "nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface";
import { GetServerMembersByPageResult } from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatServerServiceInterface";
import { QChatSystemNotification } from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatMsgServiceInterface";
import logger from "./logger";
import { Modal } from "ant-design-vue";
import { QChatUnreadInfo } from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatInterface";

type SystemNotificationResponse = {
  feature?: string;
  systemNotifications: QChatSystemNotification[];
};

function destroySocket() {
  window.nim?.destroy();
  window.qchat?.destroy();
  window.nim = null;
  window.qchat = null;
  Modal.warning({
    title: "已断开连接",
    content: "请刷新页面后重试",
    onOk() {
      location.reload();
    },
  });
}

export const qchatAttachEvents = (instance: QChatSDK, store: Store<any>) => {
  instance.on("logined", (res: any) => {
    logger.log(`收到 qchat logined 事件：`, res);
  });

  instance.on("systemNotification", (res: SystemNotificationResponse) => {
    logger.log(`收到 systemNotification 事件：`, res);
  });

  instance.on("disconnect", () => {
    logger.log(`qchat 断开连接!`);
    destroySocket();
  });
  instance.on("kicked", () => {
    logger.log(`qchat 被踢下线!`);
    destroySocket();
  });

  // 监听系统通知，实时同步成员列表状态
  instance.on("systemNotification", async (res: SystemNotificationResponse) => {
    const { systemNotifications = [] } = res;

    // 如果当前有选中服务器，则处理成员加入和成员离开事件
    if (store.state.server.curServer?.serverId) {
      const joinMemberAccids: string[] = [];
      const leaveMemberAccids: string[] = [];

      const notificationsOfCurServer = systemNotifications.filter((note) => {
        return note.serverId === store.state.server.curServer?.serverId;
      });

      for (let i = 0; i < notificationsOfCurServer.length; i++) {
        const msg = notificationsOfCurServer[i];
        const { attach, fromAccount, type } = msg;

        switch (type) {
          case "serverMemberInviteDone":
            joinMemberAccids.push(...attach.invitedAccids);
            break;
          case "serverMemberInviteAccept":
            joinMemberAccids.push(attach.inviteAccid);
            break;
          case "serverMemberApplyDone":
            joinMemberAccids.push(fromAccount);
            break;
          case "serverMemberApplyAccept":
            joinMemberAccids.push(attach.applyAccid);
            break;
          case "serverMemberKick":
            leaveMemberAccids.push(...(attach?.kickedAccids || []));
            break;
          case "serverMemberLeave":
            leaveMemberAccids.push(fromAccount);
            break;

          default:
            break;
        }
      }

      /**
       * 如果频道人数过多的情况下，
       * 每次有系统通知下发，每个频道成员各自客户端请求刷新成员列表会导致服务器请求过多，造成服务器压力过大
       * 这时就不建议从服务端刷新成员列表了
       */
      if (window.qchat && joinMemberAccids.length) {
        const joinMembers = await window.qchat.qchatServer.getServerMembers({
          accids: joinMemberAccids.map((accid) => ({
            accid,
            serverId: store.state.server.curServer?.serverId,
          })),
        });

        const { datas, listQueryTag }: GetServerMembersByPageResult =
          store.state.server.serverMembers;

        const newDatas = datas.filter(
          (data) => leaveMemberAccids.indexOf(data.accid) === -1
        );

        store.commit("server/setSeverMembers", {
          datas: [...newDatas, ...joinMembers],
          listQueryTag,
        });
      }
    }
  });
  // 登录完成后请求服务器列表
  instance.on("logined", () => {
    store.dispatch("server/getSeverList", { timestamp: 0 });
  });
  // serverBar监听系统通知，通知store更新serverList
  instance.on("systemNotification", async (res: SystemNotificationResponse) => {
    const { systemNotifications = [] } = res;
    const accid = window.qchat?.account;
    // 过滤掉与当前账户无关的系统通知
    const notificationsOfCurAccid = systemNotifications.filter((note) => {
      if (!note.toAccids) {
        return true;
      } else if (note.toAccids.includes(accid as string)) {
        return true;
      }
      return false;
    });
    for (const systemNotification of notificationsOfCurAccid) {
      const { type } = systemNotification;
      switch (type) {
        // 被邀请进入服务器
        case "serverMemberInviteDone":
          store.dispatch("server/getSeverList", { timestamp: 0 });
          break;
        // 被踢出服务器
        case "serverMemberKick":
          store.dispatch("server/getSeverList", { timestamp: 0 });
          break;
        // 删除服务器
        case "serverRemove":
          store.dispatch("server/getSeverList", { timestamp: 0 });
          break;
        // 更新服务器
        case "serverUpdate":
          store.dispatch("server/getSeverList", { timestamp: 0 });
          break;

        // 创建频道
        case "channelCreate":
          store.dispatch("channel/getChannelsByPage", {
            serverId: systemNotification.serverId,
          });
          break;
        // 删除频道
        case "channelRemove":
          await store.dispatch("channel/getChannelsByPage", {
            serverId: systemNotification.serverId,
          });
          store.commit("channel/resetCurrentChannel");
          break;
        // 修改频道
        case "channelUpdate":
          await store.dispatch("channel/getChannelsByPage", {
            serverId: systemNotification.serverId,
          });
          store.commit("channel/resetCurrentChannel");
          break;
        // 更新服务器
        // case "":
      }
    }
  });

  // 频道聊天室消息
  instance.on("message", (res) => {
    if (store.state.channel.currentChannel && res.channelId === store.state.channel.currentChannel.channelId) {
      //消息追加到当前窗口中
      store.commit("channel/addCurChannelMsgs", { data: [res] });
    }

  });
  instance.on('messageUpdate', function (msg) {
    
  })

   //监听未读消息
   instance.on("unreadInfo", (unreadInfo: QChatUnreadInfo) => {
    if(unreadInfo.unreadCount > 0){
      store.commit("channel/setUnReadNum", unreadInfo);
    }
  });

};

// const eventList = [
//   // 登陆完成事件
//   "logined",

//   // 收到多端登陆通知触发事件
//   "multiPortLogin",
//   "kicked",

//   "willReconnect",
//   "disconnect",
//   "msg",
//   "proxyMsg",
//   "syncRoamingMsgs",
//   "syncOfflineMsgs",
//   "syncMyNameCard",
//   "syncdone",
//   "sessions",
//   "updateMyNameCard",
//   "updateBlackList",
//   "updateMuteList",
//   "sysMsg",
//   "syncOfflineSysMsgs",
//   "syncFriend",
//   "friends",
//   "users",
//   "updateSystemMessages",
//   "sysMsgUnread",
//   "pushEvents",
//   "teamMsgReceipts",
//   "updateSession",
//   "onClearServerHistoryMsgs",

//   "relations",

//   // 初始化同步群
//   "teams",
//   // 多端同步创建群的情况
//   "createTeam",
//   // 更新群成员的多端同步
//   "updateTeamMember",
//   // 8-3 通知消息里群的更新
//   "updateTeam",
//   "addTeamMembers",
//   "updateTeamManagers",
//   "transferTeam",
//   "removeTeamMembers",
//   "dismissTeam",
//   "updateTeamMembersMute",

//   // 超级群
//   "superTeams",
//   "updateSuperTeam",
//   "addSuperTeamMembers",
//   "removeSuperTeamMembers",
//   "updateSuperTeamManagers",
//   "transferSuperTeam",
//   "updateSuperTeamMembersMute",
//   "updateSuperTeamMember",
//   "dismissSuperTeam",

//   // 单向删除消息
//   "deleteSelfMsgs",
// ];

export const nimAttachEvents = (instance: NIMSDK, store: any) => {
  // eventList.forEach((key: any) => {
  //   instance.on(key, (res) => {
  //     logger.log(
  //       `收到 ${key} 事件：`,
  //       res ? JSON.parse(JSON.stringify(res)) : res
  //     );
  //   });
  // });
  instance.on("syncMyNameCard", (syncMyNameCardResult: UserNameCard) => {
    logger.log(
      `收到 IM 个人信息：`,
      store.commit("user/setUserProfile", syncMyNameCardResult)
    );
  });

  instance.on("logined", (res: any) => {
    logger.log(`收到 IM logined 事件：`, res);
  });

  instance.on("disconnect", () => {
    logger.log(`nim 断开连接!`);
    destroySocket();
  });
  instance.on("kicked", () => {
    logger.log(`nim 被踢下线!`);
    destroySocket();
  });

};
