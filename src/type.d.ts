import QChatSDK from "nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK";
import NIMSDK from "nim-web-sdk-ng/dist/NIM_BROWSER_SDK";

declare global {
  interface Window {
    QChatSDK: typeof QChatSDK;
    qchat: InstanceType<typeof QChatSDK> | null;
    NIMSDK: typeof NIMSDK;
    nim: InstanceType<typeof NIMSDK> | null;
  }
}

declare module "*.css";
declare module "*.less";
declare module "*.png";
