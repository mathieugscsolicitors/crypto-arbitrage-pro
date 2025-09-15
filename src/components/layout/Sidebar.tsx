import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Target,
  History,
  User,
  Users,
  Receipt,
  Settings,
  DollarSign,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN';

  const clientNavItems = [
    { icon: LayoutDashboard, label: 'Tableau de Bord', href: '/client' },
    { icon: Wallet, label: 'Portefeuille', href: '/client/wallet' },
    { icon: ArrowLeftRight, label: 'Échange', href: '/client/exchange' },
    { icon: Target, label: 'Plans', href: '/client/plans' },
    { icon: History, label: 'Historique', href: '/client/history' },
    { icon: User, label: 'Profil', href: '/client/profile' }
  ];

  const adminNavItems = [
    { icon: LayoutDashboard, label: 'Tableau de Bord', href: '/admin' },
    { icon: Users, label: 'Utilisateurs', href: '/admin/users' },
    { icon: Receipt, label: 'Transactions', href: '/admin/transactions' },
    { icon: Target, label: 'Plans', href: '/admin/plans' },
    { icon: Wallet, label: 'Portefeuilles', href: '/admin/wallets' },
    { icon: TrendingUp, label: 'Taux', href: '/admin/rates' }
  ];

  const navItems = isAdmin ? adminNavItems : clientNavItems;

  return (
    <aside className={cn('w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-full', className)}>
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}