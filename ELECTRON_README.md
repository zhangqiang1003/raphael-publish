# Raphael Publish - Electron 版本

微信公众号排版工具的 Electron 桌面应用版本。

## 项目结构

```
src/
├── main/              # Electron 主进程
│   ├── main.ts        # 主进程入口
│   ├── preload.ts     # 预加载脚本
│   └── tsconfig.json  # 主进程 TS 配置
└── renderer/          # React 渲染进程
    ├── App.tsx        # 主应用组件
    ├── main.tsx       # 渲染进程入口
    ├── index.html     # HTML 模板
    ├── components/    # React 组件
    ├── lib/           # 工具库
    └── types/         # 类型定义
```

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（Electron + Vite）
pnpm dev
```

## 构建

```bash
# 构建 Windows 版本
pnpm build:win

# 构建 macOS 版本
pnpm build:mac

# 构建 Linux 版本
pnpm build:linux

# 或根据当前平台构建
pnpm build
```

## 技术栈

- **Electron 27** - 桌面应用框架
- **Vite 5** - 前端构建工具
- **React 18** - UI 框架
- **TypeScript** - 类型系统
- **Tailwind CSS** - 样式框架

## 新增功能

相比 Web 版本，Electron 版本提供：

1. **桌面应用体验** - 独立窗口运行，无需浏览器
2. **离线使用** - 无需联网即可使用
3. **更好的性能** - 利用本地资源
4. **系统集成** - 未来可扩展系统集成功能

## 注意事项

- 开发模式下会自动打开 DevTools
- 生产模式下需要禁用 DevTools（在 main.ts 中配置）
- 图片导出和 PDF 功能保持不变
