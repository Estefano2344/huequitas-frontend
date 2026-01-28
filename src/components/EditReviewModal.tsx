import { AlertCircle, Star, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { updateReview } from '../services/api';
import { Review } from '../types';
import { ALLOWED_IMAGE_EXTENSIONS, MAX_IMAGE_SIZE_MB, validateImageFile, validateRating, validateReviewComment } from '../utils/validators';

interface EditReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  review: Review | null;
}

export default function EditReviewModal({ isOpen, onClose, onSuccess, review }: EditReviewModalProps) {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    image: '' as string,
  });
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const MAX_COMMENT_LENGTH = 250;

  useEffect(() => {
    if (isOpen && review) {
      setFormData({
        rating: review.rating,
        comment: review.comment || '',
        image: review.image || '',
      });
      setPreviewImage(review.image || null);
    }
  }, [isOpen, review]);

  if (!isOpen || !review) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageError = validateImageFile(file);
      if (imageError) {
        setErrors({ ...errors, image: imageError.message });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData({ ...formData, image: base64 });
        setPreviewImage(base64);
        setErrors({ ...errors, image: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: '' });
    setPreviewImage(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    const ratingError = validateRating(formData.rating);
    if (ratingError) newErrors[ratingError.field] = ratingError.message;

    const commentError = validateReviewComment(formData.comment);
    if (commentError) newErrors[commentError.field] = commentError.message;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      await updateReview(
        review._id,
        formData.rating,
        formData.comment,
        formData.image
      );

      onSuccess();
      onClose();
      setFormData({
        rating: 5,
        comment: '',
        image: '',
      });
      setPreviewImage(null);
      setErrors({});
    } catch (error) {
      console.error('Error updating review:', error);
      setErrors({ submit: 'Error updating review. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-6 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-white">Edit Review</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
            disabled={loading}
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

          {/* Rating Stars */}
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
                      star <= formData.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-lg font-semibold text-gray-700">{formData.rating}.0</span>
            </div>
            {errors.rating && <p className="text-red-500 text-xs mt-1">⚠️ {errors.rating}</p>}
          </div>

          {/* Comment */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Comentario
              </label>
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
              placeholder="Cuéntanos tu experiencia..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition resize-none ${
                errors.comment ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-transparent'
              }`}
              rows={4}
              disabled={loading}
            />
            {errors.comment && <p className="text-red-500 text-xs mt-1">⚠️ {errors.comment}</p>}
            <p className="text-gray-500 text-xs mt-1">Máximo {MAX_COMMENT_LENGTH} caracteres</p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Foto (Opcional)
            </label>

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
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all"
                  disabled={loading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer">
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

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
