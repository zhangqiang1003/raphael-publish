import React from 'react';
import type { AIUserPreferences } from '../types/ai-config';

interface UsageLimitsSettingsProps {
  limits: AIUserPreferences['usageLimits'];
  onUpdateLimits: (updates: Partial<AIUserPreferences['usageLimits']>) => void;
}

export function UsageLimitsSettings({ limits, onUpdateLimits }: UsageLimitsSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Current Usage */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">📊 今日使用情况</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">请求次数</p>
            <p className="text-2xl font-bold text-gray-900">0<span className="text-sm text-gray-400"> /{limits.maxRequestsPerDay}</span></p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Token 消耗</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">预估费用</p>
            <p className="text-2xl font-bold text-gray-900">${(limits.dailyBudget * 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Daily Budget */}
      <div className="border border-gray-200 rounded-lg p-5">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          💰 每日预算上限（USD）
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={limits.dailyBudget}
            onChange={(e) => onUpdateLimits({ dailyBudget: parseFloat(e.target.value) || 0 })}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <span className="text-gray-500 text-sm">美元/天</span>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          达到此限制后，AI 功能将自动暂停使用，直到次日重置
        </p>
        
        {/* Quick Select */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[5, 10, 20, 50].map(amount => (
            <button
              key={amount}
              onClick={() => onUpdateLimits({ dailyBudget: amount })}
              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
            >
              ${amount}
            </button>
          ))}
        </div>
      </div>

      {/* Max Requests Per Day */}
      <div className="border border-gray-200 rounded-lg p-5">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          📬 每日最大请求次数
        </label>
        <input
          type="number"
          min="10"
          max="1000"
          step="10"
          value={limits.maxRequestsPerDay}
          onChange={(e) => onUpdateLimits({ maxRequestsPerDay: parseInt(e.target.value) || 50 })}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <p className="mt-2 text-xs text-gray-500">
          防止过度使用，建议设置为 50-100 次/天
        </p>
        
        {/* Slider */}
        <div className="mt-3">
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={limits.maxRequestsPerDay}
            onChange={(e) => onUpdateLimits({ maxRequestsPerDay: parseInt(e.target.value) || 50 })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>10</span>
            <span>250</span>
            <span>500</span>
          </div>
        </div>
      </div>

      {/* Notify Threshold */}
      <div className="border border-gray-200 rounded-lg p-5">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          🔔 用量提醒阈值
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0.1"
            max="1"
            step="0.1"
            value={limits.notifyThreshold}
            onChange={(e) => onUpdateLimits({ notifyThreshold: parseFloat(e.target.value) || 0.8 })}
            className="w-32 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <span className="text-gray-700 text-sm font-medium">
            {(limits.notifyThreshold * 100).toFixed(0)}%
          </span>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          当用量达到预算的 {(limits.notifyThreshold * 100).toFixed(0)}% 时，将弹出提醒
        </p>
        
        {/* Visual Guide */}
        <div className="mt-4 bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
            style={{ width: `${limits.notifyThreshold * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0%</span>
          <span>提醒点：{(limits.notifyThreshold * 100).toFixed(0)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Reset Time */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">ℹ️</span>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">用量重置时间</h4>
            <p className="text-sm text-gray-600">
              每日凌晨 0:00（本地时间）自动重置用量统计
            </p>
            <p className="text-xs text-gray-500 mt-2">
              💡 <strong>提示：</strong>合理设置预算和请求限制，避免费用超支。
              系统会在达到提醒阈值时主动通知您。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
