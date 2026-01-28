import { CheckCircle, Eye, EyeOff, UtensilsCrossed, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/api';
import { validatePasswordStrength } from '../utils/validators';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [resetCode, setResetCode] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenValid, setTokenValid] = useState(true);

  // Extraer código de reseteo de la URL
  useEffect(() => {
    const codeParam = searchParams.get('token');
    if (!codeParam) {
      setTokenValid(false);
      setError('Token no proporcionado. Solicita un nuevo reseteo de contraseña.');
      return;
    }
    setResetCode(codeParam);
  }, [searchParams]);

  const passwordStrength = validatePasswordStrength(newPassword);

  const strengthColors: Record<string, string> = {
    'muy-debil': 'bg-red-500',
    'debil': 'bg-orange-500',
    'media': 'bg-yellow-500',
    'fuerte': 'bg-lime-500',
    'muy-fuerte': 'bg-green-500',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar que hay código de reseteo
    if (!resetCode) {
      setError('Token inválido o expirado');
      return;
    }

    // Validar email
    if (!email.trim()) {
      setError('El email es requerido');
      return;
    }

    // Validar contraseña
    const passwordStrengthCheck = validatePasswordStrength(newPassword);
    if (passwordStrengthCheck.suggestions.length > 0) {
      setError('La contraseña no cumple con los requisitos mínimos de seguridad');
      return;
    }

    // Validar que coincidan
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, resetCode, newPassword, confirmPassword);
      setSuccess('✅ Contraseña resetada exitosamente. Redirigiendo al login...');
      
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al resetear contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid && !resetCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-8 text-center">
              <XCircle className="w-16 h-16 text-white mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
            </div>

            <div className="p-8 text-center">
              <p className="text-gray-700 mb-6">
                El token de recuperación no fue proporcionado o es inválido.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all"
              >
                Volver al Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl mb-4 shadow-xl">
            <UtensilsCrossed className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Las HueQuitas</h1>
          <p className="text-gray-600">Resetea tu contraseña</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-6">
            <h2 className="text-2xl font-bold text-white">Nueva Contraseña</h2>
            <p className="text-orange-100 mt-1">Ingresa tu nueva contraseña segura</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-4">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{success}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                disabled={loading || success.length > 0}
              />
            </div>

            {/* Nueva contraseña */}
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition pr-10"
                  disabled={loading || success.length > 0}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Indicador de fortaleza */}
              {newPassword && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Fortaleza:</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {passwordStrength.score}/4
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        strengthColors[passwordStrength.level]
                      }`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>

                  {passwordStrength.suggestions.length > 0 && (
                    <ul className="mt-2 text-xs text-gray-600 space-y-1">
                      {passwordStrength.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {passwordStrength.suggestions.length === 0 && (
                    <p className="text-xs text-green-600 font-medium">✅ Contraseña fuerte</p>
                  )}
                </div>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition pr-10"
                  disabled={loading || success.length > 0}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {confirmPassword && (
                <div className="mt-2">
                  {newPassword === confirmPassword ? (
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Las contraseñas coinciden
                    </p>
                  ) : (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      Las contraseñas no coinciden
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                success.length > 0 ||
                !email ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword
              }
              className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Procesando...' : 'Resetear Contraseña'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="text-sm text-gray-600 hover:text-gray-800 transition"
                disabled={loading}
              >
                Volver al login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
