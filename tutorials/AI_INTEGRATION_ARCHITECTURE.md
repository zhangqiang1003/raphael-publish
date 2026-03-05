# Raphael Publish - AI 深度集成架构设计文档

## 一、愿景与目标

### 1.1 核心理念

**"AI as a Service"** - 将 AI 能力作为基础设施，像主题系统一样可插拔、可配置、可扩展。

### 1.2 设计目标

1. **用户可配置**：开放 AI 提供商选择、模型选择、参数调节等权限
2. **多提供商支持**：同时支持 OpenAI、Claude、百度文心、阿里通义等
3. **智能降级**：主提供商失败时自动切换到备用方案
4. **成本可控**：用量限制、预算管理、缓存优化
5. **高性能**：流式响应、本地缓存、边缘计算

---

## 二、整体架构设计

### 2.1 三层架构模型

```
┌─────────────────────────────────────────────────────────┐
│              用户体验层 (UX Layer)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ AI 助手面板 │  │ 快捷菜单 │  │ 设置中心 │              │
│  └──────────┘  └──────────┘  └──────────┘              │
├─────────────────────────────────────────────────────────┤
│           AI 服务编排层 (Orchestration Layer)             │
│  ┌──────────────────────────────────────────────────┐   │
│  │            AI Orchestrator (智能调度器)           │   │
│  │  • 请求路由 (选择最优模型)                        │   │
│  │  • 上下文管理 (对话历史)                          │   │
│  │  • 降级策略 (失败重试/备用方案)                   │   │
│  │  • 配额管理 (限流/计费)                           │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Prompt   │  │ 结果     │  │ 用户     │              │
│  │ 引擎     │  │ 处理器   │  │ 偏好库   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
├─────────────────────────────────────────────────────────┤
│           AI 能力提供层 (Provider Layer)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ OpenAI   │  │ Claude   │  │ 本地模型 │              │
│  │ Provider │  │ Provider │  │ Provider │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ 文心一言 │  │ 通义千问 │  │ 自定义   │              │
│  │ Provider │  │ Provider │  │ Provider │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

### 2.2 核心组件说明

| 层级 | 组件 | 职责 |
|-----|------|------|
| UX 层 | AI 助手面板 | 统一入口，展示所有 AI 功能 |
| UX 层 | 快捷菜单 | 右键菜单快速调用 AI |
| UX 层 | 设置中心 | 配置 AI 提供商、模型、参数 |
| 编排层 | AI Orchestrator | 智能调度、请求路由、降级策略 |
| 编排层 | Prompt 引擎 | 管理和优化 Prompt 模板 |
| 编排层 | 结果处理器 | 解析、验证、后处理 AI 响应 |
| 编排层 | 用户偏好库 | 存储用户的 AI 使用习惯 |
| 提供层 | 各 AI 提供商 | 实际的 AI 模型调用 |

---

## 三、用户配置系统设计

### 3.1 配置数据结构

```typescript
// src/renderer/types/ai-config.ts

/**
 * AI 提供商配置
 */
export interface AIProvider {
  id: string;                    // 唯一标识符
  name: string;                  // 显示名称
  type: 'cloud' | 'local';       // 云端或本地
  models: AIModel[];             // 支持的模型列表
  apiKey?: string;               // API 密钥
  apiEndpoint?: string;          // 自定义 API 端点
  enabled: boolean;              // 是否启用
  priority: number;              // 优先级（数字越小优先级越高）
}

/**
 * AI 模型定义
 */
export interface AIModel {
  id: string;                    // 模型 ID
  name: string;                  // 显示名称
  providerId: string;            // 所属提供商
  maxTokens: number;             // 最大 token 数
  costPer1KTokens: number;       // 每 1K tokens 成本（美元）
  speed: 'fast' | 'medium' | 'slow';  // 速度等级
  quality: 'economy' | 'standard' | 'premium'; // 质量等级
}

/**
 * 单个 AI 功能的配置
 */
export interface AIFeatureConfig {
  featureId: string;             // 功能 ID
  enabled: boolean;              // 是否启用该功能
  preferredProvider?: string;    // 首选提供商
  preferredModel?: string;       // 首选模型
  customPrompt?: string;         // 自定义 Prompt
  temperature?: number;          // 创造性 (0-1)
  maxTokens?: number;            // 最大输出长度
  autoApply?: boolean;           // 是否自动应用结果
}

/**
 * 用户 AI 偏好总配置
 */
export interface AIUserPreferences {
  // ===== 全局设置 =====
  globalEnabled: boolean;        // 全局 AI 开关
  defaultProvider: string;       // 默认提供商
  defaultModel: string;          // 默认模型
  
  // ===== 功能级配置 =====
  features: {
    titleGeneration: AIFeatureConfig;      // 标题生成
    textOptimization: AIFeatureConfig;     // 文案优化
    themeRecommendation: AIFeatureConfig;  // 主题推荐
    imageSuggestion: AIFeatureConfig;      // 配图建议
    outlineGeneration: AIFeatureConfig;    // 大纲生成
    grammarCheck: AIFeatureConfig;         // 语法检查
  };
  
  // ===== 提供商配置 =====
  providers: {
    openai?: AIProvider;         // OpenAI 配置
    claude?: AIProvider;         // Anthropic Claude
    local?: AIProvider;          // 本地模型
    custom?: AIProvider[];       // 自定义提供商
  };
  
  // ===== 使用限制 =====
  usageLimits: {
    dailyBudget: number;         // 每日预算（元）
    maxRequestsPerDay: number;   // 每日最大请求数
    notifyThreshold: number;     // 达到多少比例时提醒 (0-1)
  };
  
  // ===== 高级选项 =====
  advanced: {
    enableCaching: boolean;      // 启用缓存
    enableStreaming: boolean;    // 启用流式输出
    enableTelemetry: boolean;    // 启用遥测
    fallbackEnabled: boolean;    // 启用自动降级
  };
}

/**
 * 默认配置值
 */
export const DEFAULT_AI_PREFERENCES: AIUserPreferences = {
  globalEnabled: true,
  defaultProvider: 'openai',
  defaultModel: 'gpt-4-turbo',
  
  features: {
    titleGeneration: {
      featureId: 'title-generation',
      enabled: true,
      preferredProvider: 'openai',
      preferredModel: 'gpt-4-turbo',
      temperature: 0.8,
      maxTokens: 800,
      autoApply: false
    },
    textOptimization: {
      featureId: 'text-optimization',
      enabled: true,
      preferredProvider: 'openai',
      preferredModel: 'gpt-3.5-turbo',
      temperature: 0.5,
      maxTokens: 500,
      autoApply: false
    },
    themeRecommendation: {
      featureId: 'theme-recommendation',
      enabled: true,
      preferredProvider: 'openai',
      preferredModel: 'gpt-3.5-turbo',
      temperature: 0.3,
      maxTokens: 300,
      autoApply: false
    },
    imageSuggestion: {
      featureId: 'image-suggestion',
      enabled: true,
      preferredProvider: 'openai',
      preferredModel: 'gpt-4-vision',
      temperature: 0.5,
      maxTokens: 200,
      autoApply: false
    },
    outlineGeneration: {
      featureId: 'outline-generation',
      enabled: true,
      preferredProvider: 'openai',
      preferredModel: 'gpt-4-turbo',
      temperature: 0.6,
      maxTokens: 1500,
      autoApply: false
    },
    grammarCheck: {
      featureId: 'grammar-check',
      enabled: true,
      preferredProvider: 'local',
      preferredModel: 'language-tool',
      temperature: 0,
      maxTokens: 1000,
      autoApply: true
    }
  },
  
  providers: {
    openai: {
      id: 'openai',
      name: 'OpenAI',
      type: 'cloud',
      models: [
        {
          id: 'gpt-4-turbo',
          name: 'GPT-4 Turbo',
          providerId: 'openai',
          maxTokens: 128000,
          costPer1KTokens: 0.01,
          speed: 'medium',
          quality: 'premium'
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          providerId: 'openai',
          maxTokens: 16385,
          costPer1KTokens: 0.002,
          speed: 'fast',
          quality: 'economy'
        },
        {
          id: 'gpt-4-vision',
          name: 'GPT-4 Vision',
          providerId: 'openai',
          maxTokens: 128000,
          costPer1KTokens: 0.03,
          speed: 'slow',
          quality: 'premium'
        }
      ],
      enabled: true,
      priority: 1
    },
    claude: {
      id: 'claude',
      name: 'Anthropic Claude',
      type: 'cloud',
      models: [
        {
          id: 'claude-3-opus',
          name: 'Claude 3 Opus',
          providerId: 'claude',
          maxTokens: 200000,
          costPer1KTokens: 0.05,
          speed: 'slow',
          quality: 'premium'
        },
        {
          id: 'claude-3-sonnet',
          name: 'Claude 3 Sonnet',
          providerId: 'claude',
          maxTokens: 200000,
          costPer1KTokens: 0.015,
          speed: 'medium',
          quality: 'standard'
        }
      ],
      enabled: false,
      priority: 2
    },
    local: {
      id: 'local',
      name: '本地模型',
      type: 'local',
      models: [
        {
          id: 'language-tool',
          name: 'LanguageTool',
          providerId: 'local',
          maxTokens: 10000,
          costPer1KTokens: 0,
          speed: 'fast',
          quality: 'standard'
        }
      ],
      enabled: true,
      priority: 3
    }
  },
  
  usageLimits: {
    dailyBudget: 10,
    maxRequestsPerDay: 100,
    notifyThreshold: 0.8
  },
  
  advanced: {
    enableCaching: true,
    enableStreaming: true,
    enableTelemetry: false,
    fallbackEnabled: true
  }
};
```

### 3.2 配置持久化

```typescript
// src/renderer/lib/ai/AIConfigManager.ts

import { AIUserPreferences, DEFAULT_AI_PREFERENCES } from '../types/ai-config';

export class AIConfigManager {
  private static STORAGE_KEY = 'ai_preferences';
  
  /**
   * 加载用户配置
   */
  static load(): AIUserPreferences {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // 合并默认值，确保新增字段有效
        return { ...DEFAULT_AI_PREFERENCES, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load AI preferences:', error);
    }
    return DEFAULT_AI_PREFERENCES;
  }
  
  /**
   * 保存用户配置
   */
  static save(preferences: AIUserPreferences): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save AI preferences:', error);
    }
  }
  
  /**
   * 重置为默认配置
   */
  static reset(): AIUserPreferences {
    this.save(DEFAULT_AI_PREFERENCES);
    return DEFAULT_AI_PREFERENCES;
  }
  
  /**
   * 导出配置（用于备份）
   */
  static export(): string {
    const preferences = this.load();
    return JSON.stringify(preferences, null, 2);
  }
  
  /**
   * 导入配置（从备份恢复）
   */
  static import(jsonString: string): AIUserPreferences {
    try {
      const preferences = JSON.parse(jsonString);
      this.save(preferences);
      return preferences;
    } catch (error) {
      throw new Error('Invalid configuration format');
    }
  }
}
```

---

## 四、AI 服务核心实现

### 4.1 AIService 类

```typescript
// src/renderer/lib/ai/AIService.ts

import { 
  AIUserPreferences, 
  AIProvider, 
  AIModel,
  AIRequest,
  AIResponse 
} from '../types/ai-config';
import { UsageTracker } from './UsageTracker';
import { CacheManager } from './CacheManager';

/**
 * AI 服务主类 - 统一管理所有 AI 交互
 */
export class AIService {
  private preferences: AIUserPreferences;
  private cache: CacheManager;
  private usageTracker: UsageTracker;
  
  constructor(preferences: AIUserPreferences) {
    this.preferences = preferences;
    this.cache = new CacheManager();
    this.usageTracker = new UsageTracker(preferences.usageLimits);
  }
  
  /**
   * 更新配置
   */
  updatePreferences(preferences: AIUserPreferences) {
    this.preferences = preferences;
    this.usageTracker.updateLimits(preferences.usageLimits);
  }
  
  /**
   * 发送 AI 请求（统一入口）
   */
  async generate(request: AIRequest): Promise<AIResponse> {
    // Step 1: 检查全局开关
    if (!this.preferences.globalEnabled) {
      throw new Error('AI 功能已禁用，请在设置中开启');
    }
    
    // Step 2: 检查功能开关
    const featureConfig = this.preferences.features[request.featureId];
    if (!featureConfig?.enabled) {
      throw new Error(`${request.featureId} 功能未启用`);
    }
    
    // Step 3: 检查用量限制
    const canMakeRequest = await this.usageTracker.canMakeRequest();
    if (!canMakeRequest) {
      throw new Error('已达到今日使用上限，请升级会员或明天继续使用');
    }
    
    // Step 4: 生成缓存键
    const cacheKey = this.generateCacheKey(request);
    
    // Step 5: 检查缓存
    if (this.preferences.advanced.enableCaching) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        console.log('✨ Cache hit:', cacheKey);
        return cached;
      }
    }
    
    // Step 6: 选择最优提供商和模型
    const selection = await this.selectBestProvider(request);
    console.log('🎯 Selected provider:', selection.provider.id, 'model:', selection.model.id);
    
    try {
      // Step 7: 调用实际 AI 服务
      const response = await this.callProvider(
        selection.provider, 
        selection.model, 
        request
      );
      
      // Step 8: 记录使用情况
      await this.usageTracker.recordUsage(
        response.usage.totalTokens, 
        selection.model.costPer1KTokens
      );
      
      // Step 9: 缓存结果
      if (this.preferences.advanced.enableCaching) {
        await this.cache.set(cacheKey, response);
      }
      
      return response;
      
    } catch (error) {
      console.error('❌ Primary provider failed:', error);
      
      // Step 10: 降级策略
      if (this.preferences.advanced.fallbackEnabled) {
        console.log('🔄 Trying fallback providers...');
        return await this.tryFallback(request, error);
      }
      
      throw error;
    }
  }
  
  /**
   * 生成缓存键
   */
  private generateCacheKey(request: AIRequest): string {
    const messagesHash = this.hash(JSON.stringify(request.messages));
    return `${request.featureId}:${messagesHash}`;
  }
  
  /**
   * 选择最优提供商
   */
  private async selectBestProvider(request: AIRequest): Promise<{ provider: AIProvider, model: AIModel }> {
    const featureConfig = this.preferences.features[request.featureId];
    
    // 优先使用功能级配置
    if (featureConfig?.preferredProvider && featureConfig?.preferredModel) {
      const provider = this.preferences.providers[featureConfig.preferredProvider as keyof typeof this.preferences.providers] as AIProvider | undefined;
      if (provider?.enabled) {
        const model = provider.models.find(m => m.id === featureConfig.preferredModel);
        if (model) {
          return { provider, model };
        }
      }
    }
    
    // 使用全局默认配置
    const defaultProvider = this.preferences.providers[this.preferences.defaultProvider as keyof typeof this.preferences.providers] as AIProvider | undefined;
    if (defaultProvider?.enabled) {
      const defaultModel = defaultProvider.models.find(m => m.id === this.preferences.defaultModel);
      if (defaultModel) {
        return { provider: defaultProvider, model: defaultModel };
      }
    }
    
    // 按优先级选择第一个可用的
    const sortedProviders = Object.values(this.preferences.providers)
      .filter((p): p is AIProvider => Boolean(p?.enabled))
      .sort((a, b) => a.priority - b.priority);
    
    if (sortedProviders.length === 0) {
      throw new Error('没有可用的 AI 提供商，请在设置中添加');
    }
    
    const provider = sortedProviders[0];
    return { provider, model: provider.models[0] };
  }
  
  /**
   * 调用具体的 AI 提供商
   */
  private async callProvider(provider: AIProvider, model: AIModel, request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    let response: AIResponse;
    
    switch (provider.id) {
      case 'openai':
        response = await this.callOpenAI(provider, model, request, startTime);
        break;
      case 'claude':
        response = await this.callClaude(provider, model, request, startTime);
        break;
      case 'local':
        response = await this.callLocalModel(provider, model, request, startTime);
        break;
      default:
        throw new Error(`不支持的提供商：${provider.id}`);
    }
    
    return response;
  }
  
  /**
   * 调用 OpenAI
   */
  private async callOpenAI(provider: AIProvider, model: AIModel, request: AIRequest, startTime: number): Promise<AIResponse> {
    // 通过 Electron IPC 调用主进程
    const { ipcRenderer } = window.require('electron');
    
    const result = await ipcRenderer.invoke('ai:chat', {
      provider: 'openai',
      model: model.id,
      apiKey: provider.apiKey,
      messages: request.messages,
      options: {
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || model.maxTokens,
        stream: request.stream && this.preferences.advanced.enableStreaming
      }
    });
    
    return {
      content: result.content,
      model: model.id,
      usage: result.usage,
      duration: Date.now() - startTime
    };
  }
  
  /**
   * 调用 Claude
   */
  private async callClaude(provider: AIProvider, model: AIModel, request: AIRequest, startTime: number): Promise<AIResponse> {
    const { ipcRenderer } = window.require('electron');
    
    const result = await ipcRenderer.invoke('ai:chat', {
      provider: 'claude',
      model: model.id,
      apiKey: provider.apiKey,
      messages: request.messages,
      options: {
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || model.maxTokens
      }
    });
    
    return {
      content: result.content,
      model: model.id,
      usage: result.usage,
      duration: Date.now() - startTime
    };
  }
  
  /**
   * 调用本地模型
   */
  private async callLocalModel(provider: AIProvider, model: AIModel, request: AIRequest, startTime: number): Promise<AIResponse> {
    // 本地模型实现（如 LanguageTool）
    // 这里可以根据具体模型类型实现不同逻辑
    
    if (model.id === 'language-tool') {
      const result = await this.runLanguageTool(request.messages[0].content);
      return {
        content: result,
        model: model.id,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        duration: Date.now() - startTime
      };
    }
    
    throw new Error(`Unsupported local model: ${model.id}`);
  }
  
  /**
   * 降级策略
   */
  private async tryFallback(request: AIRequest, originalError: Error): Promise<AIResponse> {
    const backupProviders = Object.values(this.preferences.providers)
      .filter((p): p is AIProvider => Boolean(p?.enabled && p.priority > 0))
      .sort((a, b) => a.priority - b.priority);
    
    for (const provider of backupProviders) {
      try {
        console.log(`🔄 Trying fallback provider: ${provider.id}`);
        const model = provider.models[0];
        return await this.callProvider(provider, model, request);
      } catch (fallbackError) {
        console.warn(`⚠️ Fallback ${provider.id} also failed:`, fallbackError);
        continue;
      }
    }
    
    throw originalError;
  }
  
  /**
   * 简单哈希函数
   */
  private hash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
  
  /**
   * LanguageTool 实现（示例）
   */
  private async runLanguageTool(text: string): Promise<string> {
    // 这里可以集成开源的语法检查库
    // 如 https://languagetool.org/http-api/
    return text; // 占位实现
  }
}
```

### 4.2 用量追踪器

```typescript
// src/renderer/lib/ai/UsageTracker.ts

import { AIUserPreferences } from '../types/ai-config';

interface UsageData {
  tokens: number;
  cost: number;
  requests: number;
  lastReset: number;
}

export class UsageTracker {
  private limits: AIUserPreferences['usageLimits'];
  private currentUsage: UsageData;
  private readonly STORAGE_KEY = 'ai_usage';
  
  constructor(limits: AIUserPreferences['usageLimits']) {
    this.limits = limits;
    this.currentUsage = this.loadFromStorage();
    this.checkAndReset();
  }
  
  /**
   * 检查是否可以发起请求
   */
  async canMakeRequest(): Promise<boolean> {
    return (
      this.currentUsage.requests < this.limits.maxRequestsPerDay &&
      this.currentUsage.cost < this.limits.dailyBudget
    );
  }
  
  /**
   * 记录使用情况
   */
  async recordUsage(tokens: number, costPer1K: number): Promise<void> {
    const cost = (tokens / 1000) * costPer1K;
    
    this.currentUsage.tokens += tokens;
    this.currentUsage.cost += cost;
    this.currentUsage.requests += 1;
    
    this.saveToStorage();
    
    // 检查是否需要提醒
    if (this.currentUsage.cost >= this.limits.dailyBudget * this.limits.notifyThreshold) {
      this.notifyUser();
    }
  }
  
  /**
   * 更新限制
   */
  updateLimits(newLimits: AIUserPreferences['usageLimits']) {
    this.limits = newLimits;
  }
  
  /**
   * 获取当前使用情况
   */
  getCurrentUsage(): UsageData {
    return { ...this.currentUsage };
  }
  
  /**
   * 重置用量统计
   */
  reset() {
    this.currentUsage = {
      tokens: 0,
      cost: 0,
      requests: 0,
      lastReset: Date.now()
    };
    this.saveToStorage();
  }
  
  /**
   * 检查并重置（每日自动重置）
   */
  private checkAndReset() {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (now - this.currentUsage.lastReset > oneDay) {
      console.log('📊 Resetting daily usage stats');
      this.reset();
    }
  }
  
  /**
   * 从存储加载
   */
  private loadFromStorage(): UsageData {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Failed to parse usage data:', error);
      }
    }
    return {
      tokens: 0,
      cost: 0,
      requests: 0,
      lastReset: Date.now()
    };
  }
  
  /**
   * 保存到存储
   */
  private saveToStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUsage));
  }
  
  /**
   * 通知用户
   */
  private notifyUser() {
    // 可以通过通知系统发送提醒
    console.warn('⚠️ AI usage approaching limit!');
    
    // 或者显示 toast
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('AI 使用量提醒', {
        body: '您的 AI 使用量即将达到今日上限',
        icon: '/warning.png'
      });
    }
  }
}
```

### 4.3 缓存管理器

```typescript
// src/renderer/lib/ai/CacheManager.ts

import { AIResponse } from '../types/ai-config';

interface CacheEntry {
  response: AIResponse;
  timestamp: number;
  hits: number;
}

export class CacheManager {
  private cache: Map<string, CacheEntry>;
  private readonly MAX_SIZE = 1000;
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 小时
  
  constructor() {
    this.cache = new Map();
    this.startCleanup();
  }
  
  /**
   * 获取缓存
   */
  async get(key: string): Promise<AIResponse | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // 检查是否过期
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    entry.hits++;
    return entry.response;
  }
  
  /**
   * 设置缓存
   */
  async set(key: string, response: AIResponse): Promise<void> {
    // 如果缓存已满，删除最久未使用的
    if (this.cache.size >= this.MAX_SIZE) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      hits: 0
    });
  }
  
  /**
   * 清除缓存
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }
  
  /**
   * 获取缓存统计
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_SIZE,
      ttl: this.TTL
    };
  }
  
  /**
   * 清理过期缓存
   */
  private startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > this.TTL) {
          this.cache.delete(key);
        }
      }
    }, 60 * 60 * 1000); // 每小时清理一次
  }
  
  /**
   * 淘汰最久未使用的条目
   */
  private evictOldest() {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}
```

---

## 五、Electron IPC 桥接

### 5.1 主进程 AI 网关

```typescript
// src/main/api/ai-gateway.ts

import { ipcMain, IpcMainInvokeEvent } from 'electron';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

/**
 * AI 网关 - 统一处理所有 AI 请求
 */
class AIGateway {
  private openaiClients: Map<string, OpenAI> = new Map();
  private anthropicClients: Map<string, Anthropic> = new Map();
  
  initialize() {
    // 注册 IPC 处理器
    ipcMain.handle('ai:chat', this.handleChat.bind(this));
    ipcMain.handle('ai:check-availability', this.checkAvailability.bind(this));
    ipcMain.handle('ai:test-connection', this.testConnection.bind(this));
    
    console.log('✅ AI Gateway initialized');
  }
  
  /**
   * 处理聊天请求
   */
  private async handleChat(event: IpcMainInvokeEvent, request: any): Promise<any> {
    const { provider, model, apiKey, messages, options } = request;
    
    try {
      console.log(`🤖 AI Request: provider=${provider}, model=${model}`);
      
      switch (provider) {
        case 'openai':
          return await this.useOpenAI(model, messages, options, apiKey);
        case 'claude':
          return await this.useAnthropic(model, messages, options, apiKey);
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (error) {
      console.error('❌ AI Gateway error:', error);
      throw error;
    }
  }
  
  /**
   * 使用 OpenAI
   */
  private async useOpenAI(model: string, messages: any[], options: any, apiKey: string): Promise<any> {
    const client = this.getOrCreateOpenAIClient(apiKey);
    
    const response = await client.chat.completions.create({
      model,
      messages,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
      stream: options.stream
    });
    
    return {
      content: response.choices[0].message.content,
      usage: response.usage,
      model
    };
  }
  
  /**
   * 使用 Anthropic (Claude)
   */
  private async useAnthropic(model: string, messages: any[], options: any, apiKey: string): Promise<any> {
    const client = this.getOrCreateAnthropicClient(apiKey);
    
    const response = await client.messages.create({
      model,
      messages,
      max_tokens: options.max_tokens,
      temperature: options.temperature
    });
    
    return {
      content: response.content[0].text,
      usage: response.usage,
      model
    };
  }
  
  /**
   * 获取或创建 OpenAI 客户端
   */
  private getOrCreateOpenAIClient(apiKey: string): OpenAI {
    if (!this.openaiClients.has(apiKey)) {
      this.openaiClients.set(apiKey, new OpenAI({ apiKey }));
    }
    return this.openaiClients.get(apiKey)!;
  }
  
  /**
   * 获取或创建 Anthropic 客户端
   */
  private getOrCreateAnthropicClient(apiKey: string): Anthropic {
    if (!this.anthropicClients.has(apiKey)) {
      this.anthropicClients.set(apiKey, new Anthropic({ apiKey }));
    }
    return this.anthropicClients.get(apiKey)!;
  }
  
  /**
   * 检查服务可用性
   */
  private async checkAvailability(event: IpcMainInvokeEvent, provider: string): Promise<boolean> {
    // 简单的健康检查
    return true;
  }
  
  /**
   * 测试连接
   */
  private async testConnection(event: IpcMainInvokeEvent, provider: string, apiKey: string): Promise<boolean> {
    try {
      if (provider === 'openai') {
        const client = new OpenAI({ apiKey });
        await client.models.list();
        return true;
      } else if (provider === 'claude') {
        const client = new Anthropic({ apiKey });
        await client.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hello' }]
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// 初始化网关
new AIGateway().initialize();
```

---

## 六、配置界面设计

### 6.1 AI 设置面板组件

```typescript
// src/renderer/components/AISettingsPanel.tsx

import React, { useState, useEffect } from 'react';
import { Settings, Key, Sliders, BarChart3, Plus, Trash2 } from 'lucide-react';
import { AIUserPreferences, DEFAULT_AI_PREFERENCES } from '../types/ai-config';
import { AIConfigManager } from '../lib/ai/AIConfigManager';

export function AISettingsPanel() {
  const [activeTab, setActiveTab] = useState<'general' | 'providers' | 'features' | 'usage'>('general');
  const [preferences, setPreferences] = useState<AIUserPreferences>(DEFAULT_AI_PREFERENCES);
  
  useEffect(() => {
    // 加载用户配置
    const saved = AIConfigManager.load();
    setPreferences(saved);
  }, []);
  
  const handleSave = () => {
    AIConfigManager.save(preferences);
    alert('✅ 配置已保存');
  };
  
  return (
    <div className="ai-settings-container flex h-[600px] w-[900px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
      {/* 侧边栏导航 */}
      <div className="settings-sidebar w-56 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
        <NavItem 
          icon={<Settings size={18} />}
          label="通用设置"
          active={activeTab === 'general'}
          onClick={() => setActiveTab('general')}
        />
        <NavItem 
          icon={<Key size={18} />}
          label="API 配置"
          active={activeTab === 'providers'}
          onClick={() => setActiveTab('providers')}
        />
        <NavItem 
          icon={<Sliders size={18} />}
          label="功能配置"
          active={activeTab === 'features'}
          onClick={() => setActiveTab('features')}
        />
        <NavItem 
          icon={<BarChart3 size={18} />}
          label="用量统计"
          active={activeTab === 'usage'}
          onClick={() => setActiveTab('usage')}
        />
        
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            保存配置
          </button>
        </div>
      </div>
      
      {/* 主内容区 */}
      <div className="settings-content flex-1 p-6 overflow-y-auto">
        {activeTab === 'general' && (
          <GeneralSettings preferences={preferences} onChange={setPreferences} />
        )}
        {activeTab === 'providers' && (
          <ProviderSettings preferences={preferences} onChange={setPreferences} />
        )}
        {activeTab === 'features' && (
          <FeatureSettings preferences={preferences} onChange={setPreferences} />
        )}
        {activeTab === 'usage' && (
          <UsageStats />
        )}
      </div>
    </div>
  );
}

// 通用设置子组件
function GeneralSettings({ preferences, onChange }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">通用设置</h2>
      
      {/* 全局开关 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">启用 AI 功能</h3>
          <p className="text-sm text-gray-500 mt-1">关闭后将禁用所有 AI 相关功能</p>
        </div>
        <Switch
          checked={preferences.globalEnabled}
          onChange={(checked) => onChange({ ...preferences, globalEnabled: checked })}
        />
      </div>
      
      {/* 默认提供商 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          默认 AI 提供商
        </label>
        <select
          value={preferences.defaultProvider}
          onChange={(e) => onChange({ ...preferences, defaultProvider: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          {Object.values(preferences.providers).filter(Boolean).map(provider => (
            <option key={provider!.id} value={provider!.id}>
              {provider!.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* 默认模型 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          默认模型
        </label>
        <select
          value={preferences.defaultModel}
          onChange={(e) => onChange({ ...preferences, defaultModel: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          {preferences.providers[preferences.defaultProvider]?.models.map(model => (
            <option key={model.id} value={model.id}>
              {model.name} (${model.costPer1KTokens}/1K tokens)
            </option>
          ))}
        </select>
      </div>
      
      {/* 高级选项 */}
      <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white">高级选项</h3>
        
        <ToggleRow
          label="启用缓存"
          description="缓存 AI 响应结果，减少重复请求"
          checked={preferences.advanced.enableCaching}
          onChange={(checked) => onChange({ ...preferences, advanced: { ...preferences.advanced, enableCaching: checked } })}
        />
        
        <ToggleRow
          label="启用流式输出"
          description="实时显示 AI 生成内容，减少等待焦虑"
          checked={preferences.advanced.enableStreaming}
          onChange={(checked) => onChange({ ...preferences, advanced: { ...preferences.advanced, enableStreaming: checked } })}
        />
        
        <ToggleRow
          label="自动降级"
          description="主提供商失败时自动尝试备用方案"
          checked={preferences.advanced.fallbackEnabled}
          onChange={(checked) => onChange({ ...preferences, advanced: { ...preferences.advanced, fallbackEnabled: checked } })}
        />
      </div>
    </div>
  );
}

// API 配置子组件
function ProviderSettings({ preferences, onChange }) {
  const [showApiKey, setShowApiKey] = useState(false);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI 服务提供商</h2>
      
      {/* OpenAI 配置 */}
      <ProviderCard
        provider={preferences.providers.openai}
        onUpdate={(provider) => onChange({
          ...preferences,
          providers: { ...preferences.providers, openai: provider }
        })}
        showApiKey={showApiKey}
        onToggleApiKey={() => setShowApiKey(!showApiKey)}
      />
      
      {/* Claude 配置 */}
      <ProviderCard
        provider={preferences.providers.claude}
        onUpdate={(provider) => onChange({
          ...preferences,
          providers: { ...preferences.providers, claude: provider }
        })}
        showApiKey={showApiKey}
        onToggleApiKey={() => setShowApiKey(!showApiKey)}
      />
      
      {/* 添加自定义提供商 */}
      <button className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2">
        <Plus size={20} />
        <span>添加自定义 AI 提供商</span>
      </button>
    </div>
  );
}

// 功能配置子组件
function FeatureSettings({ preferences, onChange }) {
  const featureNames = {
    'title-generation': '标题生成',
    'text-optimization': '文案润色',
    'theme-recommendation': '主题推荐',
    'image-suggestion': '配图建议',
    'outline-generation': '大纲生成',
    'grammar-check': '语法检查'
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">功能配置</h2>
      
      {Object.entries(preferences.features).map(([featureId, config]) => (
        <FeatureCard
          key={featureId}
          featureName={featureNames[featureId]}
          feature={config}
          onUpdate={(updated) => onChange({
            ...preferences,
            features: { ...preferences.features, [featureId]: updated }
          })}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">启用</span>
              <Switch
                checked={config.enabled}
                onChange={(checked) => onChange({ ...config, enabled: checked })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">首选模型</label>
              <select
                value={config.preferredModel}
                onChange={(e) => onChange({ ...config, preferredModel: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
              >
                {/* 模型选项 */}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                创造性：{config.temperature}
              </label>
              <Slider
                value={config.temperature}
                min={0}
                max={1}
                step={0.1}
                onChange={(temp) => onChange({ ...config, temperature: temp })}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>保守</span>
                <span>平衡</span>
                <span>创意</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <span className="font-medium">自动应用结果</span>
              <Switch
                checked={config.autoApply}
                onChange={(auto) => onChange({ ...config, autoApply: auto })}
              />
            </div>
          </div>
        </FeatureCard>
      ))}
    </div>
  );
}

// 用量统计子组件
function UsageStats() {
  const [usage, setUsage] = useState({ tokens: 0, cost: 0, requests: 0 });
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">用量统计</h2>
      
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="今日请求"
          value={usage.requests}
          unit="次"
          icon="📊"
        />
        <StatCard
          title="今日消耗"
          value={usage.cost.toFixed(4)}
          unit="USD"
          icon="💰"
        />
        <StatCard
          title="Token 使用"
          value={usage.tokens.toLocaleString()}
          unit="tokens"
          icon="🔤"
        />
      </div>
      
      {/* 用量趋势图 */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium mb-4">近 7 日用量趋势</h3>
        {/* 这里可以使用图表库绘制趋势图 */}
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500">
          图表区域
        </div>
      </div>
    </div>
  );
}
```

---

## 七、部署配置

### 7.1 环境变量示例

```bash
# .env.example

# ===== OpenAI 配置 =====
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...
OPENAI_BASE_URL=https://api.openai.com/v1

# ===== Anthropic 配置 =====
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_BASE_URL=https://api.anthropic.com/v1

# ===== 国内备选方案 =====
BAIDU_API_KEY=...
BAIDU_SECRET_KEY=...
ALIYUN_API_KEY=...

# ===== 费率配置（用于成本计算） =====
OPENAI_GPT4_RATE=0.01
OPENAI_GPT35_RATE=0.002
CLAUDE_OPUS_RATE=0.05
CLAUDE_SONNET_RATE=0.015

# ===== 其他配置 =====
AI_CACHE_ENABLED=true
AI_CACHE_TTL=86400
AI_STREAMING_ENABLED=true
AI_TELEMETRY_ENABLED=false
```

### 7.2 依赖安装

```bash
# 安装 AI SDK
npm install openai @anthropic-ai/sdk

# 安装类型定义
npm install --save-dev @types/node

# 可选：本地模型
npm install languagetool-node
```

---

## 八、开发路线图

### Phase 1：基础框架（Week 1-2）

**目标**：搭建 AI 服务基础架构，支持单一提供商

**任务清单**：
- [ ] 实现 `AIService` 核心类
- [ ] 实现 `AIConfigManager` 配置管理
- [ ] 实现 `UsageTracker` 用量追踪
- [ ] 实现 `CacheManager` 缓存管理
- [ ] 集成 OpenAI Provider
- [ ] 开发基础设置界面
- [ ] 编写单元测试

**交付物**：
- ✅ 可在设置中配置 OpenAI API Key
- ✅ 可使用默认配置调用 GPT-4
- ✅ 基本的用量统计和缓存功能

### Phase 2：多提供商支持（Week 3-4）

**目标**：支持多个 AI 提供商，实现智能调度

**任务清单**：
- [ ] 集成 Claude Provider
- [ ] 实现自动降级策略
- [ ] 完善提供商优先级机制
- [ ] 开发完整的设置界面
- [ ] 添加连接测试功能
- [ ] 性能优化和错误处理

**交付物**：
- ✅ 支持 OpenAI 和 Claude 双提供商
- ✅ 主提供商失败时自动切换备用
- ✅ 完整的用户配置界面

### Phase 3：高级特性（Week 5-6）

**目标**：实现本地模型、自定义 Prompt 等高级功能

**任务清单**：
- [ ] 集成 LanguageTool（语法检查）
- [ ] 实现自定义 Prompt 编辑器
- [ ] 开发 A/B 测试框架
- [ ] 添加用量图表和导出功能
- [ ] 支持配置导入/导出
- [ ] 用户文档和帮助系统

**交付物**：
- ✅ 完整的 AI 功能矩阵
- ✅ 用户友好的配置系统
- ✅ 完善的监控和统计

### Phase 4：优化与扩展（Week 7+）

**目标**：性能优化、更多 AI 提供商、商业化支持

**任务清单**：
- [ ] 边缘计算部署（降低延迟）
- [ ] 集成国内 AI（百度文心、阿里通义）
- [ ] 会员系统和计费
- [ ] 团队协作功能
- [ ] 企业定制支持

---

## 九、风险与应对

### 9.1 技术风险

| 风险 | 可能性 | 影响 | 应对措施 |
|-----|-------|------|---------|
| API 响应慢 | 中 | 中 | 流式输出 + Loading 动画 + 边缘节点 |
| 生成质量差 | 低 | 高 | Few-shot learning + 持续调优 + 用户反馈 |
| 成本超支 | 中 | 中 | 限流 + 缓存 + 分级模型 + 预算告警 |
| 服务宕机 | 低 | 高 | 多供应商备份 + 自动降级 |
| API Key 泄露 | 中 | 高 | 加密存储 + 不上传服务器 + 定期轮换 |

### 9.2 法律风险

| 风险 | 应对措施 |
|-----|---------|
| 生成内容侵权 | 用户协议声明 + AI 生成标识 + 免责声明 |
| 敏感内容过滤 | 关键词审核 + 人工复审通道 + 举报机制 |
| 数据隐私 | 本地加密存储 + 不收集用户内容 + GDPR 合规 |

### 9.3 用户体验风险

**风险**：AI 生成内容不符合预期，用户失望

**应对**：
1. 降低期望管理（标注"AI 生成，仅供参考"）
2. 提供便捷的反馈渠道（点赞/点踩）
3. 持续优化模型（基于反馈数据）
4. 保留人工编辑权利（AI 只是辅助）

---

## 十、成功指标

### 10.1 产品指标

```typescript
const metrics = {
  // 采用率指标
  aiActivationRate: {
    definition: '启用 AI 功能的用户占比',
    target: '>70%',
    calculation: 'Users with AI enabled / Total users'
  },
  
  aiUsageRate: {
    definition: '活跃使用 AI 的用户占比',
    target: '>60%',
    calculation: 'DAU using AI / Total DAU'
  },
  
  // 满意度指标
  satisfactionScore: {
    definition: '用户对 AI 生成的满意度',
    target: '>4.5/5',
    calculation: '(👍 count) / (👍 + 👎 count)'
  },
  
  // 粘性指标
  avgGenerationsPerDay: {
    definition: '每用户日均使用次数',
    target: '>5 次',
    calculation: 'Total AI calls / DAU'
  },
  
  // 商业化指标
  conversionRate: {
    definition: '免费用户转付费比例',
    target: '>5%',
    calculation: 'New paid users / Free users'
  },
  
  arpu: {
    definition: '每用户平均收入提升',
    target: '+¥5/月',
    calculation: '(Revenue with AI - Revenue without AI) / Users'
  },
  
  retentionBoost: {
    definition: 'AI 功能对留存的提升',
    target: '>20%',
    calculation: '(Retention with AI - Retention without AI) / Retention without AI'
  }
};
```

### 10.2 技术指标

```typescript
const techMetrics = {
  avgResponseTime: {
    definition: 'AI 请求平均响应时间',
    target: '<3s',
    measurement: '从发起到收到完整响应的时间'
  },
  
  cacheHitRate: {
    definition: '缓存命中率',
    target: '>30%',
    calculation: 'Cache hits / Total requests'
  },
  
  errorRate: {
    definition: '请求失败率',
    target: '<1%',
    calculation: 'Failed requests / Total requests'
  },
  
  fallbackSuccessRate: {
    definition: '降级成功率',
    target: '>90%',
    calculation: 'Successful fallbacks / Total fallback attempts'
  },
  
  costPerRequest: {
    definition: '平均每次请求成本',
    target: '<$0.005',
    calculation: 'Total API cost / Total requests'
  }
};
```

---

## 十一、总结

### 核心优势

1. **可插拔架构**：新增 AI 提供商只需实现 Provider 接口，无需改动核心逻辑
2. **用户主导**：完全开放的配置权限，用户可根据需求和预算灵活调整
3. **高可用性**：多提供商 + 自动降级保证服务稳定性
4. **成本透明**：实时用量追踪 + 预算告警 + 分级模型选择
5. **性能优化**：本地缓存 + 流式输出 + 边缘计算

### 商业价值

- **差异化竞争**：市面上少有如此深度和开放的 AI 集成
- **付费转化**：AI 功能是强有力的付费理由
- **用户粘性**：养成使用 AI 的习惯后留存率显著提升
- **数据价值**：积累的用户偏好数据可用于进一步优化

### 下一步行动

**立即开始（本周）**：
1. 创建项目文件结构
2. 实现 `AIService` 核心类
3. 集成第一个 Provider（OpenAI）
4. 开发基础设置界面
5. 找 3-5 个种子用户体验

**记住**：完美的计划不如快速的行动。先做出 MVP，再持续迭代！🚀

---

**文档版本**：v1.0  
**创建日期**：2026 年 3 月 4 日  
**作者**：AI Assistant  
**状态**：待实施

---

## 附录：快速开始代码片段

### A. 初始化 AI 服务

```typescript
// src/renderer/main.ts

import { AIService } from './lib/ai/AIService';
import { AIConfigManager } from './lib/ai/AIConfigManager';

// 加载用户配置
const preferences = AIConfigManager.load();

// 创建 AI 服务实例
const aiService = new AIService(preferences);

// 暴露到全局或 Context
window.aiService = aiService;
```

### B. 使用 AI 服务

```typescript
// 在任何组件中调用

const { aiService } = useContext(AppContext);

// 生成标题
const titles = await aiService.generate({
  featureId: 'title-generation',
  messages: [
    { role: 'system', content: '你是一位标题专家...' },
    { role: 'user', content: `文章：${content}...` }
  ],
  temperature: 0.8,
  maxTokens: 800,
  stream: true
});
```

### C. 测试连接

```typescript
// 测试 API 连接
const isConnected = await ipcRenderer.invoke(
  'ai:test-connection',
  'openai',
  apiKey
);

if (isConnected) {
  console.log('✅ API 连接成功');
} else {
  console.log('❌ API 连接失败，请检查 Key');
}
```

---

**Ready to code! Let's build something amazing! 🎉**
