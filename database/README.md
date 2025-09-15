# Instructions SQL pour Supabase

## Script à exécuter dans Supabase SQL Editor

### 1. Créer la table investment_plans

Exécutez le script `database/fix-investment-plans-table.sql` dans l'éditeur SQL de Supabase.

Ce script :
- Crée la table `investment_plans` avec 3 plans d'investissement
- Configure les politiques RLS appropriées
- Corrige les références dans la table `investments`

### 2. Plans d'investissement inclus

- **Starter** : 5.5% total return (30 jours)
- **Premium** : 8.2% total return (35 jours) 
- **VIP** : 12.5% total return (40 jours)

### 3. Après exécution

Les fonctionnalités suivantes seront opérationnelles :
- Accès aux plans d'investissement via l'API
- Création d'investissements par les clients
- Interface complète des plans dans l'application

---
*Dernière mise à jour: 15/09/2025 09:13:31*
