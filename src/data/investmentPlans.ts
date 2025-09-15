export interface InvestmentPlan {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  dailyReturn: number;
  duration: number; // en jours
  totalReturn: number;
  features: string[];
  popular?: boolean;
  color: string;
}

export const investmentPlans: InvestmentPlan[] = [
  {
    id: 'starter',
    name: 'Plan Starter',
    description: 'Parfait pour débuter dans l\'arbitrage crypto',
    minAmount: 100,
    maxAmount: 1000,
    dailyReturn: 0.15, // 0.15% par jour
    duration: 30,
    totalReturn: 5.5, // 5.5% sur 30 jours
    features: [
      'Support client 24/7',
      'Arbitrage automatique',
      'Retrait quotidien',
      'Dashboard en temps réel'
    ],
    color: 'blue',
  },
  {
    id: 'premium',
    name: 'Plan Premium',
    description: 'Pour les investisseurs expérimentés',
    minAmount: 1000,
    maxAmount: 10000,
    dailyReturn: 0.25, // 0.25% par jour
    duration: 35,
    totalReturn: 8.2, // 8.2% sur 35 jours
    features: [
      'Support client prioritaire',
      'Arbitrage multi-exchanges',
      'Retrait instantané',
      'Analyses avancées',
      'Gestionnaire dédié'
    ],
    popular: true,
    color: 'green',
  },
  {
    id: 'vip',
    name: 'Plan VIP',
    description: 'Le summum de l\'arbitrage professionnel',
    minAmount: 10000,
    maxAmount: 100000,
    dailyReturn: 0.35, // 0.35% par jour
    duration: 40,
    totalReturn: 12.5, // 12.5% sur 40 jours
    features: [
      'Support VIP exclusif',
      'Arbitrage institutionnel',
      'Retraits illimités',
      'Rapports personnalisés',
      'Conseiller personnel',
      'Accès aux signaux premium'
    ],
    color: 'purple',
  }
];

export const calculateProfit = (amount: number, plan: InvestmentPlan): number => {
  return (amount * plan.totalReturn) / 100;
};

export const calculateDailyProfit = (amount: number, plan: InvestmentPlan): number => {
  return (amount * plan.dailyReturn) / 100;
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};