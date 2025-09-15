import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Settings, Database, Shield, Bell } from 'lucide-react';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    newRegistrations: true,
    emailNotifications: true,
    minDepositAmount: 0.001,
    maxWithdrawalAmount: 10,
    tradingFeePercentage: 0.5
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    try {
      // Ici on sauvegarderait les paramètres
      console.log('Sauvegarde des paramètres:', settings);
      alert('Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Settings className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Paramètres Système
        </h1>
      </div>

      {/* Paramètres généraux */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Paramètres Généraux
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-slate-900 dark:text-white font-medium">Mode Maintenance</label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Désactiver temporairement l'accès au site
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-slate-900 dark:text-white font-medium">Nouvelles Inscriptions</label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Autoriser les nouveaux utilisateurs à s'inscrire
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.newRegistrations}
                onChange={(e) => handleSettingChange('newRegistrations', e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-slate-900 dark:text-white font-medium">Notifications Email</label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Envoyer des notifications par email
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Paramètres financiers */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="h-6 w-6 text-green-600" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Paramètres Financiers
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-900 dark:text-white font-medium mb-2">
                Dépôt Minimum (BTC)
              </label>
              <input
                type="number"
                step="0.0001"
                value={settings.minDepositAmount}
                onChange={(e) => handleSettingChange('minDepositAmount', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-900 dark:text-white font-medium mb-2">
                Retrait Maximum (BTC)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.maxWithdrawalAmount}
                onChange={(e) => handleSettingChange('maxWithdrawalAmount', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-900 dark:text-white font-medium mb-2">
                Frais de Trading (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.tradingFeePercentage}
                onChange={(e) => handleSettingChange('tradingFeePercentage', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">
          Annuler
        </Button>
        <Button onClick={saveSettings}>
          Sauvegarder les Paramètres
        </Button>
      </div>
    </div>
  );
};

export default SystemSettings;