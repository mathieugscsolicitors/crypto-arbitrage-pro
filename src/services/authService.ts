import { supabase } from '../lib/supabase';
import { db } from '../lib/database';
import type { User } from '../lib/database';

export interface AuthUser {
  id: string;
  email: string;
  role: 'CLIENT' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  firstName?: string;
  lastName?: string;
  theme: 'dark' | 'light';
  passwordChanged: boolean;
}

export interface AuthResponse {
  user?: AuthUser;
  error?: string;
}

export class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signUp(email: string, password: string, firstName: string, lastName: string): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        return { error: 'Un utilisateur avec cet email existe déjà' };
      }

      // Create auth user in Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: 'CLIENT'
          }
        }
      });

      if (authError) {
        return { error: authError.message };
      }

      if (!authData.user) {
        return { error: 'Erreur lors de la création du compte' };
      }

      // Create user profile in database
      const userData = await db.createUser({
        id: authData.user.id,
        email,
        role: 'CLIENT',
        status: 'ACTIVE',
        first_name: firstName,
        last_name: lastName,
        theme: 'dark',
        password_changed: true
      });

      if (!userData) {
        return { error: 'Erreur lors de la création du profil utilisateur' };
      }

      // Create default wallets for the user
      await this.createDefaultWallets(userData.id);

      // Create audit log
      await db.createAuditLog({
        user_id: userData.id,
        action: 'USER_REGISTRATION',
        resource: 'users',
        resource_id: userData.id,
        details: { email, firstName, lastName }
      });

      return {
        user: {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          status: userData.status,
          firstName: userData.first_name || undefined,
          lastName: userData.last_name || undefined,
          theme: userData.theme,
          passwordChanged: userData.password_changed
        }
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'Erreur lors de la création du compte' };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        return { error: 'Email ou mot de passe invalide' };
      }

      if (!authData.user) {
        return { error: 'Erreur d\'authentification' };
      }

      // Get user profile from database
      const userData = await db.getUserById(authData.user.id);
      if (!userData) {
        return { error: 'Profil utilisateur introuvable' };
      }

      // Check if user is suspended
      if (userData.status === 'SUSPENDED') {
        return { error: 'Votre compte a été suspendu. Contactez le support.' };
      }

      // Create audit log
      await db.createAuditLog({
        user_id: userData.id,
        action: 'USER_LOGIN',
        resource: 'users',
        resource_id: userData.id,
        details: { email }
      });

      return {
        user: {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          status: userData.status,
          firstName: userData.first_name || undefined,
          lastName: userData.last_name || undefined,
          theme: userData.theme,
          passwordChanged: userData.password_changed
        }
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'Erreur lors de la connexion' };
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return null;
      }

      const userData = await db.getUserById(session.user.id);
      if (!userData) {
        return null;
      }

      return {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        firstName: userData.first_name || undefined,
        lastName: userData.last_name || undefined,
        theme: userData.theme,
        passwordChanged: userData.password_changed
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<AuthUser>): Promise<AuthUser | null> {
    try {
      const userData = await db.updateUser(userId, {
        first_name: updates.firstName,
        last_name: updates.lastName,
        theme: updates.theme,
        password_changed: updates.passwordChanged
      });

      if (!userData) {
        return null;
      }

      // Create audit log
      await db.createAuditLog({
        user_id: userId,
        action: 'USER_PROFILE_UPDATE',
        resource: 'users',
        resource_id: userId,
        details: updates
      });

      return {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        firstName: userData.first_name || undefined,
        lastName: userData.last_name || undefined,
        theme: userData.theme,
        passwordChanged: userData.password_changed
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return null;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { error: error.message };
      }

      // Update password_changed flag
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await db.updateUser(user.id, { password_changed: true });
        
        // Create audit log
        await db.createAuditLog({
          user_id: user.id,
          action: 'PASSWORD_CHANGE',
          resource: 'users',
          resource_id: user.id,
          details: {}
        });
      }

      return {};
    } catch (error) {
      console.error('Change password error:', error);
      return { error: 'Erreur lors du changement de mot de passe' };
    }
  }

  async resetPassword(email: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: 'Erreur lors de la réinitialisation du mot de passe' };
    }
  }

  private async createDefaultWallets(userId: string): Promise<void> {
    const assets: Array<'BTC' | 'ETH' | 'USDT' | 'USDC'> = ['BTC', 'ETH', 'USDT', 'USDC'];
    
    for (const asset of assets) {
      await db.createWallet({
        user_id: userId,
        asset,
        balance: 0,
        address: this.generateWalletAddress(asset),
        is_master: false
      });
    }
  }

  private generateWalletAddress(asset: string): string {
    const prefixes = {
      BTC: ['1', '3', 'bc1'],
      ETH: ['0x'],
      USDT: ['0x'],
      USDC: ['0x']
    };

    const prefix = prefixes[asset as keyof typeof prefixes]?.[0] || '0x';
    const length = asset === 'BTC' ? 34 : 42;
    const chars = '0123456789abcdefABCDEF';
    
    let address = prefix;
    for (let i = prefix.length; i < length; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return address;
  }

  // Auth state listener
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });

    return () => subscription.unsubscribe();
  }
}

export const authService = AuthService.getInstance();
