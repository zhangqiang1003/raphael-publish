// src/renderer/types/ai-config.ts

/**
 * AI 模型定义
 */
export interface AIModel {
  id: string;
  name: string;
  providerId: string;
  maxTokens: number;
  costPer1KTokens: number;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'economy' | 'standard' | 'premium';
}

/**
 * AI 提供商定义（静态配置）
 */
export interface AIProviderDefinition {
  id: string;
  name: string;
  type: 'cloud' | 'local';
  models: AIModel[];
  priority: number;
  requiresApiKey: boolean;
}

/**
 * 单个 AI 功能的配置
 */
export interface AIFeatureConfig {
  featureId: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  preferredProvider?: string;
  preferredModel?: string;
  customPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  autoApply?: boolean;
}

/**
 * 用户 AI 偏好总配置
 */
export interface AIUserPreferences {
  globalEnabled: boolean;
  defaultProvider: string;
  defaultModel: string;

  features: {
    titleGeneration: AIFeatureConfig;
    textOptimization: AIFeatureConfig;
    themeRecommendation: AIFeatureConfig;
    imageSuggestion: AIFeatureConfig;
    outlineGeneration: AIFeatureConfig;
    grammarCheck: AIFeatureConfig;
  };

  providers: Record<string, string>; // providerId -> apiKey 映射

  usageLimits: {
    dailyBudget: number;
    maxRequestsPerDay: number;
    notifyThreshold: number;
  };

  advanced: {
    enableCaching: boolean;
    enableStreaming: boolean;
    enableTelemetry: boolean;
    fallbackEnabled: boolean;
  };
}

/**
 * AI 请求接口
 */
export interface AIRequest {
  featureId: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string
  }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

/**
 * AI 响应接口
 */
export interface AIResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  duration: number;
}

/**
 * 支持的 AI 提供商列表（静态配置）
 */
export const AI_PROVIDERS: AIProviderDefinition[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'cloud',
    priority: 1,
    requiresApiKey: true,
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
      }
    ]
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    type: 'cloud',
    priority: 2,
    requiresApiKey: true,
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
    ]
  },
  {
    id: 'google',
    name: 'Google Gemini',
    type: 'cloud',
    priority: 3,
    requiresApiKey: true,
    models: [
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        providerId: 'google',
        maxTokens: 32000,
        costPer1KTokens: 0.0005,
        speed: 'fast',
        quality: 'standard'
      },
      {
        id: 'gemini-ultra',
        name: 'Gemini Ultra',
        providerId: 'google',
        maxTokens: 32000,
        costPer1KTokens: 0.01,
        speed: 'medium',
        quality: 'premium'
      }
    ]
  },
  {
    id: 'qwen',
    name: '阿里云 Qwen',
    type: 'cloud',
    priority: 4,
    requiresApiKey: true,
    models: [
      {
        id: 'qwen-turbo',
        name: 'Qwen Turbo',
        providerId: 'qwen',
        maxTokens: 8000,
        costPer1KTokens: 0.0008,
        speed: 'fast',
        quality: 'economy'
      },
      {
        id: 'qwen-plus',
        name: 'Qwen Plus',
        providerId: 'qwen',
        maxTokens: 32000,
        costPer1KTokens: 0.002,
        speed: 'medium',
        quality: 'standard'
      },
      {
        id: 'qwen-max',
        name: 'Qwen Max',
        providerId: 'qwen',
        maxTokens: 32000,
        costPer1KTokens: 0.02,
        speed: 'medium',
        quality: 'premium'
      }
    ]
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    type: 'cloud',
    priority: 5,
    requiresApiKey: true,
    models: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        providerId: 'deepseek',
        maxTokens: 32000,
        costPer1KTokens: 0.0014,
        speed: 'fast',
        quality: 'standard'
      },
      {
        id: 'deepseek-coder',
        name: 'DeepSeek Coder',
        providerId: 'deepseek',
        maxTokens: 16000,
        costPer1KTokens: 0.0014,
        speed: 'fast',
        quality: 'standard'
      }
    ]
  },
  {
    id: 'doubao',
    name: '字节豆包',
    type: 'cloud',
    priority: 6,
    requiresApiKey: true,
    models: [
      {
        id: 'doubao-pro',
        name: '豆包 Pro',
        providerId: 'doubao',
        maxTokens: 32000,
        costPer1KTokens: 0.0008,
        speed: 'fast',
        quality: 'standard'
      }
    ]
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    type: 'cloud',
    priority: 7,
    requiresApiKey: true,
    models: [
      {
        id: 'abab6-chat',
        name: 'ABAB 6 Chat',
        providerId: 'minimax',
        maxTokens: 16000,
        costPer1KTokens: 0.01,
        speed: 'medium',
        quality: 'standard'
      }
    ]
  },
  {
    id: 'zhipu',
    name: '智谱 AI',
    type: 'cloud',
    priority: 8,
    requiresApiKey: true,
    models: [
      {
        id: 'glm-4',
        name: 'GLM-4',
        providerId: 'zhipu',
        maxTokens: 128000,
        costPer1KTokens: 0.01,
        speed: 'medium',
        quality: 'premium'
      },
      {
        id: 'glm-3-turbo',
        name: 'GLM-3 Turbo',
        providerId: 'zhipu',
        maxTokens: 128000,
        costPer1KTokens: 0.0005,
        speed: 'fast',
        quality: 'economy'
      }
    ]
  },
  {
    id: 'moonshot',
    name: 'Kimi 月之暗面',
    type: 'cloud',
    priority: 9,
    requiresApiKey: true,
    models: [
      {
        id: 'moonshot-v1-8k',
        name: 'Moonshot v1 8K',
        providerId: 'moonshot',
        maxTokens: 8000,
        costPer1KTokens: 0.012,
        speed: 'fast',
        quality: 'standard'
      },
      {
        id: 'moonshot-v1-32k',
        name: 'Moonshot v1 32K',
        providerId: 'moonshot',
        maxTokens: 32000,
        costPer1KTokens: 0.024,
        speed: 'medium',
        quality: 'standard'
      },
      {
        id: 'moonshot-v1-128k',
        name: 'Moonshot v1 128K',
        providerId: 'moonshot',
        maxTokens: 128000,
        costPer1KTokens: 0.06,
        speed: 'slow',
        quality: 'premium'
      }
    ]
  },
  {
    id: 'local',
    name: '本地模型',
    type: 'local',
    priority: 10,
    requiresApiKey: false,
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
    ]
  }
];

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

  providers: {},

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
