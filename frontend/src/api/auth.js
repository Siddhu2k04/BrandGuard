import apiClient from './client';

export const authAPI = {
  // Company registration
  registerCompany: async (data) => {
    const response = await apiClient.post('/auth/register/company', data);
    return response.data;
  },

  // Employee registration
  registerEmployee: async (data) => {
    const response = await apiClient.post('/auth/register/employee', data);
    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    await apiClient.post('/auth/logout');
  },
};
