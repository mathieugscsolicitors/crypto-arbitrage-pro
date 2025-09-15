import { db } from '../lib/database';
import { cryptoAPI } from '../lib/api';
import type { Transaction } from '../lib/database';

export interface WalletBalance {
  asset: 'BTC' | 'ETH' | 'USDT' | 'USDC';
  balance: number;
  usdValue: number;
  change24h: number;
  address: string;
}

export interface TransactionRequest {
  type: 'DEPOSIT' | 'WITHDRAW' | 'EXCHANGE' | 'INVEST';
  asset: 'BTC' | 'ETH' | 'USDT' | 'USDC';
  amount: number;
  fromAsset?: string;
  toAsset?: string;
  toAddress?: string;
  planId?: string;
  notes?: string;
}

export class WalletService {
  private static instance: WalletService;

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  async getUserWalletBalances(userId: string): Promise<WalletBalance[]> {
    try {
      const wallets = await db.getUserWallets(userId);
      const rates = cryptoAPI.getCurrentRates();
      
      return wallets.map(wallet => {
        const rate = rates[wallet.asset];
        const usdValue = wallet.balance * (rate?.price || 0);
        
        return {
          asset: wallet.asset,
          balance: wallet.balance,
          usdValue,
          change24h: rate?.change24h || 0,
          address: wallet.address || ''
        };
      });
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      return [];
    }
  }

  async getTotalPortfolioValue(userId: string): Promise<number> {
    const balances = await this.getUserWalletBalances(userId);
    return balances.reduce((total, wallet) => total + wallet.usdValue, 0);
  }

  async createTransaction(userId: string, request: TransactionRequest): Promise<void> {
    try {
      const validation = await this.validateTransaction(userId, request);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Create transaction record
      const transaction = await db.createTransaction({
        user_id: userId,
        type: request.type,
        asset: request.asset,
        amount: request.amount,
        status: 'PENDING',
        from_asset: request.fromAsset,
        to_asset: request.toAsset,
        plan_id: request.planId,
        notes: request.notes
      });

      if (transaction) {
        // Process transaction based on type
        await this.processTransaction(transaction);

        // Create audit log
        await db.createAuditLog({
          user_id: userId,
          action: `TRANSACTION_${request.type}`,
          resource: 'transactions',
          resource_id: transaction.id,
          details: request
        });
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async processDeposit(userId: string, asset: 'BTC' | 'ETH' | 'USDT' | 'USDC', amount: number): Promise<boolean> {
    try {
      const wallets = await db.getUserWallets(userId);
      const wallet = wallets.find(w => w.asset === asset);
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Update wallet balance
      const updatedWallet = await db.updateWalletBalance(wallet.id, wallet.balance + amount);
      
      if (!updatedWallet) {
        throw new Error('Failed to update wallet balance');
      }

      return true;
    } catch (error) {
      console.error('Error processing deposit:', error);
      return false;
    }
  }

  async processWithdrawal(userId: string, asset: 'BTC' | 'ETH' | 'USDT' | 'USDC', amount: number, toAddress: string): Promise<boolean> {
    try {
      const wallets = await db.getUserWallets(userId);
      const wallet = wallets.find(w => w.asset === asset);
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Calculate network fee
      const networkFee = this.getNetworkFee(asset);
      const totalDeduction = amount + networkFee.amount;

      if (wallet.balance < totalDeduction) {
        throw new Error('Insufficient balance for fees');
      }

      // Update wallet balance
      const updatedWallet = await db.updateWalletBalance(wallet.id, wallet.balance - totalDeduction);
      
      if (!updatedWallet) {
        throw new Error('Failed to update wallet balance');
      }

      // In a real implementation, this would trigger the actual blockchain transaction
      // For now, we'll simulate the withdrawal process

      return true;
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      return false;
    }
  }

  async processExchange(userId: string, fromAsset: string, toAsset: string, amount: number): Promise<boolean> {
    try {
      const wallets = await db.getUserWallets(userId);
      const fromWallet = wallets.find(w => w.asset === fromAsset);
      const toWallet = wallets.find(w => w.asset === toAsset);
      
      if (!fromWallet || !toWallet) {
        throw new Error('Wallet not found');
      }

      if (fromWallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Calculate exchange rate and fees
      const exchangeRate = cryptoAPI.convertCrypto(1, fromAsset, toAsset);
      const exchangeFee = 0.001; // 0.1% exchange fee
      const receivedAmount = (amount * exchangeRate) * (1 - exchangeFee);

      // Update balances
      await db.updateWalletBalance(fromWallet.id, fromWallet.balance - amount);
      await db.updateWalletBalance(toWallet.id, toWallet.balance + receivedAmount);

      return true;
    } catch (error) {
      console.error('Error processing exchange:', error);
      return false;
    }
  }

  async getUserTransactionHistory(userId: string, limit = 20, offset = 0): Promise<Transaction[]> {
    try {
      return await db.getUserTransactions(userId, limit, offset);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  async getTransactionById(transactionId: string): Promise<Transaction | null> {
    try {
      const { data, error } = await db.supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

  private async validateTransaction(userId: string, request: TransactionRequest): Promise<{ valid: boolean; error?: string }> {
    try {
      const wallets = await db.getUserWallets(userId);
      
      switch (request.type) {
        case 'WITHDRAW':
        case 'EXCHANGE':
          const wallet = wallets.find(w => w.asset === request.asset);
          if (!wallet) {
            return { valid: false, error: 'Wallet not found' };
          }
          
          if (wallet.balance < request.amount) {
            return { valid: false, error: 'Insufficient balance' };
          }
          
          // Check minimum withdrawal amounts
          const minAmounts = { BTC: 0.001, ETH: 0.01, USDT: 10, USDC: 10 };
          if (request.amount < minAmounts[request.asset]) {
            return { valid: false, error: `Minimum ${request.asset} amount is ${minAmounts[request.asset]}` };
          }
          break;
          
        case 'DEPOSIT':
          // Deposits are always valid (external validation)
          break;
          
        case 'INVEST':
          const investWallet = wallets.find(w => w.asset === request.asset);
          if (!investWallet || investWallet.balance < request.amount) {
            return { valid: false, error: 'Insufficient balance for investment' };
          }
          break;
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Validation failed' };
    }
  }

  private async processTransaction(transaction: Transaction): Promise<void> {
    try {
      let success = false;
      
      switch (transaction.type) {
        case 'DEPOSIT':
          success = await this.processDeposit(transaction.user_id, transaction.asset, transaction.amount);
          break;
          
        case 'WITHDRAW':
          // Withdrawals need manual approval for security
          // Mark as pending and notify admins
          await db.createNotification({
            user_id: transaction.user_id,
            title: 'Withdrawal Request Submitted',
            message: `Your withdrawal request for ${transaction.amount} ${transaction.asset} has been submitted and is pending approval.`,
            type: 'INFO'
          });
          return; // Keep as PENDING
          
        case 'EXCHANGE':
          if (transaction.from_asset && transaction.to_asset) {
            success = await this.processExchange(
              transaction.user_id, 
              transaction.from_asset, 
              transaction.to_asset, 
              transaction.amount
            );
          }
          break;
          
        case 'INVEST':
          // Investment processing would be handled by investment service
          success = true; // For now, mark as successful
          break;
      }
      
      // Update transaction status
      if (success) {
        await db.updateTransactionStatus(transaction.id, 'COMPLETED');
        
        // Create success notification
        await db.createNotification({
          user_id: transaction.user_id,
          title: 'Transaction Completed',
          message: `Your ${transaction.type.toLowerCase()} of ${transaction.amount} ${transaction.asset} has been completed successfully.`,
          type: 'SUCCESS'
        });
      } else {
        await db.updateTransactionStatus(transaction.id, 'REJECTED');
        
        // Create failure notification
        await db.createNotification({
          user_id: transaction.user_id,
          title: 'Transaction Failed',
          message: `Your ${transaction.type.toLowerCase()} of ${transaction.amount} ${transaction.asset} has failed. Please contact support if you need assistance.`,
          type: 'ERROR'
        });
      }
    } catch (error) {
      console.error('Error processing transaction:', error);
      await db.updateTransactionStatus(transaction.id, 'REJECTED');
    }
  }

  private getNetworkFee(asset: string): { amount: number; usd: number } {
    const fees = {
      BTC: { amount: 0.0001, usd: 4.32 },
      ETH: { amount: 0.002, usd: 5.30 },
      USDT: { amount: 1.0, usd: 1.00 },
      USDC: { amount: 1.0, usd: 1.00 }
    };
    return fees[asset as keyof typeof fees] || fees.BTC;
  }

  // Admin functions
  async getMasterWalletBalances(): Promise<WalletBalance[]> {
    try {
      const masterWallets = await db.getMasterWallets();
      const rates = cryptoAPI.getCurrentRates();
      
      return masterWallets.map(wallet => {
        const rate = rates[wallet.asset];
        const usdValue = wallet.balance * (rate?.price || 0);
        
        return {
          asset: wallet.asset,
          balance: wallet.balance,
          usdValue,
          change24h: rate?.change24h || 0,
          address: wallet.address || ''
        };
      });
    } catch (error) {
      console.error('Error fetching master wallet balances:', error);
      return [];
    }
  }

  async getAllTransactions(limit = 50, offset = 0): Promise<Transaction[]> {
    try {
      return await db.getAllTransactions(limit, offset);
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      return [];
    }
  }

  async approveWithdrawal(transactionId: string, adminId: string): Promise<boolean> {
    try {
      const transaction = await this.getTransactionById(transactionId);
      if (!transaction || transaction.type !== 'WITHDRAW' || transaction.status !== 'PENDING') {
        return false;
      }

      // Process the withdrawal
      const success = await this.processWithdrawal(
        transaction.user_id,
        transaction.asset,
        transaction.amount,
        'external_address' // In real implementation, this would be from the transaction
      );

      if (success) {
        await db.updateTransactionStatus(transactionId, 'COMPLETED');
        
        // Create audit log
        await db.createAuditLog({
          user_id: adminId,
          action: 'WITHDRAWAL_APPROVED',
          resource: 'transactions',
          resource_id: transactionId,
          details: { transactionId, adminId }
        });

        // Notify user
        await db.createNotification({
          user_id: transaction.user_id,
          title: 'Withdrawal Approved',
          message: `Your withdrawal of ${transaction.amount} ${transaction.asset} has been approved and processed.`,
          type: 'SUCCESS'
        });
      }

      return success;
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      return false;
    }
  }

  async rejectWithdrawal(transactionId: string, adminId: string, reason: string): Promise<boolean> {
    try {
      const transaction = await this.getTransactionById(transactionId);
      if (!transaction || transaction.type !== 'WITHDRAW' || transaction.status !== 'PENDING') {
        return false;
      }

      await db.updateTransactionStatus(transactionId, 'REJECTED');
      
      // Create audit log
      await db.createAuditLog({
        user_id: adminId,
        action: 'WITHDRAWAL_REJECTED',
        resource: 'transactions',
        resource_id: transactionId,
        details: { transactionId, adminId, reason }
      });

      // Notify user
      await db.createNotification({
        user_id: transaction.user_id,
        title: 'Withdrawal Rejected',
        message: `Your withdrawal of ${transaction.amount} ${transaction.asset} has been rejected. Reason: ${reason}`,
        type: 'ERROR'
      });

      return true;
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      return false;
    }
  }
}

export const walletService = WalletService.getInstance();
