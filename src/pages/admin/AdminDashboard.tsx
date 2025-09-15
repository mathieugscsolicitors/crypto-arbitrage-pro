import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { adminService } from '../../services/adminService';
import { walletService } from '../../services/walletService';
import { formatCurrency, formatPercent } from '../../lib/utils';
import { CryptoChart, generateMockChartData } from '../../components/CryptoChart';
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Activity,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Eye
} from 'lucide-react';

interface KPI {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<any>;
}

interface RecentActivity {
  id: string;
  type: 'USER_REGISTRATION' | 'DEPOSIT' | 'WITHDRAWAL' | 'INVESTMENT' | 'SYSTEM';
  description: string;
  amount?: number;
  asset?: string;
  timestamp: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [stats, setStats] = useState<any>(null);
  const [masterWallets, setMasterWallets] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const [adminStats, wallets, activity] = await Promise.all([
          adminService.getSystemHealth(),
          walletService.getUserWalletBalances('master'),
          adminService.getSystemHealth()
        ]);
        
        // Transform data for display
        const transformedStats = {
          total_users: adminStats?.users_count || 0,
          active_users: adminStats?.active_users || 0,
          total_volume: adminStats?.total_volume || 0,
          total_profit: adminStats?.total_profit || 0,
          pending_transactions: adminStats?.pending_transactions || 0,
          completed_transactions: adminStats?.completed_transactions || 0,
          user_growth_percent: 12,
          volume_growth_percent: 8,
          profit_growth_percent: 15
        };
        
        const transformedWallets = wallets.map((w: any) => ({
          ...w,
          name: `Portefeuille ${w.asset}`,
          is_active: true,
          usd_value: w.balance * (w.asset === 'BTC' ? 45000 : w.asset === 'ETH' ? 2500 : 1),
          change24h: Math.random() * 10 - 5
        }));
        
        const transformedActivity = [
          {
            id: '1',
            type: 'USER_REGISTRATION',
            description: 'Nouveaux utilisateurs inscrits',
            timestamp: new Date().toISOString(),
            status: 'SUCCESS'
          },
          {
            id: '2',
            type: 'DEPOSIT',
            description: 'Dépôts traités',
            amount: 25000,
            asset: 'USDT',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'SUCCESS'
          }
        ];
        
        setStats(transformedStats);
        setMasterWallets(transformedWallets);
        setRecentActivity(transformedActivity);
      } catch (error) {
        console.error('Erreur lors du chargement des données admin:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user?.id, timeRange]);

  // KPIs simulés
  const kpis: KPI[] = [
    {
      label: 'Total Utilisateurs',
      value: '2 547',
      change: '+12,5%',
      trend: 'up',
      icon: Users
    },
    {
      label: 'Volume Total (24h)',
      value: '1 134 567€',
      change: '+8,2%',
      trend: 'up',
      icon: DollarSign
    },
    {
      label: 'Investissements Actifs',
      value: '5 218 901€',
      change: '+15,7%',
      trend: 'up',
      icon: TrendingUp
    },
    {
      label: 'Actions en Attente',
      value: '23',
      change: '-5,1%',
      trend: 'down',
      icon: AlertTriangle
    }
  ];

  const totalMasterValue = masterWallets.reduce((sum: number, wallet: any) => sum + (wallet.usd_value || 0), 0);
  const chartData = generateMockChartData(
    timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30,
    totalMasterValue
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'USER_REGISTRATION':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'DEPOSIT':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'WITHDRAWAL':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'INVESTMENT':
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case 'SYSTEM':
        return <Activity className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="success">Succès</Badge>;
      case 'PENDING':
        return <Badge variant="warning">En attente</Badge>;
      case 'FAILED':
        return <Badge variant="error">Échoué</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Tableau de Bord Admin
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Aperçu de la plateforme et métriques clés
          </p>
        </div>
        <Button variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser les Données
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">Chargement des statistiques...</p>
          </div>
        ) : (
          <>
            {/* Total des utilisateurs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Utilisateurs
                </h3>
                <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.total_users?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400">
                  +{stats?.user_growth_percent || 0}% par rapport au mois dernier
                </p>
              </CardContent>
            </Card>

            {/* Volume total */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Volume Total (24h)
                </h3>
                <DollarSign className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(stats?.total_volume || 0)}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400">
                  +{stats?.volume_growth_percent || 0}% par rapport au mois dernier
                </p>
              </CardContent>
            </Card>

            {/* Investissements actifs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Investissements Actifs
                </h3>
                <TrendingUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(stats?.active_investments || 0)}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400">
                  +{stats?.investment_growth_percent || 0}% par rapport au mois dernier
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Graphique du volume de la plateforme */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Volume de la Plateforme
            </h3>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              {(['24h', '7d', '30d'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeRange(period)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    timeRange === period
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CryptoChart data={chartData} height={300} color="#3B82F6" />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Portefeuilles Maîtres */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Portefeuilles Maîtres
                </h3>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Voir Tout
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">
                  <p className="text-slate-500 dark:text-slate-400">Chargement des portefeuilles...</p>
                </div>
              ) : masterWallets.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-slate-500 dark:text-slate-400">Aucun portefeuille maître configuré</p>
                </div>
              ) : (
                masterWallets.map((wallet) => (
                  <div key={wallet.asset} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {wallet.name || `Portefeuille ${wallet.asset}`}
                      </h4>
                      <Badge variant={wallet.is_active ? 'success' : 'error'}>
                        {wallet.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(wallet.usd_value || 0)}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {wallet.balance?.toLocaleString() || '0'} {wallet.asset}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Mis à jour : {new Date(wallet.updated_at || Date.now()).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Activité Récente
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {activity.description}
                    </p>
                    {activity.amount && activity.asset && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatCrypto(activity.amount, activity.asset)}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(activity.timestamp).toLocaleString('fr-FR')}
                      </p>
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Actions Rapides
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span>Gérer les Utilisateurs</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <DollarSign className="h-6 w-6 mb-2" />
              <span>Examiner les Transactions</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Wallet className="h-6 w-6 mb-2" />
              <span>Opérations de Portefeuille</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span>Mettre à Jour les Taux</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}