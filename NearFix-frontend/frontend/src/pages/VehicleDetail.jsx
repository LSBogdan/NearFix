import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { ENDPOINTS } from '../config';
import AppointmentCard from '../components/AppointmentCard';

const VehicleDetail = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState('');

  useEffect(() => {
    const fetchVehicleAndOwner = async () => {
      setLoading(true);
      try {
        const response = await api.get(ENDPOINTS.VEHICLES.DETAIL(vehicleId));
        setVehicle(response.data);
        setError('');
        if (response.data && response.data.userId) {
          try {
            const userResponse = await api.get(ENDPOINTS.USERS.DETAIL(response.data.userId));
            setOwner(userResponse.data);
          } catch (userErr) {
            setOwner(null);
          }
        } else {
          setOwner(null);
        }
      } catch (err) {
        setError('Failed to fetch vehicle details');
        setVehicle(null);
        setOwner(null);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicleAndOwner();
  }, [vehicleId]);

  useEffect(() => {
    const fetchCompletedAppointments = async () => {
      setAppointmentsLoading(true);
      setAppointmentsError('');
      try {
        const res = await api.get(`/vehicles/${vehicleId}/appointments/completed`);
        setAppointments(res.data);
      } catch (err) {
        setAppointmentsError('Failed to fetch completed appointments');
        setAppointments([]);
      } finally {
        setAppointmentsLoading(false);
      }
    };
    fetchCompletedAppointments();
  }, [vehicleId]);

  const isOwner = () => {
    return user && vehicle && user.email === owner?.email;
  };

  const formatMileage = (mileage) => {
    return new Intl.NumberFormat('en-US').format(mileage);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f3e3] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-[#f6f3e3] flex items-center justify-center">
        <div className="text-xl text-gray-800">Vehicle not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f3e3] py-4 sm:py-8 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
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
          Back to Vehicles
        </button>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 animate-fade-in text-sm sm:text-base">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 sm:mb-8">
          {/* Hero Section with Photo */}
          <div className="relative h-64 sm:h-80">
            {vehicle.photoUrl ? (
              <img
                src={vehicle.photoUrl}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#f5f7fa] flex items-center justify-center">
                <svg
                  className="h-24 w-24 text-[#819bb9]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-6 sm:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#708eb3] mb-2">{vehicle.brand} {vehicle.model}</h1>
              <p className="text-[#819bb9] text-base sm:text-lg">
                {vehicle.year} &bull; {vehicle.fuelType}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
              <div className="bg-[#f8fafc] rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#e2e8f0]">
                <h3 className="text-lg sm:text-xl font-semibold text-[#708eb3] mb-4">Vehicle Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-[#819bb9] mb-1">VIN</p>
                    <p className="font-medium text-[#708eb3] break-all">{vehicle.vin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#819bb9] mb-1">Power</p>
                    <p className="font-medium text-[#708eb3]">{vehicle.power} hp</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#819bb9] mb-1">Cylinder Capacity</p>
                    <p className="font-medium text-[#708eb3]">{vehicle.cylinderCapacity} cc</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#819bb9] mb-1">Mileage</p>
                    <p className="font-medium text-[#708eb3]">{formatMileage(vehicle.mileage)} km</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#f8fafc] rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#e2e8f0]">
                <h3 className="text-lg sm:text-xl font-semibold text-[#708eb3] mb-4">Owner Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-[#819bb9] mb-1">Owner Name</p>
                    <p className="font-medium text-[#708eb3]">{owner ? `${owner.firstName} ${owner.lastName}` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#819bb9] mb-1">Phone Number</p>
                    <p className="font-medium text-[#708eb3]">{owner && owner.phoneNumber ? owner.phoneNumber : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#819bb9] mb-1">Contact Email</p>
                    <p className="font-medium text-[#708eb3] break-all">{owner ? owner.email : 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#f8fafc] rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#e2e8f0] col-span-1 sm:col-span-2">
                <h3 className="text-lg sm:text-xl font-semibold text-[#708eb3] mb-4">Completed Appointments</h3>
                {appointmentsLoading ? (
                  <div className="flex justify-center items-center py-8"><Spinner /></div>
                ) : appointmentsError ? (
                  <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 animate-fade-in">{appointmentsError}</div>
                ) : appointments.length === 0 ? (
                  <div className="flex items-center justify-center min-h-[120px] text-[#819bb9] text-center w-full">No completed appointments for this vehicle.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {appointments.map(appt => (
                      <AppointmentCard key={appt.appointmentId} appointment={appt} view="customer" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail; 