// src/renderer/lib/ai/AIService.ts

import { 
  AIUserPreferences, 
  AIProvider, 
  AIModel,
  AIRequest,
  AIResponse 
} from '../../types/ai-config';
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
    const featureConfig = Object.values(this.preferences.features).find(f => f.featureId === request.featureId);
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
        return await this.tryFallback(request, error as Error);
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
    const featureConfig = Object.values(this.preferences.features).find(f => f.featureId === request.featureId);
    
    // 优先使用功能级配置
    if (featureConfig?.preferredProvider && featureConfig?.preferredModel) {
      const provider = this.preferences.providers[featureConfig.preferredProvider as keyof typeof this.preferences.providers];
      if (provider && !Array.isArray(provider) && provider.enabled) {
        const model = provider.models.find(m => m.id === featureConfig.preferredModel);
        if (model) {
          return { provider, model };
        }
      }
    }
    
    // 使用全局默认配置
    const defaultProvider = this.preferences.providers[this.preferences.defaultProvider as keyof typeof this.preferences.providers];
    if (defaultProvider && !Array.isArray(defaultProvider) && defaultProvider.enabled) {
      const defaultModel = defaultProvider.models.find(m => m.id === this.preferences.defaultModel);
      if (defaultModel) {
        return { provider: defaultProvider, model: defaultModel };
      }
    }
    
    // 按优先级选择第一个可用的
    const sortedProviders = Object.values(this.preferences.providers)
      .filter((p): p is AIProvider => Boolean(p && !Array.isArray(p) && p.enabled))
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
      .filter((p): p is AIProvider => Boolean(p && !Array.isArray(p) && p.enabled && p.priority > 0))
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
  
  /**
   * 获取用量统计
   */
  getUsageStats() {
    return this.usageTracker.getCurrentUsage();
  }
  
  /**
   * 获取剩余用量
   */
  getRemainingUsage() {
    return this.usageTracker.getRemainingUsage();
  }
  
  /**
   * 重置用量
   */
  resetUsage() {
    this.usageTracker.reset();
  }
  
  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear();
  }
}
