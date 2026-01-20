import React, { useState } from 'react';
import { StorageData, TrackedProduct, canUseFeature, incrementUsage, getApiKey } from '../lib/storage';
import { analyzePricing, PriceRecommendation, initializeOpenAI } from '../lib/ai';

interface Props {
  storage: StorageData;
  onRefresh: () => void;
}

export function PriceOptimizer({ storage, onRefresh }: Props) {
  const { trackedProducts } = storage;
  const [selectedProduct, setSelectedProduct] = useState<TrackedProduct | null>(null);
  const [competitorPrices, setCompetitorPrices] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<PriceRecommendation | null>(null);
  const [error, setError] = useState('');

  async function handleAnalyze() {
    if (!selectedProduct) return;

    const hasUsage = await canUseFeature();
    if (!hasUsage) {
      setError('Monthly limit reached. Upgrade to Pro for unlimited analyses.');
      return;
    }

    const apiKey = await getApiKey();
    if (!apiKey) {
      setError('Please add your OpenAI API key in Settings to use AI pricing.');
      return;
    }

    setAnalyzing(true);
    setError('');
    setRecommendation(null);

    try {
      const prices = competitorPrices
        .split(',')
        .map(p => parseFloat(p.trim()))
        .filter(p => !isNaN(p) && p > 0);

      initializeOpenAI(apiKey);
      const result = await analyzePricing(selectedProduct, prices, selectedProduct.category);
      setRecommendation(result);
      await incrementUsage();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }

  function getConfidenceColor(confidence: string) {
    switch (confidence) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }

  function getPriceChangePercent(current: number, recommended: number) {
    const change = ((recommended - current) / current) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      direction: change >= 0 ? 'increase' : 'decrease',
      color: change >= 0 ? 'text-green-400' : 'text-red-400',
    };
  }

  return (
    <div className="space-y-4">
      {/* Product Selection */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Select Product to Optimize</label>
        <select
          value={selectedProduct?.id || ''}
          onChange={(e) => {
            const product = trackedProducts.find(p => p.id === e.target.value);
            setSelectedProduct(product || null);
            setRecommendation(null);
          }}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:border-[#FE2C55] focus:outline-none"
        >
          <option value="">Choose a product...</option>
          {trackedProducts.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} (${product.price})
            </option>
          ))}
        </select>
      </div>

      {/* Selected Product Info */}
      {selectedProduct && (
        <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-xl">
              📦
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium truncate">{selectedProduct.name}</h3>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>Current: ${selectedProduct.price}</span>
                <span>{selectedProduct.sales} sales</span>
                <span>⭐ {selectedProduct.rating}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Competitor Prices Input */}
      {selectedProduct && (
        <div>
          <label className="block text-xs text-gray-400 mb-2">
            Competitor Prices (comma-separated, optional)
          </label>
          <input
            type="text"
            value={competitorPrices}
            onChange={(e) => setCompetitorPrices(e.target.value)}
            placeholder="e.g., 19.99, 24.99, 22.50"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:border-[#FE2C55] focus:outline-none"
          />
        </div>
      )}

      {/* Analyze Button */}
      {selectedProduct && (
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="w-full py-3 btn-tiktok rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {analyzing ? 'Analyzing...' : '💰 Get AI Price Recommendation'}
        </button>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Recommendation Result */}
      {recommendation && selectedProduct && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#25F4EE]/10 to-[#FE2C55]/10 border border-gray-700 space-y-4">
          {/* Main Recommendation */}
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Recommended Price</p>
            <div className="text-4xl font-bold tiktok-gradient">
              ${recommendation.recommendedPrice.toFixed(2)}
            </div>
            {(() => {
              const change = getPriceChangePercent(selectedProduct.price, recommendation.recommendedPrice);
              return (
                <p className={`text-sm mt-1 ${change.color}`}>
                  {change.direction === 'increase' ? '↑' : '↓'} {change.value}% {change.direction}
                </p>
              );
            })()}
          </div>

          {/* Price Range */}
          <div className="flex justify-between text-center">
            <div>
              <p className="text-xs text-gray-400">Min</p>
              <p className="text-lg font-semibold text-[#25F4EE]">${recommendation.minPrice.toFixed(2)}</p>
            </div>
            <div className="flex-1 flex items-center px-4">
              <div className="w-full h-2 bg-gray-700 rounded-full relative">
                <div
                  className="absolute h-full bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] rounded-full"
                  style={{
                    left: '0%',
                    right: '0%',
                  }}
                />
                <div
                  className="absolute w-3 h-3 bg-white rounded-full -top-0.5 transform -translate-x-1/2"
                  style={{
                    left: `${((recommendation.recommendedPrice - recommendation.minPrice) /
                      (recommendation.maxPrice - recommendation.minPrice)) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400">Max</p>
              <p className="text-lg font-semibold text-[#FE2C55]">${recommendation.maxPrice.toFixed(2)}</p>
            </div>
          </div>

          {/* Confidence */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-gray-400">Confidence:</span>
            <span className={`text-sm font-semibold capitalize ${getConfidenceColor(recommendation.confidence)}`}>
              {recommendation.confidence}
            </span>
          </div>

          {/* Strategy */}
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Strategy</p>
            <p className="text-sm">{recommendation.strategy}</p>
          </div>

          {/* Reasoning */}
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Reasoning</p>
            <p className="text-sm">{recommendation.reasoning}</p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(recommendation.recommendedPrice.toFixed(2))}
              className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
            >
              Copy Price
            </button>
            <button
              onClick={() => setRecommendation(null)}
              className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
            >
              New Analysis
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {trackedProducts.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">💰</div>
          <h3 className="text-lg font-semibold mb-2">Optimize Your Pricing</h3>
          <p className="text-sm text-gray-400">
            Start tracking products to get AI-powered pricing recommendations based on competitor analysis and market trends.
          </p>
        </div>
      )}
    </div>
  );
}
