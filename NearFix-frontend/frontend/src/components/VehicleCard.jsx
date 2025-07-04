import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { ENDPOINTS } from '../config';
import UpdateVehicleModal from './UpdateVehicleModal';

const VehicleCard = ({ vehicle, onVehicleUpdated }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const formatMileage = (mileage) => {
    return new Intl.NumberFormat('en-US').format(mileage);
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    const vehicleData = {
      vin: vehicle.vin || '',
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      year: Number(vehicle.year),
      cylinderCapacity: Number(vehicle.cylinderCapacity),
      power: Number(vehicle.power),
      fuelType: vehicle.fuelType || '',
      mileage: Number(vehicle.mileage)
    };
    formData.append('vehicleData', new Blob([JSON.stringify(vehicleData)], { type: 'application/json' }));
    formData.append('photo', file);
    setUploading(true);
    setError('');

    try {
      const response = await api.put(ENDPOINTS.VEHICLES.DETAIL(vehicle.vehicleId), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data) {
        onVehicleUpdated(response.data);
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
      await api.delete(ENDPOINTS.VEHICLES.DELETE_PHOTO(vehicle.vehicleId));
      
      // Fetch the updated vehicle data
      const response = await api.get(ENDPOINTS.VEHICLES.DETAIL(vehicle.vehicleId));
      if (response.data) {
        onVehicleUpdated(response.data);
      }
    } catch (err) {
      setError('Failed to delete photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="relative h-48 group overflow-hidden">
        {vehicle.photoUrl ? (
          <img
            src={vehicle.photoUrl}
            alt={`${vehicle.brand} ${vehicle.model}`}
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
            {vehicle.photoUrl && (
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
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg m-4 animate-fade-in">
          {error}
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-[#708eb3] mb-1">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-[#819bb9]">{vehicle.year}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#f5f7fa] text-[#819bb9]">
            {vehicle.fuelType}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
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
          <div>
            <p className="text-sm text-[#819bb9] mb-1">VIN</p>
            <div className="w-full overflow-x-auto">
              <p className="font-medium text-[#708eb3] whitespace-nowrap">{vehicle.vin}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="w-9 h-9 sm:w-auto sm:h-auto p-2 sm:px-4 sm:py-2 bg-[#92a8bf] hover:bg-[#819bb9] text-white rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              title="Edit vehicle"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span className="hidden sm:inline">Edit</span>
            </button>
            <Link
              to={`/vehicles/${vehicle.vehicleId}`}
              className="w-9 h-9 sm:w-auto sm:h-auto p-2 sm:px-4 sm:py-2 bg-[#92a8bf] hover:bg-[#819bb9] text-white rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              title="View details"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="hidden sm:inline">View Details</span>
            </Link>
          </div>
        </div>
      </div>

      <UpdateVehicleModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        vehicle={vehicle}
        onVehicleUpdated={onVehicleUpdated}
      />
    </div>
  );
};

export default VehicleCard; 