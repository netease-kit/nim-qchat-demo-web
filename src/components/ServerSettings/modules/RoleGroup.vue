<template>
  <div v-if="!settingRole">
    <div class="title">
      {{ $t("身份组") }}
      <span class="sub-title">{{
        $t("使用身份组组织你的服务器成员并自定义其权限")
      }}</span>
    </div>
    <div class="role-group-content">
      <div class="default-role">
        <div class="role-info">
          <span class="role-info__icon">
           <TeamOutlined class="item-name-icon" theme="filled" />
          </span>
          <span class="role-name">
            {{ $t("默认权限") }}
            <br />
            <span class="role-desc">
              {{ $t("@everyone·适用于所有服务器成员") }}
            </span>
          </span>
        </div>
        <RightOutlined
          v-if="ifCanEdit"
          :style="{ fontSize: '12px', color: '#6E6F74' }"
          @click="editRole(defaultRole)"
        />
        <RightOutlined
          v-if="!ifCanEdit"
          :style="{ fontSize: '12px', color: '#6E6F74' }"
        />
      </div>
      <Button v-if="ifCanEdit" type="primary" @click="createVisible = true">
        {{ $t("创建新身份组") }}
      </Button>
      <Button v-if="!ifCanEdit" disabled @click="createVisible = true">
        {{ $t("创建新身份组") }}
      </Button>
      <p class="role-tips">{{ $t("你只能管理比自己最高身份更低的身份组") }}</p>
      <div class="role-table">
        <div class="role-table-thead role-table-row">
          <div class="role-table-cell">{{ $t("身份组") }}</div>
          <div class="role-table-cell">{{ $t("成员") }}</div>
          <div class="role-table-cell"></div>
        </div>
        <div class="role-table-tbody">
            <div>
              <div class="role-table-row" v-for="(element) in NoDragRoleList" :key="element.roleId">
                <div class="role-table-cell">
                  <LockOutlined/>
                  <UserOutlined style="font-size: 18px"/>
                  {{ element.name }}
                </div>
                <div class="role-table-cell">
                  <UserOutlined style="font-size: 16px"/>
                  {{ element.memberCount }}</div>
                <div class="role-table-cell">
                  <EditOutlined v-if="ifCanEdit" class="action-btn" @click="editRole(element)" />
                  <EditOutlined v-if="!ifCanEdit" disabled class="action-btn" />
                  <DeleteOutlined
                  v-if="ifCanEdit"
                    class="action-btn"
                    @click="handleDeleteRole(element)"
                  />
                  <DeleteOutlined
                  v-if="!ifCanEdit"
                    class="action-btn"
                  />
                </div>
              </div>
            </div>
            <Draggable
            :list="canDragRoleList"
            handle=".role-drag-holder"
            item-key="name"
            class="list-group"
            drag-class="drag-class"
            ghost-class="drag-ghost"
            @end="handleDragRoles"
          >
            <template #item="{ element }">
              <div class="role-table-row" :key="element.roleId">
                <div class="role-table-cell">
                  <HolderOutlined class="role-drag-holder" />
                  <UserOutlined style="font-size: 18px"/>
                  {{ element.name }}
                </div>
                <div class="role-table-cell">
                  <UserOutlined style="font-size: 16px"/>
                  {{ element.memberCount }}</div>
                <div class="role-table-cell">
                  <EditOutlined v-if="ifCanEdit" class="action-btn" @click="editRole(element)" />
                  <EditOutlined v-if="!ifCanEdit" disabled class="action-btn" />
                  <DeleteOutlined
                  v-if="ifCanEdit"
                    class="action-btn"
                    @click="handleDeleteRole(element)"
                  />
                  <DeleteOutlined
                  v-if="!ifCanEdit"
                    class="action-btn"
                  />
                </div>
              </div>
            </template>
          </Draggable>
        </div>
      </div>
    </div>
    <Modal
      v-model:visible="createVisible"
      :title="$t('新建身份组')"
      class="dark"
      :footer="null"
      :width="520"
    >
      <Form
        ref="formRef"
        class="create-form form--dark"
        :hideRequiredMark="true"
        :model="formState"
        layout="vertical"
        :rules="rules"
      >
        <FormItem :label="$t('身份组名称')" name="roleName">
          <Input
            v-model:value="formState.roleName"
            :maxlength="20"
            :placeholder="$t('请输入身份组名称')"
          ></Input>
        </FormItem>
        <div class="bottom-button">
          <Button class="setting__button" @click="createVisible = false"
            >取消</Button
          >
          <Button type="primary" @click="handleCreateRole">确认</Button>
        </div>
      </Form>
    </Modal>
  </div>
  <RoleSettings :ifCanEdit="ifCanEdit" :currentUserMaxRolePriority="minRolePriority" v-else />
</template>

<script lang="ts">
import Draggable from "vuedraggable";
import { ref, reactive, toRaw, defineComponent, computed, watch, onBeforeMount, onMounted } from "vue";
import { Button, Modal, Form, Input } from "ant-design-vue";
import { useStore } from "vuex";
import {
  RightOutlined,
  HolderOutlined,
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  ContactsTwoTone,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons-vue";
import { useI18n } from "vue-i18n";
import { QChatServerRole } from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatRoleServiceInterface";
import RoleSettings from "./RoleSettings.vue";

const FormItem = Form.Item;

export default defineComponent({
  name: "RoleGroup",
  components: {
    Draggable,
    RightOutlined,
    HolderOutlined,
    DeleteOutlined,
    EditOutlined,
    LockOutlined,
    UserOutlined,
    Modal,
    Form,
    FormItem,
    Input,
    Button,
    RoleSettings,
    TeamOutlined,
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
    const { t: $t } = useI18n();

    const store = useStore();

    const serverId = store.state.server.curServer.serverId;

    const ifOwner = computed(() => store.state.server.curServer.owner === store.state.user.userProfile.account );

    const defaultRole = computed(() =>
      store.state.server.curServerRoles.find(
        ({ type }: { type: string }) => type === "everyone"
      )
    );

    const settingRole = computed(() => store.state.server.settingServerRole);

    const createVisible = ref<boolean>(false);

    const roleList = ref<QChatServerRole[]>([]);

    //可以移动的身份
    const canDragRoleList = ref<QChatServerRole[]>([]);
    //不可移动的身份
    const NoDragRoleList = ref<QChatServerRole[]>([]);

    const formRef = ref();
    // 表单元素
    const formState = reactive({
      roleName: "",
    });
    // 表单校验规则
    const rules = {
      roleName: [
        {
          required: true,
          message: $t("请输入身份组名称"),
          trigger: "blur",
        },
      ],
    };

    const getServerRoles = () => {
      store.dispatch("server/getServerRoles", { serverId });
    };

    const handleCreateRole = () => {
      formRef.value.validate().then(() => {
        const last = roleList.value[roleList.value.length - 1];
        let priority = 1;
        if (last) {
          priority = last.priority + 1;
        }
        store
          .dispatch("server/createServerRole", {
            serverId,
            priority,
            name: toRaw(formState).roleName,
          })
          .then((resp) => {
            // 刷新
            getServerRoles();
            createVisible.value = false;
          });
      });
    };

    const minRolePriority = ref(0);

    onMounted(()=>{
      maxPriority();
    });

    const maxPriority = () =>{
        store.dispatch("server/getServerRolesByAccid",{
          serverId:store.state.server.curServer.serverId,
          accid: store.state.user.userProfile.account,
          timetag:0,
          limit: 100,
        }).then((resp) =>{
          let min = 100000;
          for (let index = 0; index < resp.length; index++) {
            const item = resp[index];
            if(item.priority < min){
                min = item.priority;
            }
          }
          minRolePriority.value = min;
          roleGroupByPriority();
        });
    };

    const sortByKey = (array, key, order) =>{
      return array.sort(function(a, b) {
        var x = a[key]; var y = b[key]
        if (order) {
          return ((x < y) ? -1 : ((x > y) ? 1 : 0))
        } else {
          return ((x < y) ? ((x > y) ? 1 : 0) : -1)
        }
      })
    }

    const roleGroupByPriority = () =>{
      canDragRoleList.value = [];
      NoDragRoleList.value = [];
      if(ifOwner.value){
        canDragRoleList.value = roleList.value;
      }else{
        for (let k = 0; k < roleList.value.length; k++) {
          const role = roleList.value[k];
          if(role.priority > minRolePriority.value){
            canDragRoleList.value.push(role);
          }else{
            NoDragRoleList.value.push(role);
          }
        }
      }
      sortByKey(canDragRoleList.value,'priority',true);
      sortByKey(NoDragRoleList.value,'priority',true);
    }


    // 身份组拖动排序
    const handleDragRoles = (event) => {
      let maxPriority = 0;
      for (let index = canDragRoleList.value.length; index > 0; index--) {
        const role = canDragRoleList.value[index-1];
        maxPriority = Math.max(role.priority,maxPriority);
      }
      for (let index = canDragRoleList.value.length; index > 0; index--) {
        const role = canDragRoleList.value[index-1];
        role.priority = maxPriority--;
      }
      store
        .dispatch("server/updateServerRolePriorities", {
          serverId,
          serverRoles:canDragRoleList.value,
        })
        .then(() => {
          // 刷新
          getServerRoles();
        });
    };
    // 身份组删除
    const handleDeleteRole = (role: any) => {
      Modal.confirm({
        title: $t(`确认删除"${role.name}"身份组`),
        okText: () => $t("确认"),
        cancelText: () => $t("取消"),
        async onOk() {
          try {
            return await store
              .dispatch("server/deleteServerRole", {
                serverId,
                roleId: role.roleId,
              })
              .then(() => {
                getServerRoles();
              });
          } catch {
            return console.log("Oops errors!");
          }
        },
      });
    };
    // 身份组编辑
    const editRole = (role: QChatServerRole) => {
      store.commit("server/setSettingServerRole", role);
    };

    watch(
      () =>
        store.state.server.curServerRoles.filter(
          ({ type }: { type: string }) => type === "custom"
        ),
      (roles) => {
        roleList.value = roles;
        maxPriority();
      }
    );

    // 初始化身份组
    getServerRoles();

    return {
      settingRole,
      defaultRole,
      roleList,
      createVisible,
      formRef,
      rules,
      formState,
      editRole,
      handleCreateRole,
      handleDragRoles,
      handleDeleteRole,
      ifCanEdit,
      maxPriority,
      roleGroupByPriority,
      minRolePriority,
      canDragRoleList,
      NoDragRoleList,
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.title {
  height: 80px;
  padding: 40px 0 0 30px;
  text-align: left;
  font-size: 18px;
  border-bottom: 1px solid #202126;
  .sub-title {
    font-size: 12px;
    color: #6e6f74;
  }
}
.role-group-content {
  padding: 30px;
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
    .item-name-icon {
      color: #a3a4a9;
      font-size: 34px;
      margin-left: 3px;
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
  width: 400px;
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
</style>
