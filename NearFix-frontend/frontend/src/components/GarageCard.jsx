import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { ENDPOINTS } from '../config';
import UpdateGarageModal from './UpdateGarageModal';

const GarageCard = ({ garage, onGarageUpdated, context = 'my-garages', onViewDetails, formData }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    const garageData = {
      name: garage.name || '',
      address: garage.address || {},
      schedule: garage.schedule || []
    };
    formData.append('garageData', new Blob([JSON.stringify(garageData)], { type: 'application/json' }));
    formData.append('photo', file);
    setUploading(true);
    setError('');

    try {
      const response = await api.put(ENDPOINTS.GARAGES.DETAIL(garage.garageId), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data) {
        onGarageUpdated(response.data);
      }
    } catch (err) {
      setError('Failed to update photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    setUploading(true);
    setError('');

    try {
      await api.delete(ENDPOINTS.GARAGES.DELETE_PHOTO(garage.garageId));
      
      // Fetch the updated garage data
      const response = await api.get(ENDPOINTS.GARAGES.DETAIL(garage.garageId));
      if (response.data) {
        onGarageUpdated(response.data);
      }
    } catch (err) {
      setError('Failed to delete photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getDayName = (dayOfWeek) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayOfWeek];
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTodaySchedule = () => {
    if (!garage.schedule) return null;
    // JS Date.getDay(): 0=Sunday, 1=Monday, ..., 6=Saturday
    // App: 0=Monday, 6=Sunday
    let today = new Date().getDay();
    today = today === 0 ? 6 : today - 1; // 0 (Sunday) -> 6, 1 (Monday) -> 0, ...
    return garage.schedule.find(day => day.dayOfWeek === today);
  };

  const isOpenNow = () => {
    const todaySchedule = getTodaySchedule();
    if (!todaySchedule || todaySchedule.isClosed) return false;

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
    return currentTime >= todaySchedule.openingTime && currentTime <= todaySchedule.closingTime;
  };

  const isGarageOwner = () => {
    return user && user.email === garage.ownerEmail;
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      navigate(`/garage/${garage.garageId}`, { state: { from: context } });
    }
  };

  const handleBook = async () => {
    if (!formData) {
      setError('Missing appointment data.');
      return;
    }
    try {
      const appointmentRequest = {
        garageId: garage.garageId,
        vehicleId: formData.vehicleId,
        selectedDate: formData.date,
        details: '', // You can add a details field if needed
        area: formData.area
      };
      const response = await api.post(ENDPOINTS.GARAGES.BASE + '/appointments', appointmentRequest);
      alert('Appointment booked successfully!');
      navigate('/appointments'); // Redirect to My Appointments
    } catch (err) {
      setError('Failed to book appointment.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col">
      <div className="relative h-48 group overflow-hidden">
        {garage.photoUrl ? (
          <img
            src={garage.photoUrl}
            alt={garage.name}
            className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-[#f5f7fa] flex items-center justify-center">
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
        {isGarageOwner() && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 backdrop-blur-[2px]">
            <div className="flex gap-2 transform transition-all duration-300 scale-95 group-hover:scale-100">
              <label className="cursor-pointer p-2 bg-white rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={uploading}
                />
                <svg className="w-6 h-6 text-[#708eb3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </label>
              {garage.photoUrl && (
                <button
                  onClick={handleDeletePhoto}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
                  disabled={uploading}
                >
                  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg m-4 animate-fade-in">
          {error}
        </div>
      )}

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-semibold text-[#708eb3] mb-1">{garage.name}</h3>
            </div>
            <div className="flex gap-2">
              {garage.status && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium bg-[#f5f7fa] flex items-center justify-center ${
                  garage.status === 'APPROVED' ? 'text-green-600' :
                  garage.status === 'PENDING' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {garage.status}
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-[#f5f7fa] flex items-center justify-center ${isOpenNow() ? 'text-green-600' : 'text-red-600'}`}> 
                {isOpenNow() ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
          </div>

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
            <div className="col-span-2 flex items-center justify-between">
              <div>
                <p className="text-sm text-[#819bb9] mb-1">Today's Schedule</p>
                {getTodaySchedule() ? (
                  <span className="font-medium text-[#708eb3]">
                    {getTodaySchedule().isClosed ? (
                      'Closed'
                    ) : (
                      <>
                        {formatTime(getTodaySchedule().openingTime)} - {formatTime(getTodaySchedule().closingTime)}
                      </>
                    )}
                  </span>
                ) : (
                  <span className="text-[#819bb9]">No schedule available</span>
                )}
              </div>
              <div>
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
        </div>

        <div className="flex justify-end">
          <div className="flex gap-2 sm:gap-4">
            {context === 'my-garages' ? (
              <>
                <button
                  onClick={() => setIsUpdateModalOpen(true)}
                  className="w-9 h-9 sm:w-auto sm:h-auto p-2 sm:px-4 sm:py-2 bg-[#92a8bf] hover:bg-[#819bb9] text-white rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  title="Edit garage"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span className="hidden sm:inline">Edit</span>
                </button>
                {garage.status === 'APPROVED' && isGarageOwner() && (
                  <button
                    onClick={handleViewDetails}
                    className="w-9 h-9 sm:w-auto sm:h-auto p-2 sm:px-4 sm:py-2 bg-[#92a8bf] hover:bg-[#819bb9] text-white rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    title="View garage details"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="hidden sm:inline">View Details</span>
                  </button>
                )}
              </>
            ) : context === 'search-results' ? (
              <>
                <button
                  onClick={handleBook}
                  className="bg-[#92a8bf] hover:bg-[#819bb9] text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center gap-2 text-sm sm:text-base"
                >
                  Book
                </button>
                <button
                  onClick={handleViewDetails}
                  className="bg-[#92a8bf] hover:bg-[#819bb9] text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center gap-2 text-sm sm:text-base"
                >
                  View Details
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <UpdateGarageModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        garage={garage}
        onGarageUpdated={onGarageUpdated}
      />
    </div>
  );
};

export default GarageCard;
