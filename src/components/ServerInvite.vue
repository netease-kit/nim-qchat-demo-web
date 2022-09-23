<template>
  <Modal
    :visible="visible"
    class="dark"
    :width="520"
    title="向好友发送邀请 ID"
    :footer="null"
    @cancel="modalClose"
  >
    <div class="id-box">
      ID:
      <Text :style="{ color: '#a3a4a9' }" :copyable="{ text: id }">
        <span class="id">{{ id }}</span>
        <template v-slot:copyableIcon>
          <Button type="primary" @click="copy">
            {{ $t("复制") }}
          </Button>
        </template>
      </Text>
    </div>
  </Modal>
</template>

<script lang="ts">
import { Modal, Button, Typography } from "ant-design-vue";
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { emptyFunc } from "@/utils";

const Text = Typography.Text;

export default {
  name: "SeverInvite",
  components: {
    Modal,
    Button,
    Text,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: "",
    },
    modalClose: {
      type: Function,
      default: emptyFunc,
    },
  },
  setup() {
    const selectKey = ref("info");
    const store = useStore();
    return {
      selectKey,
      account: window.qchat?.account,
      curServer: computed(() => store.state.server.curServer),
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
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
</style>
