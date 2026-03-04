# Raphael Publish Electron 改造完成

## 改造概述

已成功将 Raphael Publish 从纯 Web 项目改造为 Electron 桌面应用，参考 ZeromatUI 项目架构。

## 新增文件

### Electron 主进程文件
- `src/main/main.ts` - Electron 主进程入口
- `src/main/preload.ts` - 预加载脚本（暴露安全的 IPC API）
- `src/main/tsconfig.json` - 主进程 TypeScript 配置

### 渲染进程类型定义
- `src/renderer/types/electron.d.ts` - Electron API 类型定义

### 构建脚本
- `scripts/dev-server.js` - 开发服务器（Vite + Electron 热重载）
- `scripts/build.js` - 生产构建脚本

### 配置文件
- `electron-builder.json` - Electron Builder 打包配置
- `vite.config.ts` - 更新为 Electron 模式
- `tsconfig.json` - 更新路径配置
- `src/renderer/tsconfig.json` - 渲染进程 TS 配置
- `src/renderer/index.html` - HTML 入口（从根目录移入）

### 文档
- `ELECTRON_README.md` - Electron 版本使用说明

## 修改的文件

### package.json
- 添加 `main` 字段指向构建输出
- 添加 Electron 相关脚本：`dev`, `build`, `build:win/mac/linux`
- 添加 Electron 依赖：`electron`, `electron-builder`, `chalk`, `chokidar`

### .gitignore
- 添加 `build/` 目录忽略

## 项目结构

```
raphael-publish/
├── src/
│   ├── main/                    # Electron 主进程
│   │   ├── main.ts             # 主进程入口
│   │   ├── preload.ts          # 预加载脚本
│   │   └── tsconfig.json       # 主进程 TS 配置
│   └── renderer/               # React 渲染进程（原有代码）
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.html
│       ├── components/
│       ├── lib/
│       ├── types/
│       └── tsconfig.json
├── scripts/
│   ├── dev-server.js           # 开发服务器
│   └── build.js                # 生产构建
├── build/                      # 编译输出（开发/生产）
├── dist/                       # Electron 打包输出
├── electron-builder.json
├── vite.config.ts
├── package.json
└── ELECTRON_README.md
```

## 使用方法

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
pnpm dev
```
- 自动启动 Vite 开发服务器（端口 8080）
- 自动打开 Electron 窗口
- 支持主进程和渲染进程热重载

### 生产构建
```bash
pnpm build        # 构建当前平台
pnpm build:win    # Windows
pnpm build:mac    # macOS
pnpm build:linux  # Linux
```

## 技术细节

### IPC 通信
当前暴露的 API（在 preload.ts 中）：
- `ping()` - 心跳检测
- `getAppVersion()` - 获取应用版本
- `platform` - 当前平台
- `isElectron` - 是否为 Electron 环境

### 窗口配置
- 默认尺寸：1400x900
- 最小尺寸：1024x700
- 背景色：#fbfbfd（防止白屏闪烁）
- 开发模式自动打开 DevTools

### 安全配置
- `nodeIntegration: false` - 禁用 Node 集成
- `contextIsolation: true` - 启用上下文隔离
- CSP: `script-src 'self' 'unsafe-inline'`

## 下一步可选增强

1. **添加系统菜单** - 关于、偏好设置等
2. **文件操作** - 保存/打开 Markdown 文件
3. **自动更新** - electron-updater
4. **托盘图标** - 最小化到系统托盘
5. **原生对话框** - 文件保存/打开对话框
6. **窗口状态保存** - 记住窗口大小和位置

## 与 ZeromatUI 对比

| 功能 | ZeromatUI | Raphael Publish Electron |
|------|-----------|-------------------------|
| 后端服务 | 有（ZeromatServer.exe） | 无 |
| 蓝牙通信 | 有 | 无 |
| HTTP 封装 | 有 | 基础 IPC |
| 日志系统 | 复杂 | 简化版 |
| 字节码混淆 | 有 | 无 |
| 多平台构建 | 有 | 有 |

Raphael Publish 的版本更加简洁，专注于核心的排版功能，去除了不必要的复杂性。
