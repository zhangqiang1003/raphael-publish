# AI 基础框架使用指南

## 📦 Phase 1 实现清单

✅ **已完成的文件：**

### 1. 类型定义
- `src/renderer/types/ai-config.ts` - AI 相关的 TypeScript 类型定义

### 2. 核心服务类
- `src/renderer/lib/ai/AIConfigManager.ts` - 配置管理器
- `src/renderer/lib/ai/CacheManager.ts` - 缓存管理器
- `src/renderer/lib/ai/UsageTracker.ts` - 用量追踪器
- `src/renderer/lib/ai/AIService.ts` - AI 服务主类

### 3. Electron IPC 网关
- `src/main/api/ai-gateway.ts` - AI 网关（主进程）
- `src/main/main.ts` - 已集成 AI 网关初始化

### 4. 测试组件
- `src/renderer/components/AITestPanel.tsx` - AI 功能测试面板

---

## 🚀 如何使用

### 方法 1: 在现有组件中使用 AI 服务

```typescript
import { AIService } from '../lib/ai/AIService';
import { AIConfigManager } from '../lib/ai/AIConfigManager';
import { AIRequest } from '../types/ai-config';

// 创建 AI 服务实例
const aiService = new AIService(AIConfigManager.load());

// 调用 AI
async function callAI() {
  const request: AIRequest = {
    featureId: 'title-generation',
    messages: [
      { role: 'system', content: '你是一位助手...' },
      { role: 'user', content: '请帮我...' }
    ],
    temperature: 0.7,
    maxTokens: 500
  };
  
  try {
    const response = await aiService.generate(request);
    console.log('AI 响应:', response.content);
  } catch (error) {
    console.error('AI 调用失败:', error);
  }
}
```

### 方法 2: 使用测试面板

在 App.tsx 或其他地方引入测试面板：

```typescript
import { AITestPanel } from './components/AITestPanel';

function App() {
  return (
    <div>
      {/* 其他内容 */}
      <AITestPanel />
    </div>
  );
}
```

---

## ⚙️ 配置 API Key

### 方式 1: 通过 localStorage 直接设置

打开浏览器控制台，执行：

```javascript
const defaultPrefs = {
  providers: {
    openai: {
      apiKey: 'sk-your-openai-api-key-here'
    }
  }
};
localStorage.setItem('ai_preferences', JSON.stringify(defaultPrefs));
location.reload();
```

### 方式 2: 修改默认配置

编辑 `src/renderer/types/ai-config.ts` 中的 `DEFAULT_AI_PREFERENCES`：

```typescript
export const DEFAULT_AI_PREFERENCES: AIUserPreferences = {
  // ...其他配置
  providers: {
    openai: {
      id: 'openai',
      name: 'OpenAI',
      type: 'cloud',
      models: [...],
      apiKey: 'sk-your-key-here', // 在这里设置
      enabled: true,
      priority: 1
    }
  }
};
```

---

## 🧪 测试流程

### 1. 安装依赖

```bash
npm install openai @anthropic-ai/sdk
```

### 2. 启动开发服务器

```bash
pnpm dev
```

### 3. 测试 AI 功能

1. 在应用中引入 `AITestPanel` 组件
2. 点击「测试标题生成」按钮
3. 查看生成的标题结果
4. 检查控制台日志和用量统计

---

## 📊 核心功能说明

### AIService - 统一入口

```typescript
const aiService = new AIService(preferences);

// 生成 AI 内容
await aiService.generate(request);

// 获取用量统计
const stats = aiService.getUsageStats();

// 清除缓存
aiService.clearCache();

// 重置用量
aiService.resetUsage();
```

### AIConfigManager - 配置管理

```typescript
// 加载配置
const prefs = AIConfigManager.load();

// 保存配置
AIConfigManager.save(prefs);

// 更新部分配置
AIConfigManager.update({ globalEnabled: false });

// 导出配置
const json = AIConfigManager.export();

// 导入配置
AIConfigManager.import(jsonString);
```

### CacheManager - 缓存管理

```typescript
const cache = new CacheManager();

// 获取缓存
const cached = await cache.get(key);

// 设置缓存
await cache.set(key, response);

// 清除所有缓存
await cache.clear();
```

### UsageTracker - 用量追踪

```typescript
const tracker = new UsageTracker(limits);

// 检查是否可以请求
const canRequest = await tracker.canMakeRequest();

// 记录使用情况
await tracker.recordUsage(tokens, costPer1K);

// 获取剩余用量
const remaining = tracker.getRemainingUsage();
```

---

## 🔧 故障排查

### 问题 1: "Unknown provider" 错误

**原因**：尝试使用未配置的提供商

**解决**：确保 `preferences.providers` 中包含对应的提供商配置

### 问题 2: "已达到今日使用上限"

**原因**：用量追踪器限制了请求

**解决**：
- 调用 `aiService.resetUsage()` 重置用量
- 或修改配置中的 `usageLimits`

### 问题 3: API Key 无效

**原因**：API Key 错误或过期

**解决**：
- 前往 OpenAI/Claude 官网重新生成 Key
- 更新配置中的 API Key

### 问题 4: CORS 错误

**原因**：浏览器跨域限制

**解决**：AI 请求通过 Electron 主进程转发，不会出现 CORS 问题

---

## 📝 下一步计划

### Phase 2: 多提供商支持
- [ ] 完善 Claude 集成
- [ ] 添加百度文心一言
- [ ] 添加阿里通义千问
- [ ] 优化自动降级策略

### Phase 3: 用户界面
- [ ] 完整的 AI 设置面板
- [ ] API Key 输入界面
- [ ] 用量统计图表
- [ ] 功能配置界面

### Phase 4: 高级功能
- [ ] 自定义 Prompt 编辑器
- [ ] 本地模型集成
- [ ] A/B 测试框架
- [ ] 会员系统

---

## 💡 最佳实践

1. **缓存优先**：相同的请求尽量使用缓存
2. **流式输出**：长文本生成启用流式模式
3. **错误处理**：始终捕获并友好展示错误信息
4. **用量监控**：定期提醒用户剩余用量
5. **降级策略**：主提供商失败时自动切换备用

---

**🎉 基础框架已完成！现在可以开始使用 AI 功能了！**

如有问题，请查阅 `tutorials/AI_INTEGRATION_ARCHITECTURE.md` 获取完整架构设计文档。
