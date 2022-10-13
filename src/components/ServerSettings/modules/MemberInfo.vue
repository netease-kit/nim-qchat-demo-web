/* eslint-disable */
<template>
  <div class="setting-content-wrap">
    <div class="title">{{ $t("服务器成员") }}</div>
    <div class="server-info">
      <div class="server-icon-container">
        <div class="title-p">
          <div style="display: inline-block; font-size:14px; color:#6e6f74;">
            {{ memberAndRoleList.length }}人
          </div>
          <span
            style="display: inline-block; text-align: right; margin-left: 80%; font-size:14px; color:#6e6f74;"
            >显示身份组：</span
          >
          <div class="select-wrap">
            <a-select
              ref="select"
              :value="selectedKey"
              @focus="focus"
              @change="getServerRoleMembers"
            >
              <a-select-option
                class="selectOption"
                v-for="item in roleList"
                :key="item.roleId"
                :value="item.roleId"
                :label="item.name"
              >{{item.name}}</a-select-option>
            </a-select>
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
              :width="33"
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
                  <CloseCircleFilled
                    class="role-delete"
                    v-if="ifCanEdit"
                    @click="
                      handleDeleteRoles(
                        item.memberInfo.accid,
                        role.roleId,
                        role.index
                      )
                    "
                  />
                  <CloseCircleFilled
                    class="role-delete-disabled"
                    v-if="!ifCanEdit"
                  />
                  <span class="role-member-title">{{ role.name }}</span>
                </div>
                <PlusCircleOutlined
                  v-if="ifCanEdit"
                  class="role-member-add"
                  @click="getSeverMembers(item)"
                />
                <PlusCircleOutlined
                  v-if="!ifCanEdit"
                  class="role-member-add"
                />
                </div>
                  <DeleteOutlined
                    v-if="ifCanEdit"
                    class="role-member-delete"
                    @click="handleDeleteMember(item.memberInfo)"
                  />
                  <DeleteOutlined
                    v-if="!ifCanEdit"
                    class="role-member-delete-disabled"
                    @click="handleDeleteMember(item.memberInfo)"
                  />
              </div>
           </div>
        </div>
    </div>
  </div>
  <ChannelSelectModal
    :visible="addMembersModalVisible"
    :dataSource="RolesSelectDataSource"
    :hasMore="RolesSelectDataSourceListQueryTag.hasMore"
    @cancel="addMembersModalVisible = false"
    @ok="handleAddMembers"
    @onLoadMore="handelLoadMore"
  />
</template>
<script lang="ts">
import { ref, reactive, computed, watch,onBeforeMount,onMounted } from "vue";
import { message, Modal } from "ant-design-vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import ChannelSelectModal from "../../Common/ChannelSelectModal.vue";
import { QChatServerRole } from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatRoleServiceInterface";
import { MemberInfo } from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatServerServiceInterface";
import CommonAvatar from "../../CommonAvatar.vue";
import { CloseCircleFilled, PlusCircleOutlined, DeleteOutlined } from "@ant-design/icons-vue";
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
    ChannelSelectModal,
    CommonAvatar,
    CloseCircleFilled,
    PlusCircleOutlined,
    DeleteOutlined
  },

  props:{
    canEdit:{
      type:Boolean,
      default:false,
    }
  },

  setup(props,context) {
    const ifCanEdit = computed(() => {
      return props.canEdit
      });
    onBeforeMount(()=>{
        getServerRoles();
    });
    onMounted(() =>{
      setSelectedKey();
      getServerRoleMembers(undefined);
    });

    const { t: $t } = useI18n();

    let accidnow = "";

    const store = useStore();
    //1: 名称与权限；  2: 管理成员；
    const tabActiveKey = ref("1");

    const membersFromServerRole = ref<MemberInfo[]>([]);

    const addMembersModalVisible = ref(false);

    let memberAndRoleList = ref<any[]>([]);

    const RolesSelectDataSource = ref<ChannelInfo[]>([]);

    const RolesSelectDataSourceListQueryTag = reactive({
      hasMore: false,
      nextTimetag: 0,
    });

    const formRef = ref();

    const roleList = computed(() => store.state.server.curServerRoles);

    const selectedKey = ref();

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
    // 查询某服务器下某身份组下的成员列表
    const getMembersFromServerRole = (selectedRoleId: any) => {
      store
        .dispatch("server/getMembersFromServerRole", {
          serverId: store.state.server.curServer.serverId,
          roleId: selectedRoleId,
        })
        .then((res) => {
          membersFromServerRole.value = res;
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
              .dispatch("server/removeMembersFromServer", {
                serverId:  store.state.server.curServer.serverId,
                accids: [member.accid],
              })
              .then(() => {
                message.success($t("移除成功"));
                getServerRoleMembers(undefined);
              });
          } catch {
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

    const getSeverMembers = async (item) => {
      const res = await store.dispatch("server/getServerRoles", {
        serverId: store.state.server.curServer.serverId,
        timetag: 0,
      }).then((res) => {
          accidnow = item.memberInfo.accid;
          store.dispatch("server/getServerRolesByAccid", {
            serverId:  store.state.server.curServer.serverId,
            timetag: 0,
            limit: 100,
            accid: item.memberInfo.accid,
          }).then((rsp) => {
           let RolesSelect = res.roles.filter((s) =>
                !(s.name === "@everyone"),
            );
            RolesSelectDataSource.value = RolesSelect.filter((s) =>
              !rsp.find((i) => i.roleId === s.roleId)
            );
          });
      })
      addMembersModalVisible.value = true;
    };

    const setSelectedKey = async () =>{
      store.dispatch("server/getServerRoles",{serverId:store.state.server.curServer.serverId}).then(response =>{
         for (let index = 0; index < response.length; index++) {
            const roleInfo = response[index];
            if(selectedKey.value == undefined && roleInfo.type === 'everyone'){
                  selectedKey.value = roleInfo.roleId;
                  break;
            }
          }
       });
    }

    const getServerRoleMembers = (selectedValue) => {
      let role;
      if(selectedValue == undefined || selectedKey.value == undefined){
        role = {type:'everyone'};
        for (let index = 0; index < roleList.value.length; index++) {
          const item = roleList.value[index];
          if(item.type === 'everyone'){
            selectedKey.value = item.roleId;
          }
        }
      }else{
         for (let index = 0; index < roleList.value.length; index++) {
          const item = roleList.value[index];
          if(item.roleId === selectedValue && item.type === 'everyone'){
            selectedKey.value = item.roleId;
            role = {type:'everyone'};
          }
        }
        if(role == undefined){
            role = {type: 'custom',roleId:selectedValue};
        }

      }
      memberAndRoleList.value = [];
      store.dispatch("server/getSeverMembers", {
          serverId: store.state.server.curServer.serverId,
          timetag: new Date().getTime(),
          limit: 200,
      }).then((resp) => {
        const memberInfos = resp.datas;
        memberInfos.forEach(item => {
          store.dispatch("server/getServerRolesByAccid", {
            serverId: item.serverId,
            timetag: 0,
            limit: 100,
            accid: item.accid,
          })
          .then((rsp) => {
              if(role.type ==='everyone'){
                  memberAndRoleList.value.push({ memberInfo: item, roles: rsp });
              }else{
                const roles = rsp.filter(roleInfo => role.roleId === roleInfo.roleId);
                if(roles.length == 1){
                    memberAndRoleList.value.push({ memberInfo: item, roles: roles });
                }
              }

          });
        });

      });

    };

    const getServerRoles = () => {
      store.dispatch("server/getServerRoles", {
          serverId: store.state.server.curServer.serverId,
        });
    };

    const handleAddMembers = (roles: QChatServerRole[]) => {
      for (let i = 0; i < roles.length; i++) {
        let item = roles[i];
        store
          .dispatch("server/addMembersToServerRole", {
            serverId: store.state.server.curServer.serverId,
            roleId: item.roleId,
            accids: [accidnow],
          })
          .then(() => {
            message.success($t("添加成功"));
            getServerRoleMembers(undefined);

          });
      }
      addMembersModalVisible.value = false;
    };
    const handleDeleteRoles = (accid: any, roleId: any, indexsum: any) => {
      store
        .dispatch("server/removeMembersFromServerRole", {
          serverId: store.state.server.curServer.serverId,
          roleId: roleId,
          accids: [accid],
        })
        .then(() => {
          message.success($t("删除成功"));
          getServerRoleMembers(undefined);
        });
    };
    watch(memberAndRoleList, () => {
      onReset();
    });
    return {
      memberAndRoleList,
      rules,
      formState,
      formRef,
      roleList,
      tabActiveKey,
      membersFromServerRole,
      addMembersModalVisible,
      RolesSelectDataSource,
      RolesSelectDataSourceListQueryTag,
      selectedKey,
      ifCanEdit,
      getServerRoles,
      handleRoleChange,
      back,
      onReset,
      onSubmit,
      handleAddMembers,
      getServerRoleMembers,
      handleDeleteRoles,
      getSeverMembers,
      handleDeleteMember,
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
.select-wrap{
  display: inline-block; text-align: right;
}
.select-wrap /deep/ .ant-select-selector {
  background-color: #2e3036; border:none; font-size:14px; width:120px; color:#fff;
}
.select-wrap /deep/ .ant-select-arrow{
  color:#fff;
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
    position: absolute;
    right: 10px;
    top: -45px;
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
      .role-member-delete{
        display: block;
        color: #ffffff;
        cursor: pointer;
        font-size: 20px;
        position: marker;
        right: 30px;
      }
    }
  }
  .role-member-delete{
    display: none;
  }
  .role-member-delete-disabled{
    display: none;
  }
  .role-member-name {
    margin: 0 8px;
    color: #fff;
  }
  .role-member-accid {
    color: #a3a4a9;
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
.role-member-add {
  color: #282A2F;
  font-size: 30px;
  position: marker;
  margin-left: 20px;
  margin-top: 0px;
  vertical-align:middle;
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
    background: #282A2F;
    margin-right: 10px;
    padding-top: 5px;
    .role-delete-disabled{
      color: #656A72;
      background: #282A2F;
      position: absolute;
      margin-top: 5px;
    }
    .role-delete{
      color: #656A72;
      background: #282A2F;
      position: absolute;
      margin-top: 5px;
      &:hover {
        background: #0a0a0a;
        border-radius: 8px;
        .role-member-delete{
          display: block;
          color: #ffffff;
          cursor: pointer;
          font-size: 20px;
          position: marker;
          right: 30px;
        }
      }
    }
    .role-member-title{
      width: 150px;
      padding-left: 30px;
      position: static;
      width: 48px;
      height: 14px;
      left: 18px;
      top: 0px;
      font-family: 'PingFang SC';
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 14px;
      color: #FFFFFF;
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
