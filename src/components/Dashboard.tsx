import React from 'react';
import { StorageData } from '../lib/storage';

interface Props {
  storage: StorageData;
  onRefresh: () => void;
}

export function Dashboard({ storage }: Props) {
  const { trackedProducts, competitors, trends, priceAlerts } = storage;

  const totalSales = trackedProducts.reduce((sum, p) => sum + p.sales, 0);
  const avgPrice = trackedProducts.length > 0
    ? trackedProducts.reduce((sum, p) => sum + p.price, 0) / trackedProducts.length
    : 0;
  const avgRating = trackedProducts.length > 0
    ? trackedProducts.reduce((sum, p) => sum + p.rating, 0) / trackedProducts.length
    : 0;

  const triggeredAlerts = priceAlerts.filter(a => a.triggered).length;

  const stats = [
    {
      label: 'Tracked Products',
      value: trackedProducts.length,
      icon: '📦',
      color: 'from-[#25F4EE] to-[#25F4EE]/50',
    },
    {
      label: 'Total Sales',
      value: totalSales.toLocaleString(),
      icon: '💰',
      color: 'from-[#FE2C55] to-[#FE2C55]/50',
    },
    {
      label: 'Competitors',
      value: competitors.length,
      icon: '🎯',
      color: 'from-purple-500 to-purple-500/50',
    },
    {
      label: 'Active Trends',
      value: trends.length,
      icon: '🔥',
      color: 'from-orange-500 to-orange-500/50',
    },
  ];

  const quickStats = [
    { label: 'Avg Price', value: `$${avgPrice.toFixed(2)}` },
    { label: 'Avg Rating', value: avgRating.toFixed(1) },
    { label: 'Alerts', value: triggeredAlerts },
  ];

  // Get top performing product
  const topProduct = [...trackedProducts].sort((a, b) => b.sales - a.sales)[0];

  // Get recent price changes
  const recentChanges = trackedProducts
    .filter(p => p.priceHistory.length > 1)
    .map(p => ({
      name: p.name,
      oldPrice: p.priceHistory[p.priceHistory.length - 2].price,
      newPrice: p.price,
      change: ((p.price - p.priceHistory[p.priceHistory.length - 2].price) / p.priceHistory[p.priceHistory.length - 2].price) * 100,
    }))
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 border border-gray-800`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span>{stat.icon}</span>
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
            <div className="text-xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Stats Bar */}
      <div className="flex justify-between p-3 bg-gray-800/50 rounded-lg">
        {quickStats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-sm font-semibold">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Top Performer */}
      {topProduct && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#FE2C55]/10 to-[#25F4EE]/10 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <span>🏆</span>
            <span className="text-sm font-semibold">Top Performer</span>
          </div>
          <div className="text-sm truncate">{topProduct.name}</div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span>${topProduct.price}</span>
            <span>{topProduct.sales} sales</span>
            <span>⭐ {topProduct.rating}</span>
          </div>
        </div>
      )}

      {/* Recent Price Changes */}
      {recentChanges.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <span>📈</span> Recent Price Changes
          </h3>
          <div className="space-y-2">
            {recentChanges.map((change, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg text-sm">
                <span className="truncate flex-1 mr-2">{change.name}</span>
                <span className={change.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {change.change >= 0 ? '+' : ''}{change.change.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {trackedProducts.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🛍️</div>
          <h3 className="text-lg font-semibold mb-2">Start Tracking Products</h3>
          <p className="text-sm text-gray-400 mb-4">
            Visit TikTok Shop and click the extension to track products, monitor competitors, and discover trends.
          </p>
          <a
            href="https://shop.tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 btn-tiktok rounded-lg text-white text-sm font-medium"
          >
            Open TikTok Shop
          </a>
        </div>
      )}
    </div>
  );
}
