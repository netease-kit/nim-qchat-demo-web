<template>
  <div class="chatroomWrapper">
    <div class="chatroomContent" ref="contentRef" @scroll="scrollHandler">
      <div>
        <div v-if="isNoMore">{{ $t("没有更多消息了") }}~</div>
        <div v-else-if="loadingMore">
          <LoadingOutlined />
          <span style="margin-left: 10px">{{ $t("正在加载，请稍候") }}</span>
        </div>
      </div>
      <div v-if="msgs.length">
        <ChatCard
          v-for="item in msgs"
          v-bind:key="item.msgIdClient"
          :msg="item"
          :myAvatar="myAvatar"
          :myAccid="myAccid"
          :onResendText="onResendText"
          :onResendImg="onResendImg"
          :onResendFile="onResendFile"
        />
      </div>
      <div v-else class="emptyChatroomContent">
        <div>{{ $t("欢迎来到") }}</div>
        <h1>#{{ channelName }}</h1>
        <div>
          {{ $t("这是") }} #{{ channelName }} {{ $t("的起点") }}。{{ topic }}
        </div>
      </div>
    </div>
    <div class="chatroomControllerWrapper">
      <div class="chatroomInputWrapper">
        <Textarea
          id="chatroomInputId"
          class="chatroomInput"
          v-model:value="curText"
          :placeholder="inputPlaceholder"
          :disabled="sendDisabled"
          @change="inputChangeHandler"
          @pressEnter="pressEnterHandler"
          @blur="handleInputBlur"
        />
        <div class="chatroomController">
          <Popover placement="topRight">
            <template #content>
              <div style="width: 400px">
                <span
                  style="padding: 5px 0 0 5px; font-size: 16px; cursor: pointer"
                  v-for="(value, i) in emjjData"
                  :key="i"
                  @click="insertEmj(i)"
                  >{{ value }}</span
                >
              </div>
            </template>
            <SmileOutlined
              :style="{
                color: '#A3A4A9',
                width: '16px',
                height: '16px',
                marginLeft: '15px',
              }"
            />
          </Popover>
          <Upload
            :before-upload="uploadImgHandler"
            :showUploadList="false"
            accept=".jpg,.png,.jpeg"
            :disabled="sendDisabled"
          >
            <Button
              class="chatroomButton"
              type="text"
              :loading="imgUploading"
              :disabled="sendDisabled"
            >
              <template #icon>
                <IconFont
                  type="icon-tupian"
                  :style="{ color: '#A3A4A9', width: '18px', height: '18px' }"
                />
              </template>
            </Button>
          </Upload>
          <Upload
            :before-upload="uploadFileHandler"
            :showUploadList="false"
            :disabled="sendDisabled"
          >
            <Button
              class="chatroomButton"
              type="text"
              :loading="fileUploading"
              :disabled="sendDisabled"
            >
              <template #icon>
                <FileSearchOutlined
                  :style="{ color: '#A3A4A9', width: '16px', height: '16px' }"
                />
              </template>
            </Button>
          </Upload>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { Input, Button, Upload, Modal, Popover } from "ant-design-vue";
import {
  FileSearchOutlined,
  LoadingOutlined,
  SmileOutlined,
} from "@ant-design/icons-vue";
import { useStore } from "vuex";
import { emptyFunc, filterStr, isLt } from "@/utils";
import { QChatMessage } from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatMsgServiceInterface";
import ChatCard from "./ChatCard.vue";
import IconFont from "../IconFont";
import { useI18n } from "vue-i18n";

const Textarea = Input.TextArea;

export default {
  name: "ChatContent",
  components: {
    Textarea,
    Button,
    Upload,
    FileSearchOutlined,
    ChatCard,
    IconFont,
    LoadingOutlined,
    SmileOutlined,
    Popover,
  },
  props: {
    msgs: {
      type: Array,
      default: [] as QChatMessage[],
    },
    channelName: {
      type: String,
      default: "频道名称",
    },
    topic: {
      type: String,
      default: "频道主题",
    },
    imgUploading: {
      type: Boolean,
      default: false,
    },
    fileUploading: {
      type: Boolean,
      default: false,
    },
    sendDisabled: {
      type: Boolean,
      default: false,
    },
    isNoMore: {
      type: Boolean,
      default: false,
    },
    myAccid: {
      type: String,
      default: "",
    },
    myAvatar: {
      type: String,
      default: "",
    },
    onSendText: {
      type: Function,
      default: emptyFunc,
    },
    onSendImg: {
      type: Function,
      default: emptyFunc,
    },
    onSendFile: {
      type: Function,
      default: emptyFunc,
    },
    onResendText: {
      type: Function,
      default: emptyFunc,
    },
    onResendImg: {
      type: Function,
      default: emptyFunc,
    },
    onResendFile: {
      type: Function,
      default: emptyFunc,
    },
    onLoadMore: {
      type: Function,
      default: emptyFunc,
    },
  },
  setup(props: any) {
    const store = useStore();
    const { t: $t } = useI18n();
    const curText = ref<string>("");
    const cursorIndex = ref<number>(0);
    const contentRef = ref<any>(null);
    const loadingMore = ref<boolean>(false);

    const emjjData = [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "🤣",
      "😂",
      "🙂",
      "🙃",
      "😉",
      "😊",
      "😇",
      "🥰",
      "😍",
      "🤩",
      "😘",
      "😗",
      "☺️",
      "☺",
      "😚",
      "😙",
      "😋",
      "😛",
      "😜",
      "🤪",
      "😝",
      "🤑",
      "🤗",
      "🤭",
      "🤫",
      "🤔",
      "🤐",
      "🤨",
      "😐",
      "😑",
      "😶",
      "😏",
      "😒",
      "🙄",
      "😬",
      "🤥",
      "😌",
      "😔",
      "😪",
      "🤤",
      "😴",
      "😷",
      "🤒",
      "🤕",
      "🤢",
      "🤮",
      "🤧",
      "🥵",
      "🥶",
      "🥴",
      "😵",
      "🤯",
      "🤠",
      "🥳",
      "😎",
      "🤓",
      "🧐",
      "😕",
      "😟",
      "🙁",
      "☹️",
      "😮",
      "😯",
      "😲",
      "😳",
      "🥺",
      "😦",
      "😧",
      "😨",
      "😰",
      "😥",
      "😢",
      "😭",
      "😱",
      "😖",
      "😣",
      "😞",
      "😓",
      "😩",
      "😫",
      "😤",
      "😡",
      "😠",
      "🤬",
      "😈",
      "👿",
      "💀",
      "☠️",
      "☠",
      "💩",
      "🤡",
      "👹",
      "👺",
      "👻",
      "👽",
      "👾",
      "🤖",
      "😺",
      "😸",
      "😹",
      "😻",
      "😼",
      "😽",
      "🙀",
      "😿",
      "😾",
      "🙈",
      "🙉",
      "🙊",
      "💋",
      "💌",
      "💘",
      "💝",
      "💖",
      "💗",
      "💓",
      "💞",
      "💕",
      "💟",
      "❣️",
      "❣",
      "💔",
      "❤️",
      "❤",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "💯",
      "💢",
      "💥",
      "💫",
      "💦",
      "💨",
      "🕳️",
      "🕳",
      "💣",
      "💬",
      "👁️‍🗨️",
      "👁‍🗨️",
      "👁️‍🗨",
      "👁‍🗨",
      "🗨️",
      "🗨",
      "🗯️",
      "🗯",
      "💭",
      "💤",
      "👋",
    ];

    watch(
      () => props.msgs,
      () => {
        nextTick(() => {
          if (contentRef.value.scrollTop > contentRef.value.scrollHeight / 2) {
            contentRef.value.scrollTop = contentRef.value.scrollHeight;
          }
        });
      }
    );

    return {
      emjjData,
      loadingMore,
      curText,
      contentRef,
      cursorIndex,
      inputPlaceholder: computed(() =>
        props.sendDisabled
          ? $t("您暂无发送消息权限")
          : `${$t("按下 Enter 发送消息给")} #${props.channelName} ${$t(
              "内的人，按下 Shift + Enter 换行"
            )}`
      ),
      handleInputBlur: (e: any) => {
        cursorIndex.value = e.srcElement.selectionStart;
      },
      insertEmj: (e: any) => {
        const insertVal = emjjData[e];
        var curTextVal =
          curText.value.slice(0, cursorIndex.value) +
          insertVal +
          curText.value.slice(cursorIndex.value);
        curText.value = curTextVal;
        cursorIndex.value = cursorIndex.value + insertVal.length;
      },
      inputChangeHandler: (e: any) => {
        curText.value = e.target.value;
      },
      pressEnterHandler: (e: any) => {
        if (!e.shiftKey) {
          e.preventDefault();
          const text = filterStr(curText.value.trim());
          if (text) {
            props.onSendText(text);
            curText.value = "";
          }
        }
      },
      scrollHandler: async (e: any) => {
        if (
          e.target.scrollTop === 0 &&
          e.target.scrollHeight - e.target.clientHeight > 0 &&
          !loadingMore.value &&
          !props.isNoMore &&
          props.msgs.length
        ) {
          loadingMore.value = true;
          await props.onLoadMore(props.msgs[0].time);
          loadingMore.value = false;
          store.commit("channel/resetChannelUnReadCount", {}, { root: true });
        }
      },
      uploadImgHandler: (file: File) => {
        // 图片暂不做大小限制
        // if (isLt(file.size, 100)) {
        //   props.onSendImg(file);
        // } else {
        //   message.error("图片大小最大支持100M");
        // }
        props.onSendImg(file);
      },
      uploadFileHandler: (file: File) => {
        if (isLt(file.size, 200)) {
          props.onSendFile(file);
        } else {
          Modal.info({
            title: $t("提醒"),
            content: () => $t("文件大小最大支持200M"),
          });
        }
      },
    };
  },
};
</script>

<style scoped lang="less">
.chatroomWrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .chatroomContent {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }
  .emptyChatroomContent {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    h1 {
      color: #fff;
      margin: 0;
      font-size: 24px;
    }
    div {
      font-size: 16px;
      color: #b3b7bc;
    }
  }
  .chatroomControllerWrapper {
    padding: 24px 20px;
    width: 100%;

    .chatroomInputWrapper {
      border-radius: 8px;
      background-color: #3c3e45;
      display: flex;
      align-items: center;
      width: 100%;
      height: 46px;
    }

    .chatroomButton {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chatroomInput {
      flex: 1;
      height: 100%;
      line-height: 2.8715;
      border-radius: 8px;
      border: none;
      outline: none;
      resize: none;
      color: #fff;
      background-color: #3c3e45;
      font-size: 14px;
      &::placeholder {
        color: #74767a;
      }
      &:active,
      &:focus {
        border: none;
        outline: none;
        box-shadow: none;
      }
    }

    .chatroomController {
      display: flex;
      align-items: center;
      padding: 0 15px;
    }
  }
}
</style>
