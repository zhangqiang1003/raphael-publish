// src/main/api/ai-gateway.ts

import { ipcMain, IpcMainInvokeEvent } from 'electron';

/**
 * AI 网关 - 统一处理所有 AI 请求
 */
class AIGateway {
  private openaiClients: Map<string, any> = new Map();
  private anthropicClients: Map<string, any> = new Map();
  
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
    const OpenAI = require('openai');
    const client = this.getOrCreateOpenAIClient(apiKey, OpenAI);
    
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
    const Anthropic = require('@anthropic-ai/sdk');
    const client = this.getOrCreateAnthropicClient(apiKey, Anthropic);
    
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
  private getOrCreateOpenAIClient(apiKey: string, OpenAI: any): any {
    if (!this.openaiClients.has(apiKey)) {
      this.openaiClients.set(apiKey, new OpenAI({ apiKey }));
    }
    return this.openaiClients.get(apiKey);
  }
  
  /**
   * 获取或创建 Anthropic 客户端
   */
  private getOrCreateAnthropicClient(apiKey: string, Anthropic: any): any {
    if (!this.anthropicClients.has(apiKey)) {
      this.anthropicClients.set(apiKey, new Anthropic({ apiKey }));
    }
    return this.anthropicClients.get(apiKey);
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
        const OpenAI = require('openai');
        const client = new OpenAI({ apiKey });
        await client.models.list();
        return true;
      } else if (provider === 'claude') {
        const Anthropic = require('@anthropic-ai/sdk');
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
export function initializeAIGateway() {
  new AIGateway().initialize();
}
