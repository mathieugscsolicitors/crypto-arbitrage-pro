export interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  icon: string;
}

export const cryptoAssets: CryptoAsset[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 43250.00,
    change24h: 2.45,
    marketCap: 847000000000,
    volume24h: 15200000000,
    icon: '₿'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 2650.00,
    change24h: -1.23,
    marketCap: 318000000000,
    volume24h: 8900000000,
    icon: 'Ξ'
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    price: 1.00,
    change24h: 0.01,
    marketCap: 95000000000,
    volume24h: 25000000000,
    icon: '₮'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    price: 1.00,
    change24h: -0.01,
    marketCap: 25000000000,
    volume24h: 3200000000,
    icon: '$'
  }
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatCrypto = (amount: number, symbol: string): string => {
  const decimals = symbol === 'BTC' ? 8 : symbol === 'ETH' ? 6 : 2;
  return `${amount.toFixed(decimals)} ${symbol}`;
};

export const getCryptoIcon = (symbol: string): string => {
  const asset = cryptoAssets.find(a => a.symbol === symbol);
  return asset?.icon || symbol;
};