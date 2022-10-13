<template>
  <LoginModal
    :visible="visible"
    :onLogin="loginHandler"
    :onSend="sendHandler"
    @closeLoginModal="closeLoginModal"
  />
</template>

<script lang="ts">
import LoginModal from "./LoginModal.vue";
import { ref } from "vue";
import Request from "../apis";
import { memoryIns, sessionIns, localIns } from "../utils/storage";
import { emptyFunc } from "@/utils";
import { context } from "ant-design-vue/lib/vc-image/src/PreviewGroup";

export const TOKEN = `${process.env.VUE_APP_ENV}_token`;

export const memoryFuncMap = {
  localStorage: localIns,
  sessionStorage: sessionIns,
  memory: memoryIns,
};

export const memoryFuncCreator = (
  memoryMode: "localStorage" | "sessionStorage" | "memory"
) => memoryFuncMap[memoryMode];

export const afterLogout = (
  memoryMode: "localStorage" | "sessionStorage" | "memory"
) => {
  memoryFuncMap[memoryMode].remove(TOKEN);
};

export default {
  name: "LoginController",
  components: { LoginModal },
  props: {
    autoLogin: {
      type: Boolean,
      default: true,
    },
    memoryMode: {
      type: String,
      default: "localStorage",
    },
    baseDomain: {
      type: String,
      default: "",
    },
    appkey: {
      type: String,
      default: "",
    },
    parentScope: {
      type: Number,
      default: undefined,
    },
    scope: {
      type: Number,
      default: undefined,
    },
    onLogin: {
      type: Function,
      default: emptyFunc,
    },
  },
  setup(props: any, context: any) {
    const visible = ref<boolean>(false);
    const storage = memoryFuncCreator(props.memoryMode);

    const onLogin = async (token: any) => {
      const isLoginSuccess = await props.onLogin(token);

      if (!isLoginSuccess) {
        visible.value = true;
        return;
      }

      visible.value = false;
    };

    const init = async () => {
      Request.setHeaders({
        appkey: props.appkey,
        scope: props.scope,
        parentScope: props.parentScope,
      });

      Request.setBaseDomain(props.baseDomain);

      const token = storage.get(TOKEN);
      if (!token) {
        visible.value = true;
        return;
      }

      if (!props.autoLogin) {
        visible.value = true;
        return;
      }

      await onLogin(token);
    };

    init();

    return {
      visible,
      sendHandler: (phone: string) => {
        return Request.sendSmsCode(phone);
      },
      closeLoginModal: () => {
        visible.value = false;
        context.emit("closeLoginDialog");
      },
      loginHandler: async ({
        phone,
        code,
      }: {
        phone: string;
        code: string;
      }) => {
        const res = await Request.smsLogin({
          mobile: phone,
          code,
        });
        storage.set(TOKEN, res);
        await onLogin(res);
      },
    };
  },
};
</script>

<style scoped lang="less"></style>
