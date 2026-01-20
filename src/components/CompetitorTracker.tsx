import React, { useState } from 'react';
import { StorageData, Competitor, addCompetitor, removeCompetitor } from '../lib/storage';

interface Props {
  storage: StorageData;
  onRefresh: () => void;
}

export function CompetitorTracker({ storage, onRefresh }: Props) {
  const { competitors } = storage;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState({
    name: '',
    shopUrl: '',
    products: 0,
    followers: 0,
    rating: 0,
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleAdd() {
    if (!newCompetitor.name || !newCompetitor.shopUrl) return;

    await addCompetitor({
      name: newCompetitor.name,
      shopUrl: newCompetitor.shopUrl,
      products: newCompetitor.products,
      followers: newCompetitor.followers,
      rating: newCompetitor.rating,
    });

    setNewCompetitor({ name: '', shopUrl: '', products: 0, followers: 0, rating: 0 });
    setShowAddForm(false);
    onRefresh();
  }

  async function handleRemove(id: string) {
    if (confirm('Remove this competitor from tracking?')) {
      await removeCompetitor(id);
      onRefresh();
    }
  }

  function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }

  function getCompetitorScore(competitor: Competitor): number {
    // Simple scoring based on products, followers, rating
    const productScore = Math.min(competitor.products / 100, 1) * 30;
    const followerScore = Math.min(competitor.followers / 100000, 1) * 40;
    const ratingScore = (competitor.rating / 5) * 30;
    return Math.round(productScore + followerScore + ratingScore);
  }

  function getThreatLevel(score: number): { label: string; color: string } {
    if (score >= 70) return { label: 'High Threat', color: 'text-red-400' };
    if (score >= 40) return { label: 'Medium Threat', color: 'text-yellow-400' };
    return { label: 'Low Threat', color: 'text-green-400' };
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <span>🎯</span> Competitor Analysis
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1 text-xs bg-[#FE2C55] rounded-full hover:bg-[#FE2C55]/80 transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 space-y-3">
          <input
            type="text"
            value={newCompetitor.name}
            onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
            placeholder="Shop name"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:border-[#FE2C55] focus:outline-none"
          />
          <input
            type="text"
            value={newCompetitor.shopUrl}
            onChange={(e) => setNewCompetitor({ ...newCompetitor, shopUrl: e.target.value })}
            placeholder="Shop URL"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:border-[#FE2C55] focus:outline-none"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              value={newCompetitor.products || ''}
              onChange={(e) => setNewCompetitor({ ...newCompetitor, products: parseInt(e.target.value) || 0 })}
              placeholder="Products"
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:border-[#FE2C55] focus:outline-none"
            />
            <input
              type="number"
              value={newCompetitor.followers || ''}
              onChange={(e) => setNewCompetitor({ ...newCompetitor, followers: parseInt(e.target.value) || 0 })}
              placeholder="Followers"
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:border-[#FE2C55] focus:outline-none"
            />
            <input
              type="number"
              step="0.1"
              max="5"
              value={newCompetitor.rating || ''}
              onChange={(e) => setNewCompetitor({ ...newCompetitor, rating: parseFloat(e.target.value) || 0 })}
              placeholder="Rating"
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:border-[#FE2C55] focus:outline-none"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!newCompetitor.name || !newCompetitor.shopUrl}
            className="w-full py-2 btn-tiktok rounded-lg text-sm font-medium disabled:opacity-50"
          >
            Add Competitor
          </button>
        </div>
      )}

      {/* Competitor List */}
      <div className="space-y-3">
        {competitors.map((competitor) => {
          const score = getCompetitorScore(competitor);
          const threat = getThreatLevel(score);

          return (
            <div
              key={competitor.id}
              className={`p-3 rounded-xl border transition-all ${
                expandedId === competitor.id
                  ? 'border-[#25F4EE] bg-gray-800/50'
                  : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
              }`}
            >
              {/* Header */}
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setExpandedId(expandedId === competitor.id ? null : competitor.id)}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#25F4EE] to-[#FE2C55] flex items-center justify-center text-lg font-bold">
                  {competitor.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">{competitor.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{competitor.products} products</span>
                    <span>•</span>
                    <span>{formatNumber(competitor.followers)} followers</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{score}</div>
                  <div className={`text-xs ${threat.color}`}>{threat.label}</div>
                </div>
              </div>

              {/* Expanded */}
              {expandedId === competitor.id && (
                <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      <div className="text-sm font-semibold">{competitor.products}</div>
                      <div className="text-xs text-gray-500">Products</div>
                    </div>
                    <div className="p-2 bg-gray-800 rounded-lg">
                      <div className="text-sm font-semibold">{formatNumber(competitor.followers)}</div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>
                    <div className="p-2 bg-gray-800 rounded-lg">
                      <div className="text-sm font-semibold">⭐ {competitor.rating}</div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                  </div>

                  {/* Threat Score Breakdown */}
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">Competitive Score: {score}/100</h4>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <a
                      href={competitor.shopUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 text-center bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                    >
                      Visit Shop
                    </a>
                    <button
                      onClick={() => handleRemove(competitor.id)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {competitors.length === 0 && !showAddForm && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-lg font-semibold mb-2">Track Your Competitors</h3>
          <p className="text-sm text-gray-400 mb-4">
            Add competitor shops to monitor their products, pricing, and growth strategies.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 btn-tiktok rounded-lg text-sm font-medium"
          >
            Add First Competitor
          </button>
        </div>
      )}
    </div>
  );
}
