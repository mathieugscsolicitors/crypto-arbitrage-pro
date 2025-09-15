import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { cryptoAPI } from '../../lib/api';
import { walletService } from '../../services/walletService';
import { formatCurrency, formatCrypto, formatPercent, generateWalletAddress } from '../../lib/utils';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  QrCode,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface WalletBalance {
  asset: 'BTC' | 'ETH' | 'USDT' | 'USDC';
  balance: number;
  usdValue: number;
  change24h: number;
  address: string;
}

export function WalletPage() {
  const { user } = useAuth();
  const [hideBalances, setHideBalances] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'ETH' | 'USDT' | 'USDC'>('BTC');
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const rates = cryptoAPI.getCurrentRates();

  useEffect(() => {
    const loadWalletData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        
        // Charger les soldes des portefeuilles
        const wallets = await walletService.getUserWalletBalances(user.id);
        const formattedWallets = wallets.map(wallet => ({
          asset: wallet.asset as 'BTC' | 'ETH' | 'USDT' | 'USDC',
          balance: wallet.balance,
          usdValue: wallet.balance * (rates[wallet.asset as keyof typeof rates] || 0),
          change24h: Math.random() * 10 - 5, // Simulation
          address: wallet.address || generateWalletAddress(wallet.asset)
        }));
        
        setWalletBalances(formattedWallets);
        
        // Charger les transactions récentes
        const transactions = await walletService.getRecentTransactions(user.id, 10);
        setRecentTransactions(transactions);
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setNotification({
          type: 'error',
          message: 'Erreur lors du chargement des données du portefeuille'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadWalletData();
  }, [user?.id, rates]);

  const selectedWallet = walletBalances.find(w => w.asset === selectedAsset);
  const totalUSDValue = walletBalances.reduce((sum, wallet) => sum + wallet.usdValue, 0);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setNotification({
      type: 'success',
      message: 'Adresse copiée dans le presse-papier'
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleWithdraw = async () => {
    if (!user?.id || !selectedWallet) return;
    
    const amount = parseFloat(withdrawAmount);
    if (amount <= 0 || amount > selectedWallet.balance) {
      setNotification({
        type: 'error',
        message: 'Montant invalide'
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      await walletService.createTransaction({
        user_id: user.id,
        type: 'WITHDRAWAL',
        asset: selectedAsset,
        amount: amount,
        to_address: withdrawAddress,
        status: 'PENDING'
      });

      setNotification({
        type: 'success',
        message: 'Demande de retrait soumise avec succès'
      });
      
      setWithdrawAmount('');
      setWithdrawAddress('');
      
      // Recharger les données
      const wallets = await walletService.getUserWalletBalances(user.id);
      const formattedWallets = wallets.map(wallet => ({
        asset: wallet.asset as 'BTC' | 'ETH' | 'USDT' | 'USDC',
        balance: wallet.balance,
        usdValue: wallet.balance * (rates[wallet.asset as keyof typeof rates] || 0),
        change24h: Math.random() * 10 - 5,
        address: wallet.address || generateWalletAddress(wallet.asset)
      }));
      
      setWalletBalances(formattedWallets);
      
    } catch (error) {
      console.error('Erreur lors du retrait:', error);
      setNotification({
        type: 'error',
        message: 'Erreur lors de la demande de retrait'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Portefeuille
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gérez vos actifs crypto
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHideBalances(!hideBalances)}
            className="flex items-center space-x-2"
          >
            {hideBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span>{hideBalances ? 'Afficher' : 'Masquer'} les Soldes</span>
          </Button>
          <Button variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
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

      {/* Portfolio Overview */}
      <Card variant="gradient">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <Wallet className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h2 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Valeur Totale du Portefeuille
            </h2>
            <p className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {hideBalances ? '••••••••' : formatCurrency(totalUSDValue)}
            </p>
            <div className="flex items-center justify-center text-sm">
              <span className="text-green-600 dark:text-green-400">
                +{formatPercent(5.67)} (24h)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Selection */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Sélectionner un Actif
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {walletBalances.map((wallet) => (
              <button
                key={wallet.asset}
                onClick={() => setSelectedAsset(wallet.asset)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedAsset === wallet.asset
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold text-slate-900 dark:text-white mb-1">
                    {wallet.asset}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {hideBalances ? '••••••' : formatCrypto(wallet.balance, wallet.asset)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {hideBalances ? '••••••' : formatCurrency(wallet.usdValue)}
                  </div>
                  <div className={`text-xs mt-1 ${wallet.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercent(wallet.change24h)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deposit/Withdraw Tabs */}
      <Card>
        <CardHeader>
          <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'deposit'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownLeft className="h-4 w-4" />
              <span>Dépôt</span>
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'withdraw'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>Retrait</span>
            </button>
          </div>
        </CardHeader>

        <CardContent>
          {activeTab === 'deposit' ? (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Déposer {selectedAsset}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Envoyez {selectedAsset} à l'adresse ci-dessous. Dépôt minimum : {
                    selectedAsset === 'BTC' ? '0,001 BTC' :
                    selectedAsset === 'ETH' ? '0,01 ETH' :
                    '10 USDT ou USDC'
                  }
                </p>
              </div>

              {selectedWallet && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg border-2 border-slate-200">
                      <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                        <QrCode className="h-16 w-16 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Adresse {selectedAsset}
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={selectedWallet.address}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedWallet.address)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div className="text-sm text-yellow-800 dark:text-yellow-200">
                        <p className="font-medium mb-1">Important :</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Envoyez uniquement du {selectedAsset} à cette adresse</li>
                          <li>• Les dépôts nécessitent 3 confirmations réseau</li>
                          <li>• Les fonds apparaîtront dans votre compte sous 10-30 minutes</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Retirer {selectedAsset}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Solde disponible : {selectedWallet ? formatCrypto(selectedWallet.balance, selectedAsset) : '0'}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Adresse de destination
                  </label>
                  <Input
                    placeholder={`Entrez l'adresse ${selectedAsset}`}
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Montant à retirer
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      step="0.00000001"
                      min="0"
                      max={selectedWallet?.balance || 0}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                      {selectedAsset}
                    </div>
                  </div>
                  {selectedWallet && (
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>Min: 0.001 {selectedAsset}</span>
                      <button
                        onClick={() => setWithdrawAmount(selectedWallet.balance.toString())}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Max: {formatCrypto(selectedWallet.balance, selectedAsset)}
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="text-sm text-red-800 dark:text-red-200">
                      <p className="font-medium mb-1">Attention :</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Vérifiez l'adresse de destination</li>
                        <li>• Les transactions sont irréversibles</li>
                        <li>• Frais de réseau : ~0.0005 {selectedAsset}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleWithdraw}
                  disabled={!withdrawAddress || !withdrawAmount || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? 'Traitement...' : `Retirer ${selectedAsset}`}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Transactions Récentes
            </h3>
            <Button variant="ghost" size="sm">
              Voir tout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-slate-500 dark:text-slate-400">Chargement des transactions...</p>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-slate-500 dark:text-slate-400">Aucune transaction récente</p>
              </div>
            ) : (
              <React.Fragment>
              {recentTransactions.map((tx: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      tx.type === 'DEPOSIT' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {tx.type === 'DEPOSIT' ? (
                        <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {tx.type === 'DEPOSIT' ? 'Dépôt' : 'Retrait'}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatCrypto(tx.amount, tx.asset)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={tx.status === 'COMPLETED' ? 'success' : tx.status === 'PENDING' ? 'warning' : 'error'}>
                      {tx.status === 'COMPLETED' ? 'Terminé' : 
                       tx.status === 'PENDING' ? 'En attente' : 
                       tx.status === 'REJECTED' ? 'Rejeté' : tx.status}
                    </Badge>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(tx.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
              </React.Fragment>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
