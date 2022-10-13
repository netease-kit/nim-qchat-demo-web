<template>
  <div class="channel-bar-container">
    <div class="container__header">
      <div class="server-name">{{ curServer.name }}</div>
      <SeverSetting />
    </div>
    <div class="channel-box">
      <div class="channel-box__header">
        <div class="header-text">{{ $t("频道名") }}</div>
        <div class="header-bar" @click="createVisible = true">
          <PlusOutlined :style="{ color: '#A3A4A9', fontSize: '16px' }" />
        </div>
      </div>
      <div class="channel-box__list">
        <div
          class="list-item"
          v-for="channel in channelList"
          :key="channel.channelId"
          :class="{
            active:
              currentChannel && currentChannel.channelId === channel.channelId,
          }"
          @click="setCurChannel(channel)"
        >
          <div class="item-name">
            <NumberOutlined class="item-name-icon" />
            <!-- <Typography :ellipsis="true"></Typography> -->
            <span>{{ channel.name }}</span>
          </div>
          <div class="item-bar">
            <Badge
              :count="channel.unreadCount"
              :number-style="{
                marginRight: '15px',
                height: '18px',
                backgroundColor: '#ff4d4f',
                color: '#fff',
                boxShadow: '0 0 0 1px #ff4d4f inset',
              }"
            >
            </Badge>
            <UserAddOutlined
              class="item-bar__icon"
              @click="gotoServerInvite(channel.serverId)"
            />
            <SettingOutlined
              class="item-bar__icon"
              @click.stop="gotoChannelSettings(channel)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <Modal
    v-model:visible="createVisible"
    :title="$t('创建新频道')"
    class="dark"
    :footer="null"
    :width="520"
  >
    <template #closeIcon>
      <CloseCircleOutlined />
    </template>
    <!-- <template #footer>
      <a-button
        key="submit"
        type="primary"
        @click="handleOk"
        >{{ $t("频道名") }}</a-button
      >
    </template> -->
    <Form
      ref="formRef"
      class="create-form form--dark"
      :hideRequiredMark="true"
      :model="formState"
      layout="vertical"
      :rules="rules"
    >
      <FormItem :label="$t('频道名称')" name="name">
        <Input
          v-model:value="formState.name"
          :maxlength="50"
          :placeholder="$t('请输入频道名称')"
        ></Input>
      </FormItem>
      <FormItem :label="$t('频道主题')" name="topic">
        <Textarea
          :rows="6"
          v-model:value="formState.topic"
          :maxlength="64"
          :placeholder="$t('请输入频道主题')"
        ></Textarea>
      </FormItem>
      <FormItem :label="$t('私密频道')" name="viewMode">
        <div class="tip">
          {{ $t("将频道设为私密，则只有白名单成员能够查看此频道") }}
        </div>
        <Switch
          v-model:checked="formState.viewMode"
          :checkedValue="1"
          :unCheckedValue="0"
        ></Switch>
      </FormItem>
      <div class="bottom-button">
        <Button type="primary" :loading="buttonVisible" @click="onSubmit"
          >创建</Button
        >
      </div>
    </Form>
  </Modal>

  <Modal
    :visible="settingsVisible"
    wrapClassName="full-modal"
    :footer="null"
    width="100%"
    @cancel="handleModalCancel"
  >
    <template #closeIcon>
      <CloseCircleOutlined />
    </template>
    <ChannelSettings
      @modalClose="settingsVisible = false"
      @deleteChannelEvent="receiveDeleteChannelEvent"
    ></ChannelSettings>
  </Modal>

  <ServerInvite
    :visible="serverInviteVisible"
    :id="serverInviteId"
    :modalClose="handleServerInviteClose"
  ></ServerInvite>
</template>

<script lang="ts">
import {
  computed,
  onBeforeMount,
  reactive,
  ref,
  toRaw,
  UnwrapRef,
  watch,
} from "vue";
import { useStore } from "vuex";
import { ChannelInfo } from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatChannelServiceInterface";
import {
  PlusOutlined,
  NumberOutlined,
  SettingOutlined,
  CloseCircleOutlined,
  UserAddOutlined,
} from "@ant-design/icons-vue";
import { Form, Modal, Input, Button, Switch, Badge } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import ChannelSettings from "./ChannelSettings/index.vue";
import SeverSetting from "./ServerSettings/index.vue";
import ServerInvite from "./ServerInvite.vue";

const FormItem = Form.Item;
const Textarea = Input.TextArea;

interface FormState {
  serverId: string;
  name: string;
  topic: string;
  viewMode: number;
}

export default {
  name: "ChannelBar",
  components: {
    Form,
    Modal,
    Input,
    Button,
    FormItem,
    Textarea,
    Switch,
    Badge,
    PlusOutlined,
    NumberOutlined,
    SettingOutlined,
    CloseCircleOutlined,
    UserAddOutlined,
    ChannelSettings,
    SeverSetting,
    ServerInvite,
  },
  setup() {
    const { t: $t } = useI18n();
    const store = useStore();
    const createVisible = ref<boolean>(false);
    const settingsVisible = ref<boolean>(false);
    const buttonVisible = ref<boolean>(false);
    const serverInviteVisible = ref<boolean>(false);
    const serverInviteId = ref<string>("");
    const channelList = computed(() => store.state.channel.channelList);
    const currentChannel = computed(() => store.state.channel.currentChannel);
    const curServer = computed(() => store.state.server.curServer || {});
    const setCurChannel = (channel: ChannelInfo) => {
      store.commit("channel/setCurChannel", channel);
      store.commit("channel/resetChannelUnReadCount");
      store
        .dispatch("channel/getMembersByPage", {
          serverId: store.state.server.curServer.serverId,
          channelId: channel.channelId,
          timetag: 0,
          limit: 100,
        })
        .then((res) => {
          store.commit("channel/setChannelMembers", res);
          store.commit("server/setSeverMembers", res);
        });
    };
    const receiveDeleteChannelEvent = (data) => {
      settingsVisible.value = false;
      // 重新请求频道列表
      store
        .dispatch("channel/getChannelsByPage", {
          serverId: store.state.server.curServer.serverId,
        })
        .then((resp) => {
          // 默认进入频道1
          setCurChannel(store.state.channel.channelList[0]);
        });
    };

    onBeforeMount(() => {
      store.dispatch("server/getSeverMembers", {
        serverId: store.state.server.curServer.serverId,
        timetag: 0,
      });
    });

    // 表单元素
    const formState: UnwrapRef<FormState> = reactive({
      serverId: "",
      name: "",
      topic: "",
      viewMode: 0,
    });

    const formRef = ref();

    // 表单校验规则
    const rules = {
      name: [
        {
          required: true,
          message: $t("请输入频道名称"),
          trigger: "blur",
        },
      ],
      // topic: [
      //   {
      //     required: true,
      //     message: $t("请输入频道主题"),
      //     trigger: "blur",
      //   },
      // ],
    };

    watch(
      () => store.state.server.curServer,
      async (curServer: ChannelInfo) => {
        formState.serverId = curServer.serverId;
        await store.dispatch("channel/getChannelsByPage", {
          serverId: curServer.serverId,
          timetag: 0,
        });
        // 默认选中该 server 下的第一个 channel
        setCurChannel(channelList.value[0]);
      },
      {
        immediate: true,
      }
    );

    return {
      channelList,
      currentChannel,
      curServer,
      receiveDeleteChannelEvent,
      setCurChannel,
      // 表单相关
      onSubmit: () => {
        buttonVisible.value = true;
        formRef.value.validate().then(async () => {
          const formdata = toRaw(formState);
          await store.dispatch("channel/createChannel", formdata);
          await store.dispatch("channel/getChannelsByPage", {
            serverId: formdata.serverId,
            timetag: 0,
          });

          await setCurChannel(channelList.value[0]);
          formState.name = "";
          formState.topic = "";
          formState.viewMode = 0;
          createVisible.value = false;
          buttonVisible.value = false;
        });
      },
      formRef,
      createVisible,
      formState,
      rules,

      serverInviteVisible,
      serverInviteId,

      // 设置弹窗
      settingsVisible,
      buttonVisible,
      gotoChannelSettings(channel: ChannelInfo) {
        store.commit("channel/setCurChannel", channel);
        settingsVisible.value = true;
      },
      handleModalCancel() {
        Modal.confirm({
          title: () => $t("退出编辑"),
          content: () => `退出编辑状态，表单内容不保存`,
          okText: () => $t("确认"),
          cancelText: () => $t("取消"),
          onOk() {
            settingsVisible.value = false;
          },
          onCancel() {
            console.log("onCancel");
          },
        });
      },
      gotoServerInvite(serverId: string) {
        serverInviteId.value = serverId;
        serverInviteVisible.value = true;
      },
      handleServerInviteClose() {
        serverInviteVisible.value = false;
      },
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.channel-bar-container {
  text-align: left;
  // .channel-box {
  // }
}
.container__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 17px 20px 8px;
  line-height: 28px;
  font-size: 16px;
  border-bottom: 1px solid #202126;
  position: relative;
  .server-name {
    width: 170px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.channel-box__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 14px 8px 14px;
  font-size: 14px;
  color: #a3a4a9;
  .header-bar {
    cursor: pointer;
  }
}
.channel-box__list {
  font-size: 14px;
  .list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 14px;
    height: 30px;
    &.active {
      background: #212326;
    }
  }
  .item-name {
    flex: 1;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 10px;
  }
  .item-name-icon {
    color: #464a54;
    font-size: 14px;
    margin-right: 4px;
  }
}
.item-bar__icon {
  color: #464a54;
  font-size: 12px;
  margin-right: 16px;
  cursor: pointer;
  &:last-child {
    margin-right: 0px;
  }
}

.create-form {
  .bottom-button {
    margin: 0 -24px;
    padding: 16px 20px 0;
    border-top: 1px solid #474a52;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  .tip {
    margin-bottom: 8px;
    font-size: 12px;
    color: #6e6f74;
  }
}
</style>
