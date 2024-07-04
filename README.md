Integrating token expiration checks with `react-query` involves using the `useQuery` hook along with a custom hook or function to manage token expiration and refresh. Here’s a sample implementation to demonstrate how you can achieve this in a React application using `react-query` for data fetching and token management:

### Step-by-Step Implementation

#### 1. Setup `react-query` with Axios

First, configure `react-query` to use Axios for API requests. You'll also need to handle token expiration and refresh within your Axios setup.

```javascript
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
```

#### 2. Implement `useTokenExpirationCheck` Hook

Create a custom hook or function that periodically checks the token expiration and refreshes the token as needed. This hook will be used in components that require authenticated API calls.

```javascript
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
```

#### 3. Use `useTokenExpirationCheck` in Your Components

Finally, use the `useTokenExpirationCheck` hook in components where you use `react-query` to fetch data. This ensures that tokens are refreshed automatically before they expire.

```javascript
// Dashboard.js (Example component using react-query)

import React from 'react';
import { useQuery } from 'react-query';
import api from './api';
import useTokenExpirationCheck from './useTokenExpirationCheck';

const Dashboard = () => {
  useTokenExpirationCheck(); // Hook to check and refresh tokens

  const { data, isLoading, isError } = useQuery('dashboardData', async () => {
    const response = await api.get('/dashboardData');
    return response.data;
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error fetching data...</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      {/* Display dashboard data */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default Dashboard;
```

### Summary

By integrating token expiration checks with `react-query`, you ensure that your React application can automatically refresh tokens before they expire, providing a seamless user experience with minimal disruption. This approach leverages Axios interceptors for token management and a custom hook (`useTokenExpirationCheck`) to handle token refresh logic. Adjust the example code according to your specific authentication flow, backend setup, and security requirements. Always handle tokens securely and validate inputs to prevent security vulnerabilities in your application.
