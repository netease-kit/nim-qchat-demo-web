# app-discord-web-vue

类 discord 的 web 项目，采用 vue 3 搭建，依赖网易云信提供的 IM SDK 和 圈组 SDK。

## 启动项目

**注意：一定要在 .env, .env.dev, .env.prod 下替换您的 VUE_APP_APPKEY**

```
npm install --registry=https://registry.npm.taobao.org/
```

### 开发启动，编译热更新

```
npm run serve
```

### 线上环境构建

```
npm run build
```

### lint 修复文件格式

```
npm run lint
```

### 更多配置参照

See [Configuration Reference](https://cli.vuejs.org/config/).

## 项目组成

```
src
├── App.vue  view 主入口
├── apis  一些 http 接口 API
│   └── index.ts
├── assets   静态文件目录
│   ├── logo.png
│   ├── logo2.png
│   ├── logo3.png
│   └── member_bg.png
├── components  组件目录
│   ├── ChannelBar.vue   频道列表
│   ├── ChannelSettings   频道-相关设置弹窗
│   │   ├── index.vue
│   │   └── modules
│   │       └── GeneralSituation.vue  频道-弹窗-概况设置
│   ├── ChatPage.vue  聊天区域+成员展示
│   ├── ChatRoom  聊天区域
│   │   ├── ChatCard.vue
│   │   ├── ChatContent.vue
│   │   └── index.vue
│   ├── CommonAvatar.vue
│   ├── IconFont.ts
│   ├── LoginController.vue
│   ├── LoginModal.vue  登录-弹窗
│   ├── ServerBar.vue  服务器-列表
│   ├── ServersHome.vue  服务器-主页
│   ├── ServerSettings  服务器-相关设置弹窗
│   │   ├── index.vue
│   │   └── modules
│   │       └── ServerInfo.vue  服务器-弹窗-基本信息设置
│   ├── UserSettings  用户资料相关
│   │   ├── index.vue
│   │   └── modules
│   │       └── ProfileSetting.vue  用户资料-弹窗-设置
│   └── index.ts
├── locales  语言，本地化文件
│   └── en.json
├── main.ts   vue 项目入口
├── router   路由目录
│   └── index.ts
├── shims-vue.d.ts
├── store   vuex 数据目录
│   ├── channel.ts  频道模块
│   ├── global.ts  全局数据
│   ├── index.ts  入口文件
│   ├── sdk.ts  与 sdk 打交道的 store
│   ├── server.ts  服务器模块
│   └── user.ts  用户模块
├── type.d.ts   全局 ts 定义
├── utils  工具函数目录
│   ├── events.ts
│   ├── index.ts
│   ├── logger.ts
│   └── storage.ts
└── views
    └── HomeView.vue  主页
```

![](https://yx-web-nosdn.netease.im/common/5855e3fd113c70d7d536829424719bbe/POPO20220318-113445.jpg)

## 交互数据流转

Web -----> Vuex Store -----> SDK

## 统一登录说明

登录是使用的云信统一登录组件，需要联系云信同学开通权限后，才可正常获取二维码登录

## 项目配置说明

- 开发环境：在 `.env.dev` 中配置您的 appkey
- 线上环境：在 `.env.prod` 中配置您的 appkey

## 文档参考

- [云信 IM SDK 文档](https://doc.yunxin.163.com/docs/TM5MzM5Njk/DY0MzYxNDc?platformId=120901)
- [云信圈组 SDK 文档](https://doc.yunxin.163.com/docs/TM5MzM5Njk/Tc4ODUzODk?platformId=120901)
