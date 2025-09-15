import { db } from '../lib/database';
import type { Notification } from '../lib/database';

export interface NotificationRequest {
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
}

export class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async createNotification(request: NotificationRequest): Promise<Notification | null> {
    try {
      return await db.createNotification({
        user_id: request.userId,
        title: request.title,
        message: request.message,
        type: request.type,
        is_read: false
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  async getUserNotifications(userId: string, limit = 20): Promise<Notification[]> {
    try {
      return await db.getUserNotifications(userId, limit);
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const result = await db.markNotificationAsRead(notificationId);
      return result !== null;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await db.supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      return !error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await db.supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await db.supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      return !error;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // System notifications for common events
  async notifyDeposit(userId: string, amount: number, asset: string): Promise<void> {
    await this.createNotification({
      userId,
      title: 'Dépôt Reçu',
      message: `Votre dépôt de ${amount} ${asset} a été traité avec succès.`,
      type: 'SUCCESS'
    });
  }

  async notifyWithdrawal(userId: string, amount: number, asset: string): Promise<void> {
    await this.createNotification({
      userId,
      title: 'Retrait Traité',
      message: `Votre retrait de ${amount} ${asset} a été traité avec succès.`,
      type: 'SUCCESS'
    });
  }

  async notifyInvestmentCreated(userId: string, amount: number, planName: string): Promise<void> {
    await this.createNotification({
      userId,
      title: 'Investissement Créé',
      message: `Votre investissement de ${amount} USDT dans le plan ${planName} a été créé avec succès.`,
      type: 'SUCCESS'
    });
  }

  async notifyInvestmentCompleted(userId: string, amount: number, earned: number, planName: string): Promise<void> {
    await this.createNotification({
      userId,
      title: 'Investissement Terminé',
      message: `Votre investissement de ${amount} USDT dans le plan ${planName} est terminé. Vous avez gagné ${earned} USDT.`,
      type: 'SUCCESS'
    });
  }

  async notifyEarnings(userId: string, amount: number): Promise<void> {
    await this.createNotification({
      userId,
      title: 'Gains Quotidiens',
      message: `Vous avez reçu ${amount.toFixed(2)} USDT de gains quotidiens.`,
      type: 'INFO'
    });
  }

  async notifySecurityAlert(userId: string, action: string): Promise<void> {
    await this.createNotification({
      userId,
      title: 'Alerte Sécurité',
      message: `Action de sécurité détectée: ${action}. Si ce n'était pas vous, contactez immédiatement le support.`,
      type: 'WARNING'
    });
  }

  async notifyMaintenanceScheduled(userId: string, date: string): Promise<void> {
    await this.createNotification({
      userId,
      title: 'Maintenance Programmée',
      message: `Une maintenance système est programmée le ${date}. Les services pourraient être temporairement indisponibles.`,
      type: 'INFO'
    });
  }

  async notifyAccountSuspended(userId: string, reason: string): Promise<void> {
    await this.createNotification({
      userId,
      title: 'Compte Suspendu',
      message: `Votre compte a été suspendu. Raison: ${reason}. Contactez le support pour plus d'informations.`,
      type: 'ERROR'
    });
  }

  async notifyAccountReactivated(userId: string): Promise<void> {
    await this.createNotification({
      userId,
      title: 'Compte Réactivé',
      message: 'Votre compte a été réactivé. Vous pouvez maintenant accéder à toutes les fonctionnalités.',
      type: 'SUCCESS'
    });
  }

  // Bulk notifications for admin
  async sendBulkNotification(
    userIds: string[],
    title: string,
    message: string,
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  ): Promise<boolean> {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        title,
        message,
        type,
        is_read: false
      }));

      const { error } = await db.supabase
        .from('notifications')
        .insert(notifications);

      return !error;
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      return false;
    }
  }

  // Real-time notification subscription
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void): () => void {
    const subscription = db.supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}

export const notificationService = NotificationService.getInstance();
