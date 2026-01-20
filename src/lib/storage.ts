// Storage types and utilities for TikTok Shop Manager

export interface TrackedProduct {
  id: string;
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
  addedAt: number;
  lastUpdated: number;
  priceHistory: { price: number; date: number }[];
  salesHistory: { sales: number; date: number }[];
}

export interface Competitor {
  id: string;
  name: string;
  shopUrl: string;
  products: number;
  followers: number;
  rating: number;
  addedAt: number;
  lastUpdated: number;
}

export interface TrendingItem {
  id: string;
  keyword: string;
  category: string;
  growth: number; // percentage
  volume: number;
  competition: 'low' | 'medium' | 'high';
  detectedAt: number;
}

export interface UsageData {
  analysesUsed: number;
  monthlyLimit: number;
  resetDate: number;
  isPro: boolean;
}

export interface Settings {
  apiKey: string;
  onboardingComplete: boolean;
  notifications: boolean;
  autoTrack: boolean;
  currency: string;
}

export interface StorageData {
  trackedProducts: TrackedProduct[];
  competitors: Competitor[];
  trends: TrendingItem[];
  usage: UsageData;
  settings: Settings;
  priceAlerts: PriceAlert[];
}

export interface PriceAlert {
  id: string;
  productId: string;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  type: 'below' | 'above';
  triggered: boolean;
  createdAt: number;
}

const DEFAULT_STORAGE: StorageData = {
  trackedProducts: [],
  competitors: [],
  trends: [],
  usage: {
    analysesUsed: 0,
    monthlyLimit: 10,
    resetDate: getNextMonthReset(),
    isPro: false,
  },
  settings: {
    apiKey: '',
    onboardingComplete: false,
    notifications: true,
    autoTrack: false,
    currency: 'USD',
  },
  priceAlerts: [],
};

function getNextMonthReset(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
}

export async function getStorage(): Promise<StorageData> {
  return new Promise((resolve) => {
    chrome.storage.local.get(DEFAULT_STORAGE, (result) => {
      // Check if we need to reset monthly usage
      const usage = result.usage as UsageData;
      if (Date.now() > usage.resetDate) {
        usage.analysesUsed = 0;
        usage.resetDate = getNextMonthReset();
        chrome.storage.local.set({ usage });
      }
      resolve(result as StorageData);
    });
  });
}

export async function updateStorage(data: Partial<StorageData>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, resolve);
  });
}

export async function incrementUsage(): Promise<boolean> {
  const storage = await getStorage();
  if (storage.usage.isPro || storage.usage.analysesUsed < storage.usage.monthlyLimit) {
    storage.usage.analysesUsed++;
    await updateStorage({ usage: storage.usage });
    return true;
  }
  return false;
}

export async function canUseFeature(): Promise<boolean> {
  const storage = await getStorage();
  return storage.usage.isPro || storage.usage.analysesUsed < storage.usage.monthlyLimit;
}

// Product tracking
export async function addTrackedProduct(product: Omit<TrackedProduct, 'id' | 'addedAt' | 'lastUpdated' | 'priceHistory' | 'salesHistory'>): Promise<TrackedProduct> {
  const storage = await getStorage();
  const newProduct: TrackedProduct = {
    ...product,
    id: crypto.randomUUID(),
    addedAt: Date.now(),
    lastUpdated: Date.now(),
    priceHistory: [{ price: product.price, date: Date.now() }],
    salesHistory: [{ sales: product.sales, date: Date.now() }],
  };
  storage.trackedProducts.push(newProduct);
  await updateStorage({ trackedProducts: storage.trackedProducts });
  return newProduct;
}

export async function removeTrackedProduct(id: string): Promise<void> {
  const storage = await getStorage();
  storage.trackedProducts = storage.trackedProducts.filter(p => p.id !== id);
  await updateStorage({ trackedProducts: storage.trackedProducts });
}

export async function updateProductData(id: string, updates: Partial<TrackedProduct>): Promise<void> {
  const storage = await getStorage();
  const index = storage.trackedProducts.findIndex(p => p.id === id);
  if (index !== -1) {
    const product = storage.trackedProducts[index];

    // Add to history if price or sales changed
    if (updates.price && updates.price !== product.price) {
      product.priceHistory.push({ price: updates.price, date: Date.now() });
    }
    if (updates.sales && updates.sales !== product.sales) {
      product.salesHistory.push({ sales: updates.sales, date: Date.now() });
    }

    storage.trackedProducts[index] = {
      ...product,
      ...updates,
      lastUpdated: Date.now(),
    };
    await updateStorage({ trackedProducts: storage.trackedProducts });
  }
}

// Competitor tracking
export async function addCompetitor(competitor: Omit<Competitor, 'id' | 'addedAt' | 'lastUpdated'>): Promise<Competitor> {
  const storage = await getStorage();
  const newCompetitor: Competitor = {
    ...competitor,
    id: crypto.randomUUID(),
    addedAt: Date.now(),
    lastUpdated: Date.now(),
  };
  storage.competitors.push(newCompetitor);
  await updateStorage({ competitors: storage.competitors });
  return newCompetitor;
}

export async function removeCompetitor(id: string): Promise<void> {
  const storage = await getStorage();
  storage.competitors = storage.competitors.filter(c => c.id !== id);
  await updateStorage({ competitors: storage.competitors });
}

// Price alerts
export async function addPriceAlert(alert: Omit<PriceAlert, 'id' | 'triggered' | 'createdAt'>): Promise<PriceAlert> {
  const storage = await getStorage();
  const newAlert: PriceAlert = {
    ...alert,
    id: crypto.randomUUID(),
    triggered: false,
    createdAt: Date.now(),
  };
  storage.priceAlerts.push(newAlert);
  await updateStorage({ priceAlerts: storage.priceAlerts });
  return newAlert;
}

export async function removePriceAlert(id: string): Promise<void> {
  const storage = await getStorage();
  storage.priceAlerts = storage.priceAlerts.filter(a => a.id !== id);
  await updateStorage({ priceAlerts: storage.priceAlerts });
}

// Settings
export async function updateSettings(settings: Partial<Settings>): Promise<void> {
  const storage = await getStorage();
  storage.settings = { ...storage.settings, ...settings };
  await updateStorage({ settings: storage.settings });
}

export async function getApiKey(): Promise<string> {
  const storage = await getStorage();
  return storage.settings.apiKey;
}

export async function setApiKey(apiKey: string): Promise<void> {
  await updateSettings({ apiKey });
}
