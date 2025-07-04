import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { ENDPOINTS } from '../config';
import { carMakes, getModelsForMake } from '../utils/carMakesAndModels';
import AutocompleteSelect from './AutocompleteSelect';

const UpdateVehicleModal = ({ isOpen, onClose, vehicle, onVehicleUpdated }) => {
  const [formData, setFormData] = useState({
    vin: vehicle.vin || '',
    brand: vehicle.brand || '',
    model: vehicle.model || '',
    year: vehicle.year || '',
    cylinderCapacity: vehicle.cylinderCapacity || '',
    power: vehicle.power || '',
    fuelType: vehicle.fuelType || '',
    mileage: vehicle.mileage || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [availableModels, setAvailableModels] = useState([]);
  
  // Update available models when brand changes
  useEffect(() => {
    if (formData.brand) {
      setAvailableModels(getModelsForMake(formData.brand));
      // Reset model when brand changes
      if (formData.model && !getModelsForMake(formData.brand).includes(formData.model)) {
        setFormData(prev => ({ ...prev, model: '' }));
      }
    } else {
      setAvailableModels([]);
      setFormData(prev => ({ ...prev, model: '' }));
    }
  }, [formData.brand]);
  
  // Initialize available models when component mounts or vehicle changes
  useEffect(() => {
    if (vehicle.brand) {
      setAvailableModels(getModelsForMake(vehicle.brand));
    }
  }, [vehicle.brand]);

  const hasChanges = () => {
    return Object.keys(formData).some(key => {
      if (key === 'year' || key === 'cylinderCapacity' || key === 'power' || key === 'mileage') {
        return Number(formData[key]) !== Number(vehicle[key]);
      }
      return formData[key] !== vehicle[key];
    });
  };

  const isFormValid = () => {
    return Object.keys(formData).every(key => {
      if (key === 'fuelType') {
        return formData[key] !== '';
      }
      return !validateField(key, formData[key]);
    });
  };

  const validateVIN = (vin) => {
    if (!vin) return 'VIN is required';
    if (vin.length !== 17) return 'VIN must be exactly 17 characters';
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) return 'VIN must contain only valid characters (A-H, J-N, P-Z, 0-9)';
    return '';
  };

  const validateYear = (year) => {
    if (!year) return 'Year is required';
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year);
    if (yearNum < 1900 || yearNum > currentYear + 1) {
      return `Year must be between 1900 and ${currentYear + 1}`;
    }
    return '';
  };

  const validateCylinderCapacity = (capacity) => {
    if (!capacity) return 'Cylinder capacity is required';
    const capacityNum = parseInt(capacity);
    if (capacityNum < 50 || capacityNum > 10000) {
      return 'Cylinder capacity must be between 50cc and 10000cc';
    }
    return '';
  };

  const validatePower = (power) => {
    if (!power) return 'Power is required';
    const powerNum = parseInt(power);
    if (powerNum < 1 || powerNum > 2000) {
      return 'Power must be between 1 and 2000 horsepower';
    }
    return '';
  };

  const validateMileage = (mileage) => {
    if (!mileage) return 'Mileage is required';
    const mileageNum = parseInt(mileage);
    if (mileageNum < 0 || mileageNum > 1000000) {
      return 'Mileage must be between 0 and 1,000,000 km';
    }
    return '';
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'vin':
        return validateVIN(value);
      case 'year':
        return validateYear(value);
      case 'cylinderCapacity':
        return validateCylinderCapacity(value);
      case 'power':
        return validatePower(value);
      case 'mileage':
        return validateMileage(value);
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate the field
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate all fields before submission
    const errors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      const vehicleData = {
        vin: formData.vin,
        brand: formData.brand,
        model: formData.model,
        year: Number(formData.year),
        cylinderCapacity: Number(formData.cylinderCapacity),
        power: Number(formData.power),
        fuelType: formData.fuelType,
        mileage: Number(formData.mileage)
      };
      
      formDataToSend.append('vehicleData', new Blob([JSON.stringify(vehicleData)], { type: 'application/json' }));

      const response = await api.put(ENDPOINTS.VEHICLES.DETAIL(vehicle.vehicleId), formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        onVehicleUpdated(response.data);
        onClose();
      }
    } catch (err) {
      setError('Failed to update vehicle. Please try again.');
      console.error('Error updating vehicle:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-xl transform transition-all duration-300 hover:shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-2xl font-bold text-[#708eb3]">Update Vehicle</h2>
              <button
                onClick={onClose}
                className="text-[#a4b5c5] hover:text-[#819bb9] transition-colors duration-300"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#819bb9] mb-2">
                    VIN <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="vin"
                    value={formData.vin}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      fieldErrors.vin ? 'border-red-400' : 'border-[#a4b5c5]'
                    } focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent`}
                  />
                  {fieldErrors.vin && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.vin}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#819bb9] mb-2">
                    Brand <span className="text-red-400">*</span>
                  </label>
                  <AutocompleteSelect
                    name="brand"
                    options={carMakes}
                    value={formData.brand}
                    onChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}
                    placeholder="Select a brand"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#819bb9] mb-2">
                    Model <span className="text-red-400">*</span>
                  </label>
                  <AutocompleteSelect
                    name="model"
                    options={availableModels}
                    value={formData.model}
                    onChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
                    placeholder={formData.brand ? "Select a model" : "Select a brand first"}
                    disabled={!formData.brand}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#819bb9] mb-2">
                    Year <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      fieldErrors.year ? 'border-red-400' : 'border-[#a4b5c5]'
                    } focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent`}
                  />
                  {fieldErrors.year && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.year}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#819bb9] mb-2">
                    Cylinder Capacity (cc) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="cylinderCapacity"
                    value={formData.cylinderCapacity}
                    onChange={handleChange}
                    required
                    min="50"
                    max="10000"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      fieldErrors.cylinderCapacity ? 'border-red-400' : 'border-[#a4b5c5]'
                    } focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent`}
                  />
                  {fieldErrors.cylinderCapacity && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.cylinderCapacity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#819bb9] mb-2">
                    Power (hp) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="power"
                    value={formData.power}
                    onChange={handleChange}
                    required
                    min="1"
                    max="2000"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      fieldErrors.power ? 'border-red-400' : 'border-[#a4b5c5]'
                    } focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent`}
                  />
                  {fieldErrors.power && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.power}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#819bb9] mb-2">
                    Fuel Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-[#a4b5c5] focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300 hover:border-[#92a8bf] cursor-pointer appearance-none bg-white bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2392a8bf%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:8px_10px] bg-[right_0.5rem_center] bg-no-repeat pr-8"
                  >
                    <option value="">Select fuel type</option>
                    <option value="PETROL">Petrol</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="ELECTRIC">Electric</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="LPG">LPG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#819bb9] mb-2">
                    Mileage (km) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleChange}
                    required
                    min="0"
                    max="1000000"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      fieldErrors.mileage ? 'border-red-400' : 'border-[#a4b5c5]'
                    } focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent`}
                  />
                  {fieldErrors.mileage && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.mileage}</p>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-[#819bb9] hover:text-[#708eb3] disabled:opacity-50 transition-all duration-300 hover:scale-105 active:scale-95"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !isFormValid() || !hasChanges()}
                  className="bg-[#92a8bf] hover:bg-[#819bb9] text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Vehicle'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateVehicleModal; 