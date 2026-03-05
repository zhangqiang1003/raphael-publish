// src/renderer/types/ai-config.ts

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
 * 单个 AI 功能的配置
 */
export interface AIFeatureConfig {
  featureId: string;             // 功能 ID
  name: string;                  // 功能名称
  description: string;           // 功能描述
  icon: string;                  // 图标 emoji
  enabled: boolean;              // 是否启用该功能
  preferredProvider?: string;    // 首选提供商
  preferredModel?: string;       // 首选模型
  customPrompt?: string;         // 自定义 Prompt
  temperature?: number;          // 创造性 (0-2)
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
 * AI 请求接口
 */
export interface AIRequest {
  featureId: string;             // 功能 ID
  messages: Array<{ 
    role: 'system' | 'user' | 'assistant'; 
    content: string 
  }>;                            // 对话消息
  model?: string;                // 指定模型
  temperature?: number;          // 温度参数
  maxTokens?: number;            // 最大输出长度
  stream?: boolean;              // 是否流式输出
}

/**
 * AI 响应接口
 */
export interface AIResponse {
  content: string;               // AI 生成的内容
  model: string;                 // 使用的模型
  usage: {
    promptTokens: number;        // 输入 token 数
    completionTokens: number;    // 输出 token 数
    totalTokens: number;         // 总 token 数
  };
  duration: number;              // 耗时（毫秒）
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
      name: '爆款标题生成',
      description: '根据文章内容自动生成吸引人的公众号标题',
      icon: '🎯',
      enabled: true,
      preferredProvider: 'openai',
      preferredModel: 'gpt-4-turbo',
      temperature: 0.8,
      maxTokens: 800,
      autoApply: false
    },
    textOptimization: {
      featureId: 'text-optimization',
      name: '文案润色优化',
      description: '优化文章表达，提升可读性和感染力',
      icon: '✍️',
      enabled: true,
      preferredProvider: 'openai',
      preferredModel: 'gpt-3.5-turbo',
      temperature: 0.5,
      maxTokens: 500,
      autoApply: false
    },
    themeRecommendation: {
      featureId: 'theme-recommendation',
      name: '智能主题推荐',
      description: '根据内容推荐合适的排版主题',
      icon: '🎨',
      enabled: true,
      preferredProvider: 'openai',
      preferredModel: 'gpt-3.5-turbo',
      temperature: 0.3,
      maxTokens: 300,
      autoApply: false
    },
    imageSuggestion: {
      featureId: 'image-suggestion',
      name: '配图建议',
      description: '为文章内容推荐合适的图片位置和类型',
      icon: '🖼️',
      enabled: true,
      preferredProvider: 'openai',
      preferredModel: 'gpt-4-vision',
      temperature: 0.5,
      maxTokens: 200,
      autoApply: false
    },
    outlineGeneration: {
      featureId: 'outline-generation',
      name: '大纲生成',
      description: '快速生成文章结构大纲',
      icon: '📝',
      enabled: true,
      preferredProvider: 'openai',
      preferredModel: 'gpt-4-turbo',
      temperature: 0.6,
      maxTokens: 1500,
      autoApply: false
    },
    grammarCheck: {
      featureId: 'grammar-check',
      name: '语法检查',
      description: '自动检查并纠正语法错误',
      icon: '✅',
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
