import { useState } from 'react';
import { AI_PROVIDERS, type AIProviderDefinition } from '../types/ai-config';

interface ProviderSettingsProps {
  providers: Record<string, string>;
  defaultProvider: string;
  onUpdateProvider: (providerId: string, apiKey: string) => void;
  onSetDefault: (providerId: string) => void;
}

export function ProviderSettings({
  providers,
  defaultProvider,
  onUpdateProvider,
  onSetDefault
}: ProviderSettingsProps) {
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  const toggleShowApiKey = (providerId: string) => {
    setShowApiKey(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const hasApiKey = (providerId: string) => Boolean(providers[providerId]);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>提示：</strong>配置您的 API Key 后才能使用对应的 AI 模型。密钥仅存储在本地浏览器，不会上传到服务器。
        </p>
      </div>

      {AI_PROVIDERS.map((provider: AIProviderDefinition) => {
        const apiKey = providers[provider.id] || '';
        const isConfigured = hasApiKey(provider.id);
        const isDefault = provider.id === defaultProvider;

        return (
          <div key={provider.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{provider.type === 'cloud' ? '☁️' : '💻'}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{provider.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {provider.type === 'cloud' ? '云端服务' : '本地服务'} • {provider.models.length} 个模型
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isConfigured && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                    ✓ 已配置
                  </span>
                )}
                {isDefault && isConfigured && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">
                    默认
                  </span>
                )}
              </div>
            </div>

            {provider.requiresApiKey && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type={showApiKey[provider.id] ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => onUpdateProvider(provider.id, e.target.value)}
                    placeholder={`请输入 ${provider.name} 的 API Key`}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowApiKey(provider.id)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                  >
                    {showApiKey[provider.id] ? '🙈' : '👁️'}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  🔒 密钥仅存储在本地浏览器，不会上传到服务器
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📦 可用模型
              </label>
              <div className="space-y-2">
                {provider.models.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{model.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{model.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                        💰 ${model.costPer1KTokens.toFixed(4)}/1K
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        model.speed === 'fast' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        model.speed === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {model.speed === 'fast' ? '⚡' : model.speed === 'medium' ? '🚀' : '🐢'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isConfigured && !isDefault && (
              <button
                onClick={() => onSetDefault(provider.id)}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                设为默认提供商
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
