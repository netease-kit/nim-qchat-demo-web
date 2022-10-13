<template>
  <Modal
    :visible="visible"
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
          <div class="menu-item danger" @click="destroy">退出登录</div>
        </div>
      </div>
      <ProfileSetting
        @modalClose="visible = false"
        v-if="selectedKey === 'ProfileSetting'"
      />
    </div>
  </Modal>

  <CommonAvatar
    :avatar="userProfile.avatar"
    :nick="userProfile.nick"
    :accid="userProfile.account"
    :width="42"
    :border="0"
    @click="visible = true"
    style="margin-bottom: 10px"
  ></CommonAvatar>
</template>

<script lang="ts">
import ProfileSetting from "./modules/ProfileSetting.vue";
import { computed, createVNode, ref } from "vue";
import { useStore } from "vuex";
import { Modal } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import {
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons-vue";
import CommonAvatar from "../CommonAvatar.vue";
import { afterLogout } from "../LoginController.vue";

export default {
  name: "UserSettings",
  components: { Modal, ProfileSetting, CommonAvatar, CloseCircleOutlined },
  setup() {
    const { t: $t } = useI18n();
    const store = useStore();
    const menuList = ref([{ key: "ProfileSetting", name: $t("个人资料") }]);
    const selectedKey = ref("ProfileSetting");
    const visible = ref<boolean>(false);
    let userProfile = computed(() => store.state.user.userProfile);

    return {
      visible,
      selectedKey,
      menuList,
      userProfile,
      async destroy() {
        Modal.confirm({
          title: () => $t("退出登录"),
          icon: () => createVNode(ExclamationCircleOutlined),
          content: () => `是否退出登录`,
          okText: () => $t("确认"),
          cancelText: () => $t("取消"),
          async onOk() {
            afterLogout(process.env.VUE_APP_MEMORY_MODE);
            window.location.reload();
          },
        });
      },
      handleModalCancel() {
        Modal.confirm({
          title: () => $t("退出编辑"),
          content: () => `退出编辑状态，表单内容不保存`,
          okText: () => $t("确认"),
          cancelText: () => $t("取消"),
          onOk() {
            visible.value = false;
          },
          onCancel() {
            console.log("onCancel");
          },
        });
      },
    };
  },
};
</script>

<style scoped lang="less">
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
</style>
