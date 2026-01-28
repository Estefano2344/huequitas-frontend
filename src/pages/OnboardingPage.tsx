import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, MapPin, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { completeSetup } from '../services/api';

const FOOD_TYPES = [
  { id: 'Típica', label: 'Típica', description: 'Hornado, fritada, mote, ceviche serrano' },
  { id: 'Callejera', label: 'Callejera', description: 'Tripas, empanadas, choclos, salchipapas' },
  { id: 'Mariscos', label: 'Mariscos', description: 'Ceviches, encebollados, corviches' },
  { id: 'Postres', label: 'Postres', description: 'Helados de paila, tres leches, quesadillas' }
];

const LOCATIONS = [
  { id: 'Norte', label: 'Norte de Quito', description: 'La Carolina, Iñaquito, El Inca, La Y, Pomasqui' },
  { id: 'Centro', label: 'Centro de Quito', description: 'San Juan, La Mariscal, Centro Histórico, La Floresta' },
  { id: 'Sur', label: 'Sur de Quito', description: 'La Villaflora, Chillogallo, Quitumbe, Solanda' },
  { id: 'Valles', label: 'Valles', description: 'Cumbayá, Tumbaco, Los Chillos, San Rafael' }
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleFoodType = (id: string) => {
    setSelectedFoodTypes(prev =>
      prev.includes(id)
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
    setError('');
  };

  const handleLocationSelect = (id: string) => {
    setSelectedLocation(id);
    setError('');
  };

  const handleNext = () => {
    if (step === 1 && selectedFoodTypes.length === 0) {
      setError('Selecciona al menos un tipo de comida');
      return;
    }
    setStep(2);
  };

  const handleComplete = async () => {
    if (!selectedLocation) {
      setError('Selecciona tu ubicación');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await completeSetup(selectedFoodTypes, selectedLocation);
      // Actualizar usuario y token en el contexto
      updateUser(response.user, response.token);
      // Forzar recarga para asegurar que el estado se actualice
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Error al guardar preferencias');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <UtensilsCrossed className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">¡Bienvenido a Las HueQuitas!</h1>
          <p className="text-gray-600">Personaliza tu experiencia para encontrar los mejores lugares</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>
              {step > 1 ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <span className="font-medium hidden sm:inline">Preferencias</span>
          </div>
          <div className={`w-12 h-1 rounded ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="font-medium hidden sm:inline">Ubicación</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <UtensilsCrossed className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-bold text-gray-800">¿Qué tipo de comida te gusta?</h2>
              </div>
              <p className="text-gray-600 mb-6">Selecciona los tipos de comida que prefieres. Te mostraremos huequitas basadas en tus gustos.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {FOOD_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => toggleFoodType(type.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedFoodTypes.includes(type.id)
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800">{type.label}</span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedFoodTypes.includes(type.id)
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedFoodTypes.includes(type.id) && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{type.description}</p>
                  </button>
                ))}
              </div>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg"
              >
                Continuar
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-bold text-gray-800">¿En qué parte de Quito te encuentras?</h2>
              </div>
              <p className="text-gray-600 mb-6">Te mostraremos las huequitas más cercanas a tu ubicación.</p>

              <div className="space-y-3 mb-6">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => handleLocationSelect(loc.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedLocation === loc.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-800">{loc.label}</span>
                        <p className="text-sm text-gray-500">{loc.description}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedLocation === loc.id
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedLocation === loc.id && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Atrás
                </button>
                <button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      Comenzar
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Puedes cambiar estas preferencias en cualquier momento desde tu perfil.
        </p>
      </div>
    </div>
  );
}
