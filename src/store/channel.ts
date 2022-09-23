import { message } from "ant-design-vue";
import { IUploadFileOptions } from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/CloudStorageServiceInterface";
import {
  ChannelInfo,
  CreateChannelOptions,
  GetChannelsByPageOptions,
  GetChannelsByPageResult,
  GetWhiteBlackMembersPageOptions,
  UpdateChannelOptions,
  UpdateWhiteBlackMembersOptions,
  GetMembersByPageOptions,
  GetMembersByPageResult,
} from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatChannelServiceInterface";
import { QChatMessage } from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatMsgServiceInterface";
import {
  AddMemberRoleOptions,
  QChatChannelRole,
  GetMemberRolesOptions,
} from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatRoleServiceInterface";
import { Module } from "vuex";
import { promiseDebounce } from "@/utils";

import { TRootState } from "./global";
import { QChatUnreadInfo } from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatInterface";
import store from ".";
import {
  GetChannelRolesOptions,
  QChatServerRole,
  UpdateChannelRoleOptions,
  UpdateMemberRoleOptions,
  UpdateServerRoleOptions,
  GetExistingAccidsOfMemberRolesOptions,
} from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatRoleServiceInterface";
import { Item } from "ant-design-vue/lib/menu";
import { MemberInfo } from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatServerServiceInterface";
import ChannelMember from "@/components/ChannelSettings/modules/ChannelMember.vue";

interface ServerUnReadCountAgg {
  serverId: string;
  unreadCount: number;
}

type ChannelUnReadInfo = {
  channelId: string;
  unreadCount: number;
  serverId: string;
};

type TState = {
  channelList: ChannelInfo[];
  currentChannel: ChannelInfo | null;
  settingChannelRole: QChatChannelRole | null;
  ChannelMembers: GetMembersByPageResult | null;
  channelListQueryTag: {
    hasMore: boolean;
    nextTimetag: number;
  };
  currentChannelMsgs: QChatMessage[];
  channelUnReadInfoList: ChannelUnReadInfo[];
  serverUnReadCountList: ServerUnReadCountAgg[];
};

const channelModule: Module<TState, TRootState> = {
  namespaced: true,

  state: () => ({
    channelList: [],
    channelListQueryTag: { hasMore: false, nextTimetag: 0 },
    currentChannel: null,
    ChannelMembers: null,
    currentChannelMsgs: [],
    channelUnReadInfoList: [],
    settingChannelRole: null,
    serverUnReadCountList: [],
  }),
  mutations: {
    setChannelList(state, payload: GetChannelsByPageResult) {
      store.commit("server/resetServerUnReadCount");
      state.channelList = payload.datas;
      if (state.channelList) {
        state.channelList.forEach((item) => {
          item["unreadCount"] = 0;
          for (
            let index = 0;
            index < state.channelUnReadInfoList.length;
            index++
          ) {
            const unReadInfo = state.channelUnReadInfoList[index];
            if (unReadInfo.channelId === item.channelId) {
              item["unreadCount"] = unReadInfo.unreadCount;
            }
          }
        });
      }
      state.channelListQueryTag = payload.listQueryTag;
      store.commit("channel/subscribleChannels");
    },
    subscribleChannels(state) {
      state.channelUnReadInfoList = [];
      const channels = [];
      state.channelList.forEach((item) => {
        channels.push({ serverId: item.serverId, channelId: item.channelId });
      });

      window.qchat.qchatChannel
        .subscribeChannel({
          type: 2,
          opeType: 1,
          channels: channels,
        })
        .then((resp) => {
          const unreadInfos = resp;
          unreadInfos.forEach((item) => {
            if (state.channelList && state.channelList.length > 0) {
              state.channelList.forEach((channelItem) => {
                if (channelItem.channelId === item.channelId) {
                  channelItem["unreadCount"] = item.unreadCount;
                }
              });
            }
            state.channelUnReadInfoList.push({
              channelId: item.channelId,
              unreadCount: item.unreadCount,
              serverId: item.serverId,
            });
          });

          state.serverUnReadCountList = [];
          state.channelUnReadInfoList.forEach((item) => {
            let existsFlag = false;
            for (
              let index = 0;
              index < state.serverUnReadCountList.length;
              index++
            ) {
              const serverCount = state.serverUnReadCountList[index];
              if (serverCount.serverId === item.serverId) {
                existsFlag = true;
                break;
              }
            }
            if (!existsFlag) {
              state.serverUnReadCountList.push({
                serverId: item.serverId,
                unreadCount: item.unreadCount,
              });
            } else {
              for (
                let index = 0;
                index < state.serverUnReadCountList.length;
                index++
              ) {
                const serverUnReadCountAgg = state.serverUnReadCountList[index];
                if (serverUnReadCountAgg.serverId == item.serverId) {
                  serverUnReadCountAgg.unreadCount =
                    serverUnReadCountAgg.unreadCount + item.unreadCount;
                  break;
                }
              }
            }
          });
          store.commit("server/setUnReadInfo", state.serverUnReadCountList);
        });
    },

    //设置channel的未读消息数
    setUnReadNum(state, payload: QChatUnreadInfo) {
      if (state.channelList && state.channelList.length > 0) {
        state.channelList.forEach((channelItem) => {
          if (channelItem.channelId === payload.channelId) {
            channelItem["unreadCount"] = payload.unreadCount;
          }
        });
      }
      let exists = false;
      if (state.channelUnReadInfoList) {
        for (
          let index = 0;
          index < state.channelUnReadInfoList.length;
          index++
        ) {
          const item = state.channelUnReadInfoList[index];
          if (item.channelId === payload.channelId) {
            item.unreadCount = payload.unreadCount;
            exists = true;
            break;
          }
        }
      }
      if (!exists) {
        state.channelUnReadInfoList.push({
          channelId: payload.channelId,
          unreadCount: payload.unreadCount,
          serverId: payload.serverId,
        });
      }
      state.serverUnReadCountList = [];
      state.channelUnReadInfoList.forEach((item) => {
        let existsFlag = false;
        for (
          let index = 0;
          index < state.serverUnReadCountList.length;
          index++
        ) {
          const serverCount = state.serverUnReadCountList[index];
          if (serverCount.serverId === item.serverId) {
            existsFlag = true;
            break;
          }
        }
        if (!existsFlag) {
          state.serverUnReadCountList.push({
            serverId: item.serverId,
            unreadCount: item.unreadCount,
          });
        } else {
          for (
            let index = 0;
            index < state.serverUnReadCountList.length;
            index++
          ) {
            const serverUnReadCountAgg = state.serverUnReadCountList[index];
            if (serverUnReadCountAgg.serverId == item.serverId) {
              serverUnReadCountAgg.unreadCount =
                serverUnReadCountAgg.unreadCount + item.unreadCount;
              break;
            }
          }
        }
      });
      store.commit("server/setUnReadInfo", state.serverUnReadCountList);
    },

    setCurChannel(state, payload: ChannelInfo) {
      state.currentChannel = payload;
    },
    setChannelMembers(state, payload: GetMembersByPageResult) {
      state.ChannelMembers = payload;
    },
    settingChannelRole(state, payload: QChatChannelRole) {
      state.settingChannelRole = payload;
    },
    resetChannelUnReadCount(state) {
      if (state.currentChannel) {
        if (state.channelUnReadInfoList) {
          let finalIndex = -1;
          for (
            let index = 0;
            index < state.channelUnReadInfoList.length;
            index++
          ) {
            const unReadInfo = state.channelUnReadInfoList[index];
            if (unReadInfo.channelId === state.currentChannel.channelId) {
              finalIndex = index;
              break;
            }
          }
          if (finalIndex > -1) {
            state.channelUnReadInfoList.slice(finalIndex, 1);
          }
        }
        const readCount = state.currentChannel["unreadCount"];
        if (readCount < 1) {
          return;
        }
        store.commit("server/setServerUnReadCount", {
          serverId: state.currentChannel.serverId,
          readCount: readCount,
        });
        const markMessageReadOption = {
          serverId: state.currentChannel.serverId,
          channelId: state.currentChannel.channelId,
          time: new Date().getTime(),
          ackTimestamp: new Date().getTime(),
          unreadCount: readCount,
          mentionedCount: 0,
          maxCount: 99,
          lastMsgTime: new Date().getTime(),
        };
        window.qchat.qchatMsg.markMessageRead(markMessageReadOption);
        state.currentChannel["unreadCount"] = 0;
      }
    },
    // channelList 有变化时，让当前的 currentChannel 变化为 channelList 列表里最新的对象
    resetCurrentChannel(state) {
      const newChannel = state.channelList.find(
        (channel) => channel.channelId === state.currentChannel?.channelId
      );
      if (newChannel) {
        state.currentChannel = newChannel;
      }
    },
    addCurChannelMsgs(
      state,
      {
        data,
        isUnShift = false,
      }: {
        data: QChatMessage[];
        isUnShift: boolean;
      }
    ) {
      const existMsgs = data.filter((i) =>
        state.currentChannelMsgs.some((j) => j.msgIdClient === i.msgIdClient)
      );
      const newMsgs = data.filter((i) =>
        state.currentChannelMsgs.every((j) => j.msgIdClient !== i.msgIdClient)
      );
      const msgs = state.currentChannelMsgs.map((i) => {
        const existMsg = existMsgs.find((j) => j.msgIdClient === i.msgIdClient);
        if (existMsg) {
          return {
            ...i,
            ...existMsg,
          };
        }
        return i;
      });
      state.currentChannelMsgs = isUnShift
        ? [...newMsgs, ...msgs]
        : [...msgs, ...newMsgs];
    },
    removeCurChannelMsgs(state, payload: QChatMessage[]) {
      state.currentChannelMsgs = state.currentChannelMsgs.filter((i) =>
        payload.every((j) => j.msgIdClient !== i.msgIdClient)
      );
    },
    setCurChannelMsgs(state, payload: QChatMessage[]) {
      state.currentChannelMsgs = payload;
    },
    clearCurChannelMsgs(state) {
      state.currentChannelMsgs = [];
    },
  },
  actions: {
    // 获取 channel 列表
    getChannelsByPage: promiseDebounce(
      async (context: any, options: GetChannelsByPageOptions) => {
        if (!window.qchat) {
          throw new Error("QChat no login");
        }
        const res = await window.qchat.qchatChannel.getChannelsByPage(
          Object.assign(
            {
              timetag: 0,
            },
            options
          )
        );
        context.commit("setChannelList", res);
      },
      1000
    ),

    // 创建 channel
    async createChannel(context, options: CreateChannelOptions) {
      if (!window.qchat) {
        throw new Error("QChat no login");
      }
      await window.qchat.qchatChannel.createChannel({
        ...options,
        type: "message",
      });
    },

    // 更新 channel
    async updateChannel(context, options: UpdateChannelOptions) {
      if (!window.qchat) {
        throw new Error("QChat no login");
      }
      await window.qchat.qchatChannel.updateChannel(options);
      // context.dispatch("getChannelsByPage", {
      //   serverId: options.serverId,
      //   timetag: 0,
      // });
      // context.commit("setCurChannel", channel);

      //message.success("success");
    },

    // 更新 channel
    async deleteChannel(context) {
      if (!window.qchat) {
        throw new Error("QChat no login");
      }
      if (!context.state.currentChannel?.channelId) {
        throw new Error("No curr channel");
      }
      // const serverId = context.state.currentChannel?.serverId;
      const channelId = context.state.currentChannel?.channelId;
      await window.qchat.qchatChannel.deleteChannel({
        channelId,
      });
      // context.dispatch("getChannelsByPage", {
      //   serverId: serverId,
      //   timetag: 0,
      // });

      message.success("success");
    },

    // 获取历史消息
    async getChannelHistoryMsgs(
      context,
      options: {
        limit: number;
      }
    ) {
      if (!window.qchat) {
        throw new Error("QChat no login");
      }
      if (!context.state.currentChannel) {
        throw new Error("no currentChannel");
      }
      const msgs = (
        await window.qchat.qchatMsg.getHistoryMessage({
          serverId: context.state.currentChannel.serverId,
          channelId: context.state.currentChannel.channelId,
          limit: options.limit,
        })
      ).reverse();
      return msgs;
    },

    // 加载更多历史消息
    async loadMoreHistoryMsgs(
      context,
      options: {
        limit: number;
        lastTime: number;
      }
    ) {
      if (!window.qchat) {
        throw new Error("QChat no login");
      }
      if (!context.state.currentChannel) {
        throw new Error("no currentChannel");
      }
      const msgs = (
        await window.qchat.qchatMsg.getHistoryMessage({
          serverId: context.state.currentChannel.serverId,
          channelId: context.state.currentChannel.channelId,
          limit: options.limit,
          endTime: options.lastTime - 1,
        })
      ).reverse();
      context.commit("addCurChannelMsgs", {
        data: msgs,
        isUnShift: true,
      });
      return msgs;
    },

    // 发送文本消息
    async sendTextMsg(
      context,
      options: {
        body: string;
      }
    ) {
      if (!window.qchat) {
        throw new Error("QChat no login");
      }
      if (!context.state.currentChannel) {
        throw new Error("no currentChannel");
      }
      try {
        const msg = await window.qchat.qchatMsg.sendMessage({
          serverId: context.state.currentChannel.serverId,
          channelId: context.state.currentChannel.channelId,
          type: "text",
          body: options.body,
          onSendBefore: (msg) => {
            context.commit("addCurChannelMsgs", { data: [msg] });
          },
        });
        if (msg.channelId === context.state.currentChannel?.channelId) {
          context.commit("addCurChannelMsgs", { data: [msg] });
        }
      } catch (error: any) {
        console.error("sendMessage error: ", error);
        if (error.msg) {
          context.commit("addCurChannelMsgs", { data: [error.msg] });
        }
      }
    },

    // 发送文件消息
    async sendFileMsg(
      context,
      options: {
        file: IUploadFileOptions["file"];
        onUploadStart: IUploadFileOptions["onUploadStart"];
        onUploadDone: IUploadFileOptions["onUploadDone"];
      }
    ) {
      if (!window.qchat) {
        throw new Error("QChat no login");
      }
      if (!context.state.currentChannel) {
        throw new Error("no currentChannel");
      }
      try {
        const msg = await window.qchat.qchatMsg.sendMessage({
          serverId: context.state.currentChannel.serverId,
          channelId: context.state.currentChannel.channelId,
          type: "file",
          file: options.file,
          onUploadStart: options.onUploadStart,
          onUploadDone: options.onUploadDone,
          onSendBefore: (msg) => {
            context.commit("addCurChannelMsgs", { data: [msg] });
          },
        });
        if (msg.channelId === context.state.currentChannel?.channelId) {
          context.commit("addCurChannelMsgs", { data: [msg] });
        }
      } catch (error: any) {
        console.error("sendMessage error: ", error);
        if (error.msg) {
          context.commit("addCurChannelMsgs", { data: [error.msg] });
        }
      }
    },

    // 发送图片消息
    async sendImageMsg(
      context,
      options: {
        file: IUploadFileOptions["file"];
        onUploadStart: IUploadFileOptions["onUploadStart"];
        onUploadDone: IUploadFileOptions["onUploadDone"];
      }
    ) {
      if (!window.qchat) {
        throw new Error("QChat no login");
      }
      if (!context.state.currentChannel) {
        throw new Error("no currentChannel");
      }
      try {
        const msg = await window.qchat.qchatMsg.sendMessage({
          serverId: context.state.currentChannel.serverId,
          channelId: context.state.currentChannel.channelId,
          type: "image",
          file: options.file,
          onUploadStart: options.onUploadStart,
          onUploadDone: options.onUploadDone,
          onSendBefore: (msg) => {
            context.commit("addCurChannelMsgs", { data: [msg] });
          },
        });
        if (msg.channelId === context.state.currentChannel?.channelId) {
          context.commit("addCurChannelMsgs", { data: [msg] });
        }
      } catch (error: any) {
        console.error("sendMessage error: ", error);
        if (error.msg) {
          context.commit("addCurChannelMsgs", { data: [error.msg] });
        }
      }
    },

    // 重发文本消息
    async resendTextMsg(context, options: QChatMessage) {
      if (!window.qchat) {
        throw new Error("QChat no login");
      }
      const msg = await window.qchat.qchatMsg.resendMessage(options);
      if (msg.channelId === context.state.currentChannel?.channelId) {
        context.commit("addCurChannelMsgs", { data: [msg] });
      }
    },

    // 重发文本消息
    async resendFileMsg(context, options: QChatMessage) {
      if (!window.qchat) {
        throw new Error("QChat no login");
      }
      const msg = await window.qchat.qchatMsg.resendMessage(options);
      if (msg.channelId === context.state.currentChannel?.channelId) {
        context.commit("addCurChannelMsgs", { data: [msg] });
      }
    },

    // 重发文本消息
    async resendImageMsg(context, options: QChatMessage) {
      if (!window.qchat) {
        throw new Error("QChat no login");
      }
      const msg = await window.qchat.qchatMsg.resendMessage(options);
      if (msg.channelId === context.state.currentChannel?.channelId) {
        context.commit("addCurChannelMsgs", { data: [msg] });
      }
    },
    // 获取频道黑白名单
    async getWhiteBlackMembersPage(
      context,
      options: GetWhiteBlackMembersPageOptions
    ) {
      if (!window.qchat) {
        throw new Error("QChat no login");
      }
      const res = await window.qchat.qchatChannel.getWhiteBlackMembersPage(
        options
      );
      return res;
    },
    //更新频道黑白名单成员
    async updateWhiteBlackMembers(
      context,
      options: UpdateWhiteBlackMembersOptions
    ) {
      if (!window.qchat) {
        throw new Error("QChat no login");
      }
      const msg = await window.qchat.qchatChannel.updateWhiteBlackMembers(
        options
      );
    },
    //
    //更新频道身份组权限
    async updateChannelRole(context, options: UpdateChannelRoleOptions) {
      if (!window.qchat) {
        throw new Error("QChat no login");
      }
      const msg = await window.qchat.qchatRole.updateChannelRole(options);
    },
    //更新频道成员权限
    async updateMemberRole(context, options: UpdateMemberRoleOptions) {
      if (!window.qchat) {
        throw new Error("QChat no login");
      }
      return await window.qchat.qchatRole.updateMemberRole(options);
    },
    //新增成员频道权限
    async addMemberRole(context, options: AddMemberRoleOptions) {
      if (!window.qchat) {
        throw new Error("QChat no login");
      }
      const msg = await window.qchat.qchatRole.addMemberRole(options);
    },
    //获取频道身份组
    async getChannelRoles(context, options: GetChannelRolesOptions) {
      const res = await window.qchat.qchatRole.getChannelRoles(options);
      return res;
    },
    //查询频道下名单
    async getMembersByPage(context, options: GetMembersByPageOptions) {
      const res = await window.qchat.qchatChannel.getMembersByPage(options);
      context.commit("setChannelMembers", res);
      return res;
    },
    async getMemberRoles(context, options: GetMemberRolesOptions) {
      const res = await window.qchat.qchatRole.getMemberRoles(options);
      return res;
    },
    async getExistingAccidsOfMemberRoles(
      context,
      options: GetExistingAccidsOfMemberRolesOptions
    ) {
      const res = await window.qchat.qchatRole.getExistingAccidsOfMemberRoles(
        options
      );
      return res;
    },
  },
};

export default channelModule;
