/* eslint-disable */
import {
  GetServersByPageOptions,
  GetServersOptions,
  GetServersByPageResult,
  GetServerMembersByPageOptions,
  GetServerMembersByPageResult,
  ApplyServerJoinOptions,
  UpdateServerOptions,
  CreateServerOptions,
  ServerInfo,
  MemberInfo,
  DeleteServerOptions,
  UpdateMyMemberInfoOptions, GetServerMembersOptions, KickServerMembersOptions,
  LeaveServerOptions, SubscribeServerOptions,
} from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatServerServiceInterface";
import {
  GetServerRolesByAccidOptions,
  QChatServerRole,
  CreateServerRoleOptions,
  DeleteServerRoleOptions,
  UpdateServerRolePrioritiesOptions,
  GetServerRolesOptions,
  UpdateServerRoleOptions,
  GetMembersFromServerRoleOptions,
  AddMembersToServerRoleOptions,
  RemoveMembersFromServerRoleOptions,
  RemoveMemberRoleOptions,
  UpdateMemberRoleOptions, AddChannelRoleOptions,
  GetMemberRolesOptions, CheckPermissionOptions,
} from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatRoleServiceInterface";
import { TRootState } from "./global";
import { Module } from "vuex";
import { QChatUnreadInfo } from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatInterface";
import { Item } from "ant-design-vue/lib/menu";
import store from ".";
import {SendSystemNotificationOptions} from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatMsgServiceInterface";

type TState = {
  serverList: ServerInfo[];
  curServer: ServerInfo | null;
  curServerRoles: QChatServerRole[];
  settingServerRole: QChatServerRole | null;
  serverMembers: GetServerMembersByPageResult | null;
  curMember: MemberInfo | null;
  curMemberRoles: QChatServerRole[] | null;
  listQueryTag: GetServersByPageResult["listQueryTag"];
  searchServerId: string;
};

const global: Module<TState, TRootState> = {
  namespaced: true,

  state: () => ({
    serverList: [],
    listQueryTag: {
      nextTimetag: 0,
      hasMore: false,
    },
    curServer: null,
    curServerRoles: [],
    settingServerRole: null,
    serverMembers: null,
    curMember: null,
    curMemberRoles: [],
    searchServerId: "",
  }),
  mutations: {
    // 同步方法
    setCurServer(state: TState, payload: ServerInfo) {
      state.curServer = payload;
    },
    setCurServerRoles(state: TState, payload: QChatServerRole[]) {
      state.curServerRoles = payload;
    },
    setSettingServerRole(state: TState, payload: QChatServerRole | null) {
      state.settingServerRole = payload;
    },
    setSeverList(state: TState, payload: GetServersByPageResult) {
      state.listQueryTag = payload.listQueryTag;
      state.serverList = payload.datas;
      if (state.serverList) {
        state.serverList.forEach(item => {
          item["unReadInfo"] = 0;
        });
      }

    },
    setSeverMembers(state: TState, payload: GetServerMembersByPageResult) {
      state.serverMembers = payload;
    },
    setCurMember(state: TState, payload: MemberInfo) {
      state.curMember = payload;
    },
    setCurMemberRoles(state: TState, payload: QChatServerRole[]) {
      state.curMemberRoles = payload;
    },
    setSearchServerId(state: TState, payload: string) {
      state.searchServerId = payload;
    },
    setUnReadInfo(state: TState, payload: any[]) {
      for (let index = 0; index < payload.length; index++) {
        const serverAggCount = payload[index];
        for (let j = 0; index < state.serverList.length; j++) {
          const item = state.serverList[j];
          if(item.serverId === serverAggCount.serverId){
            item["unReadInfo"] = serverAggCount.unreadCount;
            break;
          }
        }
      }
    },

    resetServerUnReadCount(state: TState){
      if (state.serverList) {
        state.serverList.forEach(item => {
          item["unReadInfo"] = 0;
        });
      }
    },
    setServerUnReadCount(state: TState, payload: any){
      if(state.serverList && payload.serverId && payload.readCount){
        for (let index = 0; index < state.serverList.length; index++) {
          const item = state.serverList[index];
          if(item.serverId === payload.serverId){
            item["unReadInfo"] = item["unReadInfo"] - payload.readCount;
            break;
          }
        }
      }
    }
  },
  actions: {
    // 获取服务器列表
    async getSeverList(context, options: GetServersByPageOptions) {
      if (window.qchat) {
        const res = await window.qchat.qchatServer.getServersByPage(options);
        context.commit("setSeverList", res);
      }
    },
    // 添加下一页服务器列表
    async appendServerList(context, options: GetServersByPageOptions) {
      if (window.qchat) {
        const res = await window.qchat.qchatServer.getServersByPage(options);
        const { datas = [], listQueryTag } = res;
        context.commit("setSeverList", {
          datas: [...(context.state.serverList || []), ...datas],
          listQueryTag,
        });
      }
    },
    // 获取服务器成员列表
    async getSeverMembers(context, options: GetServerMembersByPageOptions) {
      if (window.qchat) {
        const res = await window.qchat.qchatServer.getServerMembersByPage(
          options
        );
        context.commit("setSeverMembers", res);
        return res;
      }
    },
    // 获取服务器成员
    async getSeverMember(context, options: GetServerMembersOptions) {
      if (window.qchat) {
        const res = await window.qchat.qchatServer.getServerMembers(options);
        context.commit("setSeverMembers", res);
        return res;
      }
    },
    // 添加下一页服务器成员列表
    async appendSeverMembers(context, options: GetServerMembersByPageOptions) {
      if (window.qchat) {
        const res = await window.qchat.qchatServer.getServerMembersByPage(
          options
        );
        const { datas = [], listQueryTag } = res;
        context.commit("setSeverMembers", {
          datas: [...(context.state.serverMembers?.datas || []), ...datas],
          listQueryTag,
        });
        return res;
      }
    },
    // 获取服务器成员身份组列表
    async getCurMemberRoles(context, options: GetServerRolesByAccidOptions) {
      if (window.qchat) {
        const res = await window.qchat.qchatRole.getServerRolesByAccid(options);
        context.commit("setCurMemberRoles", res);
        return res;
      }
    },
    // 根据severId获取server
    async getServers(context, options: GetServersOptions) {
      if (window.qchat) {
        const res = await window.qchat.qchatServer.getServers(options);
        return res;
      }
    },
    // 根据severId删除server
    async deleteServers(context, options: DeleteServerOptions) {
      if (window.qchat) {
        const res = await window.qchat.qchatServer.deleteServer(options);
        return res;
      }
    },
    // 申请加入服务器
    async applySeverJoin(context, options: ApplyServerJoinOptions) {
      if (window.qchat) {
        const res = await window.qchat.qchatServer.applyServerJoin({
          ...options,
          ps: options.ps || "",
        });
        return res;
      }
    },
    // 创建服务器
    async createServer(context, options: CreateServerOptions) {
      if (window.qchat) {
        const res = await window.qchat.qchatServer.createServer(options);
        return res;
      }
    },
    // 更新服务器
    async updateServer(context, options: UpdateServerOptions) {
      if (window.qchat) {
        const res = await window.qchat.qchatServer.updateServer(options);
        return res;
      }
    },
    // 删除服务器提醒
    async deleteServerTip(context, options: SendSystemNotificationOptions) {
      if (window.qchat) {
        await window.qchat.qchatMsg.sendSystemNotification(options);
      }
    },

    // 获取服务器角色组列表
    async getServerRoles(context, options: GetServerRolesOptions) {
      if (window.qchat) {
        const res = await window.qchat.qchatRole.getServerRoles(options);
        if (res.roles && res.roles.length > 0) {
          context.commit("setCurServerRoles", res.roles);
        }
        return res;
      }
    },
    //将身份组加入频道
    async addChannelRole(context,options:AddChannelRoleOptions){
      if (window.qchat) {
        const res = await window.qchat.qchatRole.addChannelRole(options);
        return res;
      }
    },
    // 创建服务器角色组
    async createServerRole(context, options: CreateServerRoleOptions) {
      if (window.qchat) {
        const res = await window.qchat.qchatRole.createServerRole(options);
        //新增时设置默认权限
        const udpateOptions = {
          serverId: options.serverId,
          roleId: res.roleId,
          /**
           * 权限
           */
          auths: {
            accountInfoOther: 'deny',
            accountInfoSelf: 'deny',
            deleteMsg:'deny',
            inviteServer: 'allow',
            kickServer: 'deny',
            manageBlackWhiteList: 'deny',
            manageChannel: 'deny',
            manageRole:'deny',
            manageServer: 'deny',
            recallMsg: 'deny',
            remindEveryone: 'deny',
            remindOther: 'deny',
            sendMsg: 'allow'
        },
          /**
           * 优先级，越小的数字优先级越高
           */
          priority: options.priority
        }
        context.dispatch("updateServerRole", udpateOptions);
        return res;
      }
    },
    // 服务器角色组排序
    async updateServerRolePriorities(
      context,
      options: UpdateServerRolePrioritiesOptions
    ) {
      if (window.qchat) {
        const res = await window.qchat.qchatRole.updateServerRolePriorities(
          options
        );
        return res;
      }
    },
    //订阅服务器
    async subscribeServer(context,options:SubscribeServerOptions){
      if (window.qchat) {
        const res = await window.qchat.qchatServer.subscribeServer(options);
        return res;
      }
    },
    // 删除服务器角色组
    async deleteServerRole(context, options: DeleteServerRoleOptions) {
      if (window.qchat) {
        const res = await window.qchat.qchatRole.deleteServerRole(options);
        return res;
      }
    },
    // 更新服务器角色组
    async updateServerRole(context, options: UpdateServerRoleOptions) {
      if (window.qchat) {
        const res = await window.qchat.qchatRole.updateServerRole(options);
        context.commit("setSettingServerRole", res);
        context.dispatch("getServerRoles", { serverId: res.serverId });
        return res;
      }
    },
    // 获取服务器角色组成员
    async getMembersFromServerRole(
      context,
      options: GetMembersFromServerRoleOptions
    ) {
      if (window.qchat) {
        const res = await window.qchat.qchatRole.getMembersFromServerRole(
          options
        );
        return res;
      }
    },
    // 将某些人加入某服务器身份组
    async addMembersToServerRole(
      context,
      options: AddMembersToServerRoleOptions
    ) {
      if (window.qchat) {
        const res = await window.qchat.qchatRole.addMembersToServerRole(
          options
        );
        return res;
      }
    },
    // 将某些人加入某服务器身份组
    async removeMembersFromServerRole(
      context,
      options: RemoveMembersFromServerRoleOptions
    ) {
      if (window.qchat) {
        const res = await window.qchat.qchatRole.removeMembersFromServerRole(
          options
        );
        return res;
      }
    },
    //根据用户 ID 获取其已经分配的身份组列表
    async getServerRolesByAccid(
      context,
      options: GetServerRolesByAccidOptions
    ) {
      if (window.qchat) {
        const res = await window.qchat.qchatRole.getServerRolesByAccid(options);
        return res;
      }
    },
    //更新身份组
    async updateMemberRole(context, options: UpdateMemberRoleOptions) {
      if (window.qchat) {
        const res = await window.qchat.qchatRole.updateMemberRole(options);
        return res;
      }
    },
    //根据用户 ID 获取其已经分配的身份组列表
    async removeMemberRole(context, options: RemoveMemberRoleOptions) {
      if (window.qchat) {
        const res = await window.qchat.qchatRole.removeMemberRole(options);
        return res;
      }
    },
    //修改自己服务器成员信息
    async updateMyMemberInfo(context,options: UpdateMyMemberInfoOptions) {
      if(window.qchat){
        const res = await window.qchat.qchatServer.updateMyMemberInfo(options);
        return res;
      }
    },
    //获取个人权限
    async checkPermissionMessage(context,options: CheckPermissionOptions) {
      if(window.qchat){
        const res = await window.qchat.qchatRole.checkPermission(options);
        return res;
      }
    },
    async removeMembersFromServer(context,options: KickServerMembersOptions) {
      if(window.qchat){
        const res = await window.qchat.qchatServer.kickServerMembers(options)
        return res;
      }
    },
    async getMemberRoles(context, options: GetMemberRolesOptions) {
      if(window.qchat){
        const res = await window.qchat.qchatRole.getMemberRoles(options);
        return res;
      }
    },

    async leaveServer(context, options: LeaveServerOptions) {
      if(window.qchat){
        const res = await window.qchat.qchatServer.leaveServer(options);
        return res;
      }
    },
  },
};

export default global;
