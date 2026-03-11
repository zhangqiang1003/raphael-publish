import { useState } from 'react';
import type { AIUserPreferences, AIFeatureConfig } from '../types/ai-config';
import { ProviderSettings } from './ProviderSettings';
import { FeatureSettings } from './FeatureSettings';

interface AISettingsPanelProps {
  preferences: AIUserPreferences;
  onSave: (preferences: AIUserPreferences) => void;
  onClose: () => void;
}

export function AISettingsPanel({ preferences, onSave, onClose }: AISettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'providers' | 'features'>('providers');
  const [localPrefs, setLocalPrefs] = useState<AIUserPreferences>({ ...preferences });

  const handleSave = () => {
    onSave(localPrefs);
    onClose();
  };

  const handleCancel = () => {
    setLocalPrefs({ ...preferences });
    onClose();
  };

  const updateProvider = (providerId: string, apiKey: string) => {
    setLocalPrefs((prev: AIUserPreferences) => ({
      ...prev,
      providers: {
        ...prev.providers,
        [providerId]: apiKey
      }
    }));
  };

  const updateFeature = (featureId: string, updates: Partial<AIFeatureConfig>) => {
    setLocalPrefs((prev: AIUserPreferences) => {
      // 找到匹配的 feature 键名（featureId 可能与 features 对象的键名不同）
      const featureKey = Object.keys(prev.features).find(
        key => prev.features[key as keyof typeof prev.features]?.featureId === featureId
      ) as keyof typeof prev.features | undefined;

      if (!featureKey) {
        console.warn(`Feature with featureId "${featureId}" not found`);
        return prev;
      }

      return {
        ...prev,
        features: {
          ...prev.features,
          [featureKey]: { ...prev.features[featureKey], ...updates }
        }
      };
    });
  };

  const addCustomModel = (providerId: string, modelName: string) => {
    setLocalPrefs((prev: AIUserPreferences) => {
      const currentModels = prev.customModels[providerId] || [];
      if (currentModels.includes(modelName)) {
        return prev; // 避免重复添加
      }
      return {
        ...prev,
        customModels: {
          ...prev.customModels,
          [providerId]: [...currentModels, modelName]
        }
      };
    });
  };

  const removeCustomModel = (providerId: string, modelName: string) => {
    setLocalPrefs((prev: AIUserPreferences) => {
      const currentModels = prev.customModels[providerId] || [];
      return {
        ...prev,
        customModels: {
          ...prev.customModels,
          [providerId]: currentModels.filter(m => m !== modelName)
        }
      };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-3xl">⚙️</span>
            <span>AI 功能设置</span>
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-8 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <button
            onClick={() => setActiveTab('providers')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'providers'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>🤖</span>
              <span>服务提供商</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'features'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>✨</span>
              <span>功能配置</span>
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          {activeTab === 'providers' && (
            <ProviderSettings
              providers={localPrefs.providers}
              defaultProvider={localPrefs.defaultProvider}
              customModels={localPrefs.customModels || {}}
              onUpdateProvider={updateProvider}
              onSetDefault={(id: string) => setLocalPrefs((prev: AIUserPreferences) => ({ ...prev, defaultProvider: id }))}
              onAddCustomModel={addCustomModel}
              onRemoveCustomModel={removeCustomModel}
            />
          )}
          
          {activeTab === 'features' && (
            <FeatureSettings
              features={localPrefs.features}
              globalEnabled={localPrefs.globalEnabled}
              defaultModel={localPrefs.defaultModel}
              providers={localPrefs.providers}
              customModels={localPrefs.customModels || {}}
              onToggleGlobal={(enabled: boolean) => setLocalPrefs((prev: AIUserPreferences) => ({ ...prev, globalEnabled: enabled }))}
              onUpdateFeature={updateFeature}
              onSetDefaultModel={(model: string) => setLocalPrefs((prev: AIUserPreferences) => ({ ...prev, defaultModel: model }))}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
          >
            💾 保存设置
          </button>
        </div>
      </div>
    </div>
  );
}
