import { useState } from 'react';
import { AI_PROVIDERS, type AIProviderDefinition } from '../types/ai-config';

interface ProviderSettingsProps {
  providers: Record<string, string>;
  defaultProvider: string;
  customModels: Record<string, string[]>;
  onUpdateProvider: (providerId: string, apiKey: string) => void;
  onSetDefault: (providerId: string) => void;
  onAddCustomModel: (providerId: string, modelName: string) => void;
  onRemoveCustomModel: (providerId: string, modelName: string) => void;
}

export function ProviderSettings({
  providers,
  defaultProvider,
  customModels,
  onUpdateProvider,
  onSetDefault,
  onAddCustomModel,
  onRemoveCustomModel
}: ProviderSettingsProps) {
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [addingModelFor, setAddingModelFor] = useState<string | null>(null);
  const [newModelName, setNewModelName] = useState('');

  const toggleShowApiKey = (providerId: string) => {
    setShowApiKey(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const hasApiKey = (providerId: string) => Boolean(providers[providerId]);

  const handleAddModel = (providerId: string) => {
    const trimmedName = newModelName.trim();
    if (trimmedName) {
      onAddCustomModel(providerId, trimmedName);
      setNewModelName('');
      setAddingModelFor(null);
    }
  };

  const handleCancelAdd = () => {
    setNewModelName('');
    setAddingModelFor(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>提示：</strong>配置您的 API Key 后才能使用对应的 AI 模型。密钥仅存储在本地，不会上传到服务器。
        </p>
      </div>

      {AI_PROVIDERS.map((provider: AIProviderDefinition) => {
        const apiKey = providers[provider.id] || '';
        const isConfigured = hasApiKey(provider.id);
        const isDefault = provider.id === defaultProvider;
        const providerCustomModels = customModels[provider.id] || [];

        return (
          <div key={provider.id} className={`group border rounded-lg p-5 bg-white dark:bg-gray-800 transition-all duration-200 ${
            isDefault
              ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 dark:ring-blue-400/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:ring-2 hover:ring-blue-300/30 dark:hover:ring-blue-600/30'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{provider.type === 'cloud' ? '☁️' : '💻'}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2.5">
                    {provider.name}
                    {isConfigured && (
                      <span className="ml-2.5 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                        ✓ 已配置
                      </span>
                    )}
                    {isDefault && (
                      <span className="px-2 py-0.5 bg-blue-500 dark:bg-blue-600 text-white text-xs font-medium rounded-full">
                        ⭐ 默认
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {provider.type === 'cloud' ? '云端服务' : '本地服务'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!isDefault && (
                  <button
                    onClick={() => onSetDefault(provider.id)}
                    className="w-[100px] px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    设为默认
                  </button>
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
                  🔒 密钥仅存储在本地，不会上传到服务器
                </p>
              </div>
            )}

            {/* 自定义模型区域 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  📦 自定义模型
                </label>
                <button
                  onClick={() => setAddingModelFor(provider.id)}
                  className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  添加模型
                </button>
              </div>

              {/* 添加模型表单 */}
              {addingModelFor === provider.id && (
                <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddModel(provider.id);
                      if (e.key === 'Escape') handleCancelAdd();
                    }}
                    placeholder="输入模型名称，如 gpt-4o"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2"
                    autoFocus
                  />
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-amber-500 text-sm flex-shrink-0">⚠️</span>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      请确保模型名称符合 {provider.name} 官方要求，注意大小写和格式，错误的名称可能导致调用失败。
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCancelAdd}
                      className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => handleAddModel(provider.id)}
                      disabled={!newModelName.trim()}
                      className="px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                      确认添加
                    </button>
                  </div>
                </div>
              )}

              {/* 自定义模型标签列表 */}
              {providerCustomModels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {providerCustomModels.map((modelName) => (
                    <div
                      key={modelName}
                      className="group/tag inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <span>{modelName}</span>
                      <button
                        onClick={() => onRemoveCustomModel(provider.id, modelName)}
                        className="ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover/tag:opacity-100"
                        title="删除模型"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {providerCustomModels.length === 0 && addingModelFor !== provider.id && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  暂无自定义模型，悬停点击"添加模型"添加
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}