import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { validatePassword } from '../../lib/utils';
import {
  User,
  Mail,
  Shield,
  Moon,
  Sun,
  Key,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    
    try {
      await updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email
      });
      
      setNotification({ type: 'success', message: 'Profil mis à jour avec succès !' });
      setIsEditing(false);
    } catch (error) {
      setNotification({ type: 'error', message: 'Échec de la mise à jour du profil' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    const passwordValidation = validatePassword(passwordData.newPassword);
    
    if (!passwordValidation.valid) {
      setNotification({ type: 'error', message: passwordValidation.errors[0] });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setNotification({ type: 'error', message: 'Les mots de passe ne correspondent pas' });
      return;
    }

    setIsLoading(true);

    // Simulation d'appel API
    setTimeout(() => {
      setNotification({ type: 'success', message: 'Mot de passe changé avec succès !' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
      setIsLoading(false);
    }, 1500);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Paramètres du Profil
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gérez les paramètres de votre compte et vos préférences
          </p>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <Card className={`border-l-4 ${
          notification.type === 'success' 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
            : 'border-red-500 bg-red-50 dark:bg-red-900/20'
        }`}>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span className={`text-sm ${
                notification.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
              }`}>
                {notification.message}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Informations du profil */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Informations Personnelles
                  </h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Annuler' : 'Modifier'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditing}
                />
                <Input
                  label="Nom"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              
              <Input
                label="Adresse Email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
                icon={<Mail className="h-5 w-5" />}
              />

              {isEditing && (
                <div className="flex space-x-3">
                  <Button
                    onClick={handleProfileUpdate}
                    isLoading={isLoading}
                    className="flex-1"
                  >
                    Enregistrer les Modifications
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData({
                        firstName: user?.firstName || '',
                        lastName: user?.lastName || '',
                        email: user?.email || ''
                      });
                    }}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Paramètres de sécurité */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Paramètres de Sécurité
                </h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isChangingPassword ? (
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Mot de Passe</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Dernière modification : {user?.passwordChanged ? 'Récemment' : 'Jamais'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsChangingPassword(true)}
                  >
                    Changer le Mot de Passe
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      label="Mot de Passe Actuel"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      icon={<Key className="h-5 w-5" />}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      label="Nouveau Mot de Passe"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      icon={<Key className="h-5 w-5" />}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      label="Confirmer le Nouveau Mot de Passe"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      icon={<Key className="h-5 w-5" />}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {passwordData.newPassword && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">Exigences du Mot de Passe :</p>
                      <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                        <li className={validatePassword(passwordData.newPassword).valid ? 'text-green-600 dark:text-green-400' : ''}>
                          • Au moins 8 caractères
                        </li>
                        <li className={/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                          • Contient une lettre majuscule
                        </li>
                        <li className={/[a-z]/.test(passwordData.newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                          • Contient une lettre minuscule
                        </li>
                        <li className={/\d/.test(passwordData.newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                          • Contient un chiffre
                        </li>
                      </ul>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Button
                      onClick={handlePasswordChange}
                      isLoading={isLoading}
                      disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      className="flex-1"
                    >
                      Mettre à Jour le Mot de Passe
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Aperçu du compte et préférences */}
        <div className="space-y-6">
          {/* Statut du compte */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Statut du Compte
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Rôle</span>
                <Badge variant={user?.role === 'ADMIN' ? 'info' : 'default'}>
                  {user?.role === 'ADMIN' ? 'Administrateur' : 'Client'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Statut</span>
                <Badge variant={user?.status === 'ACTIVE' ? 'success' : 'error'}>
                  {user?.status === 'ACTIVE' ? 'Actif' : 'Suspendu'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Membre Depuis</span>
                <span className="text-sm text-slate-900 dark:text-white">
                  Janvier 2024
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Dernière Connexion</span>
                <span className="text-sm text-slate-900 dark:text-white">
                  {new Date().toLocaleDateString('fr-FR')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Préférences */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Préférences
                </h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {theme === 'dark' ? (
                    <Moon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <Sun className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Thème</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {theme === 'dark' ? 'Mode sombre' : 'Mode clair'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                >
                  Passer au {theme === 'dark' ? 'Clair' : 'Sombre'}
                </Button>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Notifications Email</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Recevoir les mises à jour par email
                    </p>
                  </div>
                  <Badge variant="warning">Désactivé</Badge>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Authentification à Deux Facteurs</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Sécurité supplémentaire pour votre compte
                    </p>
                  </div>
                  <Badge variant="warning">Non Activé</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions du compte */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Actions du Compte
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Télécharger les Données du Compte
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                Demander la Suppression du Compte
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}