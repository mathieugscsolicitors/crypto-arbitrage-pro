import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { walletService } from '../../services/walletService';
import { investmentService } from '../../services/investmentService';
import { formatCurrency, formatCrypto, formatPercent } from '../../lib/utils';
import {
  History,
  Filter,
  Download,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Target,
  Calendar,
  DollarSign,
  TrendingUp
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'EXCHANGE' | 'INVESTMENT';
  asset: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  fromAsset?: string;
  toAsset?: string;
  exchangeRate?: number;
  planName?: string;
  notes?: string;
  timestamp: string;
  txHash?: string;
}

export function HistoryPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'deposits' | 'withdrawals' | 'exchanges' | 'investments'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const [walletTransactions, userInvestments] = await Promise.all([
          walletService.getUserTransactionHistory(user.id, 50),
          investmentService.getUserInvestments(user.id)
        ]);
        
        setTransactions(walletTransactions);
        setInvestments(userInvestments);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHistory();
  }, [user?.id]);

  const allHistory = [
    ...transactions.map(tx => ({
      ...tx,
      type: tx.type,
      timestamp: tx.created_at
    })),
    ...investments.map(inv => ({
      ...inv,
      type: 'INVESTMENT',
      timestamp: inv.created_at,
      status: inv.status
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  const filteredTransactions = allHistory.filter(transaction => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        transaction.asset?.toLowerCase().includes(searchLower) ||
        transaction.type.toLowerCase().includes(searchLower) ||
        transaction.status.toLowerCase().includes(searchLower) ||
        transaction.plan_name?.toLowerCase().includes(searchLower)
      );
    }
    if (filter !== 'all') {
      if (filter === 'deposits' && transaction.type !== 'DEPOSIT') return false;
      if (filter === 'withdrawals' && transaction.type !== 'WITHDRAW') return false;
      if (filter === 'exchanges' && transaction.type !== 'EXCHANGE') return false;
      if (filter === 'investments' && transaction.type !== 'INVESTMENT') return false;
    }
    return true;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
      case 'WITHDRAW':
        return <ArrowUpRight className="h-5 w-5 text-red-500" />;
      case 'EXCHANGE':
        return <ArrowLeftRight className="h-5 w-5 text-blue-500" />;
      case 'INVESTMENT':
        return <TrendingUp className="h-5 w-5 text-purple-500" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTransactionDescription = (tx: Transaction) => {
    switch (tx.type) {
      case 'DEPOSIT':
        return `Dépôt ${formatCrypto(tx.amount, tx.asset)}`;
      case 'WITHDRAW':
        return `Retrait ${formatCrypto(tx.amount, tx.asset)}`;
      case 'EXCHANGE':
        return `Échange ${tx.fromAsset} vers ${tx.toAsset}`;
      case 'INVESTMENT':
        return `Investissement dans ${tx.planName}`;
      default:
        return 'Transaction';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Historique des Transactions
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Consultez et gérez votre historique de transactions
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Filtres
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher des transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les Types</option>
              <option value="deposits">Dépôts</option>
              <option value="withdrawals">Retraits</option>
              <option value="exchanges">Échanges</option>
              <option value="investments">Investissements</option>
            </select>

            <select
              value={dateRange.start}
              onChange={(e) => setDateRange({ start: e.target.value, end: dateRange.end })}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Date de début</option>
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">90 derniers jours</option>
              <option value="365">Dernière année</option>
            </select>

            <select
              value={dateRange.end}
              onChange={(e) => setDateRange({ start: dateRange.start, end: e.target.value })}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Date de fin</option>
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">90 derniers jours</option>
              <option value="365">Dernière année</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des transactions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Transactions ({filteredTransactions.length})
          </h3>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">Chargement de l'historique...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">Aucune transaction trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {getTransactionDescription(transaction)}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                        <span>ID : {transaction.id}</span>
                        <span>{new Date(transaction.timestamp).toLocaleString('fr-FR')}</span>
                        {transaction.txHash && (
                          <span className="font-mono">Hash : {transaction.txHash.substring(0, 8)}...</span>
                        )}
                      </div>
                      {transaction.notes && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          Note : {transaction.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {transaction.type === 'EXCHANGE' && transaction.fromAsset && transaction.toAsset ? (
                            `${formatCrypto(transaction.amount, transaction.toAsset)}`
                          ) : (
                            formatCrypto(transaction.amount, transaction.asset)
                          )}
                        </p>
                        {transaction.type === 'EXCHANGE' && transaction.exchangeRate && (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Taux : {transaction.exchangeRate.toFixed(8)}
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant={
                          transaction.status === 'COMPLETED' ? 'success' :
                          transaction.status === 'PENDING' ? 'warning' : 'error'
                        }
                      >
                        {transaction.status === 'COMPLETED' ? 'Terminé' :
                         transaction.status === 'PENDING' ? 'En attente' : 'Rejeté'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}