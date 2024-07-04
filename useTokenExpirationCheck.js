// useTokenExpirationCheck.js

import { useEffect } from 'react';
import api from './api';

const useTokenExpirationCheck = () => {
  useEffect(() => {
    const checkTokenExpiration = async () => {
      const tokenExpiration = sessionStorage.getItem('tokenExpiration');
      const currentTime = new Date().getTime();

      // Check if token is expired or close to expiration (e.g., within 5 minutes)
      if (tokenExpiration && currentTime >= parseInt(tokenExpiration, 10) - 5 * 60 * 1000) {
        try {
          // Call API endpoint to refresh token
          const response = await api.post('/refreshToken');

          // Store the new access token and its expiration time
          sessionStorage.setItem('accessToken', response.data.accessToken);
          sessionStorage.setItem('tokenExpiration', new Date().getTime() + response.data.expiresIn * 1000);
        } catch (error) {
          console.error('Failed to refresh token:', error);
          // Handle token refresh failure (e.g., logout user, redirect to login page)
          // For example:
          window.location.href = '/login'; // Or use history.push('/login')
        }
      }
    };

    // Check token expiration initially and then every 5 minutes
    checkTokenExpiration();
    const intervalId = setInterval(checkTokenExpiration, 5 * 60 * 1000);

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);
};

export default useTokenExpirationCheck;
