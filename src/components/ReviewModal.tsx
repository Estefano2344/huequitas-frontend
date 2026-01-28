import { AlertCircle, Star, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createReview, getRestaurants } from '../services/api';
import { Restaurant } from '../types';
import {
    ALLOWED_IMAGE_EXTENSIONS,
    MAX_IMAGE_SIZE_MB,
    validateImageFile,
    validateRating,
    validateReviewComment,
} from '../utils/validators';

const MAX_COMMENT_LENGTH = 250;

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  restaurantId?: string;
}

export default function ReviewModal({ isOpen, onClose, onSuccess, restaurantId }: ReviewModalProps) {
  const [formData, setFormData] = useState({
    restaurantId: restaurantId || '',
    comment: '',
    rating: 5,
    image: '' as string,
  });
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && restaurantId) {
      setFormData((prev) => ({ ...prev, restaurantId }));
    }
  }, [restaurantId, isOpen]);

  useEffect(() => {
    if (isOpen && !restaurantId) {
      loadRestaurants();
    }
  }, [isOpen, restaurantId]);

  const loadRestaurants = async () => {
    setLoadingRestaurants(true);
    try {
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  if (!isOpen) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar archivo
      const fileError = validateImageFile(file);
      if (fileError) {
        setErrors({ ...errors, image: fileError.message });
        return;
      }

      setErrors({ ...errors, image: '' });

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData({ ...formData, image: base64 });
        setPreviewImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: '' });
    setPreviewImage(null);
    setErrors({ ...errors, image: '' });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.restaurantId) {
      newErrors.restaurantId = 'Debe seleccionar un restaurante';
    }

    const ratingError = validateRating(formData.rating);
    if (ratingError) {
      newErrors[ratingError.field] = ratingError.message;
    }

    const commentError = validateReviewComment(formData.comment);
    if (commentError) {
      newErrors[commentError.field] = commentError.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await createReview(
        formData.restaurantId,
        formData.rating,
        formData.comment,
        formData.image
      );

      setFormData({
        restaurantId: restaurantId || '',
        comment: '',
        rating: 5,
        image: '',
      });
      setPreviewImage(null);
      setErrors({});
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating review:', error);
      setErrors({ submit: 'Error al crear la reseña. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-yellow-500 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Escribir Reseña</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error General */}
          {errors.submit && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-semibold">{errors.submit}</span>
            </div>
          )}

          {/* Restaurante */}
          {!restaurantId && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Restaurante <span className="text-red-500">*</span>
              </label>
              {loadingRestaurants ? (
                <div className="p-3 bg-gray-100 rounded-lg text-gray-600">Cargando...</div>
              ) : (
                <>
                  <select
                    value={formData.restaurantId}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData({ ...formData, restaurantId: newValue });
                      if (newValue) {
                        setErrors((prev) => {
                          const updated = { ...prev };
                          delete updated.restaurantId;
                          return updated;
                        });
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition bg-white ${
                      errors.restaurantId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-transparent'
                    }`}
                  >
                    <option value="">Selecciona un restaurante</option>
                    {restaurants.map((restaurant) => (
                      <option key={restaurant._id} value={restaurant._id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                  {errors.restaurantId && <p className="text-red-500 text-xs mt-1">⚠️ {errors.restaurantId}</p>}
                </>
              )}
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Tu Calificación <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, rating: star });
                    setErrors((prev) => {
                      const updated = { ...prev };
                      delete updated.rating;
                      return updated;
                    });
                  }}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-lg font-semibold text-gray-700">{formData.rating}.0</span>
            </div>
            {errors.rating && <p className="text-red-500 text-xs mt-1">⚠️ {errors.rating}</p>}
          </div>

          {/* Comentario */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">Comentario</label>
              <span className={`text-xs font-semibold ${
                formData.comment.length > MAX_COMMENT_LENGTH * 0.8 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {formData.comment.length}/{MAX_COMMENT_LENGTH}
              </span>
            </div>
            <textarea
              value={formData.comment}
              onChange={(e) => {
                const newComment = e.target.value;
                setFormData({ ...formData, comment: newComment });
                // Limpiar error de comentario apenas el usuario escriba
                setErrors((prev) => {
                  const updated = { ...prev };
                  delete updated.comment;
                  return updated;
                });
              }}
              maxLength={MAX_COMMENT_LENGTH}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition resize-none ${
                errors.comment ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-transparent'
              }`}
              rows={5}
              placeholder="Cuéntanos tu experiencia..."
            />
            {errors.comment && <p className="text-red-500 text-xs mt-1">⚠️ {errors.comment}</p>}
            <p className="text-gray-500 text-xs mt-1">Máximo {MAX_COMMENT_LENGTH} caracteres</p>
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Foto (Opcional)</label>
            {previewImage && (
              <div className="relative mb-4">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-48 object-contain rounded-lg bg-gray-50"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition"
                  disabled={loading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition cursor-pointer">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-orange-500" />
                <span className="text-orange-600 font-medium">
                  {previewImage ? 'Cambiar Foto' : 'Subir Foto'}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                disabled={loading}
              />
            </label>
            {errors.image && <p className="text-red-500 text-xs mt-2">⚠️ {errors.image}</p>}
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Formatos:</strong> {ALLOWED_IMAGE_EXTENSIONS.map(e => e.toUpperCase()).join(', ')}
              </p>
              <p className="text-xs text-blue-700">
                <strong>Tamaño máx:</strong> {MAX_IMAGE_SIZE_MB}MB
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Enviando...
                </>
              ) : (
                'Publicar Reseña'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
