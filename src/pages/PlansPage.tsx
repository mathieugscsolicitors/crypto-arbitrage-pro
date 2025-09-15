import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { calculateROI, formatCurrency } from '../lib/utils';
import {
  Star,
  TrendingUp,
  Shield,
  Clock,
  Calculator,
  CheckCircle
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  apy: number;
  durationDays: number;
  minAmount: number;
  maxAmount: number | null;
  description: string;
  features: string[];
  popular?: boolean;
}

const mockPlans: Plan[] = [
  {
    id: '1',
    name: 'Débutant',
    apy: 8.5,
    durationDays: 30,
    minAmount: 100,
    maxAmount: 5000,
    description: 'Parfait pour les débutants qui souhaitent commencer leur parcours d\'investissement crypto',
    features: [
      'Rendements composés quotidiens',
      'Support client 24h/24 7j/7',
      'Retraits instantanés',
      'Accès application mobile'
    ]
  },
  {
    id: '2',
    name: 'Croissance',
    apy: 12.5,
    durationDays: 90,
    minAmount: 1000,
    maxAmount: 25000,
    description: 'Idéal pour faire croître votre portefeuille crypto avec des rendements plus élevés',
    features: [
      'Rendements composés quotidiens',
      'Support client prioritaire',
      'Analyses avancées',
      'Suivi de portefeuille',
      'Outils de gestion des risques'
    ],
    popular: true
  },
  {
    id: '3',
    name: 'Premium',
    apy: 15.0,
    durationDays: 180,
    minAmount: 5000,
    maxAmount: 100000,
    description: 'Rendements maximaux pour les investisseurs sérieux avec un engagement plus long',
    features: [
      'Rendements composés quotidiens',
      'Gestionnaire de compte dédié',
      'Stratégies d\'investissement personnalisées',
      'Contrôles de risque avancés',
      'Sécurité de niveau institutionnel',
      'Service haut de gamme'
    ]
  }
];

export function PlansPage() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
  const [simulationResults, setSimulationResults] = useState<{
    principal: number;
    returns: number;
    total: number;
  } | null>(null);

  const handleSimulate = (plan: Plan) => {
    if (investmentAmount >= plan.minAmount && (!plan.maxAmount || investmentAmount <= plan.maxAmount)) {
      const returns = calculateROI(investmentAmount, plan.apy, plan.durationDays);
      setSimulationResults({
        principal: investmentAmount,
        returns,
        total: investmentAmount + returns
      });
      setSelectedPlan(plan);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Plans d'Investissement
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto">
            Choisissez le plan parfait pour maximiser vos rendements crypto. Tous les plans offrent 
            des intérêts composés quotidiens et des options de retrait flexibles.
          </p>
        </div>

        {/* Investment Simulator */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card variant="gradient" className="p-8">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                  <Calculator className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
                Simulateur d'Investissement
              </h2>
              <p className="text-center text-slate-600 dark:text-slate-300">
                Calculez vos rendements potentiels selon différents plans d'investissement
              </p>
            </CardHeader>
            
            <CardContent>
              <div className="mb-6">
                <Input
                  type="number"
                  label="Montant d'Investissement (EUR)"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  min="100"
                  step="100"
                />
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {mockPlans.map((plan) => (
                  <Card
                    key={plan.id}
                    hover
                    className={`p-4 cursor-pointer transition-all ${
                      selectedPlan?.id === plan.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : ''
                    }`}
                    onClick={() => handleSimulate(plan)}
                  >
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      {plan.apy}% APY
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {plan.durationDays} days
                    </div>
                  </Card>
                ))}
              </div>

              {simulationResults && selectedPlan && (
                <Card className="p-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Résultats de Simulation - Plan {selectedPlan.name}
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Investissement Initial</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(simulationResults.principal)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Rendements Totaux</div>
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(simulationResults.returns)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Montant Final</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(simulationResults.total)}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Plans Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {mockPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge variant="info" className="bg-blue-600 text-white px-4 py-1">
                      <Star className="h-4 w-4 mr-1" />
                      Plus Populaire
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {plan.apy}%
                    <span className="text-lg text-slate-500 dark:text-slate-400 font-normal"> APY</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Durée</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {plan.durationDays} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Investissement Min</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(plan.minAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-600 dark:text-slate-400">Investissement Max</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {plan.maxAmount ? formatCurrency(plan.maxAmount) : 'Illimité'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-300 text-sm">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {user ? (
                      <Link to={`/client/plans`}>
                        <Button 
                          className="w-full" 
                          variant={plan.popular ? 'primary' : 'outline'}
                        >
                          Sélectionner le Plan
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/auth/register">
                        <Button 
                          className="w-full" 
                          variant={plan.popular ? 'primary' : 'outline'}
                        >
                          Commencer
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4">
                <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Sécurité Bancaire
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Vos investissements sont protégés par un chiffrement militaire et un stockage à froid.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Rendements Prouvés
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Historique de rendements constants soutenus par des stratégies d'arbitrage professionnelles.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full mb-4">
                <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Surveillance 24h/24
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Notre équipe surveille les marchés 24h/24 pour maximiser vos rendements.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}