// src/renderer/lib/ai/CacheManager.ts

import { AIResponse } from '../../types/ai-config';

interface CacheEntry {
  response: AIResponse;
  timestamp: number;
  hits: number;
}

/**
 * AI 缓存管理器 - 负责缓存 AI 响应结果
 */
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
    
    console.log(`💾 Cached response for key: ${key}`);
  }
  
  /**
   * 清除缓存
   */
  async clear(): Promise<void> {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
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
   * 删除指定缓存
   */
  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
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
          console.log(`🧹 Cleaned up expired cache: ${key}`);
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
      console.log(`🗑️ Evicted oldest cache entry: ${oldestKey}`);
    }
  }
}
