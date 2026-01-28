import { Eye, EyeOff, UtensilsCrossed } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { useAuth } from '../contexts/AuthContext';
import {
    getPasswordStrengthColor,
    getPasswordStrengthMessage,
    validateEmail,
    validateName,
    validatePasswordsMatch,
    validatePasswordStrength,
} from '../utils/validators';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, signUp } = useAuth();
  const navigate = useNavigate();

  // Obtener fortaleza de contraseña
  const passwordStrength = validatePasswordStrength(formData.password);

  // Limpiar error automáticamente después de 4 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar email
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors[emailError.field] = emailError.message;

    // Validar nombre (solo en signup)
    if (activeTab === 'signup') {
      const nameError = validateName(formData.name, 'nombre');
      if (nameError) newErrors[nameError.field] = nameError.message;

      // Validar fortaleza de contraseña
      if (passwordStrength.score < 2) {
        newErrors.password = 'La contraseña no es suficientemente fuerte';
      }

      // Validar que coincidan
      const matchError = validatePasswordsMatch(formData.password, formData.confirmPassword);
      if (matchError) newErrors[matchError.field] = matchError.message;
    } else {
      // En login, solo validar que no esté vacía
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mostrar errores de validación pero permitir envío
    validateForm();

    setLoading(true);

    try {
      if (activeTab === 'signin') {
        const user = await login(formData.email, formData.password);
        // Redirigir según el estado del perfil
        if (user.isProfileComplete) {
          navigate('/');
        } else {
          navigate('/onboarding');
        }
      } else {
        // Nuevo registro siempre va a onboarding
        await signUp(formData.name, formData.email, formData.password, formData.confirmPassword);
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl mb-4 shadow-xl">
            <UtensilsCrossed className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Las HueQuitas</h1>
          <p className="text-gray-600">Descubre los mejores sabores locales</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('signin');
                setErrors({});
                setError('');
              }}
              className={`flex-1 py-4 text-center font-semibold transition-all ${
                activeTab === 'signin'
                  ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setErrors({});
                setError('');
              }}
              className={`flex-1 py-4 text-center font-semibold transition-all ${
                activeTab === 'signup'
                  ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-semibold">
                ❌ {error}
              </div>
            )}

            {/* Nombre - Solo en signup */}
            {activeTab === 'signup' && (
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setFormData({ ...formData, name: newName });
                    // Limpiar error apenas el usuario escriba
                    setErrors((prev) => {
                      const updated = { ...prev };
                      delete updated.name;
                      return updated;
                    });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-transparent'
                  }`}
                  placeholder="Juan Pérez"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">⚠️ {errors.name}</p>}
                <p className="text-gray-500 text-xs mt-1">3-50 caracteres, solo letras</p>
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  const newEmail = e.target.value;
                  setFormData({ ...formData, email: newEmail });
                  // Limpiar error apenas el usuario escriba
                  setErrors((prev) => {
                    const updated = { ...prev };
                    delete updated.email;
                    return updated;
                  });
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-transparent'
                }`}
                placeholder="ejemplo@email.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">⚠️ {errors.email}</p>}
            </div>

            {/* Contraseña */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña {activeTab === 'signup' && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    const newPassword = e.target.value;
                    setFormData({ ...formData, password: newPassword });
                    // Limpiar errores apenas el usuario escriba
                    setErrors((prev) => {
                      const updated = { ...prev };
                      delete updated.password;
                      delete updated.confirmPassword;
                      return updated;
                    });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-transparent'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">⚠️ {errors.password}</p>}

              {/* Password Strength Indicator - Solo en signup */}
              {activeTab === 'signup' && formData.password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-600">Fortaleza:</span>
                    <span className="text-xs font-semibold">{getPasswordStrengthMessage(passwordStrength)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${getPasswordStrengthColor(passwordStrength)}`}
                      style={{ width: `${((passwordStrength.score + 1) / 5) * 100}%` }}
                    ></div>
                  </div>
                  {passwordStrength.suggestions.length > 0 && (
                    <ul className="mt-2 text-xs text-gray-600 space-y-1">
                      {passwordStrength.suggestions.map((suggestion, idx) => (
                        <li key={idx}>• {suggestion}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Confirmar Contraseña - Solo en signup */}
            {activeTab === 'signup' && (
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      const newConfirm = e.target.value;
                      setFormData({ ...formData, confirmPassword: newConfirm });
                      // Limpiar error apenas el usuario escriba
                      setErrors((prev) => {
                        const updated = { ...prev };
                        delete updated.confirmPassword;
                        return updated;
                      });
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition ${
                      errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-transparent'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">⚠️ {errors.confirmPassword}</p>}
              </div>
            )}

            {/* Enlace "Olvidé mi contraseña" - Solo en signin */}
            {activeTab === 'signin' && (
              <div className="text-right mb-4">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium transition"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cargando...' : activeTab === 'signin' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </form>
        </div>
      </div>

      {/* Modal de recuperación de contraseña */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}
