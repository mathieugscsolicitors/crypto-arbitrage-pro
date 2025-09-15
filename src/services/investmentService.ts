import { db } from '../lib/database';
import { walletService } from './walletService';
import type { Plan, Subscription } from '../lib/database';

export interface Investment {
  id: string;
  planName: string;
  planId: string;
  amount: number;
  apy: number;
  startDate: string;
  endDate: string;
  totalEarned: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  durationDays: number;
}

export interface InvestmentRequest {
  planId: string;
  amount: number;
  asset: 'BTC' | 'ETH' | 'USDT' | 'USDC';
}

export class InvestmentService {
  private static instance: InvestmentService;

  static getInstance(): InvestmentService {
    if (!InvestmentService.instance) {
      InvestmentService.instance = new InvestmentService();
    }
    return InvestmentService.instance;
  }

  async getAvailablePlans(): Promise<Plan[]> {
    try {
      return await db.getActivePlans();
    } catch (error) {
      console.error('Error fetching available plans:', error);
      return [];
    }
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    try {
      return await db.getUserSubscriptions(userId);
    } catch (error) {
      console.error('Error fetching user investments:', error);
      return [];
    }
  }

  async getInvestmentPlan(planId: string): Promise<Plan | null> {
    try {
      const plans = await db.getActivePlans();
      return plans.find(p => p.id === planId) || null;
    } catch (error) {
      console.error('Error fetching investment plan:', error);
      return null;
    }
  }

  async getUserInvestments(userId: string): Promise<Investment[]> {
    try {
      const subscriptions = await db.getUserSubscriptions(userId);
      
      return subscriptions.map(sub => ({
        id: sub.id,
        planName: (sub as any).plans?.name || 'Unknown Plan',
        planId: sub.plan_id,
        amount: sub.amount,
        apy: (sub as any).plans?.apy || 0,
        startDate: sub.start_date,
        endDate: sub.end_date,
        totalEarned: sub.total_earned,
        status: sub.status,
        durationDays: (sub as any).plans?.duration_days || 0
      }));
    } catch (error) {
      console.error('Error fetching user investments:', error);
      return [];
    }
  }

  async createInvestment(userId: string, request: InvestmentRequest): Promise<{ success: boolean; error?: string; subscriptionId?: string }> {
    try {
      // Validate investment request
      const validation = await this.validateInvestment(userId, request);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const plan = validation.plan!;

      // Check user wallet balance
      const wallets = await db.getUserWallets(userId);
      const wallet = wallets.find(w => w.asset === request.asset);
      
      if (!wallet || wallet.balance < request.amount) {
        return { success: false, error: 'Insufficient balance' };
      }

      // Create investment transaction
      const transaction = await walletService.createTransaction(userId, {
        type: 'INVEST',
        asset: request.asset,
        amount: request.amount,
        planId: request.planId,
        notes: `Investment in ${plan.name} plan`
      });

      if (!transaction) {
        return { success: false, error: 'Failed to create investment transaction' };
      }

      // Calculate end date
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration_days);

      // Create subscription
      const subscription = await db.createSubscription({
        user_id: userId,
        plan_id: request.planId,
        amount: request.amount,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'ACTIVE',
        total_earned: 0
      });

      if (!subscription) {
        return { success: false, error: 'Failed to create investment subscription' };
      }

      // Deduct amount from wallet
      await db.updateWalletBalance(wallet.id, wallet.balance - request.amount);

      // Create audit log
      await db.createAuditLog({
        user_id: userId,
        action: 'INVESTMENT_CREATED',
        resource: 'subscriptions',
        resource_id: subscription.id,
        details: { planId: request.planId, amount: request.amount, asset: request.asset }
      });

      // Create notification
      await db.createNotification({
        user_id: userId,
        title: 'Investment Created',
        message: `Your investment of ${request.amount} ${request.asset} in the ${plan.name} plan has been created successfully.`,
        type: 'SUCCESS'
      });

      return { success: true, subscriptionId: subscription.id };
    } catch (error) {
      console.error('Error creating investment:', error);
      return { success: false, error: 'Failed to create investment' };
    }
  }

  async cancelInvestment(userId: string, subscriptionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get subscription
      const { data: subscription, error } = await db.supabase
        .from('subscriptions')
        .select('*, plans (*)')
        .eq('id', subscriptionId)
        .eq('user_id', userId)
        .single();

      if (error || !subscription) {
        return { success: false, error: 'Investment not found' };
      }

      if (subscription.status !== 'ACTIVE') {
        return { success: false, error: 'Investment is not active' };
      }

      // Calculate penalty (if any) and refund amount
      const daysSinceStart = Math.floor(
        (new Date().getTime() - new Date(subscription.start_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      let refundAmount = subscription.amount;
      let penalty = 0;

      // Apply early cancellation penalty (5% if cancelled within first 30 days)
      if (daysSinceStart < 30) {
        penalty = subscription.amount * 0.05;
        refundAmount = subscription.amount - penalty;
      }

      // Update subscription status
      await db.updateSubscription(subscriptionId, {
        status: 'CANCELLED'
      });

      // Refund to wallet (find USDT wallet for refunds)
      const wallets = await db.getUserWallets(userId);
      const usdtWallet = wallets.find(w => w.asset === 'USDT');
      
      if (usdtWallet) {
        await db.updateWalletBalance(usdtWallet.id, usdtWallet.balance + refundAmount);
      }

      // Create refund transaction
      await db.createTransaction({
        user_id: userId,
        type: 'DEPOSIT',
        asset: 'USDT',
        amount: refundAmount,
        status: 'COMPLETED',
        notes: `Refund from cancelled investment (Subscription: ${subscriptionId})`
      });

      // Create audit log
      await db.createAuditLog({
        user_id: userId,
        action: 'INVESTMENT_CANCELLED',
        resource: 'subscriptions',
        resource_id: subscriptionId,
        details: { refundAmount, penalty, daysSinceStart }
      });

      // Create notification
      await db.createNotification({
        user_id: userId,
        title: 'Investment Cancelled',
        message: `Your investment has been cancelled. Refund amount: ${refundAmount} USDT${penalty > 0 ? ` (Penalty: ${penalty} USDT)` : ''}.`,
        type: 'INFO'
      });

      return { success: true };
    } catch (error) {
      console.error('Error cancelling investment:', error);
      return { success: false, error: 'Failed to cancel investment' };
    }
  }

  async processEarnings(): Promise<void> {
    try {
      // Get all active subscriptions
      const { data: activeSubscriptions, error } = await db.supabase
        .from('subscriptions')
        .select('*, plans (*)')
        .eq('status', 'ACTIVE');

      if (error || !activeSubscriptions) {
        console.error('Error fetching active subscriptions:', error);
        return;
      }

      for (const subscription of activeSubscriptions) {
        const plan = (subscription as any).plans;
        if (!plan) continue;

        // Calculate daily earnings
        const dailyRate = plan.apy / 365 / 100;
        const dailyEarnings = subscription.amount * dailyRate;

        // Update total earned
        const newTotalEarned = subscription.total_earned + dailyEarnings;

        await db.updateSubscription(subscription.id, {
          total_earned: newTotalEarned
        });

        // Add earnings to user's USDT wallet
        const wallets = await db.getUserWallets(subscription.user_id);
        const usdtWallet = wallets.find(w => w.asset === 'USDT');
        
        if (usdtWallet) {
          await db.updateWalletBalance(usdtWallet.id, usdtWallet.balance + dailyEarnings);
        }

        // Create earnings transaction
        await db.createTransaction({
          user_id: subscription.user_id,
          type: 'DEPOSIT',
          asset: 'USDT',
          amount: dailyEarnings,
          status: 'COMPLETED',
          notes: `Daily earnings from ${plan.name} plan`
        });

        // Check if investment period is complete
        const endDate = new Date(subscription.end_date);
        const now = new Date();
        
        if (now >= endDate) {
          await db.updateSubscription(subscription.id, {
            status: 'COMPLETED'
          });

          // Return principal amount
          if (usdtWallet) {
            await db.updateWalletBalance(usdtWallet.id, usdtWallet.balance + subscription.amount);
          }

          // Create principal return transaction
          await db.createTransaction({
            user_id: subscription.user_id,
            type: 'DEPOSIT',
            asset: 'USDT',
            amount: subscription.amount,
            status: 'COMPLETED',
            notes: `Principal return from completed ${plan.name} plan`
          });

          // Create completion notification
          await db.createNotification({
            user_id: subscription.user_id,
            title: 'Investment Completed',
            message: `Your ${plan.name} investment has completed successfully. Total earned: ${newTotalEarned.toFixed(2)} USDT`,
            type: 'SUCCESS'
          });
        }
      }

      console.log(`Processed earnings for ${activeSubscriptions.length} active investments`);
    } catch (error) {
      console.error('Error processing earnings:', error);
    }
  }

  private async validateInvestment(userId: string, request: InvestmentRequest): Promise<{ valid: boolean; error?: string; plan?: Plan }> {
    try {
      // Get plan details
      const { data: plan, error } = await db.supabase
        .from('plans')
        .select('*')
        .eq('id', request.planId)
        .eq('is_active', true)
        .single();

      if (error || !plan) {
        return { valid: false, error: 'Plan not found or inactive' };
      }

      // Check minimum amount
      if (request.amount < plan.min_amount) {
        return { valid: false, error: `Minimum investment amount is ${plan.min_amount}` };
      }

      // Check maximum amount
      if (plan.max_amount && request.amount > plan.max_amount) {
        return { valid: false, error: `Maximum investment amount is ${plan.max_amount}` };
      }

      return { valid: true, plan };
    } catch (error) {
      return { valid: false, error: 'Validation failed' };
    }
  }

  // Admin functions
  async getAllInvestments(limit = 50, offset = 0): Promise<Investment[]> {
    try {
      const { data: subscriptions, error } = await db.supabase
        .from('subscriptions')
        .select('*, plans (*), users (email, first_name, last_name)')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return (subscriptions || []).map(sub => ({
        id: sub.id,
        planName: (sub as any).plans?.name || 'Unknown Plan',
        planId: sub.plan_id,
        amount: sub.amount,
        apy: (sub as any).plans?.apy || 0,
        startDate: sub.start_date,
        endDate: sub.end_date,
        totalEarned: sub.total_earned,
        status: sub.status,
        durationDays: (sub as any).plans?.duration_days || 0,
        userEmail: (sub as any).users?.email,
        userName: `${(sub as any).users?.first_name || ''} ${(sub as any).users?.last_name || ''}`.trim()
      }));
    } catch (error) {
      console.error('Error fetching all investments:', error);
      return [];
    }
  }

  async getInvestmentStats(): Promise<{
    totalActiveInvestments: number;
    totalInvestedAmount: number;
    totalEarningsPaid: number;
    averageAPY: number;
  }> {
    try {
      const { data: stats } = await db.supabase
        .from('subscriptions')
        .select('amount, total_earned, status, plans (apy)')
        .eq('status', 'ACTIVE');

      const totalActiveInvestments = stats?.length || 0;
      const totalInvestedAmount = stats?.reduce((sum, sub) => sum + sub.amount, 0) || 0;
      const totalEarningsPaid = stats?.reduce((sum, sub) => sum + sub.total_earned, 0) || 0;
      const averageAPY = stats?.length ? 
        stats.reduce((sum, sub) => sum + ((sub as any).plans?.apy || 0), 0) / stats.length : 0;

      return {
        totalActiveInvestments,
        totalInvestedAmount,
        totalEarningsPaid,
        averageAPY
      };
    } catch (error) {
      console.error('Error fetching investment stats:', error);
      return {
        totalActiveInvestments: 0,
        totalInvestedAmount: 0,
        totalEarningsPaid: 0,
        averageAPY: 0
      };
    }
  }

  async createPlan(planData: {
    name: string;
    duration_days: number;
    apy: number;
    min_amount: number;
    max_amount?: number;
    description?: string;
  }): Promise<Plan | null> {
    try {
      const plan = await db.createPlan({
        ...planData,
        is_active: true
      });

      if (plan) {
        // Create audit log
        await db.createAuditLog({
          user_id: null, // System action
          action: 'PLAN_CREATED',
          resource: 'plans',
          resource_id: plan.id,
          details: planData
        });
      }

      return plan;
    } catch (error) {
      console.error('Error creating plan:', error);
      return null;
    }
  }

  async updatePlan(planId: string, updates: Partial<Plan>): Promise<Plan | null> {
    try {
      const plan = await db.updatePlan(planId, updates);

      if (plan) {
        // Create audit log
        await db.createAuditLog({
          user_id: null, // System action
          action: 'PLAN_UPDATED',
          resource: 'plans',
          resource_id: planId,
          details: updates
        });
      }

      return plan;
    } catch (error) {
      console.error('Error updating plan:', error);
      return null;
    }
  }
}

export const investmentService = InvestmentService.getInstance();
