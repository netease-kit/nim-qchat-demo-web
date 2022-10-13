<template>
  <div class="setting-content-wrap">
    <div class="title">{{ $t("频道权限") }}</div>
    <div class="role-group-content">
      <div class="default-role">
        <div class="role-info">
          <a-button class="role-info__icon">
            <LockOutlined class="role-info_lock" />
          </a-button>
          <span class="role-name">
            {{ $t("私密频道") }}
            <br />
            <span class="role-desc">
              {{ $t("将频道设为私密，则只有白名单成员能够查看此频道") }}
            </span>
          </span>
        </div>
        <Switch
          v-if="ifCanChangeViewMode"
          v-model:checked="formState.checked"
          :checkedValue="1"
          :unCheckedValue="0"
          @change="UpdataChannel"
        />
        <Switch
          v-if="!ifCanChangeViewMode"
          v-model:checked="formState.checked"
          disabled
          :checkedValue="1"
          :unCheckedValue="0"
          @change="UpdataChannel"
        />
      </div>
      <div class="title">
        {{ $t("高级权限") }}
        <span
          style="
            display: inline-block;
            text-align: right;
            margin-left: 66%;
            color: #6e6f74;
            font-size: 16px;
          "
          >身份组/成员：</span
        >
        <div style="display: inline-block; text-align: right">
          <Cascader
            v-if="ifCanEdit"
            v-model:value="selectedValue"
            style="width: 100%; background: #282a2f; color: #fff"
            multiple
            placement="bottomRight"
            max-tag-count="responsive"
            :options="options"
            :defaultValue="addValue"
            expandIcon="1213"
            @change="handleRoleChange(selectedValue)"
          >
          </Cascader>
          <Cascader
            v-if="!ifCanEdit"
            disabled
            v-model:value="selectedValue"
            style="width: 100%; background: #282a2f; color: #fff"
            multiple
            placement="bottomRight"
            max-tag-count="responsive"
            :options="options"
            expandIcon="1213"
          >
          </Cascader>
        </div>
        <Modal
          v-model:visible="createVisible"
          :title="$t('新增')"
          class="dark"
          :footer="null"
          style="background: left"
          :width="300"
        >
          <Cascader
            v-model:value="addValue"
            style="width: 100%; background: #282a2f; color: #fff"
            multiple
            placement="bottomRight"
            max-tag-count="responsive"
            :options="chanaloptions"
            expandIcon="1213"
            @change="handleAddRoleChange(addValue)"
          >
          </Cascader>
        </Modal>
        <div v-if="canEdit" class="header-bar" @click="createVisible = true">
          <PlusOutlined :style="{ color: '#A3A4A9', fontSize: '16px' }" />
        </div>
      </div>
      <div class="role-details-container">
        <div class="title-p">{{ $t("通用权限") }}</div>
        <div class="switch-box">
          <div class="switch-title">
            {{ $t("管理频道属性") }}
          </div>
          <div class="setting_button_wrap">
            <Button
              v-if="ifCanEdit"
              :class="[
                qChatRoleAuth.manageChannel === 'deny'
                  ? 'setting__buttonC_selected'
                  : 'setting__buttonC',
              ]"
              v-model="qChatRoleAuth.manageChannel"
              @click="settingChannelAuth('manageChannel', 'deny')"
            >
              <CloseOutlined />
            </Button>
            <Button
              v-if="!ifCanEdit"
              disabled
              :class="[
                qChatRoleAuth.manageChannel === 'deny'
                  ? 'setting__buttonC_selected'
                  : 'setting__buttonC',
              ]"
              v-model="qChatRoleAuth.manageChannel"
              @click="settingChannelAuth('manageChannel', 'deny')"
            >
              <CloseOutlined />
            </Button>
            <Button
              v-if="ifCanEdit"
              :class="[
                qChatRoleAuth.manageChannel === 'ignore'
                  ? 'setting__buttonP_selected'
                  : 'setting__buttonP',
              ]"
              v-model="qChatRoleAuth.manageChannel"
              @click="settingChannelAuth('manageChannel', 'ignore')"
            >
              <PauseOutlined />
            </Button>
            <Button
              v-if="!ifCanEdit"
              disabled
              :class="[
                qChatRoleAuth.manageChannel === 'ignore'
                  ? 'setting__buttonP_selected'
                  : 'setting__buttonP',
              ]"
              v-model="qChatRoleAuth.manageChannel"
              @click="settingChannelAuth('manageChannel', 'ignore')"
            >
              <PauseOutlined />
            </Button>
            <Button
              v-if="ifCanEdit"
              :class="[
                qChatRoleAuth.manageChannel === 'allow'
                  ? 'setting__buttonD_selected'
                  : 'setting__buttonD',
              ]"
              v-model="qChatRoleAuth.manageChannel"
              @click="settingChannelAuth('manageChannel', 'allow')"
            >
              <CheckOutlined />
            </Button>
            <Button
              v-if="!ifCanEdit"
              disabled
              :class="[
                qChatRoleAuth.manageChannel === 'allow'
                  ? 'setting__buttonD_selected'
                  : 'setting__buttonD',
              ]"
              v-model="qChatRoleAuth.manageChannel"
              @click="settingChannelAuth('manageChannel', 'allow')"
            >
              <CheckOutlined />
            </Button>
          </div>
        </div>
        <div class="switch-box">
          <div class="switch-title">
            {{ $t("管理频道权限") }}
          </div>
          <div class="setting_button_wrap">
            <Button
              v-if="ifCanEdit"
              :class="[
                qChatRoleAuth.manageRole === 'deny'
                  ? 'setting__buttonC_selected'
                  : 'setting__buttonC',
              ]"
              v-model="qChatRoleAuth.manageRole"
              @click="settingChannelAuth('manageRole', 'deny')"
            >
              <CloseOutlined />
            </Button>
            <Button
              v-if="!ifCanEdit"
              disabled
              :class="[
                qChatRoleAuth.manageRole === 'deny'
                  ? 'setting__buttonC_selected'
                  : 'setting__buttonC',
              ]"
              v-model="qChatRoleAuth.manageRole"
              @click="settingChannelAuth('manageRole', 'deny')"
            >
              <CloseOutlined />
            </Button>
            <Button
              v-if="ifCanEdit"
              :class="[
                qChatRoleAuth.manageRole === 'ignore'
                  ? 'setting__buttonP_selected'
                  : 'setting__buttonP',
              ]"
              v-model="qChatRoleAuth.manageRole"
              @click="settingChannelAuth('manageRole', 'ignore')"
            >
              <PauseOutlined />
            </Button>
            <Button
              v-if="!ifCanEdit"
              disabled
              :class="[
                qChatRoleAuth.manageRole === 'ignore'
                  ? 'setting__buttonP_selected'
                  : 'setting__buttonP',
              ]"
              v-model="qChatRoleAuth.manageRole"
              @click="settingChannelAuth('manageRole', 'ignore')"
            >
              <PauseOutlined />
            </Button>
            <Button
              v-if="ifCanEdit"
              :class="[
                qChatRoleAuth.manageRole === 'allow'
                  ? 'setting__buttonD_selected'
                  : 'setting__buttonD',
              ]"
              v-model="qChatRoleAuth.manageRole"
              @click="settingChannelAuth('manageRole', 'allow')"
            >
              <CheckOutlined />
            </Button>
            <Button
              v-if="!ifCanEdit"
              disabled
              :class="[
                qChatRoleAuth.manageRole === 'allow'
                  ? 'setting__buttonD_selected'
                  : 'setting__buttonD',
              ]"
              v-model="qChatRoleAuth.manageRole"
              @click="settingChannelAuth('manageRole', 'allow')"
            >
              <CheckOutlined />
            </Button>
          </div>
        </div>
        <div class="title-p">{{ $t("消息权限") }}</div>
        <div class="switch-box">
          <div class="switch-title">
            {{ $t("发送消息   ") }}
          </div>
          <div class="setting_button_wrap">
            <Button
              v-if="ifCanEdit"
              :class="[
                qChatRoleAuth.sendMsg === 'deny'
                  ? 'setting__buttonC_selected'
                  : 'setting__buttonC',
              ]"
              v-model="qChatRoleAuth.sendMsg"
              @click="settingChannelAuth('sendMsg', 'deny')"
            >
              <CloseOutlined />
            </Button>
            <Button
              v-if="!ifCanEdit"
              disabled
              :class="[
                qChatRoleAuth.sendMsg === 'deny'
                  ? 'setting__buttonC_selected'
                  : 'setting__buttonC',
              ]"
              v-model="qChatRoleAuth.sendMsg"
              @click="settingChannelAuth('sendMsg', 'deny')"
            >
              <CloseOutlined />
            </Button>
            <Button
              v-if="ifCanEdit"
              :class="[
                qChatRoleAuth.sendMsg === 'ignore'
                  ? 'setting__buttonP_selected'
                  : 'setting__buttonP',
              ]"
              v-model="qChatRoleAuth.sendMsg"
              @click="settingChannelAuth('sendMsg', 'ignore')"
            >
              <PauseOutlined />
            </Button>
            <Button
              v-if="!ifCanEdit"
              disabled
              :class="[
                qChatRoleAuth.sendMsg === 'ignore'
                  ? 'setting__buttonP_selected'
                  : 'setting__buttonP',
              ]"
              v-model="qChatRoleAuth.sendMsg"
              @click="settingChannelAuth('sendMsg', 'ignore')"
            >
              <PauseOutlined />
            </Button>
            <Button
              v-if="ifCanEdit"
              :class="[
                qChatRoleAuth.sendMsg === 'allow'
                  ? 'setting__buttonD_selected'
                  : 'setting__buttonD',
              ]"
              v-model="qChatRoleAuth.sendMsg"
              @click="settingChannelAuth('sendMsg', 'allow')"
            >
              <CheckOutlined />
            </Button>
            <Button
              v-if="!ifCanEdit"
              disabled
              :class="[
                qChatRoleAuth.sendMsg === 'allow'
                  ? 'setting__buttonD_selected'
                  : 'setting__buttonD',
              ]"
              v-model="qChatRoleAuth.sendMsg"
              @click="settingChannelAuth('sendMsg', 'allow')"
            >
              <CheckOutlined />
            </Button>
          </div>
        </div>
        <div class="title-p">{{ $t("成员权限") }}</div>
        <div class="switch-box">
          <div class="switch-title">
            {{ $t("管理频道名单") }}
          </div>
          <div class="setting_button_wrap">
            <Button
              v-if="ifCanEdit"
              :class="[
                qChatRoleAuth.manageBlackWhiteList === 'deny'
                  ? 'setting__buttonC_selected'
                  : 'setting__buttonC',
              ]"
              v-model="qChatRoleAuth.manageBlackWhiteList"
              @click="settingChannelAuth('manageBlackWhiteList', 'deny')"
            >
              <CloseOutlined />
            </Button>
            <Button
              v-if="!ifCanEdit"
              disabled
              :class="[
                qChatRoleAuth.manageBlackWhiteList === 'deny'
                  ? 'setting__buttonC_selected'
                  : 'setting__buttonC',
              ]"
              v-model="qChatRoleAuth.manageBlackWhiteList"
              @click="settingChannelAuth('manageBlackWhiteList', 'deny')"
            >
              <CloseOutlined />
            </Button>
            <Button
              v-if="ifCanEdit"
              :class="[
                qChatRoleAuth.manageBlackWhiteList === 'ignore'
                  ? 'setting__buttonP_selected'
                  : 'setting__buttonP',
              ]"
              v-model="qChatRoleAuth.manageBlackWhiteList"
              @click="settingChannelAuth('manageBlackWhiteList', 'ignore')"
            >
              <PauseOutlined />
            </Button>
            <Button
              v-if="!ifCanEdit"
              disabled
              :class="[
                qChatRoleAuth.manageBlackWhiteList === 'ignore'
                  ? 'setting__buttonP_selected'
                  : 'setting__buttonP',
              ]"
              v-model="qChatRoleAuth.manageBlackWhiteList"
              @click="settingChannelAuth('manageBlackWhiteList', 'ignore')"
            >
              <PauseOutlined />
            </Button>
            <Button
              v-if="ifCanEdit"
              :class="[
                qChatRoleAuth.manageBlackWhiteList === 'allow'
                  ? 'setting__buttonD_selected'
                  : 'setting__buttonD',
              ]"
              v-model="qChatRoleAuth.manageBlackWhiteList"
              @click="settingChannelAuth('manageBlackWhiteList', 'allow')"
            >
              <CheckOutlined />
            </Button>
            <Button
              v-if="!ifCanEdit"
              disabled
              :class="[
                qChatRoleAuth.manageBlackWhiteList === 'allow'
                  ? 'setting__buttonD_selected'
                  : 'setting__buttonD',
              ]"
              v-model="qChatRoleAuth.manageBlackWhiteList"
              @click="settingChannelAuth('manageBlackWhiteList', 'allow')"
            >
              <CheckOutlined />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, ref, reactive, onBeforeMount, watch } from "vue";
import { useStore } from "vuex";
import { Switch, Cascader, Button, message, Modal } from "ant-design-vue";
import type { CascaderProps } from "ant-design-vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import {
  CloseOutlined,
  LockOutlined,
  PauseOutlined,
  CheckOutlined,
} from "@ant-design/icons-vue";

export default {
  name: "ChannelRole",
  components: {
    LockOutlined,
    PauseOutlined,
    CheckOutlined,
    CloseOutlined,
    Switch,
    Cascader,
    PlusOutlined,
    Modal,
    Button,
  },
  props: {
    canEdit: {
      type: Boolean,
      default: false,
    },
    canChangeViewMode: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const ifCanEdit = computed(() => {
      return props.canEdit;
    });
    const ifCanChangeViewMode = computed(() => {
      return props.canChangeViewMode;
    });
    const roleList = ref<any[]>([]);

    onBeforeMount(() => {
      getChannalRoles();
      getServerRoles();
      getChannalMembers();
      getServerMembers();
    });

    const store = useStore();

    const memberAndRoleList = [];

    const channelmemberAndRoleList = [];

    const channelroleList = [];

    const createVisible = ref<boolean>(false);

    const ChannelData = computed(() => store.state.channel.currentChannel);

    const activeRole = computed(() => store.state.server.curServerRoles);

    const selectedValue = ref<string[]>([]);

    let addValue;

    let selectRoles;
    let selectMember;
    const formState = reactive({
      checked: ChannelData.value.viewMode,
    });
    const qChatRoleAuth = ref<any>({
      manageChannel: "",
      manageRole: "",
      sendMsg: "",
      manageBlackWhiteList: "",
    });

    watch(
      ChannelData,
      (newValue, oldValue) => {
        qChatRoleAuth.value = {
          manageChannel: "",
          manageRole: "",
          sendMsg: "",
          manageBlackWhiteList: "",
        };
        selectedValue.value = [];
      },
      { deep: true }
    );

    // 处理身份组切换
    const handleRoleChange = (value) => {
      selectRoles = value.toString().split(",")[0];
      selectMember = value.toString().split(",")[1];
      if (selectMember == undefined) {
        return message.error("请选择身份组或者成员！");
      }
      if (selectRoles === "1") {
        qChatRoleAuth.value = {
          manageChannel: "",
          manageRole: "",
          sendMsg: "",
          manageBlackWhiteList: "",
        };
        roleList.value.forEach(function (s) {
          if (s.roleId == selectMember) {
            store.commit("channel/settingChannelRole", s);
            qChatRoleAuth.value = s.auths;
          }
        });
      } else {
        qChatRoleAuth.value = {
          manageChannel: "",
          manageRole: "",
          sendMsg: "",
          manageBlackWhiteList: "",
        };
        memberAndRoleList.forEach((item) => {
          if (item.accid == selectMember) {
            store.commit("server/setCurMember", item);
          }
        });
        getMemberAuths();
      }
    };

    const getMemberAuths = () => {
      if (!ifCanEdit.value) {
        return;
      }
      //获取权限
      store
        .dispatch("channel/getMemberRoles", {
          serverId: store.state.server.curServer.serverId,
          channelId: store.state.channel.currentChannel.channelId,
          timetag: new Date().getTime(),
          limit: 100,
        })
        .then((resp) => {
          qChatRoleAuth.value = {
            manageChannel: "ignore",
            manageRole: "ignore",
            sendMsg: "ignore",
            manageBlackWhiteList: "ignore",
          };
          for (let index = 0; index < resp.length; index++) {
            const item = resp[index];
            if (item.accid === selectMember) {
              qChatRoleAuth.value = item.auths;
              break;
            }
          }
        });
    };

    const removeDuplicateObj = (arr) => {
      let obj = {};
      arr = arr.reduce((newArr, next) => {
        obj[next.key] ? "" : (obj[next.key] = true && newArr.push(next));
        return newArr;
      }, []);
      return arr;
    };

    const handleAddRoleChange = (addSelectedValue) => {
      selectRoles = addSelectedValue.toString().split(",")[0];
      selectMember = addSelectedValue.toString().split(",")[1];
      if (selectRoles == "1") {
        store
          .dispatch("server/addChannelRole", {
            serverId: store.state.server.curServer.serverId,
            channelId: store.state.channel.currentChannel.channelId,
            parentRoleId: selectMember,
            roleId: selectMember,
          })
          .then((resp) => {
            createVisible.value = false;
            resp.label = resp.name;
            resp.value = resp.roleId;
            roleList.value.push(resp);
            roleList.value = removeDuplicateObj(roleList.value);
          })
          .catch((resp) => {
            createVisible.value = false;
            getChannalRoles();
            return message.error("已存在无需新增！");
          });
      } else {
        memberAndRoleList.forEach(function (s) {
          if (s.roleId == selectMember) {
            store.commit("channel/settingChannelRole", s);
          }
        });
        getMemberAuths();
      }
    };
    const getServerRoles = () => {
      store
        .dispatch("server/getServerRoles", {
          serverId: store.state.server.curServer.serverId,
        })
        .then((resp) => {
          resp.roles.forEach(function (s) {
            let exists = false;
            if (s.type === "everyone") {
              exists = true;
            } else {
              for (let index = 0; index < roleList.value.length; index++) {
                const role = roleList.value[index];
                if (s.roleId === role.roleId) {
                  exists = true;
                  break;
                }
              }
            }

            if (!exists) {
              s.label = s.name;
              s.value = s.roleId;
              channelroleList.push(s);
            }
          });
        });
    };
    const getChannalRoles = () => {
      if (!ifCanEdit.value) {
        return;
      }
      store
        .dispatch("channel/getChannelRoles", {
          serverId: store.state.server.curServer.serverId,
          channelId: store.state.channel.currentChannel.channelId,
        })
        .then((resp) => {
          resp.forEach(function (s) {
            // if(s.type !== 'everyone'){
            s.label = s.name;
            s.value = s.roleId;
            roleList.value.push(s);
            //  }
          });
        });
    };
    const getChannalMembers = async () => {
      if (!ifCanEdit.value) {
        return;
      }
      store
        .dispatch("channel/getMembersByPage", {
          serverId: store.state.server.curServer.serverId,
          channelId: store.state.channel.currentChannel.channelId,
          timetag: 0,
          limit: 100,
        })
        .then((res) => {
          res.datas.forEach(function (s) {
            if (s.accid !== store.state.user.userProfile.account) {
              s.label = s.nick + "  " + s.accid;
              s.value = s.accid;
              s.prefixCls = true;
              channelmemberAndRoleList.push(s);
            }
          });
        });
    };
    const getServerMembers = async () => {
      const res = await store.dispatch("server/getSeverMembers", {
        serverId: store.state.server.curServer.serverId,
        timetag: 0,
      });
      res.datas.forEach(function (s) {
        s.label = s.nick + "  " + s.accid;
        s.value = s.accid;
        s.prefixCls = true;
        memberAndRoleList.push(s);
      });
    };

    const settingChannelAuth = async (auth, value) => {
      if (
        selectMember == undefined ||
        selectMember == null ||
        selectMember === ""
      ) {
        return message.error("请选择身份组或成员！");
      }
      let authObj = {};
      authObj[auth] = value;
      if (selectRoles == "1") {
        const UpdateChannelRoleOptions = {
          serverId: store.state.server.curServer.serverId,
          channelId: store.state.channel.currentChannel.channelId,
          roleId: selectMember,
          auths: authObj,
        };
        store
          .dispatch("channel/updateChannelRole", UpdateChannelRoleOptions)
          .then(() => {
            message.success("设置成功!");
            qChatRoleAuth.value[auth] = value;
          })
          .catch(() => {
            message.error("保存失败，部分权限无法编辑");
          });
      } else if (selectRoles == "2") {
        const checkOption = {
          serverId: store.state.server.curServer.serverId,
          channelId: store.state.channel.currentChannel.channelId,
          accids: [selectMember],
        };
        store
          .dispatch("channel/getExistingAccidsOfMemberRoles", checkOption)
          .then((res) => {
            const UpdateChannelRoleOptions = {
              serverId: store.state.server.curServer.serverId,
              channelId: store.state.channel.currentChannel.channelId,
              accid: selectMember,
              auths: authObj,
            };
            if (res.length > 0) {
              store
                .dispatch("channel/updateMemberRole", UpdateChannelRoleOptions)
                .then(() => {
                  message.success("设置成功!");
                  qChatRoleAuth.value[auth] = value;
                })
                .catch(() => {
                  message.error("保存失败，部分权限无法编辑");
                });
            } else {
              store
                .dispatch("channel/addMemberRole", UpdateChannelRoleOptions)
                .then(() => {
                  store
                    .dispatch(
                      "channel/updateMemberRole",
                      UpdateChannelRoleOptions
                    )
                    .then(() => {
                      qChatRoleAuth.value[auth] = value;
                      message.success("设置成功!");
                    })
                    .catch(() => {
                      message.error("保存失败，部分权限无法编辑");
                    });
                })
                .catch(() => {
                  message.error("保存失败，部分权限无法编辑");
                });
            }
          });
      }
    };

    const curServerRoles = computed(() => store.state.server.curServerRoles);

    const serverMembers = computed(() => store.state.server.serverMembers);

    const MembersList = computed(() => store.state.server.serverMembers);
    const options: CascaderProps["options"] = [
      {
        label: "身份组",
        value: "1",
        children: roleList.value,
      },
      {
        label: "成员",
        value: "2",
        children: channelmemberAndRoleList,
      },
    ];
    const chanaloptions: CascaderProps["options"] = [
      {
        label: "身份组",
        value: "1",
        children: channelroleList,
      },
    ];
    const UpdataChannel = () => {
      const Channeloptions = {
        serverId: store.state.channel.currentChannel.serverId,
        channelId: store.state.channel.currentChannel.channelId,
        viewMode: formState.checked,
      };
      store
        .dispatch("channel/updateChannel", Channeloptions)
        .then(() => {
          message.success("设置成功!");
          store
            .dispatch("channel/getMembersByPage", {
              serverId: store.state.server.curServer.serverId,
              channelId: store.state.channel.currentChannel.channelId,
              timetag: 0,
              limit: 100,
            })
            .then((res) => {
              store.commit("channel/setChannelMembers", res);
              store.commit("server/setSeverMembers", res);
            });
        })
        .catch(() => {
          message.error("无权限操作");
        });
    };
    const updateChannelRole = () => {
      if (!selectMember) {
        return message.error("请选择身份组或成员");
      } else {
        const UpdateChannelRoleOptions = {
          serverId: store.state.channel.currentChannel.serverId,
          channelId: store.state.channel.currentChannel.channelId,
          roleId: selectMember,
          auths: qChatRoleAuth,
        };
        store
          .dispatch("channel/updateChannelRole", UpdateChannelRoleOptions)
          .then(() => {
            message.success("设置成功!");
          })
          .catch(() => {
            message.error("保存失败，部分权限无法编辑");
          });
      }
    };
    return {
      roleList,
      MembersList,
      channelroleList,
      channelmemberAndRoleList,
      ChannelData,
      activeRole,
      formState,
      getChannalRoles,
      settingChannelAuth,
      curServerRoles,
      getServerRoles,
      getServerMembers,
      getChannalMembers,
      handleRoleChange,
      handleAddRoleChange,
      selectRoles,
      selectMember,
      serverMembers,
      UpdataChannel,
      qChatRoleAuth,
      updateChannelRole,
      options,
      chanaloptions,
      selectedValue,
      createVisible,
      ifCanEdit,
      ifCanChangeViewMode,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.setting-content-wrap {
  flex: 1;
  height: 100%;
  color: #fff;
  .title {
    padding: 45px 0 16px 30px;
    font-size: 22px;
    border-bottom: 1px solid #202126;
    line-height: 100%;
    .sub-title {
      font-size: 12px;
      color: #6e6f74;
    }
    .header-bar {
      cursor: pointer;
      display: inline-block;
      text-align: right;
    }
  }
}

.role-group-content {
  padding: 30px;
}
.role-details-container {
  padding: 5px;
}
.title-p {
  height: 60px;
  padding: 10px 0 0 0px;
  text-align: left;
  font-size: 16px;
  color: #6e6f74;
}
.default-role {
  padding: 20px;
  background: #282a2e;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  .role-info {
    display: flex;
    align-items: center;
    .role-info__icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #18191c;
      margin-right: 20px;
    }
    .role-info_lock {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #373941;
      margin-left: 0px;
      line-height: 40px;
      color: #8d8d91;
    }
    .role-name {
      font-size: 14px;
      .role-desc {
        font-size: 12px;
        color: #6e6f74;
      }
    }
  }
}
.button-wrap {
  display: inline-block;
  vertical-align: top;
  margin-right: 16px;
  &:last-child {
    margin-right: 0;
  }
}
.ant-close {
  width: 20px;
}
.role-tips {
  color: #6e6f74;
  margin-top: 20px;
}
.buttons {
  margin-top: 35px;
}
.drag-ghost {
  opacity: 0.5;
}
.drag-class {
  background: #363940;
}
.role-table-thead {
  color: #a3a4a9;
}
.role-table-tbody {
  color: #ffffff;
}
.role-table-row {
  border-bottom: 1px solid #363940;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 55px;
}
.role-table-cell {
  width: 100px;
}
.role-drag-holder {
  cursor: grab;
}
.action-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #373941;
  margin-left: 15px;
  line-height: 32px;
  color: #a3a4a9;
  &:hover {
    cursor: pointer;
    color: #ffffff;
    background: #282a2e;
  }
}

.create-form {
  .bottom-button {
    margin: 0 -24px;
    padding: 16px 20px 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    button {
      margin-left: 15px;
    }
  }
}
.switch-box {
  // display: flex;
  position: relative;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  .switch-title {
    color: #fff;
    font-size: 18px;
  }
  .setting_button_wrap {
    position: absolute;
    right: 10px;
    top: 0;
    .setting__buttonC {
      width: 60px;
      background-size: 50px;
      display: inline-block;
      // margin-left: 1250px;
      background: #2e3036;
      border-width: 1px 0 1px 1px;
      border-color: #171718;
      color: #cf5a57;
    }
    .setting__buttonC_selected {
      width: 60px;
      background-size: 50px;
      display: inline-block;
      // margin-left: 1250px;
      background: #2e3036;
      border-width: 1px 0 1px 1px;
      border-color: #171718;
      color: #fff;
      background: #e6605c;
    }
    .setting__buttonC:hover {
      color: #fff;
      background: #e6605c;
    }
    .setting__buttonP {
      width: 60px;
      background-size: 50px;
      display: inline-block;
      background: #2e3036;
      border-width: 1px 0 1px 0;
      border-color: #171718;
    }
    .setting__buttonP_selected {
      width: 60px;
      background-size: 50px;
      display: inline-block;
      background: #73767c;
      border-width: 1px 0 1px 0;
      border-color: #171718;
      color: #fff;
    }
    .setting__buttonP:hover {
      color: #fff;
      background: #73767c;
    }
    .setting__buttonD {
      width: 60px;
      background-size: 50px;
      display: inline-block;
      background: #2e3036;
      border-width: 1px 1px 1px 0;
      border-color: #171718;
      color: #42c294;
    }
    .setting__buttonD_selected {
      width: 60px;
      background-size: 50px;
      display: inline-block;
      background: #42c294;
      border-width: 1px 1px 1px 0;
      border-color: #171718;
      color: #fff;
    }
    .setting__buttonD:hover {
      color: #fff;
      background: #42c294;
    }
  }

  .changge-calss {
    width: 60px;
    background-size: 50px;
    display: inline-block;
    margin-left: 1250px;
    color: #f30606;
    border-color: #030303;
    background-color: rgba(248, 8, 8, 0);
  }
}
.ant-modal-body {
  padding: 24px;
  font-size: 14px;
  line-height: 1.5715;
  word-wrap: break-word;
  height: 200px;
}
</style>
