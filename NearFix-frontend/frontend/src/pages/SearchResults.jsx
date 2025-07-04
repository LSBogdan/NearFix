import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GarageCard from '../components/GarageCard';
import api from '../utils/axios';
import { ENDPOINTS } from '../config';

const DEFAULT_PAGE_SIZE = 10;

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData || location.state;
  // Log the data received from AppointmentModal
  console.log('Received formData from AppointmentModal:', formData);
  const initialGarages = location.state?.garages;
  const initialPage = location.state?.page || 0;
  const initialTotalPages = location.state?.totalPages || 0;
  const [garages, setGarages] = useState(initialGarages || []);
  const [loading, setLoading] = useState(!initialGarages);
  const [error, setError] = useState('');
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  useEffect(() => {
    if (!formData) {
      navigate('/appointments');
      return;
    }
    const fetchGarages = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.post(ENDPOINTS.GARAGES.BASE + '/search', {
          latitude: formData.location.latitude,
          longitude: formData.location.longitude,
          area: formData.area,
          openNow: formData.openNow,
          page,
          size: DEFAULT_PAGE_SIZE
        });
        setGarages(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      } catch (err) {
        setError('Failed to fetch search results.');
      } finally {
        setLoading(false);
      }
    };
    // Only fetch if not restoring from navigation state or if page changes
    if (!initialGarages || page !== initialPage) {
      fetchGarages();
    }
    // eslint-disable-next-line
  }, [formData, page, navigate]);

  const handleViewDetails = (garageId) => {
    navigate(`/garage/${garageId}`, {
      state: {
        from: 'search-results',
        garages,
        formData,
        page,
        totalPages
      }
    });
  };

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-[#f6f3e3] py-4 sm:py-8 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/appointments')}
          className="text-[#92a8bf] hover:text-[#819bb9] mb-4 sm:mb-6 flex items-center gap-2 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to My Appointments
        </button>
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <span>Loading...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-3 sm:p-4 rounded-lg mb-6 sm:mb-8 text-sm sm:text-base">{error}</div>
        ) : garages.length === 0 ? (
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
              <h3 className="text-lg sm:text-xl font-semibold text-[#708eb3]">No services found for your search.</h3>
              <p className="text-sm sm:text-base text-[#819bb9] max-w-md">
                We couldn't find any services matching your criteria. Please try adjusting your search or check back later.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {garages.map(garage => (
                <GarageCard 
                  key={garage.garageId} 
                  garage={garage} 
                  context="search-results" 
                  onViewDetails={() => handleViewDetails(garage.garageId)}
                  formData={formData}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className="px-4 py-2 text-[#819bb9] hover:text-[#708eb3] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Previous
                </button>
                <span className="text-[#819bb9]">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages - 1}
                  className="px-4 py-2 text-[#819bb9] hover:text-[#708eb3] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults; 