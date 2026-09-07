import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const API_URL = 'http://10.0.2.2:3000/api'; // Standard Android emulator localhost
const API_URL = 'http://10.44.138.194:3000/api'; // Standard Android emulator localhost
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add access token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 Unauthorized and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Request new token
        const res = await axios.post(`${API_URL}/auth/refresh-token`, {
          token: refreshToken
        });

        const newAccessToken = res.data.data.accessToken;
        const newRefreshToken = res.data.data.refreshToken;

        await AsyncStorage.setItem('accessToken', newAccessToken);
        await AsyncStorage.setItem('refreshToken', newRefreshToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (e.g. revoked). Clear storage.
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('user');
        
        // Let the AuthContext know via an event/emitter or reload app
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const familyTreeApi = {
  getTrees: () => api.get('/family-trees'),
  getTreeBranch: (treeId: string, rootMemberId?: string) => 
    api.get(`/family-trees/${treeId}/tree${rootMemberId ? `?rootMemberId=${rootMemberId}` : ''}`),
  addMember: (treeId: string, data: any) => api.post(`/family-trees/${treeId}/members`, data),
  addChild: (treeId: string, parentId: string, data: any) => api.post(`/family-trees/${treeId}/members/${parentId}/children`, data),
};

export default api;
