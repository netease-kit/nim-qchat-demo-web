<template>
  <!-- <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </nav> -->
  <router-view />
</template>
<script lang="ts">
export default {
  name: "App",
};
</script>

<style lang="less">
*::-webkit-scrollbar {
  width: 0;
}
#app {
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
.ant-checkbox-wrapper.dark {
  .ant-checkbox-inner {
    background: #37393e;
  }
  .ant-checkbox-checked .ant-checkbox-inner {
    background: #1890ff;
  }
}
.ant-modal.dark {
  .ant-modal-content {
    border-radius: 8px;
  }
  .ant-input-affix-wrapper {
    border-radius: 8px;
    border: 1px solid #23252b;
    background: #282a2f;
  }
  .ant-modal-header,
  .ant-modal-content {
    border-radius: 8px;
    background: #37393e;
    color: white;
    border-color: #474a52;

    .ant-modal-footer {
      border-top: 1px solid #474a52;
    }
    .ant-modal-title,
    .ant-modal-close {
      color: white;
    }
    .ant-modal-title {
      font-size: 18px;
    }
  }
  .ant-modal-header {
    border-radius: 8px 8px 0 0;
  }
  .ant-input-affix-wrapper > input.ant-input {
    color: white;
    background: #282a2f;
  }
}

.ant-image-img.imgMsg {
  width: 230px;
  height: 160px;
  border-radius: 0 10px 10px 10px;
  object-fit: contain;
  background-color: #23252c;
  padding: 2px 0;
  cursor: pointer;
}

.full-modal {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  overflow: auto;
  outline: 0;
  background: #282a2f;
  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }
  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
    background: transparent;
    box-shadow: 0 0 0 0;
  }
  .ant-modal-body {
    flex: 1;
    padding: 0;
  }
  .ant-modal-close {
    color: rgba(255, 255, 255, 0.45);
  }
  .ant-modal-close:hover {
    color: rgba(255, 255, 255, 0.75);
  }
}
.tabs--dark {
  .ant-tabs-bar {
    border-bottom: 1px solid #363940;
  }
  .ant-tabs-tab {
    color: #6e6f74;
  }
  .ant-tabs-nav .ant-tabs-tab-active,
  .ant-tabs-nav .ant-tabs-tab:hover {
    color: #ffffff;
  }
}
.ant-form.form--dark {
  .ant-row {
    .ant-input {
      border-style: none;
      color: white;
      background-color: #282a2f;
      border-radius: 8px;
    }
    .ant-input[disabled] {
      border-style: none;
      color: rgba(255, 255, 255, 0.25);
      background: #282a2f;
    }
    .ant-input-affix-wrapper {
      background: #282a2f;
      padding-top: 0;
      padding-bottom: 0;
      border-style: none;
      border-radius: 8px;
    }
    .ant-input-affix-wrapper:hover {
      background: #282a2f;
      padding-top: 0;
      padding-bottom: 0;
      border-style: none;
      border-radius: 8px;
    }
    .ant-btn {
      border-radius: 4px;
    }
    .anticon {
      color: #6e6f74;
    }
    input.ant-input {
      height: 40px;
    }
    .ant-form-item-label > label {
      color: #74767a;
    }
    .ant-btn {
      background: #3c3e45;
      color: #fff;
      border-style: none;
    }
    .ant-btn-primary {
      background: #337eff;
    }
  }
}
.qchat-setting-menu {
  background: #282a2f;
  width: 132px;
  .menu-item {
    cursor: pointer;
    padding-left: 16px;
    line-height: 32px;
    color: white;
    border-radius: 4px;
    &.active {
      background: #363940;
    }
    &.danger {
      color: #ff5c5c;
    }
    &.menu-title {
      color: #6e6f74;
    }
  }
  .line {
    margin-top: 8px;
    width: 100%;
    height: 1px;
    background: #363940;
  }
}

// 频道权限里的cascader控件样式修改
.ant-input {
  border-color: #23252a !important;
}
.ant-cascader-picker-arrow {
  color: rgba(155, 156, 161, 0.25) !important;
}
.ant-cascader-menus {
  background: #18191c !important;
  color: #fff;
}
.ant-cascader-menu {
  border-right-color: #1f2125 !important;
}
.ant-cascader-menu-item:hover {
  background: #282a2e !important;
}
.ant-cascader-menu-item-active:not(.ant-cascader-menu-item-disabled),
.ant-cascader-menu-item-active:not(.ant-cascader-menu-item-disabled):hover {
  background-color: #282a2e !important;
}
.ant-cascader-menu-item-expand .ant-cascader-menu-item-expand-icon,
.ant-cascader-menu-item-loading-icon {
  color: rgb(255 255 255 / 45%) !important;
}

/* 全局修改下拉框的样式 */
.ant-select-dropdown {
  background: #18191c;
  color: #fff;
}
.ant-select-item {
  color: #fff;
}
.ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
  color: #fff;
  background-color: #18191c;
}
.ant-select-item-option-active:not(.ant-select-item-option-disabled) {
  background-color: #282a2e;
}
</style>
