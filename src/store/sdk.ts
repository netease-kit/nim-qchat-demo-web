import QChatSDK from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK";
import NIMSDK from "nim-web-sdk-ng/dist/NIM_BROWSER_SDK";
import { Module, Store } from "vuex";
import { TRootState } from "./global";
import { nimAttachEvents, qchatAttachEvents } from "@/utils/events";

window.QChatSDK = QChatSDK;
window.NIMSDK = NIMSDK;

type TState = {
  // qchat: QChatSDK | null;
};

const sdk: Module<TState, TRootState> = {
  namespaced: true,
  state: () => ({
    // 实例化后的变量
    // qchat: null,
  }),
  mutations: {
    // setQChat(state, payload: QChatSDK) {
    //   state.qchat = payload;
    // },
  },
  actions: {
    async qchatLogin(
      context,
      options: {
        appkey: string;
        token: string;
        account: string;
        linkAddresses: string[];
        authType: number;
        store: Store<any>;
      }
    ) {
      if (window.qchat) {
        return;
      }
      const qchat = new QChatSDK(options);
      window.qchat = qchat;
      qchatAttachEvents(qchat, options.store);
      await qchat.login();
      // context.commit("setQChat", qchat);
      // console.log("1231231");
      // context.dispatch("server/logined", qchat.account, { root: true });
    },
    async qchatLogout() {
      const qchat = window.qchat;
      if (!qchat) {
        throw new Error("No login");
      }
      await qchat.logout();
    },
    async qchatDestroy() {
      let qchat = window.qchat;
      if (!qchat) {
        throw new Error("No login");
      }
      await qchat.destroy();
      qchat = null;
      window.qchat = null;
    },

    async nimLogin(
      context,
      options: {
        appkey: string;
        token: string;
        account: string;
        store: Store<any>;
      }
    ) {
      if (window.nim) {
        return;
      }
      const nim = new NIMSDK(options, {});
      window.nim = nim;
      nimAttachEvents(nim, options.store);
      await nim.connect();
      // context.commit("setQChat", qchat);
      // console.log("1231231");
      // context.dispatch("server/logined", qchat.account, { root: true });
    },
    async nimGetQChatAddress() {
      const nim = window.nim;
      if (!nim) {
        throw new Error("No login");
      }
      return await nim.plugin.getQChatAddress({ ipType: 0 });
    },
    async nimLogout() {
      const nim = window.nim;
      if (!nim) {
        throw new Error("No login");
      }
      await nim.disconnect();
    },
    async nimDestroy() {
      const nim = window.nim;
      if (!nim) {
        throw new Error("No login");
      }
      await nim.destroy();
    },
  },
};

export default sdk;
