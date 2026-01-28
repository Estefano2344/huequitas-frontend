import { useState, useEffect } from 'react';
import { User as UserIcon, MapPin, UtensilsCrossed, Save, ArrowLeft, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/api';

const FOOD_TYPES = [
  { id: 'Típica', label: 'Típica' },
  { id: 'Callejera', label: 'Callejera' },
  { id: 'Mariscos', label: 'Mariscos' },
  { id: 'Postres', label: 'Postres' }
];

const LOCATIONS = [
  { id: 'Norte', label: 'Norte de Quito' },
  { id: 'Centro', label: 'Centro de Quito' },
  { id: 'Sur', label: 'Sur de Quito' },
  { id: 'Valles', label: 'Valles' }
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<string[]>(user?.preferences?.foodTypes || []);
  const [selectedLocation, setSelectedLocation] = useState<string>(user?.preferences?.location || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setSelectedFoodTypes(user.preferences?.foodTypes || []);
      setSelectedLocation(user.preferences?.location || '');
    }
  }, [user]);

  const toggleFoodType = (id: string) => {
    setSelectedFoodTypes(prev =>
      prev.includes(id)
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (name.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }

    if (selectedFoodTypes.length === 0) {
      setError('Selecciona al menos un tipo de comida');
      return;
    }

    if (!selectedLocation) {
      setError('Selecciona tu ubicación');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await updateProfile({
        name: name.trim(),
        preferences: {
          foodTypes: selectedFoodTypes,
          location: selectedLocation
        }
      });
      updateUser(response.user, response.token);
      setSuccess('Perfil actualizado correctamente');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al inicio
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
                <p className="text-white/80">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Nombre */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                <UserIcon className="w-5 h-5 text-orange-500" />
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                  setSuccess('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                placeholder="Tu nombre"
              />
            </div>

            {/* Preferencias de comida */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                Tipos de comida favoritos
              </label>
              <div className="grid grid-cols-2 gap-3">
                {FOOD_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => toggleFoodType(type.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      selectedFoodTypes.includes(type.id)
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{type.label}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedFoodTypes.includes(type.id)
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedFoodTypes.includes(type.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                <MapPin className="w-5 h-5 text-orange-500" />
                Tu ubicación en Quito
              </label>
              <div className="grid grid-cols-2 gap-3">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setSelectedLocation(loc.id);
                      setError('');
                      setSuccess('');
                    }}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      selectedLocation === loc.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{loc.label}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedLocation === loc.id
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedLocation === loc.id && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mensajes */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-600">
                {success}
              </div>
            )}

            {/* Botón guardar */}
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
