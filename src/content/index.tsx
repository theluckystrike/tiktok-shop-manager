// Content script for TikTok Shop data extraction
// This runs on TikTok Shop pages to extract product and seller data

interface ProductData {
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
}

interface SellerData {
  name: string;
  shopUrl: string;
  products: number;
  followers: number;
  rating: number;
}

// Detect if we're on a product page
function isProductPage(): boolean {
  const url = window.location.href;
  return url.includes('/product/') || url.includes('/item/');
}

// Detect if we're on a seller/shop page
function isSellerPage(): boolean {
  const url = window.location.href;
  return url.includes('/shop/') || url.includes('/@');
}

// Extract product data from the page
function extractProductData(): ProductData | null {
  try {
    // Try to find product info from various possible selectors
    // TikTok Shop's DOM structure may vary, so we try multiple approaches

    // Product name
    const nameSelectors = [
      '[data-e2e="product-title"]',
      '.product-title',
      'h1[class*="title"]',
      '[class*="ProductTitle"]',
      'h1',
    ];
    let name = '';
    for (const selector of nameSelectors) {
      const el = document.querySelector(selector);
      if (el?.textContent?.trim()) {
        name = el.textContent.trim();
        break;
      }
    }

    // Price
    const priceSelectors = [
      '[data-e2e="product-price"]',
      '.product-price',
      '[class*="Price"]',
      '[class*="price"]',
    ];
    let price = 0;
    for (const selector of priceSelectors) {
      const el = document.querySelector(selector);
      if (el?.textContent) {
        const match = el.textContent.match(/[\d,.]+/);
        if (match) {
          price = parseFloat(match[0].replace(',', ''));
          break;
        }
      }
    }

    // Sales count
    const salesSelectors = [
      '[data-e2e="sold-count"]',
      '[class*="sold"]',
      '[class*="sales"]',
    ];
    let sales = 0;
    for (const selector of salesSelectors) {
      const el = document.querySelector(selector);
      if (el?.textContent) {
        const match = el.textContent.match(/[\d,.]+[KkMm]?/);
        if (match) {
          let num = parseFloat(match[0].replace(/[,]/g, ''));
          if (match[0].toLowerCase().includes('k')) num *= 1000;
          if (match[0].toLowerCase().includes('m')) num *= 1000000;
          sales = Math.round(num);
          break;
        }
      }
    }

    // Rating
    const ratingSelectors = [
      '[data-e2e="product-rating"]',
      '[class*="rating"]',
      '[class*="Rating"]',
    ];
    let rating = 0;
    for (const selector of ratingSelectors) {
      const el = document.querySelector(selector);
      if (el?.textContent) {
        const match = el.textContent.match(/[\d.]+/);
        if (match) {
          rating = parseFloat(match[0]);
          if (rating <= 5) break;
        }
      }
    }

    // Reviews count
    const reviewSelectors = [
      '[data-e2e="review-count"]',
      '[class*="review"]',
      '[class*="Review"]',
    ];
    let reviews = 0;
    for (const selector of reviewSelectors) {
      const el = document.querySelector(selector);
      if (el?.textContent) {
        const match = el.textContent.match(/[\d,.]+[KkMm]?/);
        if (match) {
          let num = parseFloat(match[0].replace(/[,]/g, ''));
          if (match[0].toLowerCase().includes('k')) num *= 1000;
          if (match[0].toLowerCase().includes('m')) num *= 1000000;
          reviews = Math.round(num);
          break;
        }
      }
    }

    // Seller name
    const sellerSelectors = [
      '[data-e2e="seller-name"]',
      '[class*="seller"]',
      '[class*="shop-name"]',
    ];
    let seller = 'Unknown Seller';
    for (const selector of sellerSelectors) {
      const el = document.querySelector(selector);
      if (el?.textContent?.trim()) {
        seller = el.textContent.trim();
        break;
      }
    }

    // Image
    const imageSelectors = [
      '[data-e2e="product-image"] img',
      '.product-image img',
      '[class*="ProductImage"] img',
      'img[class*="product"]',
    ];
    let imageUrl = '';
    for (const selector of imageSelectors) {
      const el = document.querySelector(selector) as HTMLImageElement;
      if (el?.src) {
        imageUrl = el.src;
        break;
      }
    }

    // Only return if we found at least a name
    if (!name) return null;

    return {
      name,
      price: price || 0,
      sales: sales || 0,
      rating: rating || 0,
      reviews: reviews || 0,
      category: 'General',
      seller,
      url: window.location.href,
      imageUrl,
    };
  } catch (error) {
    console.error('TikTok Shop Manager: Error extracting product data', error);
    return null;
  }
}

// Extract seller data from the page
function extractSellerData(): SellerData | null {
  try {
    const nameSelectors = [
      '[data-e2e="shop-name"]',
      '[class*="shop-name"]',
      '[class*="ShopName"]',
      'h1',
    ];
    let name = '';
    for (const selector of nameSelectors) {
      const el = document.querySelector(selector);
      if (el?.textContent?.trim()) {
        name = el.textContent.trim();
        break;
      }
    }

    const followerSelectors = [
      '[data-e2e="follower-count"]',
      '[class*="follower"]',
      '[class*="Follower"]',
    ];
    let followers = 0;
    for (const selector of followerSelectors) {
      const el = document.querySelector(selector);
      if (el?.textContent) {
        const match = el.textContent.match(/[\d,.]+[KkMm]?/);
        if (match) {
          let num = parseFloat(match[0].replace(/[,]/g, ''));
          if (match[0].toLowerCase().includes('k')) num *= 1000;
          if (match[0].toLowerCase().includes('m')) num *= 1000000;
          followers = Math.round(num);
          break;
        }
      }
    }

    const productCountSelectors = [
      '[data-e2e="product-count"]',
      '[class*="product-count"]',
    ];
    let products = 0;
    for (const selector of productCountSelectors) {
      const el = document.querySelector(selector);
      if (el?.textContent) {
        const match = el.textContent.match(/[\d,.]+/);
        if (match) {
          products = parseInt(match[0].replace(',', ''));
          break;
        }
      }
    }

    const ratingSelectors = [
      '[data-e2e="shop-rating"]',
      '[class*="rating"]',
    ];
    let rating = 0;
    for (const selector of ratingSelectors) {
      const el = document.querySelector(selector);
      if (el?.textContent) {
        const match = el.textContent.match(/[\d.]+/);
        if (match && parseFloat(match[0]) <= 5) {
          rating = parseFloat(match[0]);
          break;
        }
      }
    }

    if (!name) return null;

    return {
      name,
      shopUrl: window.location.href,
      products,
      followers,
      rating,
    };
  } catch (error) {
    console.error('TikTok Shop Manager: Error extracting seller data', error);
    return null;
  }
}

// Create floating action button
function createFloatingButton() {
  // Check if button already exists
  if (document.getElementById('tiktok-shop-manager-fab')) return;

  const fab = document.createElement('div');
  fab.id = 'tiktok-shop-manager-fab';
  fab.innerHTML = `
    <style>
      #tiktok-shop-manager-fab {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      #tiktok-shop-manager-fab .fab-button {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #25F4EE, #FE2C55);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(254, 44, 85, 0.4);
        transition: transform 0.2s, box-shadow 0.2s;
        font-size: 24px;
      }
      #tiktok-shop-manager-fab .fab-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 30px rgba(254, 44, 85, 0.6);
      }
      #tiktok-shop-manager-fab .fab-menu {
        position: absolute;
        bottom: 70px;
        right: 0;
        background: #1a1a1a;
        border-radius: 12px;
        padding: 8px;
        min-width: 200px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        display: none;
        border: 1px solid #333;
      }
      #tiktok-shop-manager-fab .fab-menu.show {
        display: block;
        animation: fadeIn 0.2s ease;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      #tiktok-shop-manager-fab .fab-menu-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        color: white;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        font-size: 14px;
      }
      #tiktok-shop-manager-fab .fab-menu-item:hover {
        background: #333;
      }
      #tiktok-shop-manager-fab .fab-menu-item .icon {
        font-size: 18px;
      }
      #tiktok-shop-manager-fab .toast {
        position: fixed;
        bottom: 90px;
        right: 20px;
        background: #1a1a1a;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        border: 1px solid #25F4EE;
        animation: slideIn 0.3s ease;
        z-index: 10000;
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
    </style>
    <div class="fab-menu" id="fab-menu">
      <button class="fab-menu-item" id="track-product">
        <span class="icon">📦</span>
        <span>Track Product</span>
      </button>
      <button class="fab-menu-item" id="track-seller">
        <span class="icon">🎯</span>
        <span>Track Seller</span>
      </button>
      <button class="fab-menu-item" id="analyze-page">
        <span class="icon">🔍</span>
        <span>Analyze Page</span>
      </button>
    </div>
    <button class="fab-button" id="fab-trigger">🛍️</button>
  `;

  document.body.appendChild(fab);

  // Event listeners
  const trigger = document.getElementById('fab-trigger');
  const menu = document.getElementById('fab-menu');
  const trackProductBtn = document.getElementById('track-product');
  const trackSellerBtn = document.getElementById('track-seller');
  const analyzeBtn = document.getElementById('analyze-page');

  trigger?.addEventListener('click', () => {
    menu?.classList.toggle('show');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!fab.contains(e.target as Node)) {
      menu?.classList.remove('show');
    }
  });

  trackProductBtn?.addEventListener('click', async () => {
    const productData = extractProductData();
    if (productData) {
      chrome.runtime.sendMessage({
        type: 'TRACK_PRODUCT',
        data: productData,
      });
      showToast('Product added to tracking!');
    } else {
      showToast('Could not extract product data');
    }
    menu?.classList.remove('show');
  });

  trackSellerBtn?.addEventListener('click', async () => {
    const sellerData = extractSellerData();
    if (sellerData) {
      chrome.runtime.sendMessage({
        type: 'TRACK_SELLER',
        data: sellerData,
      });
      showToast('Seller added to tracking!');
    } else {
      showToast('Could not extract seller data');
    }
    menu?.classList.remove('show');
  });

  analyzeBtn?.addEventListener('click', () => {
    const productData = extractProductData();
    const sellerData = extractSellerData();
    chrome.runtime.sendMessage({
      type: 'ANALYZE_PAGE',
      data: { product: productData, seller: sellerData },
    });
    showToast('Opening analysis...');
    menu?.classList.remove('show');
  });
}

function showToast(message: string) {
  const existing = document.querySelector('#tiktok-shop-manager-fab .toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  document.getElementById('tiktok-shop-manager-fab')?.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// Initialize
function init() {
  // Wait for page to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFloatingButton);
  } else {
    createFloatingButton();
  }

  // Re-create button on navigation (for SPA)
  const observer = new MutationObserver(() => {
    if (!document.getElementById('tiktok-shop-manager-fab')) {
      createFloatingButton();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

init();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_PAGE_DATA') {
    const productData = extractProductData();
    const sellerData = extractSellerData();
    sendResponse({ product: productData, seller: sellerData });
  }
  return true;
});
