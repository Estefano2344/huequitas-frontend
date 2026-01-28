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
  description?: string;
  address?: string;
  cuisine: string;
  image?: string;
  location?: RestaurantLocation;
  rating?: number;
  totalRatings?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  _id: string;
  restaurantId: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  image?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}
