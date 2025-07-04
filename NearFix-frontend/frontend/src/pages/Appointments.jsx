import React, { useState, useEffect } from 'react';
import AppointmentModal from '../components/AppointmentModal';
import api from '../utils/axios';
import { ENDPOINTS, UI } from '../config';
import AppointmentCard from '../components/AppointmentCard';

const mockUserAddress = {
  latitude: 44.4268, // Replace with real user address lat
  longitude: 26.1025 // Replace with real user address lng
};

const Appointments = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(ENDPOINTS.USERS.APPOINTMENTS, {
          params: { page, size: UI.PAGINATION.DEFAULT_PAGE_SIZE }
        });
        setAppointments(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      } catch (err) {
        setError('Failed to fetch appointments.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [page]);

  const handleMakeAppointment = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f6f3e3] py-4 sm:py-8 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#708eb3]">My Appointments</h1>
          <button
            onClick={handleMakeAppointment}
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
            Make an Appointment
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <span>Loading...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-3 sm:p-4 rounded-lg mb-6 sm:mb-8 text-sm sm:text-base">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
              <svg
                className="h-12 w-12 sm:h-16 sm:w-16 text-[#819bb9]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-lg sm:text-xl font-semibold text-[#708eb3]">No Appointments Yet</h3>
              <p className="text-sm sm:text-base text-[#819bb9] max-w-md">
                Click the "Make an Appointment" button to schedule your first appointment.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {appointments.map(appointment => (
                <AppointmentCard key={appointment.appointmentId} appointment={appointment} />
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
      <AppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userAddress={mockUserAddress}
      />
    </div>
  );
};

export default Appointments; 