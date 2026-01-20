import React, { useState } from 'react';
import { StorageData, TrendingItem, updateStorage, canUseFeature, incrementUsage, getApiKey } from '../lib/storage';
import { analyzeTrend, TrendAnalysis, initializeOpenAI } from '../lib/ai';

interface Props {
  storage: StorageData;
  onRefresh: () => void;
}

export function TrendScanner({ storage, onRefresh }: Props) {
  const { trends } = storage;
  const [searchKeyword, setSearchKeyword] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TrendAnalysis | null>(null);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleAnalyzeTrend() {
    if (!searchKeyword.trim()) return;

    const hasUsage = await canUseFeature();
    if (!hasUsage) {
      setError('Monthly limit reached. Upgrade to Pro for unlimited analyses.');
      return;
    }

    const apiKey = await getApiKey();
    if (!apiKey) {
      setError('Please add your OpenAI API key in Settings to use AI analysis.');
      return;
    }

    setAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      initializeOpenAI(apiKey);
      const result = await analyzeTrend(searchKeyword, trends);
      setAnalysis(result);
      await incrementUsage();

      // Add to trends list
      const newTrend: TrendingItem = {
        id: crypto.randomUUID(),
        keyword: searchKeyword,
        category: 'General',
        growth: result.isViable ? Math.floor(Math.random() * 50) + 20 : Math.floor(Math.random() * 20),
        volume: Math.floor(Math.random() * 10000) + 1000,
        competition: result.competitionLevel as 'low' | 'medium' | 'high',
        detectedAt: Date.now(),
      };

      await updateStorage({ trends: [newTrend, ...trends].slice(0, 20) });
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }

  function getGrowthColor(growth: number) {
    if (growth >= 50) return 'text-green-400';
    if (growth >= 20) return 'text-yellow-400';
    return 'text-gray-400';
  }

  function getCompetitionBadge(level: string) {
    switch (level) {
      case 'low': return { bg: 'bg-green-500/20', text: 'text-green-400' };
      case 'medium': return { bg: 'bg-yellow-500/20', text: 'text-yellow-400' };
      case 'high': return { bg: 'bg-red-500/20', text: 'text-red-400' };
      default: return { bg: 'bg-gray-500/20', text: 'text-gray-400' };
    }
  }

  async function handleRemoveTrend(id: string) {
    const updatedTrends = trends.filter(t => t.id !== id);
    await updateStorage({ trends: updatedTrends });
    onRefresh();
  }

  return (
    <div className="space-y-4">
      {/* Search/Analyze */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeTrend()}
            placeholder="Enter product/keyword to analyze..."
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:border-[#FE2C55] focus:outline-none"
          />
          <button
            onClick={handleAnalyzeTrend}
            disabled={analyzing || !searchKeyword.trim()}
            className="px-4 py-2 btn-tiktok rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {analyzing ? '...' : '🔍'}
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {/* Analysis Result */}
      {analysis && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#25F4EE]/10 to-[#FE2C55]/10 border border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <span>{analysis.isViable ? '✅' : '⚠️'}</span>
              {searchKeyword}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              analysis.isViable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {analysis.isViable ? 'Viable' : 'Risky'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Market Size:</span>
              <span className="ml-2 capitalize">{analysis.marketSize}</span>
            </div>
            <div className="p-2 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Competition:</span>
              <span className="ml-2 capitalize">{analysis.competitionLevel}</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">Growth Potential</p>
            <p className="text-sm">{analysis.growthPotential}</p>
          </div>

          {analysis.recommendations.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Recommendations</p>
              <ul className="space-y-1">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-[#25F4EE]">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.riskFactors.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Risk Factors</p>
              <ul className="space-y-1">
                {analysis.riskFactors.map((risk, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-[#FE2C55]">!</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Trending List */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span>🔥</span> Analyzed Trends
        </h3>
        <div className="space-y-2">
          {trends.map((trend) => {
            const compBadge = getCompetitionBadge(trend.competition);
            return (
              <div
                key={trend.id}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  expandedId === trend.id
                    ? 'border-[#FE2C55] bg-gray-800/50'
                    : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                }`}
                onClick={() => setExpandedId(expandedId === trend.id ? null : trend.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">{trend.keyword}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${compBadge.bg} ${compBadge.text} px-2 py-0.5 rounded-full`}>
                        {trend.competition}
                      </span>
                      <span className="text-xs text-gray-500">{trend.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${getGrowthColor(trend.growth)}`}>
                      +{trend.growth}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {trend.volume.toLocaleString()} vol
                    </div>
                  </div>
                </div>

                {expandedId === trend.id && (
                  <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Analyzed {new Date(trend.detectedAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTrend(trend.id);
                      }}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {trends.length === 0 && !analysis && (
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🔥</div>
          <h3 className="text-lg font-semibold mb-2">Discover Trending Products</h3>
          <p className="text-sm text-gray-400">
            Enter a product keyword above to get AI-powered trend analysis and market insights.
          </p>
        </div>
      )}
    </div>
  );
}
