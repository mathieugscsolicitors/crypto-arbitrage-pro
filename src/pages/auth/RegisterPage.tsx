import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { validateEmail, validatePassword } from '../../lib/utils';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle,
  UserPlus
} from 'lucide-react';

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.errors[0];
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );
      
      if (result.error) {
        setErrors({ general: result.error });
      } else {
        navigate('/client');
      }
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const passwordStrength = validatePassword(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-slate-900 dark:text-white">
            Créer un Compte
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Rejoignez Crypto-Arbitrage et commencez à gagner dès aujourd'hui
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white text-center">
              S'Inscrire
            </h3>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm">{errors.general}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="firstName"
                  type="text"
                  label="Prénom"
                  value={formData.firstName}
                  onChange={handleChange}
                  icon={<User className="h-5 w-5" />}
                  error={errors.firstName}
                  required
                  autoComplete="given-name"
                />

                <Input
                  name="lastName"
                  type="text"
                  label="Nom"
                  value={formData.lastName}
                  onChange={handleChange}
                  icon={<User className="h-5 w-5" />}
                  error={errors.lastName}
                  required
                  autoComplete="family-name"
                />
              </div>

              <Input
                name="email"
                type="email"
                label="Adresse Email"
                value={formData.email}
                onChange={handleChange}
                icon={<Mail className="h-5 w-5" />}
                error={errors.email}
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
                  error={errors.password}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    {passwordStrength.valid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                    <span className={passwordStrength.valid ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}>
                      {passwordStrength.valid ? 'Mot de passe fort' : 'Exigences du mot de passe :'}
                    </span>
                  </div>
                  {!passwordStrength.valid && (
                    <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 ml-6">
                      {passwordStrength.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="relative">
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirmer le Mot de Passe"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  icon={<Lock className="h-5 w-5" />}
                  error={errors.confirmPassword}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="acceptedTerms"
                  id="acceptedTerms"
                  checked={formData.acceptedTerms}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
                />
                <label 
                  htmlFor="acceptedTerms" 
                  className="text-sm text-slate-600 dark:text-slate-400"
                >
                  J'accepte les{' '}
                  <Link to="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Conditions d'Utilisation
                  </Link>{' '}
                  et la{' '}
                  <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Politique de Confidentialité
                  </Link>
                </label>
              </div>
              
              {errors.acceptedTerms && (
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {errors.acceptedTerms}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                disabled={!passwordStrength.valid || !formData.acceptedTerms}
              >
                Créer le Compte
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Vous avez déjà un compte ?{' '}
                <Link 
                  to="/auth/login" 
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Connectez-vous ici
                </Link>
              </p>
            </div>

            <div className="mt-6 text-xs text-slate-500 dark:text-slate-400 text-center">
              En créant un compte, vous reconnaissez que vos informations seront 
              traitées conformément à notre Politique de Confidentialité.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}