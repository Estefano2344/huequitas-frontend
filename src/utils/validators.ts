// Validadores reutilizables para el frontend

export interface ValidationError {
  field: string;
  message: string;
}

// ========== EMAIL ==========
export const validateEmail = (email: string): ValidationError | null => {
  if (!email || email.trim() === '') {
    return { field: 'email', message: 'El email es requerido' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'El email no es válido' };
  }
  return null;
};

// ========== NOMBRE ==========
export const validateName = (name: string, fieldName: string = 'nombre'): ValidationError | null => {
  if (!name || name.trim() === '') {
    return { field: fieldName, message: `El ${fieldName} es requerido` };
  }
  if (name.length < 3) {
    return { field: fieldName, message: `El ${fieldName} debe tener al menos 3 caracteres` };
  }
  if (name.length > 50) {
    return { field: fieldName, message: `El ${fieldName} no puede exceder 50 caracteres` };
  }
  if (!/^[a-zA-Z\s'áéíóúñ]+$/.test(name)) {
    return { field: fieldName, message: `El ${fieldName} solo puede contener letras y espacios` };
  }
  return null;
};

// ========== CONTRASEÑA ROBUSTA ==========
export interface PasswordStrength {
  score: number; // 0-4 (0 = muy débil, 4 = muy fuerte)
  level: 'muy-debil' | 'debil' | 'media' | 'fuerte' | 'muy-fuerte';
  suggestions: string[];
}

export const validatePasswordStrength = (password: string): PasswordStrength => {
  const suggestions: string[] = [];
  let score = 0;

  if (!password) {
    return {
      score: 0,
      level: 'muy-debil',
      suggestions: ['La contraseña es requerida'],
    };
  }

  if (password.length < 8) {
    suggestions.push('La contraseña debe tener al menos 8 caracteres');
  } else if (password.length >= 8) {
    score++;
  }

  if (!/[a-z]/.test(password)) {
    suggestions.push('Debe incluir letras minúsculas (a-z)');
  } else {
    score++;
  }

  if (!/[A-Z]/.test(password)) {
    suggestions.push('Debe incluir letras mayúsculas (A-Z)');
  } else {
    score++;
  }

  if (!/[0-9]/.test(password)) {
    suggestions.push('Debe incluir números (0-9)');
  } else {
    score++;
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    suggestions.push('Debe incluir símbolos especiales (!@#$%^&*...)');
  } else {
    score++;
  }

  const levelMap: Record<number, 'muy-debil' | 'debil' | 'media' | 'fuerte' | 'muy-fuerte'> = {
    0: 'muy-debil',
    1: 'debil',
    2: 'media',
    3: 'fuerte',
    4: 'muy-fuerte',
    5: 'muy-fuerte',
  };

  return {
    score: Math.min(score, 4),
    level: levelMap[Math.min(score, 4)],
    suggestions: score === 5 ? [] : suggestions,
  };
};

export const validatePasswordsMatch = (password: string, confirmPassword: string): ValidationError | null => {
  if (password !== confirmPassword) {
    //return { field: 'confirmPassword', message: 'Las contraseñas no coinciden' };
  }
  return null;
};

// ========== RESEÑAS - COMENTARIO ==========
export const validateReviewComment = (comment: string, maxLength: number = 250): ValidationError | null => {
  if (comment && comment.length > maxLength) {
    return {
      field: 'comment',
      message: `El comentario no puede exceder ${maxLength} caracteres (actualmente: ${comment.length})`,
    };
  }
  return null;
};

// ========== RESEÑAS - RATING ==========
export const validateRating = (rating: number): ValidationError | null => {
  if (rating === null || rating === undefined) {
    return { field: 'rating', message: 'La calificación es requerida' };
  }
  if (rating < 1 || rating > 5) {
    return { field: 'rating', message: 'La calificación debe estar entre 1 y 5 estrellas' };
  }
  return null;
};

// ========== IMÁGENES ==========
export const ALLOWED_IMAGE_FORMATS = ['image/jpeg', 'image/jpg'];
export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg'];
export const MAX_IMAGE_SIZE_MB = 4;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export const validateImageFile = (file: File): ValidationError | null => {
  if (!file) {
    return null; // Las imágenes son opcionales
  }

  // Validar tipo de archivo
  if (!ALLOWED_IMAGE_FORMATS.includes(file.type)) {
    return {
      field: 'image',
      message: `Formato de imagen no permitido. Solo se aceptan: ${ALLOWED_IMAGE_EXTENSIONS.join(', ').toUpperCase()}`,
    };
  }

  // Validar tamaño original
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      field: 'image',
      message: `La imagen no puede exceder ${MAX_IMAGE_SIZE_MB}MB (archivo: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    };
  }

  return null;
};

// ========== VALIDACIÓN GENERAL ==========
export const validateRequired = (value: string, fieldName: string): ValidationError | null => {
  if (!value || value.trim() === '') {
    return { field: fieldName, message: `${fieldName} es requerido` };
  }
  return null;
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): ValidationError | null => {
  if (value && value.length < minLength) {
    return {
      field: fieldName,
      message: `${fieldName} debe tener al menos ${minLength} caracteres`,
    };
  }
  return null;
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): ValidationError | null => {
  if (value && value.length > maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} no puede exceder ${maxLength} caracteres (actual: ${value.length})`,
    };
  }
  return null;
};

export const validateNumbersOnly = (value: string, fieldName: string): ValidationError | null => {
  if (value && !/^\d+$/.test(value)) {
    return { field: fieldName, message: `${fieldName} solo puede contener números` };
  }
  return null;
};

// ========== HELPER: Obtener mensaje de fortaleza de contraseña ==========
export const getPasswordStrengthMessage = (strength: PasswordStrength): string => {
  const messages = {
    'muy-debil': '🔴 Muy débil',
    'debil': '🟠 Débil',
    'media': '🟡 Media',
    'fuerte': '🟢 Fuerte',
    'muy-fuerte': '💚 Muy fuerte',
  };
  return messages[strength.level];
};

export const getPasswordStrengthColor = (strength: PasswordStrength): string => {
  const colors = {
    'muy-debil': 'bg-red-500',
    'debil': 'bg-orange-500',
    'media': 'bg-yellow-500',
    'fuerte': 'bg-lime-500',
    'muy-fuerte': 'bg-green-500',
  };
  return colors[strength.level];
};
