// src/renderer/lib/ai/UsageTracker.ts

import { AIUserPreferences } from '../../types/ai-config';

interface UsageData {
  tokens: number;
  cost: number;
  requests: number;
  lastReset: number;
}

/**
 * AI 用量追踪器 - 负责跟踪和限制 AI 使用情况
 */
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
    
    console.log(`📊 Usage recorded: ${tokens} tokens, $${cost.toFixed(4)}`);
    
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
    console.log('🔄 Daily usage stats reset');
  }
  
  /**
   * 检查并重置（每日自动重置）
   */
  private checkAndReset() {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (now - this.currentUsage.lastReset > oneDay) {
      console.log('📅 Resetting daily usage stats (new day)');
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
    console.warn('⚠️ AI usage approaching limit!');
    
    // 可以通过通知系统发送提醒
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('AI 使用量提醒', {
        body: '您的 AI 使用量即将达到今日上限',
        icon: '/warning.png'
      });
    }
  }
  
  /**
   * 获取剩余用量
   */
  getRemainingUsage() {
    return {
      requests: this.limits.maxRequestsPerDay - this.currentUsage.requests,
      budget: this.limits.dailyBudget - this.currentUsage.cost,
      percentage: {
        requests: (this.currentUsage.requests / this.limits.maxRequestsPerDay) * 100,
        budget: (this.currentUsage.cost / this.limits.dailyBudget) * 100
      }
    };
  }
}
