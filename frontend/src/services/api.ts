// frontend/src/services/api.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ============================================================================
// 🔑 1. CONSTANTS & STORAGE KEYS
// ============================================================================
// LocalStorage-la token store panna use panra key name.
// Oru edathula change panna, whole app-kum automatic-ah maarippom!
//
// 💡 EXAMPLE IN BROWSER STORAGE:
// Key: "emp_mgmt_token"  ===>  Value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
export const TOKEN_STORAGE_KEY = 'emp_mgmt_token';

// ============================================================================
// 🌐 2. CENTRAL AXIOS INSTANCE (The Highway)
// ============================================================================
// Vite .env file-la irunthu baseURL edukkum (http://localhost:3000/api/v1)
// Illana fallback-ah default localhost URL use pannum.
//
// 💡 EXAMPLE:
// apiClient.get('/employees') ===> Calls: 'http://localhost:3000/api/v1/employees'
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds-ku mela backend response tharalana request auto-cancel aagum
});

// ============================================================================
// 🛡️ 3. BODYGUARD 1: REQUEST INTERCEPTOR (The Passport Stamper)
// ============================================================================
// Ovvoru API request backend-ku kelamburathukku oru millisecond munnadi ithu trigger aagum.
// Browser pocket (localStorage)-la token irukanu paakkum.
// Iruntha automatic-ah 'Authorization: Bearer <token>' stamp pottu anuppum!
//
// 💡 EXAMPLE:
// Client calls: apiClient.get('/employees')
// Request Headers before interceptor: { Content-Type: 'application/json' }
// Request Headers after interceptor:  { Content-Type: 'application/json', Authorization: 'Bearer eyJhbG...' }
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    // Token irundha mattum Authorization header inject panrom
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    // Request network-la kelamburathukku munnadiye crash aana inga pudikirom
    return Promise.reject(error);
  }
);

// ============================================================================
// 🚨 4. BODYGUARD 2: RESPONSE INTERCEPTOR (The Bouncer)
// ============================================================================
// Backend response thirumbi browser-ku varum pothu ithu check pannum.
// Status 200/201 (Success) na direct-ah data-va component kitta kuduthudum.
// Oru vela Status 401 Unauthorized (Token fake or expired) na,
// user-oda expired token-ah thooki erinjitu login page-ku kick out pannidum!
//
// 💡 EXAMPLE:
// Backend returns: 401 { message: "Invalid or expired token" }
// Interceptor Action: localStorage.removeItem('emp_mgmt_token') -> window.location.href = '/login'
apiClient.interceptors.response.use(
  (response) => {
    // Everything smooth! Direct-ah response pass panrom
    return response;
  },
  (error: AxiosError) => {
    // Backend tharura error response status code paakrom
    if (error.response && error.response.status === 401) {
      console.warn('⚠️ Session expired or invalid token! Logging out user...');

      // 1. Expired token-ah browser memory-la irunthu delete panrom
      localStorage.removeItem(TOKEN_STORAGE_KEY);

      // 2. User already login page-la illana mattum login page-ku thallurom
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;