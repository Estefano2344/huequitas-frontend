import { Medal, Star, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getRestaurants } from '../services/api';
import { Restaurant } from '../types';

export default function RankingPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopRated();
  }, []);

  const loadTopRated = async () => {
    setLoading(true);
    try {
      const data = await getRestaurants();
      // Ordenar por rating descendente
      const sorted = data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setRestaurants(sorted);
    } catch (error) {
      console.error('Error loading top rated:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Medal className="w-8 h-8 text-yellow-500" />;
    if (index === 1) return <Medal className="w-8 h-8 text-gray-400" />;
    if (index === 2) return <Medal className="w-8 h-8 text-orange-600" />;
    return <span className="text-2xl font-bold text-gray-600">{index + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl mb-4 shadow-xl">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Top Rated Restaurants</h1>
          <p className="text-gray-600">Las mejores huecas según nuestra comunidad</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {restaurants.map((restaurant, index) => (
              <div
                key={restaurant._id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                  index < 3 ? 'border-2 border-orange-300' : ''
                }`}
              >
                <div className="flex items-center gap-6 p-6">
                  <div className="flex-shrink-0 w-16 flex items-center justify-center">
                    {getMedalIcon(index)}
                  </div>

                  <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-1">
                          {restaurant.name}
                        </h3>
                        <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {restaurant.category}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 px-4 py-2 rounded-full shadow-lg">
                          <Star className="w-6 h-6 fill-white text-white" />
                          <span className="text-2xl font-bold text-white">
                            {(restaurant.rating || 0).toFixed(1)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {restaurant.reviewCount} reviews
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-3 line-clamp-2">
                      {restaurant.description || 'Sin descripción'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
