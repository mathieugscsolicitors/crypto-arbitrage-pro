const CMC_API_KEY = '4495172e-29f3-490f-803e-35beb4ae88e3';
const CMC_BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

export interface CryptoRate {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  lastUpdated: Date;
}

export interface RatesCache {
  BTC: CryptoRate;
  ETH: CryptoRate;
  USDT: CryptoRate;
  USDC: CryptoRate;
  lastFetch: Date;
}

// Mock data for demonstration
const mockRates: RatesCache = {
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 39875.50,
    change24h: 2.34,
    lastUpdated: new Date()
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 2450.75,
    change24h: -0.87,
    lastUpdated: new Date()
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether',
    price: 0.92,
    change24h: 0.01,
    lastUpdated: new Date()
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    price: 0.92,
    change24h: -0.01,
    lastUpdated: new Date()
  },
  lastFetch: new Date()
};

export class CryptoAPI {
  private static instance: CryptoAPI;
  private ratesCache: RatesCache = mockRates;
  private lastFetch: Date = new Date();

  static getInstance(): CryptoAPI {
    if (!CryptoAPI.instance) {
      CryptoAPI.instance = new CryptoAPI();
    }
    return CryptoAPI.instance;
  }

  async fetchLatestRates(): Promise<RatesCache> {
    try {
      // In a real implementation, this would call the CMC API
      // For demo purposes, we'll simulate rate changes
      const now = new Date();
      const timeSinceLastFetch = now.getTime() - this.lastFetch.getTime();
      
      if (timeSinceLastFetch < 60000) { // Less than 1 minute
        return this.ratesCache;
      }

      // Simulate price fluctuations
      const btcChange = (Math.random() - 0.5) * 100;
      const ethChange = (Math.random() - 0.5) * 50;
      
      this.ratesCache = {
        BTC: {
          ...this.ratesCache.BTC,
          price: Math.max(1000, this.ratesCache.BTC.price + btcChange),
          change24h: (Math.random() - 0.5) * 10,
          lastUpdated: now
        },
        ETH: {
          ...this.ratesCache.ETH,
          price: Math.max(100, this.ratesCache.ETH.price + ethChange),
          change24h: (Math.random() - 0.5) * 8,
          lastUpdated: now
        },
        USDT: {
          ...this.ratesCache.USDT,
          price: 1.0001 + (Math.random() - 0.5) * 0.001,
          change24h: (Math.random() - 0.5) * 0.1,
          lastUpdated: now
        },
        USDC: {
          ...this.ratesCache.USDC,
          price: 0.9999 + (Math.random() - 0.5) * 0.001,
          change24h: (Math.random() - 0.5) * 0.1,
          lastUpdated: now
        },
        lastFetch: now
      };

      this.lastFetch = now;
      return this.ratesCache;
    } catch (error) {
      console.error('Échec de récupération des taux crypto:', error);
      return this.ratesCache; // Return cached data on error
    }
  }

  getCurrentRates(): RatesCache {
    return this.ratesCache;
  }

  convertCrypto(amount: number, fromAsset: string, toAsset: string): number {
    if (fromAsset === toAsset) return amount;
    
    const fromRate = this.ratesCache[fromAsset as keyof RatesCache] as CryptoRate;
    const toRate = this.ratesCache[toAsset as keyof RatesCache] as CryptoRate;
    
    if (!fromRate || !toRate) return 0;
    
    return (amount * fromRate.price) / toRate.price;
  }

  isRatesStale(): boolean {
    const now = new Date();
    const timeSinceLastFetch = now.getTime() - this.ratesCache.lastFetch.getTime();
    return timeSinceLastFetch > 300000; // 5 minutes
  }
}

export const cryptoAPI = CryptoAPI.getInstance();