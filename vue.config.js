const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  publicPath: "./",
  transpileDependencies: true,
  chainWebpack: (config) => {
    // config.devtool("eval-source-map");
    config.plugin("html").tap((args) => {
      args[0].title = "圈组";
      return args;
    });
    // todo: webpack 5 的工程，在 NIMSDK 引入  crypto js 时，需要不使用 node 模式。
    // 拟后续使用别的算法替代 crypto。
    config.resolve.alias.set("crypto", false);
  },
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
            "border-radius-base": "4px",
            "btn-default-color": "#fff",
            "btn-default-bg": "#3C3E45",
          },
          javascriptEnabled: true,
        },
      },
    },
  },
});
