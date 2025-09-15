import { supabase } from './supabase';

// Script d'initialisation de la base de données
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Create default admin user
    const { data: adminAuth, error: adminAuthError } = await supabase.auth.signUp({
      email: 'admin@crypto-arbitrage.com',
      password: 'admin123',
      options: {
        data: {
          first_name: 'Administrateur',
          last_name: 'Principal',
          role: 'ADMIN'
        }
      }
    });

    if (adminAuthError && !adminAuthError.message.includes('already registered')) {
      throw adminAuthError;
    }

    if (adminAuth.user) {
      // Create admin profile
      await supabase.from('users').upsert({
        id: adminAuth.user.id,
        email: 'admin@crypto-arbitrage.com',
        role: 'ADMIN',
        status: 'ACTIVE',
        first_name: 'Administrateur',
        last_name: 'Principal',
        theme: 'dark',
        password_changed: false
      });

      console.log('Admin user created');
    }

    // Create default client user
    const { data: clientAuth, error: clientAuthError } = await supabase.auth.signUp({
      email: 'client@example.com',
      password: 'client123',
      options: {
        data: {
          first_name: 'Jean',
          last_name: 'Dupont',
          role: 'CLIENT'
        }
      }
    });

    if (clientAuthError && !clientAuthError.message.includes('already registered')) {
      throw clientAuthError;
    }

    if (clientAuth.user) {
      // Create client profile
      await supabase.from('users').upsert({
        id: clientAuth.user.id,
        email: 'client@example.com',
        role: 'CLIENT',
        status: 'ACTIVE',
        first_name: 'Jean',
        last_name: 'Dupont',
        theme: 'dark',
        password_changed: true
      });

      // Create default wallets for client
      const assets = ['BTC', 'ETH', 'USDT', 'USDC'] as const;
      for (const asset of assets) {
        await supabase.from('wallets').upsert({
          user_id: clientAuth.user.id,
          asset,
          balance: asset === 'USDT' ? 1000 : asset === 'USDC' ? 500 : 0,
          address: generateWalletAddress(asset),
          is_master: false
        });
      }

      console.log('Client user and wallets created');
    }

    // Create master wallets
    const masterWallets = [
      { asset: 'BTC', balance: 125.45678 },
      { asset: 'ETH', balance: 2847.8765 },
      { asset: 'USDT', balance: 1542050.50 },
      { asset: 'USDC', balance: 987654.32 }
    ] as const;

    for (const wallet of masterWallets) {
      await supabase.from('wallets').upsert({
        user_id: null,
        asset: wallet.asset,
        balance: wallet.balance,
        address: generateWalletAddress(wallet.asset),
        is_master: true
      });
    }

    console.log('Master wallets created');

    // Create default investment plans
    const plans = [
      {
        name: 'Débutant',
        duration_days: 30,
        apy: 8.5,
        min_amount: 100,
        max_amount: 5000,
        description: 'Parfait pour découvrir l\'arbitrage crypto avec un investissement minimal et des rendements attractifs.',
        is_active: true
      },
      {
        name: 'Croissance',
        duration_days: 90,
        apy: 12.5,
        min_amount: 1000,
        max_amount: 25000,
        description: 'Le choix optimal pour faire croître votre portefeuille avec des rendements supérieurs et des outils avancés.',
        is_active: true
      },
      {
        name: 'Premium',
        duration_days: 180,
        apy: 15.0,
        min_amount: 5000,
        max_amount: 100000,
        description: 'Rendements maximaux pour les investisseurs expérimentés avec un service personnalisé de haut niveau.',
        is_active: true
      }
    ];

    for (const plan of plans) {
      await supabase.from('plans').upsert(plan);
    }

    console.log('Investment plans created');

    // Initialize crypto rates cache
    const rates = [
      { symbol: 'BTC', price_usd: 43250.75, change_24h: 2.34 },
      { symbol: 'ETH', price_usd: 2680.50, change_24h: -0.87 },
      { symbol: 'USDT', price_usd: 1.0001, change_24h: 0.01 },
      { symbol: 'USDC', price_usd: 0.9999, change_24h: -0.01 }
    ];

    for (const rate of rates) {
      await supabase.from('rates_cache').upsert({
        symbol: rate.symbol,
        price_usd: rate.price_usd,
        change_24h: rate.change_24h,
        last_updated: new Date().toISOString()
      });
    }

    console.log('Crypto rates initialized');

    // Create sample transactions for demo
    if (clientAuth.user) {
      const sampleTransactions = [
        {
          user_id: clientAuth.user.id,
          type: 'DEPOSIT',
          asset: 'USDT',
          amount: 1000,
          status: 'COMPLETED',
          notes: 'Initial deposit'
        },
        {
          user_id: clientAuth.user.id,
          type: 'DEPOSIT',
          asset: 'USDC',
          amount: 500,
          status: 'COMPLETED',
          notes: 'Secondary deposit'
        }
      ] as const;

      for (const tx of sampleTransactions) {
        await supabase.from('transactions').insert(tx);
      }

      console.log('Sample transactions created');
    }

    console.log('Database initialization completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Database initialization failed:', error);
    return { success: false, error };
  }
}

function generateWalletAddress(asset: string): string {
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

// Function to reset database (for development)
export async function resetDatabase() {
  try {
    console.log('Resetting database...');

    // Delete all data in reverse dependency order
    await supabase.from('audit_logs').delete().neq('id', '');
    await supabase.from('notifications').delete().neq('id', '');
    await supabase.from('subscriptions').delete().neq('id', '');
    await supabase.from('transactions').delete().neq('id', '');
    await supabase.from('wallets').delete().neq('id', '');
    await supabase.from('rates_cache').delete().neq('id', '');
    await supabase.from('plans').delete().neq('id', '');
    await supabase.from('users').delete().neq('id', '');

    console.log('Database reset completed');
    return { success: true };
  } catch (error) {
    console.error('Database reset failed:', error);
    return { success: false, error };
  }
}

// Function to seed database with sample data
export async function seedDatabase() {
  try {
    console.log('Seeding database with sample data...');

    // This would add more sample users, transactions, etc.
    // Implementation depends on specific requirements

    console.log('Database seeding completed');
    return { success: true };
  } catch (error) {
    console.error('Database seeding failed:', error);
    return { success: false, error };
  }
}
