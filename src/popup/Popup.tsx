import React, { useState, useEffect } from 'react';
import { getStorage, StorageData } from '../lib/storage';
import { initializeOpenAI } from '../lib/ai';
import { UsageCounter } from '../components/UsageCounter';
import { Dashboard } from '../components/Dashboard';
import { ProductTracker } from '../components/ProductTracker';
import { CompetitorTracker } from '../components/CompetitorTracker';
import { TrendScanner } from '../components/TrendScanner';
import { PriceOptimizer } from '../components/PriceOptimizer';
import { Settings } from '../components/Settings';
import { Onboarding } from '../components/Onboarding';

type Tab = 'dashboard' | 'products' | 'competitors' | 'trends' | 'pricing' | 'settings';

export function Popup() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [storage, setStorage] = useState<StorageData | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorage();
  }, []);

  async function loadStorage() {
    const data = await getStorage();
    setStorage(data);

    if (!data.settings.onboardingComplete) {
      setShowOnboarding(true);
    } else if (data.settings.apiKey) {
      initializeOpenAI(data.settings.apiKey);
    }

    setLoading(false);
  }

  function handleOnboardingComplete() {
    setShowOnboarding(false);
    loadStorage();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-gradient-to-br from-black to-[#161823]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FE2C55] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Home', icon: '📊' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'competitors', label: 'Rivals', icon: '🎯' },
    { id: 'trends', label: 'Trends', icon: '🔥' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-[500px] bg-gradient-to-br from-black to-[#161823] text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#25F4EE] to-[#FE2C55] flex items-center justify-center text-lg">
              🛍️
            </div>
            <div>
              <h1 className="text-lg font-bold tiktok-gradient">TikTok Shop Manager</h1>
              <p className="text-xs text-gray-500">Seller Analytics & Optimizer</p>
            </div>
          </div>
          {storage && <UsageCounter usage={storage.usage} />}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-800 px-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-0 py-2 px-1 text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'text-[#FE2C55] border-b-2 border-[#FE2C55]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="block text-center">{tab.icon}</span>
            <span className="block text-center truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 max-h-[380px] overflow-y-auto">
        {activeTab === 'dashboard' && storage && (
          <Dashboard storage={storage} onRefresh={loadStorage} />
        )}
        {activeTab === 'products' && storage && (
          <ProductTracker storage={storage} onRefresh={loadStorage} />
        )}
        {activeTab === 'competitors' && storage && (
          <CompetitorTracker storage={storage} onRefresh={loadStorage} />
        )}
        {activeTab === 'trends' && storage && (
          <TrendScanner storage={storage} onRefresh={loadStorage} />
        )}
        {activeTab === 'pricing' && storage && (
          <PriceOptimizer storage={storage} onRefresh={loadStorage} />
        )}
        {activeTab === 'settings' && storage && (
          <Settings storage={storage} onRefresh={loadStorage} />
        )}
      </div>

      {/* Upgrade Banner */}
      {storage && !storage.usage.isPro && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-r from-[#FE2C55]/20 to-[#25F4EE]/20 border-t border-gray-800">
          <button className="w-full py-2 px-4 btn-tiktok rounded-lg text-white text-sm font-semibold">
            Upgrade to Pro - $29/month
          </button>
        </div>
      )}
    </div>
  );
}
