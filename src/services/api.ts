import axios from 'axios';

// --- CONFIGURACIÓN ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Importante para CORS según tu backend
});

// --- INTERCEPTOR DE SEGURIDAD ---
// Inyecta el token en cada petición automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- TIPOS (Interfaces basadas en tu Mongoose Models) ---
export interface UserPreferences {
  foodTypes: string[];
  location: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferences?: UserPreferences;
  isProfileComplete?: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface RestaurantLocation {
  sector: 'Norte' | 'Centro' | 'Sur' | 'Valles';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Restaurant {
  _id: string;
  name: string;
  description: string;
  address: string;
  cuisine: string;
  rating?: number;
  totalRatings?: number;
  image?: string;
  location?: RestaurantLocation;
}

export interface RestaurantFilters {
  cuisines?: string[];
  location?: string;
}

export interface Review {
  _id: string;
  restaurantId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  image?: string;
  createdAt: string;
}

// --- SERVICIOS DE AUTENTICACIÓN (Auth Service) ---
// Rutas: /auth/login, /auth/register

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || 'Error en el inicio de sesión';
    console.error("Login error:", errorMessage);
    throw new Error(errorMessage);
  }
};

export const registerUser = async (name: string, email: string, password: string, confirmPassword: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', { name, email, password, confirmPassword });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || 'Error en el registro';
    console.error("Register error:", errorMessage);
    throw new Error(errorMessage);
  }
};

export const resetPasswordRequest = async (email: string) => {
  try {
    const response = await api.post('/auth/password-reset-request', { email });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || 'Error al solicitar reseteo';
    console.error('Reset password request error:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const verifyResetCode = async (email: string, resetCode: string) => {
  try {
    const response = await api.post('/auth/verify-reset-code', { email, resetCode });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || 'Código inválido o expirado';
    console.error('Verify reset code error:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const resetPassword = async (email: string, resetCode: string, newPassword: string, confirmPassword: string) => {
  try {
    const response = await api.post('/auth/password-reset', { email, resetCode, newPassword, confirmPassword });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || 'Error al resetear contraseña';
    console.error('Reset password error:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// --- SERVICIOS DE PERFIL ---

export const getProfile = async (): Promise<User> => {
  try {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || 'Error al obtener perfil';
    console.error('Get profile error:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const updateProfile = async (data: { name?: string; preferences?: Partial<UserPreferences> }): Promise<AuthResponse> => {
  try {
    const response = await api.put<AuthResponse>('/auth/profile', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || 'Error al actualizar perfil';
    console.error('Update profile error:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const completeSetup = async (foodTypes: string[], location: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/profile/complete-setup', { foodTypes, location });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || 'Error al completar configuración';
    console.error('Complete setup error:', errorMessage);
    throw new Error(errorMessage);
  }
};

// --- SERVICIOS CORE (Huecas & Reseñas) ---
// Rutas: /api/restaurants, /api/reviews

export const getRestaurants = async (filters?: RestaurantFilters): Promise<Restaurant[]> => {
  const params = new URLSearchParams();

  if (filters?.cuisines && filters.cuisines.length > 0) {
    params.append('cuisines', filters.cuisines.join(','));
  }

  if (filters?.location) {
    params.append('location', filters.location);
  }

  const queryString = params.toString();
  const url = queryString ? `/api/restaurants?${queryString}` : '/api/restaurants';

  const response = await api.get<Restaurant[]>(url);
  return response.data;
};

export const getRestaurantById = async (id: string): Promise<Restaurant> => {
  const response = await api.get<Restaurant>(`/api/restaurants/${id}`);
  return response.data;
};

export const createRestaurant = async (data: Partial<Restaurant>) => {
  // Requiere Auth
  const response = await api.post('/api/restaurants', data);
  return response.data;
};

export const deleteRestaurant = async (id: string) => {
  // Requiere Auth
  const response = await api.delete(`/api/restaurants/${id}`);
  return response.data;
};

// --- SERVICIOS DE RESEÑAS Y LIKES ---

export const createReview = async (restaurantId: string, rating: number, comment: string, image?: string) => {
  // Requiere Auth
  const response = await api.post('/api/reviews', { restaurantId, rating, comment, image });
  return response.data;
};

export const getReviewsByRestaurant = async (restaurantId: string): Promise<Review[]> => {
  const response = await api.get<Review[]>(`/api/reviews/${restaurantId}`);
  return response.data;
};

export const updateReview = async (reviewId: string, rating: number, comment: string, image?: string) => {
  // Requiere Auth. Solo el dueño puede editar
  const response = await api.put(`/api/reviews/${reviewId}`, { rating, comment, image });
  return response.data;
};

export const deleteReview = async (reviewId: string) => {
  // Requiere Auth. Solo el dueño puede eliminar
  const response = await api.delete(`/api/reviews/${reviewId}`);
  return response.data;
};

export const toggleLike = async (restaurantId: string) => {
  // Requiere Auth. Devuelve { message: string, liked: boolean }
  const response = await api.post('/api/like', { restaurantId });
  return response.data;
};

export const getLikeStatus = async (restaurantId: string) => {
  // Requiere Auth. Devuelve { liked: boolean }
  const response = await api.get(`/api/likes/${restaurantId}`);
  return response.data;
};

// --- SERVICIO DE CHAT (Historial) ---
// Ruta: /chat/messages

export const getChatHistory = async (room: string = 'general') => {
  const response = await api.get(`/chat/messages?room=${room}`);
  return response.data;
};

export default api;