/**
 * Application configuration
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'url/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'NearFix',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
};

// API Endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    PROFILE_PHOTO_REFRESH: '/auth/profile/photo/refresh',
    PROFILE_PHOTO_UPLOAD: '/auth/profile/photo',
    PROFILE_PHOTO_DELETE: '/auth/profile/photo',
  },
  POSTS: {
    BASE: '/posts',
    DETAIL: (postId) => `/posts/${postId}`,
    COMMENTS: (postId) => `/posts/${postId}/comments`,
    COMMENT_DETAIL: (postId, commentId) => `/posts/${postId}/comments/${commentId}`,
    LIKE: (postId) => `/posts/${postId}/like`,
    LIKES: (postId) => `/posts/${postId}/likes`,
    BATCH_LIKES: '/posts/likes/batch',
  },
  COMMENTS: {
    LIKE: (postId, commentId) => `/posts/${postId}/comments/${commentId}/like`,
    LIKES: (postId, commentId) => `/posts/${postId}/comments/${commentId}/likes`,
    BATCH_LIKES: (postId) => `/posts/${postId}/comments/likes/batch`,
  },
  USERS: {
    PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/profile/password',
    DETAIL: (userId) => `/users/${userId}`,
    APPOINTMENTS: '/users/appointments',
  },
  VEHICLES: {
    BASE: '/vehicles',
    DETAIL: (vehicleId) => `/vehicles/${vehicleId}`,
    DELETE_PHOTO: (vehicleId) => `/vehicles/${vehicleId}/photo`,
  },
  GARAGES: {
    BASE: '/garages',
    DETAIL: (garageId) => `/garages/${garageId}`,
    EMPLOYEES: (garageId) => `/garages/${garageId}/employees`,
    DELETE_PHOTO: (garageId) => `/garages/${garageId}/photo`,
    DELETE_DOCUMENT: (garageId) => `/garages/${garageId}/document`,
  },
  ADMIN: {
    REQUESTS: '/admin/requests',
    APPROVE_GARAGE: (garageId) => `/admin/garages/${garageId}/approve`,
    REJECT_GARAGE: (garageId) => `/admin/garages/${garageId}/reject`
  },
  GARAGE_OWNER: {
    EMPLOYEES: '/garage-owner/employees',
    ASSIGNED_APPOINTMENTS: '/garage-owner/employees/appointments/assigned',
  }
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FEED: '/feed',
  PROFILE: '/profile',
  VEHICLES: '/vehicles',
  GARAGES: '/garages',
  POST_DETAIL: (postId) => `/posts/${postId}`,
  ANALYTICS: '/analytics',
  ADMIN_REQUESTS: '/admin/requests',
  APPOINTMENTS: '/appointments',
};

// UI Constants
export const UI = {
  COLORS: {
    PRIMARY: '#92a8bf',
    PRIMARY_DARK: '#819bb9',
    SECONDARY: '#708eb3',
    BACKGROUND: '#f6f3e3',
    TEXT: '#819bb9',
    BORDER: '#a4b5c5',
    NAVBAR: '#e2e7ee',
    ERROR: '#ef4444',
    SUCCESS: '#22c55e',
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
  },
  ANIMATION: {
    DURATION: 300, // milliseconds
  },
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
}; 

// Mapbox Configuration
export const MAPBOX = {
  API_KEY: 'key',
  GEOCODING_BASE_URL: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
  DEFAULT_MAP_STYLE: 'mapbox://styles/mapbox/streets-v12',
  DEFAULT_ZOOM: 15,
  DEFAULT_CENTER: {
    longitude: 0,
    latitude: 0
  }
}; 