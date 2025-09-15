import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn(formData.email, formData.password);
      
      if (result.error) {
        setError(result.error);
      } else {
        // Navigate based on user role (will be handled in auth context)
        navigate('/client');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-slate-900 dark:text-white">
            Bon Retour
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Connectez-vous à votre compte Crypto-Arbitrage
          </p>
        </div>

        {/* Demo Credentials */}
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Identifiants de Démonstration
            </h3>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <p><strong>Admin :</strong> admin@crypto-arbitrage.com / admin123</p>
              <p><strong>Client :</strong> client@example.com / n'importe quel mot de passe</p>
            </div>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white text-center">
              Se Connecter
            </h3>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Input
                name="email"
                type="email"
                label="Adresse Email"
                value={formData.email}
                onChange={handleChange}
                icon={<Mail className="h-5 w-5" />}
                required
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Mot de Passe"
                  value={formData.password}
                  onChange={handleChange}
                  icon={<Lock className="h-5 w-5" />}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                Se Connecter
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Vous n'avez pas de compte ?{' '}
                <Link 
                  to="/auth/register" 
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Inscrivez-vous ici
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Réinitialisation du mot de passe disponible uniquement via le panneau d'administration
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}