import apiClient from './client';

export const userAPI = {
  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  // Update current user profile
  updateProfile: async (data) => {
    const response = await apiClient.patch('/users/me', data);
    return response.data;
  },
};
