<template>
  <Modal
    :visible="visible"
    class="dark"
    wrapClassName="full-modal"
    :footer="null"
    width="100%"
    @cancel="handleModalCancel"
  >
    <template #closeIcon>
      <CloseCircleOutlined />
    </template>
    <div class="common-settings-container" v-if="curServer">
      <div class="setting-menu-wrap">
        <div class="title" :title="curServer.name">{{ curServer.name }}</div>
        <div class="qchat-setting-menu">
          <div class="menu-item menu-title">{{ $t("基本设置") }}</div>
          <div
            class="menu-item"
            :class="{ active: selectKey === 'info' }"
            @click="toServerSetting('info')"
          >
            {{ $t("服务器概括") }}
          </div>
          <div
            class="menu-item"
            :class="{ active: selectKey === 'role' }"
            @click="toServerSetting('role')"
          >
            {{ $t("身份组") }}
          </div>
          <div class="line"></div>
          <div class="menu-item menu-title">{{ $t("用户管理") }}</div>
          <div
            class="menu-item"
            :class="{ active: selectKey === 'member' }"
            @click="toServerSetting('member')"
          >
            {{ $t("成员") }}
          </div>
          <div
            v-if="ifCanDeleteServer"
            class="menu-item danger"
            @click="deleteServer"
          >
            删除服务器
          </div>
          <div
            v-if="!ifCanDeleteServer"
            class="menu-item danger"
            @click="leaveFromServer"
          >
            退出服务器
          </div>
        </div>
      </div>
      <div class="setting-content-wrap">
        <ServerInfo
          v-if="selectKey === 'info'"
          :cancelVisible="cancelVisible"
          :canEdit="ifManageServer"
        />
        <RoleGroup
          v-else-if="selectKey === 'role'"
          :canEdit="ifManageRole"
          :ifKickServer="ifKickServer"
        />
        <MemberInfo
          v-else-if="selectKey === 'member'"
          :canEdit="ifKickServer"
        />
      </div>
    </div>
  </Modal>
  <Modal
    v-model:visible="inviteVisible"
    class="dark"
    :width="520"
    title="向好友发送邀请 ID"
    :footer="null"
  >
    <div class="id-box" v-if="curServer">
      ID:
      <Text
        :style="{ color: '#a3a4a9' }"
        :copyable="{ text: curServer.serverId }"
        ><span class="id">{{ curServer.serverId }}</span>
        <template v-slot:copyableIcon>
          <Button type="primary" @click="copy">{{
            $t("复制")
          }}</Button></template
        ></Text
      >
    </div>
  </Modal>
  <DownOutlined
    :style="{ fontSize: '12px' }"
    @click.stop="selectVisible = !selectVisible"
    v-show="!selectVisible"
  />
  <UpOutlined
    :style="{ fontSize: '12px' }"
    @click.stop="selectVisible = !selectVisible"
    v-show="selectVisible"
  />
  <div class="server-setting-select" v-show="selectVisible" @click.stop="">
    <div class="item" @click="inviteUser">
      <IconFont type="icon-tianjiachengyuan" />{{ $t("邀请他人") }}
    </div>
    <div class="item" @click="toServerSetting('info')">
      <IconFont type="icon-shezhi" />{{ $t("服务器设置") }}
    </div>
    <div class="item" @click="personalInfoSetting">
      <UserOutlined />{{ $t("个人资料") }}
      <!-- <IconFont type="icon-user" />{{ $t("个人资料") }} -->
    </div>
  </div>
  <Modal
    :visible="visibleUser"
    wrapClassName="full-modal"
    @cancel="handleModalCancel"
    :footer="null"
    width="100%"
  >
    <template #closeIcon>
      <CloseCircleOutlined />
    </template>
    <div class="settings-container">
      <div class="menu-wrap">
        <div class="title">
          <CommonAvatar
            :avatar="userProfile.avatar"
            :nick="userProfile.nick"
            :accid="userProfile.account"
            :width="36"
            :border="0"
          ></CommonAvatar>
          <span class="title-text">{{ userProfile.nick }}</span>
        </div>
        <div class="qchat-setting-menu">
          <div
            class="menu-item"
            v-for="item in menuList"
            :key="item.key"
            :class="{
              active: selectedKey === item.key,
            }"
            @click="selectedKey = item.key"
          >
            {{ item.name }}
          </div>
          <div class="line"></div>
        </div>
      </div>
      <ProfileSetting
        @modalClose="visibleUser = false"
        v-if="selectedKey === 'ProfileSetting'"
      />
    </div>
  </Modal>
</template>

<script lang="ts">
import {
  DownOutlined,
  UpOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  ConsoleSqlOutlined,
} from "@ant-design/icons-vue";
import { Modal, Button, Typography, message } from "ant-design-vue";
import { Form } from "ant-design-vue/lib/components";
import {
  ref,
  computed,
  onUnmounted,
  createVNode,
  UnwrapRef,
  reactive,
  onMounted,
  watch,
} from "vue";
import { useStore } from "vuex";
import IconFont from "../IconFont";
import ServerInfo from "./modules/ServerInfo.vue";
import RoleGroup from "./modules/RoleGroup.vue";
import MemberInfo from "./modules/MemberInfo.vue";
import { useI18n } from "vue-i18n";
import ProfileSetting from "./modules/UserProfileSetting.vue";
import CommonAvatar from "../CommonAvatar.vue";
interface FormState {
  account: string;
  tel: string;
  nick: string;
  avatar: string;
}
const Text = Typography.Text;

const FormItem = Form.Item;

export default {
  name: "ServerSettings",
  components: {
    Button,
    UpOutlined,
    ServerInfo,
    RoleGroup,
    MemberInfo,
    Modal,
    ProfileSetting,
    CommonAvatar,
    DownOutlined,
    IconFont,
    Text,
    CloseCircleOutlined,
    UserOutlined,
  },
  mounted() {
    this.processdelete();
  },
  setup() {
    const store = useStore();
    const { t: $t } = useI18n();
    const selectKey = ref("info");
    const inviteVisible = ref(false);
    const visibleUser = ref(false);
    const selectVisible = ref(false);
    const visible = ref(false);
    const ifCanDeleteServer = computed(
      () =>
        store.state.server.curServer.owner ===
        store.state.user.userProfile.account
    );
    const ifManageServer = ref(false);
    const ifManageRole = ref(false);
    const ifKickServer = ref(false);
    const menuList = ref([{ key: "ProfileSetting", name: $t("个人资料") }]);
    const selectedKey = ref("ProfileSetting");
    const currentServer = computed(() => store.state.server.curServer);

    // 表单元素
    const rules = {
      nick: [
        {
          required: true,
          message: $t("请输入昵称"),
          trigger: "blur",
        },
      ],
      phone: [
        {
          required: true,
          message: $t("请输入手机号"),
          trigger: "blur",
        },
      ],
    };
    (document.querySelector("body") as HTMLBodyElement).onclick = () => {
      selectVisible.value = false;
    };
    onUnmounted(() => {
      (document.querySelector("body") as HTMLBodyElement).onclick = null;
    });

    let userProfile = store.state.user.userProfile;
    const formState: UnwrapRef<FormState> = reactive({
      nick: userProfile.nick,
      account: userProfile.account,
      tel: userProfile.tel,
      avatar: userProfile.avatar,
    });

    const toServerSetting = (type) => {
      selectKey.value = type;
      if (currentServer.value.owner === store.state.user.userProfile.account) {
        ifManageServer.value = true;
        ifManageRole.value = true;
        ifKickServer.value = true;
        visible.value = true;
        selectVisible.value = false;
      } else {
        store
          .dispatch("server/checkPermissionMessage", {
            serverId: store.state.server.curServer.serverId,
            auth: "manageServer",
          })
          .then((resp) => {
            ifManageServer.value = resp;
          });
        store
          .dispatch("server/checkPermissionMessage", {
            serverId: store.state.server.curServer.serverId,
            auth: "kickServer",
          })
          .then((resp) => {
            ifKickServer.value = resp;
          });
        store
          .dispatch("server/checkPermissionMessage", {
            serverId: store.state.server.curServer.serverId,
            auth: "manageRole",
          })
          .then((resp) => {
            ifManageRole.value = resp;
          });
        visible.value = true;
        selectVisible.value = false;
      }
    };

    return {
      selectVisible,
      inviteVisible,
      visibleUser,
      visible,
      selectKey,
      formState,
      rules,
      menuList,
      userProfile,
      ifCanDeleteServer,
      ifManageServer,
      ifManageRole,
      ifKickServer,
      selectedKey,
      toServerSetting,
      account: window.qchat?.account,
      curServer: computed(() => store.state.server.curServer),
      handleModalCancel: () => {
        Modal.confirm({
          title: () => $t("退出编辑"),
          content: () => `退出编辑状态，表单内容不保存`,
          okText: () => $t("确认"),
          cancelText: () => $t("取消"),
          onOk() {
            visible.value = false;
            visibleUser.value = false;
          },
          onCancel() {
            console.log("onCancel");
          },
        });
      },
      leaveFromServer: () => {
        Modal.confirm({
          title: () => $t("退出服务器"),
          icon: () => createVNode(ExclamationCircleOutlined),
          content: () => `即将退出服务器 "${currentServer.value.name}"`,
          okText: () => $t("确认"),
          cancelText: () => $t("取消"),
          async onOk() {
            try {
              await store
                .dispatch("server/leaveServer", {
                  serverId: currentServer.value.serverId,
                })
                .then((res) => {
                  message.success("退出成功");
                  window.location.reload();
                });
            } catch (err: any) {
              console.error(err);
              message.error($t("操作失败"));
              return;
            }
          },
        });
      },
      async deleteServer() {
        Modal.confirm({
          title: () => $t("服务器删除"),
          icon: () => createVNode(ExclamationCircleOutlined),
          content: () => `即将删除服务器 "${currentServer.value.name}"`,
          okText: () => $t("确认"),
          cancelText: () => $t("取消"),
          async onOk() {
            try {
              /* await store
                .dispatch("server/deleteServerTip", {
                  serverId: store.state.server.curServer.serverId,
                  body:  "notify all member from server"
                })*/

              await store
                .dispatch("server/deleteServers", {
                  serverId: store.state.server.curServer.serverId,
                })
                .then((res) => {
                  message.success("删除成功");
                  window.location.reload();
                });
            } catch (err: any) {
              console.error(err);
              message.error($t("操作失败"));
              return;
            }
          },
        });
      },
      cancelVisible: () => {
        visible.value = false;
      },
      inviteUser: () => {
        if (
          currentServer.value.owner === store.state.user.userProfile.account
        ) {
          inviteVisible.value = true;
          selectVisible.value = false;
        } else {
          store
            .dispatch("server/checkPermissionMessage", {
              serverId: store.state.server.curServer.serverId,
              auth: "inviteServer",
            })
            .then((resp) => {
              if (resp) {
                inviteVisible.value = true;
                selectVisible.value = false;
              }
            });
        }
      },

      personalInfoSetting: () => {
        visibleUser.value = true;
        selectVisible.value = false;
        store
          .dispatch("server/getSeverMember", {
            accids: store.state.user.userProfile.account,
          })
          .then((resp) => {
            formState.nick = resp[0].nick;
            formState.avatar = resp[0].avatar;
            formState.tel = resp[0].tel;
          });
      },

      processdelete: () => {
        window.qchat.on(
          "systemNotification",
          async function (systemNotification) {
            if (
              systemNotification.systemNotifications[0].type === "serverRemove"
            ) {
              message.success("你当前浏览服务器已被删除");
              window.location.reload();
            }
          }
        );
      },
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.server-setting-select {
  position: absolute;
  width: 124px;
  border-radius: 8px;
  background: #18191c;
  font-size: 14px;
  top: 50px;
  right: 15px;
  padding: 8px 0;
  z-index: 100;
  .item {
    cursor: pointer;
    line-height: 32px;
    padding-left: 15px;
    .anticon {
      margin-right: 5px;
    }
    &:hover {
      background: #2e3036;
    }
  }
}
.common-settings-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  background-color: #2e3036;

  .setting-menu-wrap {
    width: 288px;
    height: 100%;
    padding-left: 140px;
    background-color: #282a2f;
    .title {
      height: 80px;
      width: 148px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 45px 0 0 16px;
      text-align: left;
      font-size: 18px;
      color: #6e6f74;
    }
  }

  .setting-content-wrap {
    flex: 1;
    height: 100%;
    color: #fff;
  }
}
.id-box {
  line-height: 40px;
  background: #202225;
  border-radius: 8px;
  color: #a3a4a9;
  padding-left: 18px;
  position: relative;
  .id {
    display: inline-block;
    width: 360px;
  }
}
.settings-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
  background-color: #2e3036;

  .menu-wrap {
    width: 288px;
    height: 100%;
    padding-left: 140px;
    background-color: #282a2f;

    // .ant-menu.ant-menu-dark {
    //   background-color: #282a2f;
    // }

    // .ant-menu-item-group-title {
    //   color: #6e6f74;
    // }
  }
  .title {
    padding: 30px 0 28px 0;
    text-align: left;
    font-size: 18px;
    color: #6e6f74;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .title-text {
      padding-left: 12px;
    }
  }
}

.disabled {
  color: #6e6f74;
}
</style>
