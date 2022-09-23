<template>
  <div class="chat-page-container">
    <div class="header-wrap">
      <div class="left">
        <span class="symbol">#</span>
        <span class="name">{{ curChannel?.name }}</span>
        <span class="divider"></span>
        <span class="title">{{ curChannel?.topic }}</span>
      </div>
      <div class="right" :class="{ active: membersVisible }">
        <IconFont type="icon-chengyuan" @click="handleClick" />
      </div>
    </div>
    <div class="content-wrap" ref="contentRef">
      <div class="main">
        <ChatRoom />
      </div>
      <div class="members-wrap" v-if="membersVisible">
        <div
          class="mask"
          :class="{ expand: visible }"
          @click="unSetCurMember()"
        >
          <div class="mask-content" @scroll="handleScroll">
            <List
              item-layout="horizontal"
              :data-source="serverMembers"
              :split="false"
            >
              <template #loadMore>
                <Spin v-if="loadingMore" :indicator="indicator"></Spin>
              </template>
              <template #renderItem="{ item }">
                <ListItem>
                  <div
                    class="member-item"
                    :key="item.accid"
                    :class="{ selected: item.accid === curMember?.accid }"
                    @click="setCurMember(item)"
                    @click.stop="true"
                  >
                    <div class="avatar">
                      <CommonAvatar
                        :avatar="item.avatar"
                        :nick="item.nick"
                        :accid="item.accid"
                        :width="36"
                        :border="0"
                      ></CommonAvatar>
                    </div>
                    <div class="nick-name">
                      <Text
                        :style="{ maxWidth: '120px' }"
                        :content="item.nick || item.accid"
                        :ellipsis="{ tooltip: item.nick || item.accid }"
                      >
                      </Text>
                    </div>
                    <div class="owner" v-if="!!item.type">
                      <IconFont type="icon-chuangjianzhe" />
                    </div>
                  </div>
                </ListItem>
              </template>
            </List>
            <div class="member-detail-wrap" v-if="curMember" @click.stop="true">
              <img class="header-background" src="../assets/member_bg.png" />
              <div class="body-wrap">
                <CommonAvatar
                  :avatar="curMember.avatar"
                  :nick="curMember.nick"
                  :accid="curMember.accid"
                  :width="70"
                  :border="4"
                ></CommonAvatar>
                <div class="name-wrap" v-if="curMember.nick">
                  <Paragraph
                    :style="{ maxWidth: '260px', color: '#fff' }"
                    :content="curMember.nick"
                    :ellipsis="{ tooltip: curMember.nick, rows: 2 }"
                  >
                  </Paragraph>
                </div>
                <div class="accid-wrap">
                  <Text
                    :style="{ maxWidth: '260px', color: '#a3a4a9' }"
                    :content="'#' + curMember.accid"
                    :ellipsis="{ tooltip: '#' + curMember.accid }"
                  >
                  </Text>
                </div>
                <div class="divider"></div>
                <div class="roles-title">{{ $t("身份组") }}</div>
                <div class="roles-wrap">
                  <div
                    class="role-item"
                    v-for="role in curMemberRoles || []"
                    :key="role.roleId"
                  >
                    {{ role.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ref, watch, h } from "vue";
import { useStore } from "vuex";
import { List, Spin, Typography } from "ant-design-vue";
import { LoadingOutlined } from "@ant-design/icons-vue";
import { MemberInfo } from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatServerServiceInterface";
import { QChatServerRole } from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatRoleServiceInterface";
import { getColorByAccid } from "@/utils";
import ChatRoom from "./ChatRoom/index.vue";
import CommonAvatar from "./CommonAvatar.vue";
import IconFont from "./IconFont";

const ListItem = List.Item;
const Text = Typography.Text;
const Paragraph = Typography.Paragraph;

export default {
  name: "ChatPage",
  components: {
    ChatRoom,
    CommonAvatar,
    List,
    ListItem,
    Spin,
    IconFont,
    Text,
    Paragraph,
  },

  setup() {
    const store = useStore();
    const contentRef = ref<any>(null);
    const membersVisibleRef = ref<boolean>(false);
    const loadingMoreRef = ref<boolean>(false);

    const indicator = h(LoadingOutlined, {
      style: {
        fontSize: "20px",
        marginBottom: "10px",
      },
      spin: true,
    });

    watch(
      () => store.state.server.curServer,
      (server) => {
        if (server.serverId) {
          store.dispatch("server/getSeverMembers", {
            serverId: server.serverId,
            timetag: 0,
          });
        }
      },
      {
        immediate: true,
      }
    );

    watch(
      [() => store.state.server.curMember, () => store.state.server.curServer],
      ([member, server]) => {
        if (member?.accid && server?.serverId)
          store.dispatch("server/getCurMemberRoles", {
            serverId: server.serverId,
            accid: member.accid,
            timetag: 0,
          });
      },
      {
        immediate: true,
      }
    );

    watch(
      () => store.state.server.serverMembers,
      () => {
        loadingMoreRef.value = false;
      },
      {
        immediate: true,
      }
    );

    return {
      indicator,
      contentRef,
      getColorByAccid,
      curChannel: computed(() => store.state.channel.currentChannel),
      serverMembers: computed(() => store.state.server.serverMembers?.datas),
      curMember: computed(() => store.state.server.curMember),
      curMemberRoles: computed(() => store.state.server.curMemberRoles),
      visible: computed(() => !!store.state.server.curMember),
      membersVisible: computed(() => !!membersVisibleRef.value),
      loadingMore: computed(() => !!loadingMoreRef.value),
      setCurMember: (member: MemberInfo) => {
        store.commit("server/setCurMember", member);
      },
      setCurMemberRoles: (roles: QChatServerRole[]) => {
        store.commit("server/setCurMemberRoles", roles);
      },
      unSetCurMember() {
        store.commit("server/setCurMember", null);
      },
      unSetCurMemberRoles() {
        store.commit("server/setCurMemberRoles", null);
      },
      handleClick() {
        membersVisibleRef.value = !membersVisibleRef.value;
      },
      handleScroll(e: any): void {
        if (
          loadingMoreRef.value ||
          !store.state.server.serverMembers?.listQueryTag?.hasMore
        ) {
          return;
        }
        const hiddenHeight =
          store.state.server.serverMembers.length * 48 -
          e.target.clientHeight -
          e.target.scrollTop;

        if (hiddenHeight >= 100) {
          return;
        }

        loadingMoreRef.value = true;

        store.dispatch("server/appendSeverMembers", {
          serverId: store.state.server.curServer.serverId,
          timetag:
            store.state.server.serverMembers?.listQueryTag?.nextTimetag || 0,
        });
      },
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.chat-page-container {
  display: flex;
  flex-direction: column;
  height: 100%;

  .header-wrap {
    display: inline-flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 17px 20px 8px;
    border-bottom: 1px solid #202126;
    font-size: 16px;
    line-height: 28px;
    vertical-align: top;

    .left {
      display: inline-flex;
      flex-direction: row;

      .symbol {
        margin-right: 6px;
        font-size: 28px;
        color: #464a54;
      }

      .name {
        margin-right: 16px;
      }

      .divider {
        width: 1px;
        height: 28px;
        margin-right: 16px;
        background: #464a54;
      }

      .title {
        font-size: 14px;
        color: #a3a4a9;
      }
    }

    .right {
      color: #464a54;
      font-size: 26px;

      &.active {
        color: #a3a4a9;
      }
    }
  }

  .content-wrap {
    display: inline-flex;
    flex-direction: row;
    height: calc(100% - 55px);

    .main {
      flex: 1;
      height: 100%;
    }

    .members-wrap {
      position: relative;
      width: 208px;
      height: 100%;
      padding: 2px 0;
      background-color: #282a2f;

      .mask {
        position: fixed;
        top: 55px;
        right: 0;
        width: 208px;
        height: auto;

        .ant-list-item {
          padding: 0;
        }

        .ant-list-header {
          position: fixed;
        }

        &.expand {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          width: 100vw;

          .mask-content {
            top: 55px;
          }
        }

        .mask-content {
          position: absolute;
          top: 0;
          right: 0;
          width: 208px;
          max-height: calc(100vh - 55px);
          overflow-y: scroll;

          .load-more-wrap {
            padding: 4px 0;
            color: #fff;
            border: 1px solid #fff;
          }

          .member-item {
            display: inline-flex;
            flex-direction: row;
            align-items: center;
            width: 100%;
            height: 48px;
            font-size: 14px;
            color: #fff;
            cursor: pointer;

            &.selected {
              background-color: #212326;
            }

            .avatar {
              margin-right: 8px;
              margin-left: 14px;
            }

            .nick-name {
              margin-right: 8px;

              .ant-typography {
                color: #fff;
              }
            }

            .owner {
              color: #ffbd3e;
            }
          }

          .member-detail-wrap {
            position: fixed;
            width: 300px;
            top: 93px;
            right: 220px;
            min-height: 318px;
            border-radius: 8px;
            background-color: #18191c;
            text-align: left;

            .header-background {
              width: 100%;
              height: 80px;
              border-radius: 8px 8px 0 0;
              object-fit: cover;
            }

            .body-wrap {
              margin-top: -35px;
              padding: 0 20px 36px;

              .avatar-wrap {
                height: 70px;
                border-radius: 50%;

                img {
                  display: inline-block;
                  width: 70px;
                  height: 70px;
                  object-fit: cover;
                  border-radius: 50%;
                  border: 4px solid #18191c;
                }
              }

              .name-wrap {
                margin-top: 17px;
                margin-right: 8px;
                font-weight: 500;
                font-size: 24px;
                line-height: 26px;
              }

              .accid-wrap {
                margin-top: 6px;
                font-weight: 500;
                font-size: 16px;
                line-height: 20px;
              }

              .divider {
                height: 1px;
                margin-top: 16px;
                background-color: #202126;
              }

              .roles-title {
                margin-top: 16px;
                font-size: 14px;
                line-height: 16px;
                color: #6e6f74;
              }

              .roles-wrap {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                margin-top: 16px;
                color: #fff;

                .role-item {
                  padding: 4px 8px;
                  margin-right: 6px;
                  margin-bottom: 6px;
                  border-radius: 8px;
                  background-color: #282a2f;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
