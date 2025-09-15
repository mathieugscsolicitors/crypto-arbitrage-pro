import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { adminService } from '../../services/adminService';
import { CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Transaction {
  id: string;
  user_id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'INVESTMENT' | 'PROFIT';
  amount: number;
  asset: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  created_at: string;
  user?: {
    email: string;
    full_name: string;
  };
}

const TransactionsManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllTransactions();
      setTransactions(data || []);
    } catch (error) {
      console.error('Erreur chargement transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'WITHDRAWAL':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Terminé</Badge>;
      case 'PENDING':
        return <Badge variant="warning">En attente</Badge>;
      case 'REJECTED':
        return <Badge variant="error">Rejeté</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <CreditCard className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Gestion des Transactions
        </h1>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Transactions Récentes ({transactions.length})
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">Chargement...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">Aucune transaction trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Utilisateur</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Montant</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Asset</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getTransactionIcon(transaction.type)}
                          <span className="text-slate-900 dark:text-white">{transaction.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white">
                        {transaction.user?.email || transaction.user_id}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white">
                        {transaction.amount.toFixed(8)}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white">
                        {transaction.asset}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {new Date(transaction.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TransactionsManagement;