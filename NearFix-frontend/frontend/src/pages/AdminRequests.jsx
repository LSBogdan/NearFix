import React, { useEffect, useState } from 'react';
import api, { handleApiError } from '../utils/axios';
import Spinner from '../components/Spinner';
import RejectGarageModal from '../components/RejectGarageModal';

const ADMIN_PENDING_ENDPOINT = '/admin/garages/pending';
const ADMIN_STATUS_ENDPOINT = (garageId) => `/admin/garages/${garageId}/status`;

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [rejectModal, setRejectModal] = useState({ open: false, garageId: null });
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(ADMIN_PENDING_ENDPOINT);
      setRequests(res.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (garageId, status, rejectionReason = '') => {
    setActionLoading((prev) => ({ ...prev, [garageId]: true }));
    setError('');
    try {
      await api.put(ADMIN_STATUS_ENDPOINT(garageId), {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
      });
      setRequests((prev) => prev.filter((g) => g.garageId !== garageId));
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setActionLoading((prev) => ({ ...prev, [garageId]: false }));
    }
  };

  const openRejectModal = (garageId) => {
    setRejectModal({ open: true, garageId });
  };

  const closeRejectModal = () => {
    setRejectModal({ open: false, garageId: null });
  };

  const handleRejectConfirm = (reason) => {
    if (rejectModal.garageId) {
      handleAction(rejectModal.garageId, 'REJECTED', reason);
      closeRejectModal();
    }
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
        <h1 className="text-2xl sm:text-3xl font-bold text-[#708eb3] mb-8">Pending Garage Requests</h1>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-3 sm:p-4 rounded-lg mb-6 sm:mb-8 text-sm sm:text-base">
            {error}
          </div>
        )}
        {requests.length === 0 ? (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 006 0M9 5a3 3 0 016 0"
                />
              </svg>
              <h3 className="text-lg sm:text-xl font-semibold text-[#708eb3]">No Pending Requests</h3>
              <p className="text-sm sm:text-base text-[#819bb9] max-w-md">
                All garage requests have been handled. New requests will appear here for your review.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {requests.map((garage) => (
              <div key={garage.garageId} className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col">
                {garage.photoUrl ? (
                  <img
                    src={garage.photoUrl}
                    alt={garage.name}
                    className="w-full h-48 object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-48 bg-[#f5f7fa] flex items-center justify-center">
                    <svg
                      className="h-16 w-16 text-[#819bb9]"
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
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-[#819bb9] mb-1">Owner</p>
                      <p className="font-medium text-[#708eb3]">{garage.ownerName}</p>
                    </div>
                    <div></div>
                    <div className="col-span-2">
                      <p className="text-sm text-[#819bb9] mb-1">Owner Email</p>
                      <div className="w-full overflow-x-auto">
                        <p className="font-medium text-[#708eb3] whitespace-nowrap">{garage.ownerEmail}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-[#819bb9] mb-1">Weekly Schedule</p>
                      <div className="flex flex-col gap-1">
                        {(() => {
                          // 0=Monday, 6=Sunday in app
                          const daysOfWeek = [
                            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
                          ];
                          const formatTime = (time) => {
                            if (!time) return '';
                            return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          };
                          return daysOfWeek.map((day, idx) => {
                            const daySchedule = garage.schedule?.find(d => d.dayOfWeek === idx);
                            return (
                              <div key={day} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-[#708eb3] w-24">{day}</span>
                                <span className="font-medium text-[#708eb3]">
                                  {daySchedule ? (
                                    daySchedule.isClosed ? (
                                      'Closed'
                                    ) : (
                                      <>
                                        {formatTime(daySchedule.openingTime)} - {formatTime(daySchedule.closingTime)}
                                      </>
                                    )
                                  ) : (
                                    <span className="text-[#819bb9]">No schedule</span>
                                  )}
                                </span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-[#819bb9] mb-1">Document</p>
                      {garage.documentUrl ? (
                        <a
                          href={garage.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Document
                        </a>
                      ) : (
                        <span className="text-[#819bb9]">No document</span>
                      )}
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-[#819bb9] mb-1">Address</p>
                      <span className="font-medium text-[#708eb3]">
                        {garage.address ? (
                          <>
                            {garage.address.street && garage.address.number ? (
                              `${garage.address.street} ${garage.address.number}`
                            ) : (
                              garage.address.street || garage.address.number || ''
                            )}
                            {garage.address.city && `, ${garage.address.city}`}
                            {garage.address.country && `, ${garage.address.country}`}
                            {garage.address.zipCode && ` (${garage.address.zipCode})`}
                          </>
                        ) : (
                          'No address'
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row gap-2 justify-end mt-6">
                    <button
                      className={`w-9 h-9 sm:w-auto sm:h-auto bg-green-500 hover:bg-green-600 text-white p-2 sm:px-4 sm:py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${actionLoading[garage.garageId] ? 'cursor-wait' : ''}`}
                      onClick={() => handleAction(garage.garageId, 'APPROVED')}
                      disabled={actionLoading[garage.garageId]}
                      title="Approve request"
                    >
                      {actionLoading[garage.garageId] ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <>
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="hidden sm:inline">Approve</span>
                        </>
                      )}
                    </button>
                    <button
                      className={`w-9 h-9 sm:w-auto sm:h-auto bg-red-500 hover:bg-red-600 text-white p-2 sm:px-4 sm:py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${actionLoading[garage.garageId] ? 'cursor-wait' : ''}`}
                      onClick={() => openRejectModal(garage.garageId)}
                      disabled={actionLoading[garage.garageId]}
                      title="Reject request"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="hidden sm:inline">Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <RejectGarageModal
        isOpen={rejectModal.open}
        onClose={closeRejectModal}
        onConfirm={handleRejectConfirm}
        loading={actionLoading[rejectModal.garageId]}
      />
    </div>
  );
};

export default AdminRequests; 