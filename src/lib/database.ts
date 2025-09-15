import { supabase } from './supabase';
import type { Database } from './supabase';

// Types pour les services
export type User = Database['public']['Tables']['users']['Row'];
export type Wallet = Database['public']['Tables']['wallets']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type Plan = Database['public']['Tables']['plans']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type RateCache = Database['public']['Tables']['rates_cache']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

// Service de base de données centralisé
export class DatabaseService {
  private static instance: DatabaseService;
  public supabase = supabase;

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // ==================== USERS ====================
  async createUser(userData: Database['public']['Tables']['users']['Insert']): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  async updateUser(id: string, updates: Database['public']['Tables']['users']['Update']): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  async getAllUsers(limit = 50, offset = 0): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // ==================== WALLETS ====================
  async createWallet(walletData: Database['public']['Tables']['wallets']['Insert']): Promise<Wallet | null> {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .insert(walletData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating wallet:', error);
      return null;
    }
  }

  async getUserWallets(userId: string): Promise<Wallet[]> {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .order('asset');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user wallets:', error);
      return [];
    }
  }

  async updateWalletBalance(id: string, balance: number): Promise<Wallet | null> {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .update({ 
          balance, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      return null;
    }
  }

  async getMasterWallets(): Promise<Wallet[]> {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('is_master', true)
        .order('asset');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching master wallets:', error);
      return [];
    }
  }

  // ==================== TRANSACTIONS ====================
  async createTransaction(transactionData: Database['public']['Tables']['transactions']['Insert']): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  }

  async getUserTransactions(userId: string, limit = 20, offset = 0): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
  }

  async getAllTransactions(limit = 50, offset = 0): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  async updateTransactionStatus(id: string, status: 'PENDING' | 'COMPLETED' | 'REJECTED'): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      return null;
    }
  }

  // ==================== PLANS ====================
  async getActivePlans(): Promise<Plan[]> {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('min_amount');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active plans:', error);
      return [];
    }
  }

  async getAllPlans(): Promise<Plan[]> {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching plans:', error);
      return [];
    }
  }

  async createPlan(planData: Database['public']['Tables']['plans']['Insert']): Promise<Plan | null> {
    try {
      const { data, error } = await supabase
        .from('plans')
        .insert(planData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating plan:', error);
      return null;
    }
  }

  async updatePlan(id: string, updates: Database['public']['Tables']['plans']['Update']): Promise<Plan | null> {
    try {
      const { data, error } = await supabase
        .from('plans')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating plan:', error);
      return null;
    }
  }

  // ==================== SUBSCRIPTIONS ====================
  async createSubscription(subscriptionData: Database['public']['Tables']['subscriptions']['Insert']): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      return null;
    }
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plans (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      return [];
    }
  }

  async updateSubscription(id: string, updates: Database['public']['Tables']['subscriptions']['Update']): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return null;
    }
  }

  // ==================== NOTIFICATIONS ====================
  async createNotification(notificationData: Database['public']['Tables']['notifications']['Insert']): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  async getUserNotifications(userId: string, limit = 20): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(id: string): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return null;
    }
  }

  // ==================== RATES CACHE ====================
  async updateRatesCache(rates: Database['public']['Tables']['rates_cache']['Insert'][]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rates_cache')
        .upsert(rates, { onConflict: 'symbol' });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating rates cache:', error);
      return false;
    }
  }

  async getRatesCache(): Promise<RateCache[]> {
    try {
      const { data, error } = await supabase
        .from('rates_cache')
        .select('*')
        .order('symbol');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching rates cache:', error);
      return [];
    }
  }

  // ==================== AUDIT LOGS ====================
  async createAuditLog(logData: Database['public']['Tables']['audit_logs']['Insert']): Promise<AuditLog | null> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert(logData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating audit log:', error);
      return null;
    }
  }

  async getAuditLogs(limit = 50, offset = 0): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  // ==================== ANALYTICS ====================
  async getPlatformStats(): Promise<{
    totalUsers: number;
    totalVolume24h: number;
    totalInvestments: number;
    pendingTransactions: number;
  }> {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get 24h volume
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: transactions24h } = await supabase
        .from('transactions')
        .select('amount')
        .gte('created_at', yesterday.toISOString())
        .eq('status', 'COMPLETED');

      const totalVolume24h = transactions24h?.reduce((sum: number, tx: any) => sum + tx.amount, 0) || 0;

      // Get total active investments
      const { data: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('amount')
        .eq('status', 'ACTIVE');

      const totalInvestments = activeSubscriptions?.reduce((sum: number, sub: any) => sum + sub.amount, 0) || 0;

      // Get pending transactions count
      const { count: pendingTransactions } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING');

      return {
        totalUsers: totalUsers || 0,
        totalVolume24h,
        totalInvestments,
        pendingTransactions: pendingTransactions || 0
      };
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      return {
        totalUsers: 0,
        totalVolume24h: 0,
        totalInvestments: 0,
        pendingTransactions: 0
      };
    }
  }
}

export const db = DatabaseService.getInstance();
