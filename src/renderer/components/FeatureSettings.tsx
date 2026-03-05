import React from 'react';
import type { AIFeatureConfig } from '../types/ai-config';

interface FeatureSettingsProps {
  features: Record<string, AIFeatureConfig>;
  globalEnabled: boolean;
  defaultModel: string;
  onToggleGlobal: (enabled: boolean) => void;
  onUpdateFeature: (featureId: string, updates: Partial<AIFeatureConfig>) => void;
  onSetDefaultModel: (model: string) => void;
}

export function FeatureSettings({
  features,
  globalEnabled,
  defaultModel,
  onToggleGlobal,
  onUpdateFeature,
  onSetDefaultModel
}: FeatureSettingsProps) {
  const featureList = Object.values(features);

  return (
    <div className="space-y-6">
      {/* Global Toggle */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">🌍 全局 AI 功能开关</h3>
            <p className="text-sm text-gray-600">关闭后将禁用所有 AI 辅助功能</p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={globalEnabled}
              onChange={(e) => onToggleGlobal(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600 relative transition-colors">
              <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6 shadow-md" />
            </div>
          </label>
        </div>
      </div>

      {/* Default Model */}
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          🎯 默认使用模型
        </label>
        <select
          value={defaultModel}
          onChange={(e) => onSetDefaultModel(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
        >
          <option value="gpt-4-turbo">GPT-4 Turbo (推荐)</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo (快速)</option>
          <option value="claude-3-opus">Claude 3 Opus (最强)</option>
          <option value="claude-3-sonnet">Claude 3 Sonnet (平衡)</option>
        </select>
      </div>

      {/* Feature List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">✨ 功能配置</h3>
        
        {featureList.map((feature) => (
          <div 
            key={feature.featureId}
            className={`border rounded-lg p-4 transition-all ${
              feature.enabled && globalEnabled
                ? 'border-blue-200 bg-blue-50/30'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">{feature.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{feature.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{feature.description}</p>
                </div>
              </div>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={feature.enabled && globalEnabled}
                  onChange={(e) => onUpdateFeature(feature.featureId, { enabled: e.target.checked })}
                  disabled={!globalEnabled}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 relative transition-colors ${
                  globalEnabled ? 'peer-checked:bg-blue-600 bg-gray-200' : 'bg-gray-200 opacity-50'
                }`}>
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
            </div>

            {/* Advanced Settings */}
            {feature.enabled && globalEnabled && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">
                      🌡️ 温度参数 (0-2)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={feature.temperature || 0.7}
                      onChange={(e) => onUpdateFeature(feature.featureId, { 
                        temperature: parseFloat(e.target.value) || 0.7 
                      })}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">越高越创意，越低越严谨</p>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">
                      📝 最大 Token 数
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="8000"
                      step="100"
                      value={feature.maxTokens || 2000}
                      onChange={(e) => onUpdateFeature(feature.featureId, { 
                        maxTokens: parseInt(e.target.value) || 2000 
                      })}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">单次响应的最大长度</p>
                  </div>
                </div>
                
                {feature.customPrompt && (
                  <div className="mt-3">
                    <label className="block text-xs text-gray-600 mb-1.5">
                      📋 自定义提示词
                    </label>
                    <textarea
                      value={feature.customPrompt}
                      onChange={(e) => onUpdateFeature(feature.featureId, { 
                        customPrompt: e.target.value 
                      })}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      placeholder="留空则使用系统默认提示词"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          💡 <strong>温度参数说明：</strong>
          <br />
          • 0.0-0.3：适合事实性、逻辑性任务（如语法检查）
          <br />
          • 0.4-0.7：适合一般写作和润色（推荐）
          <br />
          • 0.8-1.2：适合创意性写作（如标题生成）
          <br />
          • 1.3-2.0：高度发散，可能产生意想不到的效果
        </p>
      </div>
    </div>
  );
}
