import apiClient from './client';

export const companyAPI = {
  // Get current company
  getCompany: async () => {
    const response = await apiClient.get('/companies/me');
    return response.data;
  },

  // Update current company
  updateCompany: async (data) => {
    const response = await apiClient.patch('/companies/me', data);
    return response.data;
  },

  // List company employees (admin only)
  listEmployees: async () => {
    const response = await apiClient.get('/companies/me/employees');
    return response.data;
  },

  // Get specific employee (admin only)
  getEmployee: async (employeeId) => {
    const response = await apiClient.get(`/companies/me/employees/${employeeId}`);
    return response.data;
  },
};
