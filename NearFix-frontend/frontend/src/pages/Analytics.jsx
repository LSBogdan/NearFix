import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
// If you have react-chartjs-2 and chart.js installed, import them:
// import { Bar } from 'react-chartjs-2';

const Analytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/admin/garages/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        setError('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'ADMIN') fetchStats();
  }, [user]);

  if (!user || user.role !== 'ADMIN') {
    return <div className="min-h-screen flex items-center justify-center text-xl text-red-600">Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-[#f6f3e3] py-8 px-4 sm:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#708eb3] mb-8">Admin Analytics Dashboard</h1>
      {loading ? (
        <div className="flex justify-center items-center py-16">Loading...</div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 animate-fade-in">{error}</div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
                <span className="text-3xl font-bold text-[#708eb3]">{value}</span>
                <span className="text-[#819bb9] mt-2 text-lg capitalize">{key}</span>
              </div>
            ))}
          </div>
          {/* Chart Section */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-xl font-semibold text-[#708eb3] mb-6">Overview</h2>
            {/* Uncomment and use this if you have react-chartjs-2 and chart.js installed */}
            {/*
            <Bar
              data={{
                labels: Object.keys(stats).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
                datasets: [
                  {
                    label: 'Count',
                    data: Object.values(stats),
                    backgroundColor: [
                      '#92a8bf', '#819bb9', '#708eb3', '#f6f3e3', '#f5f7fa'
                    ],
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                },
              }}
            />
            */}
            {/* Placeholder if no chart library */}
            <div className="flex flex-row gap-6 justify-center items-end h-48">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="flex flex-col items-center justify-end h-full">
                  <div
                    className="w-10 sm:w-16 bg-[#92a8bf] rounded-t-xl"
                    style={{ height: `${Math.max(20, (value / Math.max(...Object.values(stats))) * 150)}px` }}
                  ></div>
                  <span className="mt-2 text-[#708eb3] text-sm sm:text-base capitalize">{key}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Analytics; 