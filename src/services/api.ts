import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const API_URL = 'http://10.0.2.2:3000/api'; // Standard Android emulator localhost
const API_URL = 'http://10.0.2.2:3000/api'; // Standard Android emulator localhost
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
  createTree: (data: any) => api.post('/family-trees', data),
  getTrees: () => api.get('/family-trees'),
  getTreeBranch: (treeId: string, rootMemberId?: string) => 
    api.get(`/family-trees/${treeId}/tree${rootMemberId ? `?rootMemberId=${rootMemberId}` : ''}`),
  addMember: (treeId: string, data: any) => api.post(`/family-trees/${treeId}/members`, data),
  addChild: (treeId: string, parentId: string, data: any) => api.post(`/family-trees/${treeId}/members/${parentId}/children`, data),
  addSpouse: (treeId: string, memberId: string, data: any) => api.post(`/family-trees/${treeId}/members/${memberId}/spouse`, data),
  
  // Phase 2
  moveSubtree: (treeId: string, subtreeRootId: string, newParentId: string) => 
    api.post(`/family-trees/${treeId}/relationships/move-subtree`, { subtreeRootId, newParentId }),
  insertBetween: (treeId: string, parentId: string, childId: string, newMemberData: any) =>
    api.post(`/family-trees/${treeId}/relationships/insert-between`, { parentId, childId, newMemberData }),
  deleteSubtree: (treeId: string, memberId: string) => 
    api.delete(`/family-trees/${treeId}/members/${memberId}`),
  restoreSubtree: (treeId: string, memberId: string) =>
    api.post(`/family-trees/${treeId}/members/${memberId}/restore-subtree`),
  getDeletedMembers: (treeId: string) =>
    api.get(`/family-trees/${treeId}/deleted-members`),
  searchMembers: (treeId: string, query: string) =>
    api.get(`/family-trees/${treeId}/members/search?q=${query}`),
};

export const familyMediaApi = {
  getAllHeadDetails: (treeId: string) =>
    api.get(`/family-media/all-head-details/${treeId}`),
  getHeadDetails: (treeId: string, headMemberId: string) =>
    api.get(`/family-media/head-details/${treeId}/${headMemberId}`),
  updateHeadDetails: (treeId: string, headMemberId: string, data: any) =>
    api.put(`/family-media/head-details/${treeId}/${headMemberId}`, data),
  getBranchPhotos: (rootMemberId: string) =>
    api.get(`/family-media/branch-photos/${rootMemberId}`),
  addBranchPhoto: (rootMemberId: string, data: any) =>
    api.post(`/family-media/branch-photos/${rootMemberId}`, data),
  deleteBranchPhoto: (photoId: string) =>
    api.delete(`/family-media/branch-photos/${photoId}`),
};

// Phase 3
export const familyRequestApi = {
  createRequest: (data: any) => api.post('/family-data-requests', data),
  getRequests: () => api.get('/family-data-requests'),
  approveRequest: (requestId: string) => api.post(`/family-data-requests/${requestId}/approve`),
  rejectRequest: (requestId: string, reviewComment?: string) => api.post(`/family-data-requests/${requestId}/reject`, { reviewComment }),
};

// Phase 4
export const specialAccessApi = {
  requestAccess: (data: any) => api.post('/special-access-permissions', data),
  getPermissions: () => api.get('/special-access-permissions'),
  approveAccess: (permissionId: string) => api.post(`/special-access-permissions/${permissionId}/approve`),
  rejectAccess: (permissionId: string) => api.post(`/special-access-permissions/${permissionId}/reject`),
};

export default api;
