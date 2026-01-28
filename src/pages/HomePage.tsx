import { MapPin, PlusCircle, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import RestaurantCard from '../components/RestaurantCard';
import ReviewModal from '../components/ReviewModal';
import { useAuth } from '../contexts/AuthContext';
import { getRestaurants } from '../services/api';
import { Restaurant } from '../types';

const LOCATIONS = [
  { id: '', label: 'Todas las zonas' },
  { id: 'Norte', label: 'Norte' },
  { id: 'Centro', label: 'Centro' },
  { id: 'Sur', label: 'Sur' },
  { id: 'Valles', label: 'Valles' }
];

export default function HomePage() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [usePreferences, setUsePreferences] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const categories = ["All", "Típica", "Callejera", "Mariscos", "Postres"];

  useEffect(() => {
    // Al cargar, usar las preferencias del usuario si existen
    if (user?.preferences?.location && usePreferences) {
      setSelectedLocation(user.preferences.location);
    }
  }, [user, usePreferences]);

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [searchQuery, selectedCategory, selectedLocation, restaurants, usePreferences, user]);

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const data = await getRestaurants();
      setRestaurants(data);
      setFilteredRestaurants(data);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRestaurants = () => {
    let filtered = restaurants;

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((r) => r.cuisine === selectedCategory);
    } else if (usePreferences && user?.preferences?.foodTypes && user.preferences.foodTypes.length > 0) {
      // Si está en "All" y usa preferencias, filtrar por tipos favoritos
      filtered = filtered.filter((r) => user.preferences?.foodTypes.includes(r.cuisine));
    }

    // Filtrar por ubicación
    if (selectedLocation) {
      filtered = filtered.filter((r) => r.location?.sector === selectedLocation);
    }

    setFilteredRestaurants(filtered);
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    if (location !== user?.preferences?.location) {
      setUsePreferences(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category !== 'All') {
      setUsePreferences(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedLocation('');
    setUsePreferences(false);
  };

  const applyPreferences = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedLocation(user?.preferences?.location || '');
    setUsePreferences(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Discover Las HueQuitas</h1>
              <p className="text-gray-600">Explora los mejores restaurantes locales</p>
            </div>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl"
            >
              <PlusCircle className="w-5 h-5" />
              Write Review
            </button>
          </div>

          {/* Indicador de preferencias */}
          {user?.preferences && (user.preferences.foodTypes?.length > 0 || user.preferences.location) && (
            <div className="mb-4 p-3 bg-orange-100 rounded-lg flex items-center justify-between">
              {usePreferences ? (
                <>
                  <p className="text-sm text-orange-800">
                    Mostrando resultados basados en tus preferencias
                    {user.preferences.foodTypes && user.preferences.foodTypes.length > 0 && (
                      <span className="font-medium"> ({user.preferences.foodTypes.join(', ')})</span>
                    )}
                    {user.preferences.location && (
                      <span className="font-medium"> en {user.preferences.location}</span>
                    )}
                  </p>
                  <button
                    onClick={resetFilters}
                    className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                  >
                    Ver todos
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-orange-800">
                    Mostrando todos los restaurantes
                  </p>
                  <button
                    onClick={applyPreferences}
                    className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                  >
                    Usar mis preferencias
                  </button>
                </>
              )}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Búsqueda y filtro de ubicación */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white shadow-sm"
                />
              </div>

              {/* Filtro de ubicación */}
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedLocation}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="pl-12 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white shadow-sm appearance-none cursor-pointer min-w-[180px]"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtros de categoría */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {filteredRestaurants.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg mb-4">No se encontraron restaurantes</p>
                <button
                  onClick={resetFilters}
                  className="text-orange-600 hover:text-orange-800 font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={loadRestaurants}
      />
    </div>
  );
}
