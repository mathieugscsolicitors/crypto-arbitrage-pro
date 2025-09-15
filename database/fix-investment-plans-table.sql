-- Correction de la table investment_plans manquante
-- Créer la table investment_plans avec les données nécessaires

-- Supprimer la table si elle existe déjà
DROP TABLE IF EXISTS investment_plans CASCADE;

-- Créer la table investment_plans
CREATE TABLE investment_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    min_amount DECIMAL(15,2) NOT NULL,
    max_amount DECIMAL(15,2) NOT NULL,
    daily_return DECIMAL(5,4) NOT NULL,
    duration INTEGER NOT NULL,
    total_return DECIMAL(5,2) NOT NULL,
    features JSONB,
    popular BOOLEAN DEFAULT FALSE,
    color TEXT DEFAULT 'blue',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les plans d'investissement
INSERT INTO investment_plans (id, name, description, min_amount, max_amount, daily_return, duration, total_return, features, popular, color) VALUES
('starter', 'Plan Starter', 'Parfait pour débuter dans l''arbitrage crypto', 100.00, 1000.00, 0.0015, 30, 5.50, 
 '["Support client 24/7", "Arbitrage automatique", "Retrait quotidien", "Dashboard en temps réel"]', 
 false, 'blue'),

('premium', 'Plan Premium', 'Pour les investisseurs expérimentés', 1000.00, 10000.00, 0.0025, 35, 8.20, 
 '["Support client prioritaire", "Arbitrage multi-exchanges", "Retrait instantané", "Analyses avancées", "Gestionnaire dédié"]', 
 true, 'green'),

('vip', 'Plan VIP', 'Le summum de l''arbitrage professionnel', 10000.00, 100000.00, 0.0035, 40, 12.50, 
 '["Support VIP exclusif", "Arbitrage institutionnel", "Retraits illimités", "Rapports personnalisés", "Conseiller personnel", "Accès aux signaux premium"]', 
 false, 'purple');

-- Créer les politiques RLS pour investment_plans
ALTER TABLE investment_plans ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "investment_plans_select_policy" ON investment_plans
    FOR SELECT
    TO authenticated
    USING (true);

-- Politique pour permettre aux admins de modifier
CREATE POLICY "investment_plans_admin_policy" ON investment_plans
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

-- Corriger la table investments pour référencer correctement investment_plans
ALTER TABLE investments 
DROP CONSTRAINT IF EXISTS investments_plan_id_fkey;

ALTER TABLE investments 
ADD CONSTRAINT investments_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES investment_plans(id);

-- Mettre à jour les investissements existants avec des plan_id valides
UPDATE investments 
SET plan_id = 'starter' 
WHERE plan_id NOT IN ('starter', 'premium', 'vip');

COMMIT;
