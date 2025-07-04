import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { ENDPOINTS, UI } from '../config';
import AppointmentCard from '../components/AppointmentCard';

const AssignedWork = () => {
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
        const response = await api.get(ENDPOINTS.GARAGE_OWNER.ASSIGNED_APPOINTMENTS, {
          params: { page, size: UI.PAGINATION.DEFAULT_PAGE_SIZE }
        });
        setAppointments(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      } catch (err) {
        setError('Failed to fetch assigned work.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [page]);

  return (
    <div className="min-h-screen bg-[#f6f3e3] py-4 sm:py-8 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#708eb3] mb-8">Assigned Work</h1>
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
                className="h-16 w-16 sm:h-20 sm:w-20 text-[#819bb9]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h3 className="text-lg sm:text-xl font-semibold text-[#708eb3]">No Assigned Work Yet</h3>
              <p className="text-sm sm:text-base text-[#819bb9] max-w-md">
                You currently have no assigned work. Assigned jobs will appear here when available.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {appointments.map(appointment => (
                <AppointmentCard key={appointment.appointmentId} appointment={appointment} view="employee" />
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

export default AssignedWork; 