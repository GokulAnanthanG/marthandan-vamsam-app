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
  getTreeBranch: (treeId: string, rootMemberId?: string, focusMemberId?: string) => {
    const params: Record<string, string> = {};
    if (rootMemberId) params.rootMemberId = rootMemberId;
    if (focusMemberId) params.focusMemberId = focusMemberId;
    return api.get(`/family-trees/${treeId}/tree`, { params });
  },
  addMember: (treeId: string, data: any) => api.post(`/family-trees/${treeId}/members`, data),
  addChild: (treeId: string, parentId: string, data: any) => api.post(`/family-trees/${treeId}/members/${parentId}/children`, data),
  updateMember: (memberId: string, data: any) => api.put(`/family-trees/members/${memberId}`, data),
  addSpouse: (treeId: string, memberId: string, data: any) => api.post(`/family-trees/${treeId}/members/${memberId}/spouse`, data),
  
  submitTreeRequest: (data: any) => api.post('/tree-requests', data),
  
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
    api.get(`/family-trees/${treeId}/members/search`, { params: { q: query } }),
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

// Events API with Categories (Requirement 2)
export const eventsApi = {
  getEvents: (params?: { date?: string; status?: string; category?: string }) =>
    api.get('/events', { params }),
  createEvent: (data: { eventName: string; date: string; time: string; location: string; description?: string; category: string }) =>
    api.post('/events', data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/events/${id}/status`, { status }),
};

// House / Illangal Directory API (Requirement 3)
export const houseApi = {
  getHouses: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/houses', { params }),
  checkAccess: () =>
    api.get('/houses/check-access'),
};

// Business and Work Directory API (Requirement 1 & Requirement 4)
export const businessWorkApi = {
  getBusinesses: (params?: { businessType?: string; relationFilter?: string; search?: string }) =>
    api.get('/business-work/businesses', { params }),
  getWorkProfiles: (params?: { fieldOfWork?: string; relationFilter?: string; search?: string }) =>
    api.get('/business-work/work-profiles', { params }),
  getRelatives: (params?: { search?: string }) =>
    api.get('/business-work/relatives', { params }),
  getEmployees: (ownerId: string) =>
    api.get(`/business-work/businesses/${ownerId}/employees`),
};

// Centralized Access Requests API (Requirement 5)
export const accessRequestApi = {
  createRequest: (data: {
    requestType: 'HOUSE' | 'WORK_ADDRESS' | 'EMPLOYEES' | 'VARAN' | 'BUSINESS';
    targetUserId?: string;
    targetMemberId?: string;
    targetVaranId?: string;
    reason?: string;
  }) => api.post('/access-requests', data),
  getRequestsByTab: (tab: string, status?: string, page: number = 1, limit: number = 20) =>
    api.get('/access-requests', { params: { tab, status, page, limit } }),
  getMySentRequests: () =>
    api.get('/access-requests/my-sent'),
  approveRequest: (id: string) =>
    api.patch(`/access-requests/${id}/approve`),
  rejectRequest: (id: string, rejectionReason: string) =>
    api.patch(`/access-requests/${id}/reject`, { rejectionReason }),
};

// Varan / Matrimonial Directory API (Requirement 5.4)
export const matrimonialApi = {
  getProfiles: (params?: { gender?: string; search?: string }) =>
    api.get('/matrimonial/profiles', { params }),
  getProfileDetail: (id: string) =>
    api.get(`/matrimonial/profiles/${id}`),
  updateAssets: (id: string, assets: {
    bridePhotoUrl?: string;
    groomPhotoUrl?: string;
    jathagamUrl?: string;
    biodataUrl?: string;
    about?: string;
  }) => api.patch(`/matrimonial/profiles/${id}/assets`, assets),
};

// Centralized Notification Module API (Requirement 6)
export const notificationApi = {
  getNotifications: (params?: { unreadOnly?: boolean; page?: number; limit?: number }) =>
    api.get('/notifications', { params }),
  getUnreadCount: () =>
    api.get('/notifications/unread-count'),
  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),
  markAllAsRead: () =>
    api.post('/notifications/mark-all-read'),
};

// User Profile API
export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
};

export default api;
