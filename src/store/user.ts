import {
  UpdateMyInfoOptions,
  UserNameCard,
} from "nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface";
import { Module } from "vuex";

import { TRootState } from "./global";

type TState = {
  userProfile: UserNameCard;
};

const userModule: Module<TState, TRootState> = {
  namespaced: true,

  state: () => ({
    userProfile: {} as UserNameCard,
  }),
  mutations: {
    setUserProfile(state, payload: UserNameCard) {
      state.userProfile = payload;
    },
  },
  actions: {
    async updateMyNameCard(context, payload: UpdateMyInfoOptions) {
      if (!window.nim) {
        throw new Error("no login");
      }
      const newUserProfile = await window.nim.user.updateMyNameCard(payload);
      context.commit("setUserProfile", newUserProfile);
    },
  },
};

export default userModule;
