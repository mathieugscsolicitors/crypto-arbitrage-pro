import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { cryptoAPI } from '../../lib/api';
import { walletService } from '../../services/walletService';
import { formatCurrency, formatCrypto, formatPercent } from '../../lib/utils';
import {
  ArrowLeftRight,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  spread: number;
}

interface ExchangeHistory {
  id: string;
  fromAsset: string;
  toAsset: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  timestamp: string;
}

export function ExchangePage() {
  const { user } = useAuth();
  const [fromAsset, setFromAsset] = useState<'BTC' | 'ETH' | 'USDT' | 'USDC'>('BTC');
  const [toAsset, setToAsset] = useState<'BTC' | 'ETH' | 'USDT' | 'USDC'>('ETH');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [rates, setRates] = useState(cryptoAPI.getCurrentRates());
  const [walletBalances, setWalletBalances] = useState<Record<string, number>>({});
  const [exchangeHistory, setExchangeHistory] = useState<ExchangeHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const assets = ['BTC', 'ETH', 'USDT', 'USDC'] as const;

  useEffect(() => {
    const loadExchangeData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const [wallets, transactions] = await Promise.all([
          walletService.getUserWalletBalances(user.id),
          walletService.getUserTransactionHistory(user.id, 10)
        ]);
        
        const balances: Record<string, number> = {};
        wallets.forEach(wallet => {
          balances[wallet.asset] = wallet.balance;
        });
        setWalletBalances(balances);
        
        const exchanges = transactions.filter(tx => tx.type === 'EXCHANGE').map(tx => ({
          id: tx.id,
          fromAsset: tx.from_asset || 'BTC',
          toAsset: tx.asset,
          fromAmount: tx.from_amount || 0,
          toAmount: tx.amount,
          rate: tx.exchange_rate || 0,
          status: tx.status as 'COMPLETED' | 'PENDING' | 'FAILED',
          timestamp: tx.created_at
        }));
        setExchangeHistory(exchanges);
      } catch (error) {
        console.error('Erreur lors du chargement des données d\'échange:', error);
        setNotification({ type: 'error', message: 'Erreur lors du chargement des données' });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExchangeData();
  }, [user?.id]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const newRates = await cryptoAPI.fetchLatestRates();
      setRates(newRates);
    }, 30000); // Mise à jour toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (fromAmount && fromAsset !== toAsset) {
      const amount = parseFloat(fromAmount);
      if (amount > 0) {
        const convertedAmount = cryptoAPI.convertCrypto(amount, fromAsset, toAsset);
        setToAmount(convertedAmount.toFixed(8));
      } else {
        setToAmount('');
      }
    }
  }, [fromAmount, fromAsset, toAsset, rates]);

  const swapAssets = () => {
    const tempAsset = fromAsset;
    setFromAsset(toAsset);
    setToAsset(tempAsset);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleExchange = async () => {
    if (!fromAmount || !toAmount || !user?.id) return;

    const amount = parseFloat(fromAmount);
    const balance = walletBalances[fromAsset] || 0;

    if (amount <= 0 || amount > balance) {
      setNotification({ type: 'error', message: 'Solde insuffisant ou montant invalide' });
      return;
    }

    setIsProcessing(true);

    try {
      await walletService.createTransaction(user.id, {
        type: 'EXCHANGE',
        asset: toAsset,
        amount: parseFloat(toAmount),
        fromAsset,
        fromAmount: amount
      });
      
      setNotification({
        type: 'success',
        message: `Échange réussi de ${formatCrypto(amount, fromAsset)} vers ${formatCrypto(parseFloat(toAmount), toAsset)}`
      });
      setFromAmount('');
      setToAmount('');
      
      // Recharger les données
      const wallets = await walletService.getUserWalletBalances(user.id);
      const balances: Record<string, number> = {};
      wallets.forEach(wallet => {
        balances[wallet.asset] = wallet.balance;
      });
      setWalletBalances(balances);
    } catch (error) {
      setNotification({ type: 'error', message: 'Erreur lors de l\'échange' });
    } finally {
      setIsProcessing(false);
    }
  };

  const getExchangeRate = () => {
    if (fromAsset === toAsset) return 1;
    return cryptoAPI.convertCrypto(1, fromAsset, toAsset);
  };

  const getSpread = () => {
    // Calcul de spread simulé (généralement 0,1-0,5%)
    return 0.25;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Échange
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Échangez vos actifs crypto instantanément
          </p>
        </div>
        <Button variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser les Taux
        </Button>
      </div>

      {/* Notification */}
      {notification && (
        <Card className={`border-l-4 ${
          notification.type === 'success' 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
            : 'border-red-500 bg-red-50 dark:bg-red-900/20'
        }`}>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span className={`text-sm ${
                notification.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
              }`}>
                {notification.message}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interface d'échange */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Échange Instantané
              </h3>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Actif source */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  De
                </label>
                <div className="flex space-x-4">
                  <select
                    value={fromAsset}
                    onChange={(e) => setFromAsset(e.target.value as any)}
                    className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {assets.map(asset => (
                      <option key={asset} value={asset}>{asset}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    step="0.00000001"
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Disponible : {formatCrypto(walletBalances[fromAsset] || 0, fromAsset)}
                </p>
              </div>

              {/* Bouton d'échange */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={swapAssets}
                  className="rounded-full p-3"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Actif de destination */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Vers
                </label>
                <div className="flex space-x-4">
                  <select
                    value={toAsset}
                    onChange={(e) => setToAsset(e.target.value as any)}
                    className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {assets.map(asset => (
                      <option key={asset} value={asset}>{asset}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={toAmount}
                    readOnly
                    className="flex-1 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Solde : {formatCrypto(walletBalances[toAsset] || 0, toAsset)}
                </p>
              </div>

              {/* Détails de l'échange */}
              {fromAmount && toAmount && fromAsset !== toAsset && (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Taux de Change :</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      1 {fromAsset} = {getExchangeRate().toFixed(8)} {toAsset}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Spread :</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {getSpread()}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Temps de Traitement :</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      Instantané
                    </span>
                  </div>
                </div>
              )}

              {/* Bouton d'échange */}
              <Button
                onClick={handleExchange}
                className="w-full"
                size="lg"
                isLoading={isProcessing}
                disabled={!fromAmount || !toAmount || fromAsset === toAsset || parseFloat(fromAmount) <= 0}
              >
                {isProcessing ? 'Traitement de l\'Échange...' : 'Échanger Maintenant'}
              </Button>

              {/* Avertissement */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">Informations sur l'Échange :</p>
                    <ul className="space-y-1">
                      <li>• Les échanges sont traités instantanément</li>
                      <li>• Les taux sont mis à jour toutes les 30 secondes</li>
                      <li>• Aucun frais supplémentaire pour les échanges</li>
                      <li>• Échange minimum : équivalent 10€</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Taux du marché */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Taux en Direct
                </h3>
                <Badge variant="success" className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>En Direct</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(rates).filter(([key]) => key !== 'lastFetch').map(([symbol, rate]) => (
                  <div key={symbol} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {symbol}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {(rate as any).name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {formatCurrency((rate as any).price)}
                      </div>
                      <div className={`text-sm flex items-center ${
                        (rate as any).change24h >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {(rate as any).change24h >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {formatPercent((rate as any).change24h)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historique des échanges */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Historique des Échanges
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-slate-500 dark:text-slate-400">Chargement de l'historique...</p>
              </div>
            ) : exchangeHistory.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-slate-500 dark:text-slate-400">Aucun échange récent</p>
              </div>
            ) : (
              <>
              {exchangeHistory.map((exchange) => (
              <div key={exchange.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                    <ArrowLeftRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {formatCrypto(exchange.fromAmount, exchange.fromAsset)} → {formatCrypto(exchange.toAmount, exchange.toAsset)}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Taux : 1 {exchange.fromAsset} = {exchange.rate.toFixed(8)} {exchange.toAsset}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={
                    exchange.status === 'COMPLETED' ? 'success' :
                    exchange.status === 'PENDING' ? 'warning' : 'error'
                  }>
                    {exchange.status === 'COMPLETED' ? 'Terminé' :
                     exchange.status === 'PENDING' ? 'En attente' : 'Échoué'}
                  </Badge>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(exchange.timestamp).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}