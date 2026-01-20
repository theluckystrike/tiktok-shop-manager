import React, { useState } from 'react';
import { StorageData, TrackedProduct, removeTrackedProduct, addPriceAlert } from '../lib/storage';

interface Props {
  storage: StorageData;
  onRefresh: () => void;
}

export function ProductTracker({ storage, onRefresh }: Props) {
  const { trackedProducts } = storage;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'sales' | 'price' | 'rating' | 'recent'>('recent');
  const [alertPrice, setAlertPrice] = useState('');

  const sortedProducts = [...trackedProducts].sort((a, b) => {
    switch (sortBy) {
      case 'sales': return b.sales - a.sales;
      case 'price': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      case 'recent': return b.addedAt - a.addedAt;
      default: return 0;
    }
  });

  async function handleRemove(id: string) {
    if (confirm('Remove this product from tracking?')) {
      await removeTrackedProduct(id);
      onRefresh();
    }
  }

  async function handleSetAlert(product: TrackedProduct) {
    const price = parseFloat(alertPrice);
    if (isNaN(price) || price <= 0) return;

    await addPriceAlert({
      productId: product.id,
      productName: product.name,
      targetPrice: price,
      currentPrice: product.price,
      type: price < product.price ? 'below' : 'above',
    });

    setAlertPrice('');
    onRefresh();
  }

  function getPriceChangeIndicator(product: TrackedProduct) {
    if (product.priceHistory.length < 2) return null;
    const prevPrice = product.priceHistory[product.priceHistory.length - 2].price;
    const change = ((product.price - prevPrice) / prevPrice) * 100;
    if (Math.abs(change) < 0.1) return null;

    return (
      <span className={`text-xs ${change > 0 ? 'text-red-400' : 'text-green-400'}`}>
        {change > 0 ? '↑' : '↓'}{Math.abs(change).toFixed(1)}%
      </span>
    );
  }

  function formatDate(timestamp: number) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="flex gap-2">
        {(['recent', 'sales', 'price', 'rating'] as const).map((sort) => (
          <button
            key={sort}
            onClick={() => setSortBy(sort)}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              sortBy === sort
                ? 'bg-[#FE2C55] text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {sort.charAt(0).toUpperCase() + sort.slice(1)}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="space-y-3">
        {sortedProducts.map((product) => (
          <div
            key={product.id}
            className={`p-3 rounded-xl border transition-all ${
              expandedId === product.id
                ? 'border-[#FE2C55] bg-gray-800/50'
                : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
            }`}
          >
            {/* Product Header */}
            <div
              className="flex items-start gap-3 cursor-pointer"
              onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
            >
              <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
                📦
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium truncate">{product.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    ${product.price}
                    {getPriceChangeIndicator(product)}
                  </span>
                  <span>{product.sales} sold</span>
                  <span>⭐ {product.rating}</span>
                </div>
              </div>
              <span className="text-gray-500">{expandedId === product.id ? '▼' : '▶'}</span>
            </div>

            {/* Expanded Content */}
            {expandedId === product.id && (
              <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <div className="text-sm font-semibold">${product.price}</div>
                    <div className="text-xs text-gray-500">Price</div>
                  </div>
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <div className="text-sm font-semibold">{product.sales}</div>
                    <div className="text-xs text-gray-500">Sales</div>
                  </div>
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <div className="text-sm font-semibold">{product.reviews}</div>
                    <div className="text-xs text-gray-500">Reviews</div>
                  </div>
                </div>

                {/* Price History Mini Chart */}
                {product.priceHistory.length > 1 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">Price History</h4>
                    <div className="flex items-end gap-1 h-12">
                      {product.priceHistory.slice(-10).map((point, i) => {
                        const maxPrice = Math.max(...product.priceHistory.map(p => p.price));
                        const minPrice = Math.min(...product.priceHistory.map(p => p.price));
                        const range = maxPrice - minPrice || 1;
                        const height = ((point.price - minPrice) / range) * 100;
                        return (
                          <div
                            key={i}
                            className="flex-1 bg-[#25F4EE] rounded-t opacity-60 hover:opacity-100 transition-opacity"
                            style={{ height: `${Math.max(height, 10)}%` }}
                            title={`$${point.price} - ${new Date(point.date).toLocaleDateString()}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Set Price Alert */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 mb-2">Price Alert</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={alertPrice}
                      onChange={(e) => setAlertPrice(e.target.value)}
                      placeholder="Target price"
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:border-[#FE2C55] focus:outline-none"
                    />
                    <button
                      onClick={() => handleSetAlert(product)}
                      className="px-4 py-2 bg-[#25F4EE] text-black rounded-lg text-sm font-medium hover:bg-[#25F4EE]/80"
                    >
                      Set
                    </button>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Added {formatDate(product.addedAt)}</span>
                  <span>Updated {formatDate(product.lastUpdated)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 text-center bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                  >
                    View on TikTok
                  </a>
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {trackedProducts.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="text-lg font-semibold mb-2">No Products Tracked</h3>
          <p className="text-sm text-gray-400">
            Browse TikTok Shop and click "Track Product" to start monitoring prices and sales.
          </p>
        </div>
      )}
    </div>
  );
}
