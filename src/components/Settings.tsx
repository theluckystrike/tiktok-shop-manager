import React, { useState } from 'react';
import { StorageData, updateSettings, updateStorage } from '../lib/storage';
import { validateApiKey, initializeOpenAI } from '../lib/ai';

interface Props {
  storage: StorageData;
  onRefresh: () => void;
}

export function Settings({ storage, onRefresh }: Props) {
  const { settings, usage } = storage;
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const usagePercent = (usage.analysesUsed / usage.monthlyLimit) * 100;
  const resetDate = new Date(usage.resetDate).toLocaleDateString();

  async function handleSaveApiKey() {
    if (!apiKey.trim()) {
      await updateSettings({ apiKey: '' });
      setMessage('API key removed');
      onRefresh();
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      setMessage('Invalid API key format');
      return;
    }

    setSaving(true);
    setMessage('');

    const isValid = await validateApiKey(apiKey);

    if (!isValid) {
      setMessage('Invalid API key. Please check and try again.');
      setSaving(false);
      return;
    }

    initializeOpenAI(apiKey);
    await updateSettings({ apiKey });
    setMessage('API key saved successfully!');
    setSaving(false);
    onRefresh();
  }

  async function handleToggleSetting(key: 'notifications' | 'autoTrack') {
    await updateSettings({ [key]: !settings[key] });
    onRefresh();
  }

  async function handleClearData() {
    if (confirm('This will delete all tracked products, competitors, and trends. Continue?')) {
      await updateStorage({
        trackedProducts: [],
        competitors: [],
        trends: [],
        priceAlerts: [],
      });
      onRefresh();
    }
  }

  async function handleResetUsage() {
    if (confirm('Reset monthly usage counter?')) {
      await updateStorage({
        usage: {
          ...usage,
          analysesUsed: 0,
        },
      });
      onRefresh();
    }
  }

  return (
    <div className="space-y-6">
      {/* Usage Stats */}
      <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span>📊</span> Usage This Month
        </h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold">{usage.analysesUsed}</span>
          <span className="text-gray-400">/ {usage.monthlyLimit} analyses</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all ${
              usagePercent > 80 ? 'bg-[#FE2C55]' : 'bg-[#25F4EE]'
            }`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">Resets on {resetDate}</p>
      </div>

      {/* API Key */}
      <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span>🔑</span> OpenAI API Key
        </h3>
        <div className="space-y-3">
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:border-[#FE2C55] focus:outline-none"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showApiKey ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          <button
            onClick={handleSaveApiKey}
            disabled={saving}
            className="w-full py-2 bg-[#25F4EE] text-black rounded-lg text-sm font-medium hover:bg-[#25F4EE]/80 disabled:opacity-50"
          >
            {saving ? 'Verifying...' : 'Save API Key'}
          </button>
          {message && (
            <p className={`text-xs ${message.includes('success') || message.includes('removed') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Get your API key from{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25F4EE] hover:underline"
            >
              platform.openai.com
            </a>
          </p>
        </div>
      </div>

      {/* Preferences */}
      <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span>⚙️</span> Preferences
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Notifications</p>
              <p className="text-xs text-gray-500">Get alerts for price changes</p>
            </div>
            <button
              onClick={() => handleToggleSetting('notifications')}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.notifications ? 'bg-[#25F4EE]' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.notifications ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Auto-Track Products</p>
              <p className="text-xs text-gray-500">Automatically track viewed products</p>
            </div>
            <button
              onClick={() => handleToggleSetting('autoTrack')}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.autoTrack ? 'bg-[#25F4EE]' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.autoTrack ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Upgrade */}
      {!usage.isPro && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#FE2C55]/20 to-[#25F4EE]/20 border border-[#FE2C55]/30">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <span>⭐</span> Upgrade to Pro
          </h3>
          <ul className="text-xs text-gray-300 space-y-1 mb-3">
            <li>✓ Unlimited AI analyses</li>
            <li>✓ Advanced competitor insights</li>
            <li>✓ Real-time price alerts</li>
            <li>✓ Priority support</li>
          </ul>
          <button className="w-full py-2 btn-tiktok rounded-lg text-sm font-semibold">
            Upgrade for $29/month
          </button>
        </div>
      )}

      {/* Data Management */}
      <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span>🗄️</span> Data Management
        </h3>
        <div className="space-y-2">
          <button
            onClick={handleResetUsage}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
          >
            Reset Usage Counter
          </button>
          <button
            onClick={handleClearData}
            className="w-full py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm transition-colors"
          >
            Clear All Data
          </button>
        </div>
      </div>

      {/* About */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>TikTok Shop Manager v1.0.0</p>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#25F4EE] hover:underline"
        >
          View on GitHub
        </a>
      </div>
    </div>
  );
}
