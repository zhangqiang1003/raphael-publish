// src/renderer/lib/ai/AIConfigManager.ts

import { AIUserPreferences, DEFAULT_AI_PREFERENCES } from '../../types/ai-config';

/**
 * AI 配置管理器 - 负责配置的加载、保存、导入导出
 */
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
      console.log('✅ AI preferences saved');
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
  
  /**
   * 更新部分配置
   */
  static update(partial: Partial<AIUserPreferences>): AIUserPreferences {
    const current = this.load();
    const updated = { ...current, ...partial };
    this.save(updated);
    return updated;
  }
}
