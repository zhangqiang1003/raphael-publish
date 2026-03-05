import React from 'react';
import type { AIProvider, AIModel } from '../types/ai-config';

interface ProviderSettingsProps {
  providers: {
    openai?: AIProvider;
    claude?: AIProvider;
    local?: AIProvider;
  };
  defaultProvider: string;
  onUpdateProvider: (providerId: string, updates: Partial<AIProvider>) => void;
  onSetDefault: (providerId: string) => void;
}

export function ProviderSettings({ 
  providers, 
  defaultProvider, 
  onUpdateProvider,
  onSetDefault 
}: ProviderSettingsProps) {
  const providerList = Object.entries(providers).filter(
    ([_, p]) => Boolean(p && !Array.isArray(p))
  ) as Array<[string, AIProvider]>;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>提示：</strong>配置您的 AI 服务提供商。支持多个提供商同时使用，系统会按优先级自动选择。
        </p>
      </div>

      {providerList.map(([providerId, provider]) => (
        <div key={providerId} className="border border-gray-200 rounded-lg p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{provider.type === 'cloud' ? '☁️' : '💻'}</span>
              <div>
                <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                <p className="text-xs text-gray-500">
                  ID: {providerId} • {provider.type === 'cloud' ? '云端' : '本地'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={provider.enabled}
                  onChange={(e) => onUpdateProvider(providerId, { enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600 peer-disabled:opacity-50 relative transition-colors">
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
              
              {provider.enabled && providerId === defaultProvider && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                  ✓ 默认
                </span>
              )}
            </div>
          </div>

          {/* API Key Input */}
          {provider.apiKey !== undefined && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="password"
                value={provider.apiKey || ''}
                onChange={(e) => onUpdateProvider(providerId, { apiKey: e.target.value })}
                placeholder={`请输入 ${provider.name} 的 API Key`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={!provider.enabled}
              />
              <p className="mt-1.5 text-xs text-gray-500">
                🔒 密钥仅存储在本地，不会上传到服务器
              </p>
            </div>
          )}

          {/* Models */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📦 可用模型
            </label>
            <div className="space-y-2">
              {provider.models.map((model: AIModel) => (
                <div 
                  key={model.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{model.name}</p>
                    <p className="text-xs text-gray-500">{model.id}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded border">
                      💰 ${(model.costPer1KTokens / 1000).toFixed(4)} / 1K tokens
                    </span>
                    <button
                      onClick={() => onSetDefault(providerId)}
                      disabled={!provider.enabled || providerId === defaultProvider}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        providerId === defaultProvider
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : provider.enabled
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {providerId === defaultProvider ? '✓ 默认' : '设为默认'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎯 优先级（数字越小优先级越高）
            </label>
            <input
              type="number"
              value={provider.priority}
              onChange={(e) => onUpdateProvider(providerId, { priority: parseInt(e.target.value) || 0 })}
              min="0"
              max="100"
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={!provider.enabled}
            />
          </div>
        </div>
      ))}

      {/* Add Custom Provider */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <p className="text-gray-500 text-sm mb-3">🔧 需要添加其他 AI 提供商？</p>
        <button 
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          disabled
        >
          即将支持（敬请期待）
        </button>
      </div>
    </div>
  );
}
