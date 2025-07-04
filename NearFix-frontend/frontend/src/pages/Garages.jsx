import React, { useState, useEffect } from 'react';
import GarageCard from '../components/GarageCard';
import CreateGarageModal from '../components/CreateGarageModal';
import Spinner from '../components/Spinner';
import api from '../utils/axios';
import { ENDPOINTS } from '../config';

const Garages = () => {
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchGarages = async () => {
    try {
      const response = await api.get(ENDPOINTS.GARAGES.BASE);
      setGarages(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch garages. Please try again later.');
      console.error('Error fetching garages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGarages();
  }, []);

  const handleGarageCreated = (newGarage) => {
    setGarages(prev => [...prev, newGarage]);
    fetchGarages();
  };

  const handleGarageUpdated = (updatedGarage) => {
    setGarages(prev => prev.map(garage => 
      garage.garageId === updatedGarage.garageId ? updatedGarage : garage
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f3e3] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f3e3] py-4 sm:py-8 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#708eb3]">My Garages</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto bg-[#92a8bf] hover:bg-[#819bb9] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Garage
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-3 sm:p-4 rounded-lg mb-6 sm:mb-8 text-sm sm:text-base">
            {error}
          </div>
        )}

        {garages.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
              <svg 
                className="h-16 w-16 sm:h-20 sm:w-20 text-[#819bb9]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" 
                />
              </svg>
              <h3 className="text-lg sm:text-xl font-semibold text-[#708eb3]">No Garages Yet</h3>
              <p className="text-sm sm:text-base text-[#819bb9] max-w-md">
                Click the "Add Garage" button to add your first garage and start managing your business.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {garages.map(garage => (
              <GarageCard 
                key={garage.garageId} 
                garage={garage} 
                onGarageUpdated={handleGarageUpdated}
                context="my-garages"
              />
            ))}
          </div>
        )}
      </div>

      <CreateGarageModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGarageCreated={handleGarageCreated}
      />
    </div>
  );
};

export default Garages;
