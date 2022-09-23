<template>
  <ChatContent
    v-if="hasCurrentChannel"
    :msgs="msgs"
    :channelName="channelName"
    :myAccid="myAccid"
    :myAvatar="myAvatar"
    :topic="topic"
    :isNoMore="isNoMore"
    :imgUploading="imgUploading"
    :fileUploading="fileUploading"
    :onSendText="onSendText"
    :onSendFile="onSendFile"
    :onSendImg="onSendImg"
    :onResendText="onResendText"
    :onResendImg="onResendImg"
    :onResendFile="onResendFile"
    :onLoadMore="onLoadMore"
    :sendDisabled="sendDisabled"
  />
  <div v-else>当前服务器下没有频道~</div>
</template>

<script lang="ts">
import ChatContent from "./ChatContent.vue";
import { useStore } from "vuex";
import { watch, ref, computed, onBeforeMount } from "vue";
import { QChatMessage } from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatMsgServiceInterface";

const HISTORY_LIMIT = 100;

export default {
  components: {
    ChatContent,
  },

  setup() {
    const store = useStore();

    const imgUploading = ref<boolean>(false);
    const fileUploading = ref<boolean>(false);
    const isNoMore = ref<boolean>(false);
    const hasCurrentChannel = ref<boolean>(false);
    const sendDisabled = ref<boolean>(false);

    watch(
      () => store.state.channel.currentChannel,
      async (currentChannel) => {
        sendDisabled.value = false;
        if (currentChannel) {
          hasCurrentChannel.value = true;
          const msgs = await store.dispatch("channel/getChannelHistoryMsgs", {
            limit: HISTORY_LIMIT,
          });
          store.commit("channel/setCurChannelMsgs", msgs);
        } else {
          hasCurrentChannel.value = false;
        }
      }
    );

    const sendMessage = (type: string, file) => {
      if (type === "textMsg") {
        store.dispatch("channel/sendTextMsg", { body: file });
        return;
      }
      if (type === "SendImg") {
        store.dispatch("channel/sendImageMsg", {
          file,
          onUploadStart: () => {
            imgUploading.value = true;
          },
          onUploadDone: () => {
            imgUploading.value = false;
          },
        });
        return;
      }
      if (type === "SendFile") {
        store.dispatch("channel/sendFileMsg", {
          file,
          onUploadStart: () => {
            fileUploading.value = true;
          },
          onUploadDone: () => {
            fileUploading.value = false;
          },
        });
        return;
      }
    };

    const checkSendAuth = (type: string, file) => {
      sendDisabled.value = false;
      if (
        store.state.server.curServer.owner ===
        store.state.user.userProfile.account
      ) {
        sendDisabled.value = false;
        sendMessage(type, file);
      } else {
        store
          .dispatch("server/checkPermissionMessage", {
            serverId: store.state.server.curServer.serverId,
            channelId: store.state.channel.currentChannel.channelId,
            auth: "sendMsg",
          })
          .then((resp) => {
            if (resp) {
              sendDisabled.value = false;
              sendMessage(type, file);
            }
          });
      }
    };
    return {
      sendDisabled,
      checkSendAuth,
      msgs: computed(() => store.state.channel.currentChannelMsgs),
      channelName: computed(() => store.state.channel.currentChannel?.name),
      topic: computed(() => store.state.channel.currentChannel?.topic),
      isNoMore,
      myAccid: window.qchat?.account,
      imgUploading,
      fileUploading,
      hasCurrentChannel,
      onSendText: (text: string) => {
        checkSendAuth("textMsg", text);
      },
      onSendImg: (file: File) => {
        checkSendAuth("SendImg", file);
      },
      onSendFile: (file: File) => {
        checkSendAuth("SendFile", file);
      },
      onResendText: (res: QChatMessage) => {
        store.dispatch("channel/resendTextMsg", res);
      },
      onResendImg: (res: QChatMessage) => {
        store.dispatch("channel/resendImageMsg", res);
      },
      onResendFile: (res: QChatMessage) => {
        store.dispatch("channel/resendFileMsg", res);
      },
      onLoadMore: async (lastTime: number) => {
        const msgs = await store.dispatch("channel/loadMoreHistoryMsgs", {
          lastTime,
          limit: HISTORY_LIMIT,
        });
        if (msgs.length < HISTORY_LIMIT) {
          isNoMore.value = true;
        }
      },
    };
  },
};
</script>

<style scoped lang="less"></style>
