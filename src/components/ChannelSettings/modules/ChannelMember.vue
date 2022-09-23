<template>
  <div class="setting-content-wrap">
    <div class="title">{{ titletext.title }}</div>
    <div class="server-info">
      <div class="server-icon-container">
        <div class="title-p">
          <div style="display: inline-block; font-size: 14px; color: #6e6f74">
            {{ memberAndRoleList.length }}人
          </div>
          <div class="select-wrap">
            <span
              style="
                display: inline-block;
                text-align: right;
                margin-left: 80%;
                font-size: 14px;
                color: #6e6f74;
              "
              >显示身份组：</span
            >
            <a-select
              v-if="ifCanEdit"
              ref="select"
              v-model:value="selectedKey"
              @focus="focus"
              @change="handleTabChange(selectedKey)"
            >
              <a-select-option
                class="selectOption"
                v-for="item in roleList"
                :key="item.roleId"
                :value="item"
                :label="item.name"
                >{{ item.name }}</a-select-option
              >
            </a-select>
            <a-select
              v-if="!ifCanEdit"
              disabled
              ref="select"
              v-model:value="selectedKey"
              @focus="focus"
            >
              <a-select-option
                class="selectOption"
                v-for="item in roleList"
                :key="item.roleId"
                :value="item"
                :label="item.name"
                >{{ item.name }}</a-select-option
              >
            </a-select>
            <UserAddOutlined
              v-if="ifCanEdit"
              class="add-members-btn"
              @click="getSeverMembers"
            />
          </div>
        </div>
        <div class="role-members-container">
          <div
            class="role-member-item"
            style="
              height: 80px;
              border-bottom: #6a645d 1px solid;
              padding-top: 10px;
            "
            v-for="item in memberAndRoleList"
            :key="item.memberInfo.accid"
          >
            <div class="member-info">
              <CommonAvatar
                :avatar="item.memberInfo.avatar"
                :nick="item.memberInfo.nick"
                :accid="item.memberInfo.accid"
                :width="38"
                :border="0"
              />
            </div>
            <div class="role-member-name">
              {{ item.memberInfo.nick }}
              {{ item.memberInfo.accid }}
            </div>
            <div class="role-member-group">
              <div
                class="member-roles"
                v-for="role in item.roles"
                :key="item.memberInfo.accid + '_' + role.roleId"
                effect="light"
              >
                <span>{{ role.name }}</span>
              </div>
            </div>
            <DeleteOutlined
              v-if="ifCanEdit"
              class="role-member-delete"
              @click="handleDeleteMember(item.memberInfo)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <MemberSelectModal
    :visible="addMembersModalVisible"
    :dataSource="memberSelectDataSource"
    :hasMore="memberSelectDataSourceListQueryTag.hasMore"
    @cancel="addMembersModalVisible = false"
    @ok="handleAddMembers"
    @onLoadMore="handelLoadMore"
  />
</template>
<script lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { message, Modal } from "ant-design-vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import MemberSelectModal from "../../Common/MemberSelectModal.vue";
import { QChatServerRole } from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatRoleServiceInterface";
import { MemberInfo } from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatServerServiceInterface";
import CommonAvatar from "../../CommonAvatar.vue";
import { UserAddOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { ChannelInfo } from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatChannelServiceInterface";
import defaultResult from "ant-design-vue/es/_util/isMobile";
import any = defaultResult.any;
export declare type MemberAndRoles = {
  memberInfo: MemberInfo;
  roles: QChatServerRole[];
};
export default {
  name: "RoleSettings",
  components: {
    MemberSelectModal,
    CommonAvatar,
    UserAddOutlined,
    DeleteOutlined,
  },
  mounted() {
    this.getServerRoles();
    this.getMembersBlackWhite();
    this.selectedKey = "@everyone";
    this.getServerMembers();
  },
  props: {
    canEdit: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const ifCanEdit = computed(() => {
      return props.canEdit;
    });
    const { t: $t } = useI18n();

    let accidnow = "";

    const store = useStore();
    //1: 名称与权限；  2: 管理成员；
    const tabActiveKey = ref("1");

    const membersFromServerRole = ref<MemberInfo[]>([]);

    const membersBlackWhite = ref<any[]>([]);

    const addMembersModalVisible = ref(false);

    const memberAndRoleList = ref<any[]>([]);

    const memberSelectDataSource = ref<ChannelInfo[]>([]);

    const memberSelectDataSourceListQueryTag = reactive({
      hasMore: false,
      nextTimetag: 0,
    });

    const viewMode = computed(
      () => store.state.channel.currentChannel.viewMode
    );

    let titletext = reactive({
      title: "频道黑名单",
    });

    const roleSelectDataSourceListQueryTag = reactive({
      hasMore: false,
      nextTimetag: 0,
    });

    const formRef = ref();

    const roleList = computed(() => store.state.server.curServerRoles);

    const activeRole = computed(() => store.state.server.serverMembers.datas);

    const rules = {
      name: [
        {
          required: true,
          message: $t("请输入身份组名称"),
          trigger: "blur",
        },
      ],
    };
    //返回
    const back = () => {
      store.commit("server/setSettingServerRole", null);
    };
    // 处理身份组切换
    const handleRoleChange = (role: QChatServerRole) => {
      store.commit("server/setSettingServerRole", role);
    };

    // 查询某服务器下黑白名单成员列表
    const getMembersBlackWhite = async () => {
      if (!ifCanEdit.value) {
        return;
      }
      store
        .dispatch("channel/getWhiteBlackMembersPage", {
          serverId: store.state.server.curServer.serverId,
          channelId: store.state.channel.currentChannel.channelId,
          type: viewMode.value == 1 ? "white" : "black",
          timetag: 0,
          limit: 100,
        })
        .then((res) => {
          membersBlackWhite.value = res.datas;
        });
    };

    // 查询某服务器下黑白名单成员列表
    const getMembersFromServerRole = (selectedRoleId: any) => {
      memberAndRoleList.value = [];
      if (!ifCanEdit.value) {
        return;
      }
      store
        .dispatch("channel/getWhiteBlackMembersPage", {
          serverId: store.state.server.curServer.serverId,
          channelId: store.state.channel.currentChannel.channelId,
          type: viewMode.value == 1 ? "white" : "black",
          timetag: 0,
          limit: 100,
        })
        .then((res) => {
          for (let index = 0; index < res.datas.length; index++) {
            const data = res.datas[index];
            store
              .dispatch("server/getServerRolesByAccid", {
                serverId: store.state.server.curServer.serverId,
                timetag: 0,
                limit: 100,
                accid: data.accid,
              })
              .then((resp) => {
                for (let i = 0; i < resp.length; i++) {
                  const role = resp[i];
                  if (role.roleId === selectedRoleId.roleId) {
                    memberAndRoleList.value.push({
                      memberInfo: data,
                      roles: resp,
                    });
                  }
                }
              });
          }
        });
    };

    const formState = reactive({
      name: activeRole.value.name,
      auths: { ...activeRole.value.auths },
    });

    const onReset = () => {
      if (activeRole.value) {
        formState.name = activeRole.value.name;
        formState.auths = { ...activeRole.value.auths };
      }
    };
    const handleDeleteMember = (member: MemberInfo) => {
      Modal.confirm({
        title: $t(`确认移除 "${member.nick || member.accid}" ？`),
        okText: () => $t("确认"),
        cancelText: () => $t("取消"),
        async onOk() {
          try {
            return await store
              .dispatch("channel/updateWhiteBlackMembers", {
                serverId: store.state.server.curServer.serverId,
                channelId: store.state.channel.currentChannel.channelId,
                type: viewMode.value == 1 ? "white" : "black",
                opeType: "remove",
                toAccids: [member.accid],
              })
              .then(() => {
                message.success($t("移除成功"));
                getServerMembers();
              });
          } catch {
            message.error("保存失败，部分权限无法编辑");
            return console.log("Oops errors!");
          }
        },
      });
    };
    const onSubmit = () => {
      formRef.value.validate().then(() => {
        const options = {
          roleId: activeRole.value.roleId,
          serverId: activeRole.value.serverId,
          name: formState.name,
          auths: formState.auths,
        };
        store
          .dispatch("server/updateServerRole", options)
          .then(() => {
            message.success($t("保存成功"));
          })
          .catch(() => {
            message.error($t("保存失败，部分权限无法编辑"));
          });
      });
    };
    //1: 名称与权限；  2: 管理成员；
    const handleTabChange = (e) => {
      if (e.name === "@everyone") {
        getServerMembers();
      } else {
        getMembersFromServerRole(e);
      }
    };

    const getSeverMembers = async (accid: any) => {
      const res = await store.dispatch("server/getSeverMembers", {
        serverId: store.state.server.curServer.serverId,
        timetag: 0,
      });
      accidnow = accid;
      memberSelectDataSourceListQueryTag.hasMore = res.listQueryTag.hasMore;
      memberSelectDataSourceListQueryTag.nextTimetag =
        res.listQueryTag.nextTimetag;
      const memberSelect = res.datas.filter(
        (item: MemberInfo) =>
          !membersBlackWhite.value.find((i) => i.accid === item.accid)
      );
      const owner = store.state.server.curServer.owner;
      memberSelectDataSource.value = memberSelect.filter(
        (item: MemberInfo) => !(owner === item.accid)
      );
      addMembersModalVisible.value = true;
    };

    const getServerMembers = async () => {
      memberAndRoleList.value = [];
      if (!ifCanEdit.value) {
        return;
      }
      const res = await store.dispatch("channel/getWhiteBlackMembersPage", {
        serverId: store.state.server.curServer.serverId,
        channelId: store.state.channel.currentChannel.channelId,
        type: viewMode.value == 1 ? "white" : "black",
        timetag: 0,
        limit: 50,
      });
      for (let index = 0; index < res.datas.length; index++) {
        const data = res.datas[index];
        store
          .dispatch("server/getServerRolesByAccid", {
            serverId: store.state.server.curServer.serverId,
            timetag: 0,
            limit: 100,
            accid: data.accid,
          })
          .then((resp) => {
            memberAndRoleList.value.push({ memberInfo: data, roles: resp });
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
          });
      }
    };

    const getServerRoles = () => {
      store
        .dispatch("server/getServerRoles", {
          serverId: store.state.server.curServer.serverId,
        })
        .then((resp) => {
          if (viewMode.value === 1) {
            titletext.title = "频道白名单";
          } else {
            titletext.title = "频道黑名单";
          }
        });
    };

    const addSeverMembers = async () => {
      const res = await store.dispatch("server/getSeverMembers", {
        serverId: store.state.server.curServer.serverId,
        timetag: 0,
      });
      memberSelectDataSourceListQueryTag.hasMore = res.listQueryTag.hasMore;
      memberSelectDataSourceListQueryTag.nextTimetag =
        res.listQueryTag.nextTimetag;
      const memberSelect = res.datas.filter(
        (item: MemberInfo) =>
          !membersBlackWhite.value.find((i) => i.accid === item.accid)
      );
      const owner = store.state.server.curServer.owner;
      memberSelectDataSource.value = memberSelect.filter(
        (item: MemberInfo) => !(owner === item.accid)
      );
      addMembersModalVisible.value = true;
    };

    const handelLoadMore = () => {
      memberSelectDataSourceListQueryTag.hasMore = false;
      store
        .dispatch("server/appendSeverMembers", {
          serverId: store.state.server.curServer.serverId,
          timetag: memberSelectDataSourceListQueryTag.nextTimetag,
        })
        .then((res) => {
          memberSelectDataSourceListQueryTag.hasMore = res.listQueryTag.hasMore;
          memberSelectDataSourceListQueryTag.nextTimetag =
            res.listQueryTag.nextTimetag;
          memberSelectDataSource.value = [
            ...memberSelectDataSource.value,
            res.datas.filter(
              (item: MemberInfo) =>
                !membersFromServerRole.value.find((i) => i.accid === item.accid)
            ),
          ];
        });
    };

    const handleAddMembers = (members: MemberInfo[]) => {
      try {
        store
          .dispatch("channel/updateWhiteBlackMembers", {
            serverId: store.state.server.curServer.serverId,
            channelId: store.state.channel.currentChannel.channelId,
            type: viewMode.value == 1 ? "white" : "black",
            opeType: "add",
            toAccids: members.map((member) => member.accid),
          })
          .then(() => {
            message.success($t("添加成功"));
            getServerMembers();
            addMembersModalVisible.value = false;
          })
          .catch(() => {
            message.error($t("保存失败，部分权限无法编辑"));
          });
      } catch {
        message.error($t("保存失败，部分权限无法编辑"));
      }
    };
    const handleDeleteRoles = (accid: any, roleId: any, indexsum: any) => {
      try {
        store
          .dispatch("server/removeMembersFromServerRole", {
            serverId: store.state.server.curServer.serverId,
            roleId: roleId,
            accids: [accid],
          })
          .then(() => {
            message.success($t("删除成功"));
            getServerMembers();
          })
          .catch(() => {
            message.error($t("保存失败，部分权限无法编辑"));
          });
      } catch {
        message.error($t("保存失败，部分权限无法编辑"));
      }
    };
    watch(memberAndRoleList, () => {
      onReset();
    });
    return {
      memberAndRoleList,
      rules,
      titletext,
      formState,
      formRef,
      roleList,
      tabActiveKey,
      membersFromServerRole,
      addMembersModalVisible,
      memberSelectDataSource,
      memberSelectDataSourceListQueryTag,
      membersBlackWhite,
      getServerRoles,
      viewMode,
      handleTabChange,
      handleRoleChange,
      handelLoadMore,
      back,
      onReset,
      onSubmit,
      addSeverMembers,
      handleAddMembers,
      getServerMembers,
      handleDeleteRoles,
      getSeverMembers,
      handleDeleteMember,
      getMembersBlackWhite,
      ifCanEdit,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.role-settings {
  display: flex;
}
.role-settings-list {
  width: 200px;
  height: 100vh;
  border-right: 1px solid #363940;
  padding: 0 16px;
  .header {
    padding: 40px 0 0 0;
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
  .menu-item {
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    &.active {
      background: #363940;
    }
  }
}
.server-info {
  padding: 30px;
  .server-icon {
    display: flex;
    margin-bottom: 30px;
    .icon {
      width: 81px;
      height: 81px;
      border-radius: 50%;
      margin-right: 20px;
    }
    .info {
      p {
        color: #a3a4a9;
      }
    }
  }
}
.role-settings-container {
  flex: 1;
}
.title {
  height: 80px;
  padding: 40px 0 0 30px;
  text-align: left;
  font-size: 18px;
}
// 模拟select样式
.select-wrap {
  display: flex;
  text-align: right;
  margin-top: -25px;
}
.select-wrap /deep/ .ant-select-selector {
  background-color: #2e3036;
  border: none;
  font-size: 14px;
  width: 100%;
  color: #fff;
  margin-top: -5px;
}
.select-wrap /deep/ .ant-select-arrow {
  color: #fff;
}

.select {
  width: 185pt;
  height: 40pt;
  line-height: 40pt;
  padding-right: 20pt;
  text-indent: 4pt;
  text-align: left;
  vertical-align: middle;
  border: 1px solid #bda3a3;
  -moz-border-radius: 6px;
  -webkit-border-radius: 6px;
  border-radius: 6px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  font-family: SimHei;
  font-size: 12pt;
  font-weight: 500;
  color: RGBA(255, 255, 255, 255);
  cursor: pointer;
  outline: none;
  background: #111111;
}
.title-p {
  height: 80px;
  padding: 40px 0 0 10px;
  font-size: 18px;
  margin-top: -45px;
  border-bottom: #6a645d 1px solid;
}
.role-settings-content {
  padding: 30px;
  max-width: 800px;
}
.back-btn {
  cursor: pointer;
}
.role-details-container {
  width: 380px;
  padding: 5px;
}
.switch-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  .switch-title {
    color: #fff;
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
.role-members-container {
  position: relative;
  .add-members-btn {
    display: inline-block;
    position: absolute;
    text-align: right;
    margin-top: -25px;
    z-index: 1;
    cursor: pointer;
    color: #a3a4a9;
    font-size: 20px;
  }
  .role-members-empty {
    padding: 60px 0;
    color: #6e6f74;
    text-align: center;
  }
  .role-member-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    &:hover {
      background: #363940;
      border-radius: 8px;
      .role-member-delete {
        display: block;
        color: #ffffff;
        cursor: pointer;
        font-size: 20px;
        position: marker;
        right: 30px;
      }
    }
  }
  .role-member-delete {
    display: none;
  }
  .role-member-name {
    margin: 0 8px;
    color: #fff;
  }
  .role-member-accid {
    color: #a3a4a9;
  }
  .role-member-add {
    display: none;
    color: #a3a4a9;
    cursor: pointer;
    font-size: 40px;
    position: marker;
    right: 1130px;
  }
}
.setting-content-wrap {
  flex: 1;
  height: 100%;
  color: #fff;
  .title {
    padding: 45px 0 16px 30px;
    font-size: 18px;
    border-bottom: 1px solid #202126;
    line-height: 100%;
    .sub-title {
      font-size: 12px;
      color: #6e6f74;
    }
  }
}
.role-member-group {
  display: inline;
  margin-left: 20px;
  margin-top: 0px;
  width: 100%;
  float: left;
  .member-roles {
    height: 35px;
    width: 150px;
    padding-left: 10px;
    display: inline-block;
    color: #f8f6f6;
    border-radius: 10%;
    background: #282a2f;
    margin-right: 10px;
    padding-top: 5px;
    .role-delete {
      color: #656a72;
      background: #282a2f;
      position: absolute;
      margin-top: 5px;
      &:hover {
        background: #0a0a0a;
        border-radius: 8px;
        .role-member-delete {
          display: block;
        }
      }
    }
    .role-member-title {
      width: 150px;
      padding-left: 30px;
      position: static;
      width: 48px;
      height: 14px;
      left: 18px;
      top: 0px;
      font-family: "PingFang SC";
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 14px;
      color: #ffffff;
    }
  }
}

.member-info {
  display: inline-block;
}
.dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #6e6f74;
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
}
.addBtn {
  width: 30px;
  height: 30px;
  border-radius: 10%;
  background-color: #363940;
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
  text-align: center;
  color: #6e6f74;
  font-size: 16px;
  font-weight: bolder;
}
</style>
