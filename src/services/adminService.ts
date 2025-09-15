import { db } from '../lib/database';
import { walletService } from './walletService';
import { investmentService } from './investmentService';
import type { User, Transaction, AuditLog } from '../lib/database';

export interface AdminStats {
  totalUsers: number;
  totalVolume24h: number;
  totalInvestments: number;
  pendingTransactions: number;
  totalMasterWalletValue: number;
}

export interface UserManagement {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  lastLogin?: string;
  totalInvested: number;
  totalEarned: number;
}

export class AdminService {
  private static instance: AdminService;

  static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  async getDashboardStats(): Promise<AdminStats> {
    try {
      const [platformStats, masterWallets] = await Promise.all([
        db.getPlatformStats(),
        walletService.getMasterWalletBalances()
      ]);

      const totalMasterWalletValue = masterWallets.reduce((sum, wallet) => sum + wallet.usdValue, 0);

      return {
        totalUsers: platformStats.totalUsers,
        totalVolume24h: platformStats.totalVolume24h,
        totalInvestments: platformStats.totalInvestments,
        pendingTransactions: platformStats.pendingTransactions,
        totalMasterWalletValue
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalUsers: 0,
        totalVolume24h: 0,
        totalInvestments: 0,
        pendingTransactions: 0,
        totalMasterWalletValue: 0
      };
    }
  }

  async getAllUsers(limit = 50, offset = 0): Promise<UserManagement[]> {
    try {
      const users = await db.getAllUsers(limit, offset);
      
      // Get additional user data
      const userManagementData = await Promise.all(
        users.map(async (user) => {
          const [subscriptions, transactions] = await Promise.all([
            db.getUserSubscriptions(user.id),
            db.getUserTransactions(user.id, 1000) // Get all transactions for totals
          ]);

          const totalInvested = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
          const totalEarned = subscriptions.reduce((sum, sub) => sum + sub.total_earned, 0);

          return {
            id: user.id,
            email: user.email,
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            role: user.role,
            status: user.status,
            createdAt: user.created_at,
            totalInvested,
            totalEarned
          };
        })
      );

      return userManagementData;
    } catch (error) {
      console.error('Error fetching users for management:', error);
      return [];
    }
  }

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED', adminId: string): Promise<boolean> {
    try {
      const updatedUser = await db.updateUser(userId, { status });
      
      if (!updatedUser) {
        return false;
      }

      // Create audit log
      await db.createAuditLog({
        user_id: adminId,
        action: 'USER_STATUS_CHANGED',
        resource: 'users',
        resource_id: userId,
        details: { newStatus: status, adminId }
      });

      // Notify user
      await db.createNotification({
        user_id: userId,
        title: status === 'SUSPENDED' ? 'Account Suspended' : 'Account Reactivated',
        message: status === 'SUSPENDED' 
          ? 'Your account has been suspended. Please contact support for more information.'
          : 'Your account has been reactivated. You can now access all features.',
        type: status === 'SUSPENDED' ? 'WARNING' : 'SUCCESS'
      });

      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  }

  async updateUserRole(userId: string, role: 'CLIENT' | 'ADMIN', adminId: string): Promise<boolean> {
    try {
      const updatedUser = await db.updateUser(userId, { role });
      
      if (!updatedUser) {
        return false;
      }

      // Create audit log
      await db.createAuditLog({
        user_id: adminId,
        action: 'USER_ROLE_CHANGED',
        resource: 'users',
        resource_id: userId,
        details: { newRole: role, adminId }
      });

      // Notify user
      await db.createNotification({
        user_id: userId,
        title: 'Role Updated',
        message: `Your account role has been updated to ${role}.`,
        type: 'INFO'
      });

      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    try {
      const { data: transactions, error } = await db.supabase
        .from('transactions')
        .select(`
          *,
          users (email, first_name, last_name)
        `)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return transactions || [];
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
      return [];
    }
  }

  async approveTransaction(transactionId: string, adminId: string): Promise<boolean> {
    try {
      const { data: transaction, error } = await db.supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error || !transaction) {
        return false;
      }

      let success = false;

      switch (transaction.type) {
        case 'WITHDRAW':
          success = await walletService.approveWithdrawal(transactionId, adminId);
          break;
        default:
          // For other transaction types, just mark as completed
          await db.updateTransactionStatus(transactionId, 'COMPLETED');
          success = true;
      }

      if (success) {
        // Create audit log
        await db.createAuditLog({
          user_id: adminId,
          action: 'TRANSACTION_APPROVED',
          resource: 'transactions',
          resource_id: transactionId,
          details: { transactionId, adminId, type: transaction.type }
        });
      }

      return success;
    } catch (error) {
      console.error('Error approving transaction:', error);
      return false;
    }
  }

  async rejectTransaction(transactionId: string, adminId: string, reason: string): Promise<boolean> {
    try {
      const { data: transaction, error } = await db.supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error || !transaction) {
        return false;
      }

      let success = false;

      switch (transaction.type) {
        case 'WITHDRAW':
          success = await walletService.rejectWithdrawal(transactionId, adminId, reason);
          break;
        default:
          // For other transaction types, just mark as rejected
          await db.updateTransactionStatus(transactionId, 'REJECTED');
          
          // Notify user
          await db.createNotification({
            user_id: transaction.user_id,
            title: 'Transaction Rejected',
            message: `Your ${transaction.type.toLowerCase()} transaction has been rejected. Reason: ${reason}`,
            type: 'ERROR'
          });
          success = true;
      }

      if (success) {
        // Create audit log
        await db.createAuditLog({
          user_id: adminId,
          action: 'TRANSACTION_REJECTED',
          resource: 'transactions',
          resource_id: transactionId,
          details: { transactionId, adminId, reason, type: transaction.type }
        });
      }

      return success;
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      return false;
    }
  }

  async getRecentActivity(limit = 20): Promise<AuditLog[]> {
    try {
      return await db.getAuditLogs(limit, 0);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  async getUserDetails(userId: string): Promise<{
    user: User | null;
    wallets: any[];
    transactions: Transaction[];
    investments: any[];
    notifications: any[];
  }> {
    try {
      const [user, wallets, transactions, investments, notifications] = await Promise.all([
        db.getUserById(userId),
        walletService.getUserWalletBalances(userId),
        db.getUserTransactions(userId, 50),
        investmentService.getUserInvestments(userId),
        db.getUserNotifications(userId, 20)
      ]);

      return {
        user,
        wallets,
        transactions,
        investments,
        notifications
      };
    } catch (error) {
      console.error('Error fetching user details:', error);
      return {
        user: null,
        wallets: [],
        transactions: [],
        investments: [],
        notifications: []
      };
    }
  }

  async adjustUserWallet(
    userId: string, 
    asset: 'BTC' | 'ETH' | 'USDT' | 'USDC', 
    amount: number, 
    type: 'ADD' | 'SUBTRACT',
    adminId: string,
    reason: string
  ): Promise<boolean> {
    try {
      const wallets = await db.getUserWallets(userId);
      const wallet = wallets.find(w => w.asset === asset);
      
      if (!wallet) {
        return false;
      }

      const newBalance = type === 'ADD' 
        ? wallet.balance + amount 
        : Math.max(0, wallet.balance - amount);

      await db.updateWalletBalance(wallet.id, newBalance);

      // Create adjustment transaction
      await db.createTransaction({
        user_id: userId,
        type: type === 'ADD' ? 'DEPOSIT' : 'WITHDRAW',
        asset,
        amount,
        status: 'COMPLETED',
        notes: `Admin adjustment: ${reason}`
      });

      // Create audit log
      await db.createAuditLog({
        user_id: adminId,
        action: 'WALLET_ADJUSTMENT',
        resource: 'wallets',
        resource_id: wallet.id,
        details: { 
          userId, 
          asset, 
          amount, 
          type, 
          reason, 
          adminId,
          oldBalance: wallet.balance,
          newBalance
        }
      });

      // Notify user
      await db.createNotification({
        user_id: userId,
        title: 'Wallet Adjustment',
        message: `Your ${asset} wallet has been ${type === 'ADD' ? 'credited' : 'debited'} with ${amount} ${asset}. Reason: ${reason}`,
        type: 'INFO'
      });

      return true;
    } catch (error) {
      console.error('Error adjusting user wallet:', error);
      return false;
    }
  }

  async updateCryptoRates(adminId: string): Promise<boolean> {
    try {
      // This would typically fetch from external API
      // For now, we'll simulate rate updates
      const rates = [
        { symbol: 'BTC', price_usd: 43250.75, change_24h: 2.34 },
        { symbol: 'ETH', price_usd: 2680.50, change_24h: -0.87 },
        { symbol: 'USDT', price_usd: 1.0001, change_24h: 0.01 },
        { symbol: 'USDC', price_usd: 0.9999, change_24h: -0.01 }
      ];

      const rateInserts = rates.map(rate => ({
        symbol: rate.symbol,
        price_usd: rate.price_usd,
        change_24h: rate.change_24h,
        last_updated: new Date().toISOString()
      }));

      const success = await db.updateRatesCache(rateInserts);

      if (success) {
        // Create audit log
        await db.createAuditLog({
          user_id: adminId,
          action: 'RATES_UPDATED',
          resource: 'rates_cache',
          resource_id: null,
          details: { rates, adminId }
        });
      }

      return success;
    } catch (error) {
      console.error('Error updating crypto rates:', error);
      return false;
    }
  }

  async generateReport(
    type: 'USERS' | 'TRANSACTIONS' | 'INVESTMENTS' | 'WALLETS',
    dateFrom: string,
    dateTo: string
  ): Promise<any[]> {
    try {
      switch (type) {
        case 'USERS':
          const { data: users } = await db.supabase
            .from('users')
            .select('*')
            .gte('created_at', dateFrom)
            .lte('created_at', dateTo)
            .order('created_at', { ascending: false });
          return users || [];

        case 'TRANSACTIONS':
          const { data: transactions } = await db.supabase
            .from('transactions')
            .select(`
              *,
              users (email, first_name, last_name)
            `)
            .gte('created_at', dateFrom)
            .lte('created_at', dateTo)
            .order('created_at', { ascending: false });
          return transactions || [];

        case 'INVESTMENTS':
          const { data: investments } = await db.supabase
            .from('subscriptions')
            .select(`
              *,
              plans (*),
              users (email, first_name, last_name)
            `)
            .gte('created_at', dateFrom)
            .lte('created_at', dateTo)
            .order('created_at', { ascending: false });
          return investments || [];

        case 'WALLETS':
          const { data: wallets } = await db.supabase
            .from('wallets')
            .select(`
              *,
              users (email, first_name, last_name)
            `)
            .gte('created_at', dateFrom)
            .lte('created_at', dateTo)
            .order('created_at', { ascending: false });
          return wallets || [];

        default:
          return [];
      }
    } catch (error) {
      console.error('Error generating report:', error);
      return [];
    }
  }

  async sendBulkNotification(
    userIds: string[],
    title: string,
    message: string,
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR',
    adminId: string
  ): Promise<boolean> {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        title,
        message,
        type
      }));

      const { error } = await db.supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      // Create audit log
      await db.createAuditLog({
        user_id: adminId,
        action: 'BULK_NOTIFICATION_SENT',
        resource: 'notifications',
        resource_id: null,
        details: { 
          userCount: userIds.length, 
          title, 
          message, 
          type, 
          adminId 
        }
      });

      return true;
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      return false;
    }
  }

  async getSystemHealth(): Promise<{
    database: boolean;
    externalAPIs: boolean;
    backgroundJobs: boolean;
    lastBackup: string | null;
  }> {
    try {
      // Check database connectivity
      const { error: dbError } = await db.supabase
        .from('users')
        .select('id')
        .limit(1);

      const database = !dbError;

      // In a real implementation, these would check actual services
      const externalAPIs = true; // Check crypto price APIs, etc.
      const backgroundJobs = true; // Check if earnings processing is running
      const lastBackup = new Date().toISOString(); // Get actual backup timestamp

      return {
        database,
        externalAPIs,
        backgroundJobs,
        lastBackup
      };
    } catch (error) {
      console.error('Error checking system health:', error);
      return {
        database: false,
        externalAPIs: false,
        backgroundJobs: false,
        lastBackup: null
      };
    }
  }
}

export const adminService = AdminService.getInstance();
