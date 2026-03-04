// 渲染进程可用的 Electron API 类型定义

export interface ElectronAPI {
  // 基础 API
  ping: () => Promise<string>;
  getAppVersion: () => Promise<string>;

  // 平台检测
  platform: string;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
