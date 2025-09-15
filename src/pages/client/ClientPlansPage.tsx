import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { investmentService } from '../../services/investmentService';
import { formatCurrency, formatPercent } from '../../lib/utils';

interface InvestmentPlan {
  id: string;
  name: string;
  expected_return: number;
  duration_days: number;
  min_amount: number;
  max_amount: number | null;
  description: string;
  features: string[];
  is_popular?: boolean;
}

interface UserSubscription {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  expected_return: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  totalEarned: number;
  dailyEarning: number;
}

export function ClientPlansPage() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isInvesting, setIsInvesting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlansData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const availablePlans = await investmentService.getAvailablePlans();
        const investments = await investmentService.getUserInvestments(user.id);

        setPlans(availablePlans);
        setUserSubscriptions(investments);
      } catch (error) {
        console.error('Erreur lors du chargement des plans:', error);
        setNotification({ type: 'error', message: 'Erreur lors du chargement des données' });
      } finally {
        setIsLoading(false);
      }
    };

    loadPlansData();
  }, [user?.id]);

  const handleInvestment = async () => {
    if (!selectedPlan || !investmentAmount || !user?.id) return;

    const amount = parseFloat(investmentAmount);
    const plan = plans.find((p: InvestmentPlan) => p.id === selectedPlan.id);

    if (!plan || amount < plan.min_amount || (plan.max_amount && amount > plan.max_amount)) {
      setNotification({
        type: 'error',
        message: `Montant invalide. Doit être entre ${formatCurrency(plan?.min_amount || 0)} et ${formatCurrency(plan?.max_amount || 999999)}`
      });
      return;
    }

    try {
      setIsInvesting(true);
      await investmentService.createInvestment(user.id, selectedPlan.id);

      setNotification({
        type: 'success',
        message: `Investissement de ${formatCurrency(amount)} créé avec succès dans le plan ${plan.name}`
      });

      // Recharger les investissements
      const investments = await investmentService.getUserInvestments(user.id);
      setUserSubscriptions(investments);

      setSelectedPlan(null);
      setInvestmentAmount('');
    } catch (error) {
      console.error('Erreur lors de l\'investissement:', error);
      setNotification({ type: 'error', message: 'Erreur lors de l\'investissement' });
    } finally {
      setIsInvesting(false);
    }
  };

  const getProgress = (subscription: UserSubscription) => {
    const now = new Date();
    const start = new Date(subscription.startDate);
    const end = new Date(subscription.endDate);
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const calculateROI = (amount: number, apy: number, days: number) => {
    return (amount * apy * days) / (365 * 100);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Plans d'Investissement
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Choisissez le plan parfait pour maximiser vos rendements
          </p>
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

      {/* Souscriptions actives */}
      {userSubscriptions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Investissements Actifs
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {userSubscriptions.map((subscription: UserSubscription) => (
              <Card key={subscription.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Plan {subscription.planName}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {subscription.expected_return}% APY
                      </p>
                    </div>
                    <Badge variant="success">Actif</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Investi</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(subscription.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Gagné</p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(subscription.totalEarned)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Gain Quotidien</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {formatCurrency(subscription.dailyEarning)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Jours Restants</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {getDaysRemaining(subscription.endDate)} jours
                        </p>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div>
                      <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-1">
                        <span>Progression</span>
                        <span>{getProgress(subscription).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgress(subscription)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Début : {new Date(subscription.startDate).toLocaleDateString('fr-FR')}</span>
                      <span>Fin : {new Date(subscription.endDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Plans disponibles */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Plans Disponibles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">Chargement des plans...</p>
            </div>
          ) : (
            plans.map((plan: InvestmentPlan) => (
              <Card
                key={plan.id}
                className={`relative border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200`}
              >
                {plan.name === 'Croissance' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge variant="info" className="bg-blue-600 text-white px-4 py-1">
                      Plus Populaire
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {plan.name}
                    {plan.is_popular && (
                      <Badge variant="success" className="ml-2">Populaire</Badge>
                    )}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Rendement attendu :</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatPercent(plan.expected_return)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Durée :</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {plan.duration_days} jours
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Investissement :</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatCurrency(plan.min_amount)} - {formatCurrency(plan.max_amount)}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {plan.features?.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    )) || []}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.name === 'Croissance' ? 'primary' : 'outline'}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Investir Maintenant
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal d'investissement */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Investir dans le Plan {selectedPlan.name}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {selectedPlan.expected_return}% APY pour {selectedPlan.duration_days} jours
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Montant d'Investissement (EUR)"
                type="number"
                placeholder="Entrez le montant"
                value={investmentAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvestmentAmount(e.target.value)}
                min={selectedPlan.min_amount}
                max={selectedPlan.max_amount || undefined}
              />

              <div className="text-sm text-slate-500 dark:text-slate-400">
                Min : {formatCurrency(selectedPlan.min_amount)} •
                Max : {selectedPlan.max_amount ? formatCurrency(selectedPlan.max_amount) : 'Illimité'}
              </div>

              {investmentAmount && parseFloat(investmentAmount) > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Résumé de l'Investissement :
                  </h4>
                  <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                    <div className="flex justify-between">
                      <span>Investissement :</span>
                      <span>{formatCurrency(parseFloat(investmentAmount))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rendement Attendu :</span>
                      <span>{formatCurrency(calculateROI(parseFloat(investmentAmount), selectedPlan.expected_return, selectedPlan.duration_days || 0))}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total Après {selectedPlan.duration_days} jours :</span>
                      <span>{formatCurrency(parseFloat(investmentAmount) + calculateROI(parseFloat(investmentAmount), selectedPlan.expected_return, selectedPlan.duration_days))}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedPlan(null)}
                  disabled={isInvesting}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleInvestment}
                  disabled={!investmentAmount || parseFloat(investmentAmount) < selectedPlan.min_amount || isInvesting}
                >
                  {isInvesting ? 'Traitement...' : 'Confirmer l\'Investissement'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}