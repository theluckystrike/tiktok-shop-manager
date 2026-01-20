// Background service worker for TikTok Shop Manager

import { addTrackedProduct, addCompetitor, getStorage } from '../lib/storage';

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message).then(sendResponse);
  return true; // Keep channel open for async response
});

async function handleMessage(message: { type: string; data: unknown }) {
  switch (message.type) {
    case 'TRACK_PRODUCT': {
      const data = message.data as {
        name: string;
        price: number;
        originalPrice?: number;
        sales: number;
        rating: number;
        reviews: number;
        category: string;
        seller: string;
        url: string;
        imageUrl?: string;
      };

      try {
        await addTrackedProduct({
          name: data.name,
          price: data.price,
          originalPrice: data.originalPrice,
          sales: data.sales,
          rating: data.rating,
          reviews: data.reviews,
          category: data.category,
          seller: data.seller,
          url: data.url,
          imageUrl: data.imageUrl,
        });
        return { success: true };
      } catch (error) {
        console.error('Failed to track product:', error);
        return { success: false, error: 'Failed to track product' };
      }
    }

    case 'TRACK_SELLER': {
      const data = message.data as {
        name: string;
        shopUrl: string;
        products: number;
        followers: number;
        rating: number;
      };

      try {
        await addCompetitor({
          name: data.name,
          shopUrl: data.shopUrl,
          products: data.products,
          followers: data.followers,
          rating: data.rating,
        });
        return { success: true };
      } catch (error) {
        console.error('Failed to track seller:', error);
        return { success: false, error: 'Failed to track seller' };
      }
    }

    case 'ANALYZE_PAGE': {
      // Open popup for analysis
      chrome.action.openPopup();
      return { success: true };
    }

    case 'GET_STORAGE': {
      try {
        const storage = await getStorage();
        return { success: true, data: storage };
      } catch (error) {
        return { success: false, error: 'Failed to get storage' };
      }
    }

    default:
      return { success: false, error: 'Unknown message type' };
  }
}

// Check for price alerts periodically
chrome.alarms.create('checkAlerts', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'checkAlerts') {
    const storage = await getStorage();
    const { priceAlerts, trackedProducts } = storage;

    for (const alert of priceAlerts) {
      if (alert.triggered) continue;

      const product = trackedProducts.find(p => p.id === alert.productId);
      if (!product) continue;

      const shouldTrigger =
        (alert.type === 'below' && product.price <= alert.targetPrice) ||
        (alert.type === 'above' && product.price >= alert.targetPrice);

      if (shouldTrigger && storage.settings.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'TikTok Shop Manager - Price Alert!',
          message: `${product.name} is now $${product.price} (target: $${alert.targetPrice})`,
        });

        // Mark alert as triggered
        alert.triggered = true;
      }
    }
  }
});

// Extension installed/updated
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open onboarding page on first install
    chrome.tabs.create({
      url: 'https://shop.tiktok.com',
    });
  }
});

console.log('TikTok Shop Manager background service started');
