<template>
  <div class="home-container">
    <div class="servers-wrap">
      <ServerBar></ServerBar>
    </div>
    <div class="server-content-wrap">
      <div class="servers-home" v-if="serversHomevisible">
        <ServersHome></ServersHome>
      </div>
      <div class="channels-wrap" v-if="!serversHomevisible">
        <ChannelBar></ChannelBar>
      </div>
      <div class="chatpage-wrap" v-if="!serversHomevisible">
        <ChatPage></ChatPage>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";

import { ServerBar, ChannelBar, ChatPage, ServersHome } from "@/components";

export default {
  name: "HomeView",
  components: {
    ServerBar,
    ChannelBar,
    ChatPage,
    ServersHome,
  },
  setup() {
    const store = useStore();

    return {
      serversHomevisible: computed(() => !store.state.server.curServer),
    };
  },
};
</script>

<style scoped lang="less">
.home-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  color: #fff;
  background-color: #282a2f;

  .servers-wrap {
    width: 66px;
    background-color: #212326;
  }

  .server-content-wrap {
    display: inline-flex;
    flex-direction: row;
    flex: 1;
    height: 100%;
    overflow-y: scroll;

    .servers-home {
      width: 100%;
    }

    .channels-wrap {
      width: 222px;
    }

    .chatpage-wrap {
      flex: 1;
      background-color: #2e3036;
    }
  }
}
</style>
