import { Eye, EyeOff, X } from 'lucide-react';
import { useState } from 'react';
import { resetPassword, resetPasswordRequest, verifyResetCode } from '../services/api';
import { validateEmail, validatePasswordStrength } from '../utils/validators';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar email
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError.message);
      return;
    }

    setLoading(true);
    try {
      await resetPasswordRequest(email);
      setSuccess('✅ Código enviado a tu correo. Válido por 15 minutos.');
      setTimeout(() => {
        setStep('code');
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al solicitar reset');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar código
    if (!resetCode || resetCode.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      await verifyResetCode(email, resetCode);
      setSuccess('✅ Código verificado correctamente. Ahora ingresa tu nueva contraseña.');
      setTimeout(() => {
        setStep('password');
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido o expirado');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    console.log('🚀 handleResetPassword ejecutado');
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('📋 Datos:', { email, resetCode, newPassword, confirmPassword });

    // Validar contraseña
    const passwordStrengthCheck = validatePasswordStrength(newPassword);
    if (passwordStrengthCheck.suggestions.length > 0) {
      console.warn('⚠️ Validación de contraseña falló:', passwordStrengthCheck.suggestions);
      setError('La contraseña no cumple con los requisitos mínimos de seguridad');
      return;
    }

    // Validar que coincidan
    if (newPassword !== confirmPassword) {
      console.warn('⚠️ Las contraseñas no coinciden');
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    console.log('📤 Enviando petición POST a /auth/password-reset', { email, resetCode, newPassword, confirmPassword });
    try {
      const response = await resetPassword(email, resetCode, newPassword, confirmPassword);
      console.log('✅ Respuesta del servidor:', response);
      setTimeout(() => {
        onClose();
        window.location.href = '/auth';
      }, 1000);
    } catch (err) {
      console.error('❌ Error en resetPassword:', err);
      setError(err instanceof Error ? err.message : 'Error al resetear contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  const passwordStrength = validatePasswordStrength(newPassword);
  const strengthColors: Record<string, string> = {
    'muy-debil': 'bg-red-500',
    'debil': 'bg-orange-500',
    'media': 'bg-yellow-500',
    'fuerte': 'bg-lime-500',
    'muy-fuerte': 'bg-green-500',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {step === 'email' && 'Recuperar Contraseña'}
            {step === 'code' && 'Verificar Código'}
            {step === 'password' && 'Nueva Contraseña'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form 
          onSubmit={
            step === 'email' ? handleRequestReset : 
            step === 'code' ? handleVerifyCode : 
            handleResetPassword
          } 
          className="p-6 space-y-4"
        >
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              ❌ {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* PASO 1: EMAIL */}
          {step === 'email' && (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Ingresa tu email para recibir un código de verificación
              </p>
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@dominio.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  disabled={loading}
                />
              </div>
            </>
          )}

          {/* PASO 2: CÓDIGO */}
          {step === 'code' && (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Hemos enviado un código de 6 dígitos a<br/>
                <strong>{email}</strong>
              </p>
              <div>
                <label htmlFor="reset-code" className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Verificación <span className="text-red-500">*</span>
                </label>
                <input
                  id="reset-code"
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest font-bold"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">Ingresa los 6 dígitos que recibiste</p>
              </div>
            </>
          )}

          {/* PASO 3: CONTRASEÑA */}
          {step === 'password' && (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Ingresa tu nueva contraseña
              </p>

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
                    disabled={loading}
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
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
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
                          <li key={idx}>• {suggestion}</li>
                        ))}
                      </ul>
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
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-xs text-green-600 mt-1">✅ Las contraseñas coinciden</p>
                )}
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">❌ Las contraseñas no coinciden</p>
                )}
              </div>
            </>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando...' : 
                step === 'email' ? 'Enviar Código' : 
                step === 'code' ? 'Verificar Código' : 
                'Resetear Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
