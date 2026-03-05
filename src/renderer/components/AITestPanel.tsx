// src/renderer/components/AITestPanel.tsx

import React, { useState } from 'react';
import { AIService } from '../lib/ai/AIService';
import { AIConfigManager } from '../lib/ai/AIConfigManager';
import { AIRequest } from '../types/ai-config';

export function AITestPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [usage, setUsage] = useState<any>(null);
  
  const aiService = new AIService(AIConfigManager.load());
  
  const testTitleGeneration = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const request: AIRequest = {
        featureId: 'title-generation',
        messages: [
          {
            role: 'system',
            content: '你是一位微信公众号爆款标题专家，擅长创作高点击率的标题。请根据文章内容生成 3 个吸引人的标题。'
          },
          {
            role: 'user',
            content: `文章主题：人工智能的发展趋势

文章内容：
近年来，人工智能技术取得了突破性进展。从 GPT-4 到 Claude，大语言模型的能力不断提升。在医疗、金融、教育等各个领域，AI 都在发挥着越来越重要的作用...

请生成 3 个适合微信传播的标题。`
          }
        ],
        temperature: 0.8,
        maxTokens: 500
      };
      
      const response = await aiService.generate(request);
      setResult(response.content);
      setUsage(aiService.getUsageStats());
      
    } catch (error) {
      console.error('Title generation failed:', error);
      setResult(`错误：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const clearCache = () => {
    aiService.clearCache();
    alert('缓存已清除');
  };
  
  const resetUsage = () => {
    aiService.resetUsage();
    setUsage(null);
    alert('用量统计已重置');
  };
  
  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        🤖 AI 功能测试面板
      </h2>
      
      <div className="space-y-4">
        {/* 测试按钮 */}
        <button
          onClick={testTitleGeneration}
          disabled={loading}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'AI 思考中...' : '✨ 测试标题生成'}
        </button>
        
        {/* 管理按钮 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={clearCache}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            🗑️ 清除缓存
          </button>
          <button
            onClick={resetUsage}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            🔄 重置用量
          </button>
        </div>
        
        {/* 用量统计 */}
        {usage && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              📊 用量统计
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>Token 使用：{usage.tokens.toLocaleString()}</p>
              <p>成本：${usage.cost.toFixed(4)}</p>
              <p>请求次数：{usage.requests}</p>
            </div>
          </div>
        )}
        
        {/* 结果显示 */}
        {result && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
              ✅ 生成结果
            </h3>
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {result}
            </p>
          </div>
        )}
        
        {/* 提示信息 */}
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            💡 <strong>提示：</strong>首次使用需要在 OpenAI 或 Claude 官网获取 API Key，
            并在设置中配置。如果配置了有效的 API Key，点击测试按钮即可看到 AI 生成的标题。
          </p>
        </div>
      </div>
    </div>
  );
}
