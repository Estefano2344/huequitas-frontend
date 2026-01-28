import { ArrowLeft, Edit2, Heart, MessageCircle, Star, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import EditReviewModal from '../components/EditReviewModal';
import Navbar from '../components/Navbar';
import ReviewModal from '../components/ReviewModal';
import { useAuth } from '../contexts/AuthContext';
import { deleteReview, getLikeStatus, getRestaurantById, getReviewsByRestaurant, toggleLike } from '../services/api';
import { Restaurant, Review } from '../types';

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  useEffect(() => {
    loadRestaurantData();
  }, [id]);

  const loadRestaurantData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const restaurantData = await getRestaurantById(id);
      setRestaurant(restaurantData);
      
      const reviewsData = await getReviewsByRestaurant(id);
      setReviews(reviewsData);

      // Load like status
      try {
        const likeStatus = await getLikeStatus(id);
        setLiked(likeStatus.liked);
      } catch (error) {
        console.error('Error loading like status:', error);
      }
    } catch (error) {
      console.error('Error loading restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async () => {
    if (!id) return;
    setLikeLoading(true);
    try {
      const result = await toggleLike(id);
      setLiked(result.liked);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setSelectedReview(review);
    setIsEditModalOpen(true);
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;

    setDeletingReviewId(reviewToDelete);
    try {
      await deleteReview(reviewToDelete);
      setReviews(reviews.filter(r => r._id !== reviewToDelete));
      loadRestaurantData();
      setIsDeleteConfirmOpen(false);
      setReviewToDelete(null);
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error al eliminar la reseña');
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setReviewToDelete(null);
  };

  const handleEditSuccess = () => {
    loadRestaurantData();
    setIsEditModalOpen(false);
    setSelectedReview(null);
  };

  const handleReviewSuccess = () => {
    loadRestaurantData();
  };

  // Filtrar reseñas por rating
  const filteredReviews = selectedRating
    ? reviews.filter(review => review.rating === selectedRating)
    : reviews;

  // Ordenar reseñas
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortOrder) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600 text-lg">Restaurante no encontrado</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver atrás
        </button>

        {/* Restaurant Header */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          {/* Image */}
          <div className="relative h-96 overflow-hidden">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            {/* Restaurant Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-orange-200 text-sm font-semibold mb-2">{restaurant.cuisine}</p>
                  <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
                </div>
                <button
                  onClick={handleToggleLike}
                  disabled={likeLoading}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 transition disabled:opacity-50"
                >
                  <Heart
                    className={`w-6 h-6 transition ${
                      liked ? 'fill-red-500 text-red-500' : 'text-white'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Restaurant Details */}
          <div className="p-8">
            <div className="grid grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-200">
              {/* Rating */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  <span className="text-3xl font-bold text-gray-800">
                    {restaurant.rating?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  {restaurant.totalRatings || 0} reseñas
                </p>
              </div>

              {/* Address */}
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-2">Dirección</p>
                <p className="text-gray-800 font-semibold">{restaurant.address || 'N/A'}</p>
              </div>

              {/* Reviews Button */}
              <div className="text-center">
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  Escribir reseña
                </button>
              </div>
            </div>

            {/* Description */}
            {restaurant.description && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-3">Descripción</h2>
                <p className="text-gray-600 leading-relaxed">{restaurant.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Reseñas ({filteredReviews.length})
            </h2>

            {/* Rating Filter & Sort - ComboBoxes */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-4">
                {/* Filter ComboBox */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-600">Filtrar:</label>
                  <select
                    value={selectedRating ?? ''}
                    onChange={(e) => setSelectedRating(e.target.value ? parseInt(e.target.value) : null)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:border-orange-400 focus:border-orange-500 focus:outline-none transition-colors bg-white cursor-pointer"
                  >
                    <option value="">Todas las reseñas</option>
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = reviews.filter(r => r.rating === rating).length;
                      return count > 0 ? (
                        <option key={rating} value={rating}>
                          {'⭐'.repeat(rating)}
                        </option>
                      ) : null;
                    })}
                  </select>
                </div>

                {/* Sort ComboBox */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-600">Ordenar:</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest')}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:border-orange-400 focus:border-orange-500 focus:outline-none transition-colors bg-white cursor-pointer"
                  >
                    <option value="newest">Más recientes</option>
                    <option value="oldest">Más antiguas</option>
                    <option value="highest">Mejor calificadas</option>
                    <option value="lowest">Peor calificadas</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">
                {selectedRating
                  ? `No hay reseñas con ${selectedRating} estrella${selectedRating !== 1 ? 's' : ''}.`
                  : 'Aún no hay reseñas. ¡Sé el primero en compartir tu experiencia!'}
              </p>
              <button
                onClick={() => {
                  setSelectedRating(null);
                  setIsReviewModalOpen(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition shadow-lg"
              >
                {selectedRating ? 'Ver todas las reseñas' : 'Escribir la primera reseña'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedReviews.map((review) => (
                <div
                  key={review._id}
                  className="border border-gray-200 rounded-xl p-6 hover:border-orange-300 transition"
                >
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">{review.userName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1.5 rounded-full">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-yellow-700">{review.rating}</span>
                      </div>
                      
                      {/* Edit/Delete Buttons - Only for owner */}
                      {user && review.userId === user.id && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                            title="Edit review"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            disabled={deletingReviewId === review._id}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title="Delete review"
                          >
                            {deletingReviewId === review._id ? (
                              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Review Comment */}
                  <p className="text-gray-700 leading-relaxed mb-4 break-words whitespace-pre-wrap overflow-hidden">{review.comment || 'Sin comentarios'}</p>

                  {/* Review Image - Enhanced Design */}
                  {review.image && (
                    <div className="flex justify-center">
                      <div 
                        onClick={() => setSelectedImage(review.image || null)}
                        className="group relative w-full max-w-sm rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
                      >
                        {/* Image Container */}
                        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 aspect-video flex items-center justify-center overflow-hidden">
                          <img
                            src={review.image}
                            alt="Review"
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        
                        {/* Overlay on Hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                              <MessageCircle className="w-4 h-4 text-orange-500" />
                              <span className="text-sm font-semibold text-gray-800">Ver imagen</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Corner Badge */}
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md">
                          <p className="text-xs font-semibold text-gray-700">Foto de reseña</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={handleReviewSuccess}
        restaurantId={id}
      />

      {/* Edit Review Modal */}
      <EditReviewModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        review={selectedReview}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="Eliminar reseña"
        message="¿Estás seguro de que quieres eliminar esta reseña? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={deletingReviewId !== null}
      />

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div className="relative flex items-center justify-center max-w-4xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Enlarged review"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
