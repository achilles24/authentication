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
