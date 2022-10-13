<template>
  <div class="setting-content-wrap">
    <div class="title">{{ $t("频道概况") }}</div>
    <div class="setting-content">
      <Form
        ref="formRef"
        class="form form--dark"
        :hideRequiredMark="true"
        :model="formState"
        layout="vertical"
        :rules="rules"
      >
        <FormItem :label="$t('频道名称')" name="name">
          <Input
            v-if="ifCanEdit"
            v-model:value="formState.name"
            :placeholder="$t('请输入频道名称')"
            :allowClear="true"
            :maxlength="50"
          ></Input>
          <Input
            v-if="!ifCanEdit"
            disabled
            v-model:value="formState.name"
            :placeholder="$t('请输入频道名称')"
            :allowClear="true"
            :maxlength="50"
          ></Input>
        </FormItem>
        <FormItem :label="$t('频道主题')" name="topic">
          <Textarea
            :rows="6"
            v-if="ifCanEdit"
            v-model:value="formState.topic"
            :placeholder="$t('请输入频道主题')"
            :allowClear="true"
            :maxlength="64"
          ></Textarea>
          <Textarea
            :rows="6"
            v-if="!ifCanEdit"
            disabled
            v-model:value="formState.topic"
            :placeholder="$t('请输入频道主题')"
            :allowClear="true"
            :maxlength="64"
          ></Textarea>
        </FormItem>
        <FormItem>
          <div class="button-wrap">
            <Button v-if="ifCanEdit" type="primary" @click="onSubmit">{{
              $t("保存")
            }}</Button>
            <Button v-if="!ifCanEdit" disabled>{{ $t("保存") }}</Button>
          </div>
          <div class="button-wrap">
            <Button v-if="ifCanEdit" class="setting__button" @click="onReset">
              {{ $t("重置") }}
            </Button>
            <Button v-if="!ifCanEdit" class="setting__button" disabled>
              {{ $t("重置") }}
            </Button>
          </div>
        </FormItem>
      </Form>
    </div>
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { computed, reactive, ref, toRaw, UnwrapRef, watch } from "vue";
import { Button, Form, Input, message } from "ant-design-vue/lib/components";
import { ChannelInfo } from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatChannelServiceInterface";

interface FormState {
  channelId: string;
  serverId: string;
  name: string;
  type: string;
  topic: string;
  ext?: string;
}

const FormItem = Form.Item;
const Textarea = Input.TextArea;

export default {
  name: "GeneralSituation",
  components: {
    Form,
    Input,
    Button,
    FormItem,
    Textarea,
  },
  props: {
    canEdit: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { t: $t } = useI18n();
    const store = useStore();
    const ifCanEdit = computed(() => {
      return props.canEdit;
    });
    let currentChannel = store.state.channel.currentChannel;
    // 表单元素
    const formState: UnwrapRef<FormState> = reactive({
      serverId: currentChannel.serverId,
      channelId: currentChannel.channelId,
      name: currentChannel.name,
      topic: currentChannel.topic,
      type: currentChannel.type,
      ext: currentChannel.ext,
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

    const onReset = () => {
      formState.serverId = currentChannel.serverId;
      formState.channelId = currentChannel.channelId;
      formState.name = currentChannel.name;
      formState.topic = currentChannel.topic;
      formState.type = currentChannel.type;
      formState.ext = currentChannel.ext;
    };

    watch(
      () => store.state.channel.currentChannel,
      (currChannel: ChannelInfo) => {
        currentChannel = currChannel;
        onReset();
      }
    );

    return {
      onSubmit: () => {
        formRef.value.validate().then(async () => {
          try {
            await store.dispatch("channel/updateChannel", toRaw(formState));
          } catch (err: any) {
            message.error($t("无权限操作"));
            return;
          }
        });
      },
      onReset,
      formRef,
      formState,
      rules,
      ifCanEdit,
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
    font-size: 18px;
    border-bottom: 1px solid #202126;
    line-height: 100%;
  }

  .setting-content {
    padding: 30px;
  }

  .button-wrap {
    display: inline-block;
    vertical-align: top;
    margin-right: 16px;
    &:last-child {
      margin-right: 0;
    }
  }
}
</style>
