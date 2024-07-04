// api.js

import axios from 'axios';
import { useQueryClient } from 'react-query';

const api = axios.create({
  baseURL: 'https://your-api-base-url.com',
  withCredentials: true, // Send cookies along with requests if using them
});

// Axios request interceptor to attach access token to requests
api.interceptors.request.use(
  (config) => {
    const accessToken = sessionStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios response interceptor to handle token refresh on token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error status is 401 (Unauthorized) and originalRequest has not been retried
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token using the refresh token stored in sessionStorage
        const refreshToken = sessionStorage.getItem('refreshToken');
        const response = await axios.post('/api/refreshToken', { refreshToken });

        // Update tokens in sessionStorage
        sessionStorage.setItem('accessToken', response.data.accessToken);

        // Retry original request with new access token
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return axios(originalRequest);
      } catch (error) {
        // Handle refresh token failure (e.g., logout user, redirect to login page)
        console.error('Failed to refresh token:', error);
        // Handle logout or redirect to login page
        // For example:
        window.location.href = '/login'; // Or use history.push('/login')
      }
    }

    return Promise.reject(error);
  }
);

export default api;
