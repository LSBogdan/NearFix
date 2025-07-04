import React, { useState, useRef } from 'react';
import api from '../utils/axios';
import { ENDPOINTS } from '../config';
import Spinner from './Spinner';
import { geocodeAddress } from '../utils/geocode';

const CreateGarageModal = ({ isOpen, onClose, onGarageCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: {
      street: '',
      number: '',
      city: '',
      country: '',
      zipCode: ''
    },
    schedule: [
      { dayOfWeek: 0, openingTime: '09:00', closingTime: '17:00', isClosed: false },
      { dayOfWeek: 1, openingTime: '09:00', closingTime: '17:00', isClosed: false },
      { dayOfWeek: 2, openingTime: '09:00', closingTime: '17:00', isClosed: false },
      { dayOfWeek: 3, openingTime: '09:00', closingTime: '17:00', isClosed: false },
      { dayOfWeek: 4, openingTime: '09:00', closingTime: '17:00', isClosed: false },
      { dayOfWeek: 5, openingTime: '09:00', closingTime: '17:00', isClosed: false },
      { dayOfWeek: 6, openingTime: '09:00', closingTime: '17:00', isClosed: true }
    ]
  });
  const [photo, setPhoto] = useState(null);
  const [document, setDocument] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const validateField = (name, value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      switch (name) {
        case 'name':
          return 'Garage name is required';
        case 'address.street':
          return 'Street is required';
        case 'address.city':
          return 'City is required';
        case 'address.country':
          return 'Country is required';
        case 'address.number':
          return 'Street number is required';
        case 'address.zipCode':
          return 'ZIP code is required';
        default:
          return ''; // Non-required fields don't show error when empty
      }
    }
    
    if (name === 'address.number' && (!Number.isInteger(Number(value)) || Number(value) <= 0)) {
      return 'Please enter a valid street number';
    }

    if (name === 'address.zipCode' && (!Number.isInteger(Number(value)) || Number(value) <= 0)) {
      return 'Please enter a valid ZIP code';
    }
    
    return '';
  };

  const handleAddressChange = async (addressField, value) => {
    setFormData(prev => {
      const updatedAddress = { ...prev.address, [addressField]: value };
      const newFormData = { ...prev, address: updatedAddress };
      if (
        updatedAddress.country &&
        updatedAddress.city &&
        updatedAddress.street &&
        updatedAddress.number &&
        updatedAddress.zipCode
      ) {
        geocodeAddress(updatedAddress).then(coords => {
          if (coords) {
            setFormData(f => ({
              ...f,
              address: { ...f.address, latitude: coords.latitude, longitude: coords.longitude }
            }));
          }
        });
      }
      return newFormData;
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      handleAddressChange(addressField, newValue);
      
      // Validate the address field
      const error = validateField(name, newValue);
      setFieldErrors(prev => ({
        ...prev,
        [name]: error
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));

      // Validate the field
      const error = validateField(name, newValue);
      setFieldErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG)');
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setPhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('PDF size should be less than 10MB');
      return;
    }

    setDocument(file);
    setError('');
  };

  const removePhoto = () => {
    setPhoto(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeDocument = () => {
    setDocument(null);
    if (documentInputRef.current) {
      documentInputRef.current.value = '';
    }
  };

  const handleScheduleChange = (dayIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((day, index) => 
        index === dayIndex ? { ...day, [field]: value } : day
      )
    }));
  };

  const getDayName = (dayOfWeek) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayOfWeek];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = {};
    let hasErrors = false;
    
    // Validate top-level fields and address fields
    const fieldsToValidate = {
      name: formData.name,
      'address.street': formData.address?.street,
      'address.city': formData.address?.city,
      'address.country': formData.address?.country,
      'address.number': formData.address?.number,
      'address.zipCode': formData.address?.zipCode
    };
    
    Object.entries(fieldsToValidate).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) {
        errors[key] = error;
        hasErrors = true;
      }
    });
    
    if (hasErrors) {
      setFieldErrors(errors);
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      // Add garage data as JSON
      formDataToSend.append('garageData', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
      
      // Add photo if exists
      if (photo) {
        formDataToSend.append('photo', photo);
      }

      // Add document if exists
      if (document) {
        formDataToSend.append('document', document);
      }
      
      const response = await api.post(
        ENDPOINTS.GARAGES.BASE,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      onGarageCreated(response.data);
      handleClose();
    } catch (err) {
      console.error('Error creating garage:', err);
      
      // Handle specific error cases
      if (err.response?.status === 403) {
        setError('You do not have permission to create a garage. Please contact support if you believe this is an error.');
      } else if (err.response?.data?.message?.includes('duplicate key value')) {
        setError('A garage with these details already exists. Please check the information and try again.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create garage. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      address: {
        street: '',
        number: '',
        city: '',
        country: '',
        zipCode: ''
      },
      schedule: [
        { dayOfWeek: 0, openingTime: '09:00', closingTime: '17:00', isClosed: false },
        { dayOfWeek: 1, openingTime: '09:00', closingTime: '17:00', isClosed: false },
        { dayOfWeek: 2, openingTime: '09:00', closingTime: '17:00', isClosed: false },
        { dayOfWeek: 3, openingTime: '09:00', closingTime: '17:00', isClosed: false },
        { dayOfWeek: 4, openingTime: '09:00', closingTime: '17:00', isClosed: false },
        { dayOfWeek: 5, openingTime: '09:00', closingTime: '17:00', isClosed: false },
        { dayOfWeek: 6, openingTime: '09:00', closingTime: '17:00', isClosed: true }
      ]
    });
    setPhoto(null);
    setDocument(null);
    setPreviewUrl(null);
    setError('');
    setFieldErrors({});
    onClose();
  };

  if (!isOpen) return null;

  console.log(formData);
  
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
              <h2 className="text-2xl font-bold text-[#708eb3]">Add Garage</h2>
              <button
                onClick={handleClose}
                className="text-[#a4b5c5] hover:text-[#819bb9] transition-colors duration-300"
                disabled={loading}
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
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-[#819bb9] mb-2">
                    Garage Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      fieldErrors.name ? 'border-red-400' : 'border-[#a4b5c5]'
                    } focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent`}
                    placeholder="Enter garage name"
                    disabled={loading}
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>
                  )}
                </div>

                {/* Address Fields */}
                <div className="md:col-span-2 space-y-4">
                  <label className="block text-sm font-medium text-[#819bb9] mb-2">
                    Address <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Street */}
                    <div>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          fieldErrors['address.street'] ? 'border-red-400' : 'border-[#a4b5c5]'
                        } focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent`}
                        placeholder="Street"
                        disabled={loading}
                      />
                      {fieldErrors['address.street'] && (
                        <p className="mt-1 text-sm text-red-500">{fieldErrors['address.street']}</p>
                      )}
                    </div>

                    {/* Number */}
                    <div>
                      <input
                        type="number"
                        name="address.number"
                        value={formData.address.number}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          fieldErrors['address.number'] ? 'border-red-400' : 'border-[#a4b5c5]'
                        } focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent`}
                        placeholder="Street Number"
                        disabled={loading}
                      />
                      {fieldErrors['address.number'] && (
                        <p className="mt-1 text-sm text-red-500">{fieldErrors['address.number']}</p>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          fieldErrors['address.city'] ? 'border-red-400' : 'border-[#a4b5c5]'
                        } focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent`}
                        placeholder="City"
                        disabled={loading}
                      />
                      {fieldErrors['address.city'] && (
                        <p className="mt-1 text-sm text-red-500">{fieldErrors['address.city']}</p>
                      )}
                    </div>

                    {/* Country */}
                    <div>
                      <input
                        type="text"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          fieldErrors['address.country'] ? 'border-red-400' : 'border-[#a4b5c5]'
                        } focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent`}
                        placeholder="Country"
                        disabled={loading}
                      />
                      {fieldErrors['address.country'] && (
                        <p className="mt-1 text-sm text-red-500">{fieldErrors['address.country']}</p>
                      )}
                    </div>

                    {/* ZIP Code */}
                    <div>
                      <input
                        type="number"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          fieldErrors['address.zipCode'] ? 'border-red-400' : 'border-[#a4b5c5]'
                        } focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent`}
                        placeholder="ZIP Code"
                        disabled={loading}
                      />
                      {fieldErrors['address.zipCode'] && (
                        <p className="mt-1 text-sm text-red-500">{fieldErrors['address.zipCode']}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Schedule Section */}
                <div className="md:col-span-2 space-y-4">
                  <label className="block text-sm font-medium text-[#819bb9] mb-2">
                    Working Hours
                  </label>
                  <div className="space-y-2">
                    {formData.schedule.map((day, index) => (
                      <div 
                        key={day.dayOfWeek} 
                        className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                          day.isClosed ? 'bg-gray-50' : 'bg-white border border-[#e2e8f0] hover:border-[#92a8bf] shadow-sm hover:shadow-md'
                        }`}
                      >
                        <div className="w-28 flex-shrink-0">
                          <span className={`text-sm font-medium ${day.isClosed ? 'text-gray-400' : 'text-[#4a5568]'}`}>
                            {getDayName(day.dayOfWeek)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!day.isClosed}
                              onChange={(e) => handleScheduleChange(index, 'isClosed', !e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                              day.isClosed ? 'peer-checked:bg-gray-400' : 'peer-checked:bg-[#92a8bf]'
                            }`}></div>
                          </label>
                          
                          {!day.isClosed && (
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 sm:gap-2 w-full">
                                <div className="relative flex-1 min-w-0">
                                  <input
                                    type="time"
                                    value={day.openingTime}
                                    onChange={(e) => handleScheduleChange(index, 'openingTime', e.target.value)}
                                    className="w-full px-1.5 py-1.5 text-xs sm:text-sm border border-[#e2e8f0] rounded-lg focus:ring-1 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-200"
                                  />
                                </div>
                                <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap px-0.5">to</span>
                                <div className="relative flex-1 min-w-0">
                                  <input
                                    type="time"
                                    value={day.closingTime}
                                    onChange={(e) => handleScheduleChange(index, 'closingTime', e.target.value)}
                                    className="w-full px-1.5 py-1.5 text-xs sm:text-sm border border-[#e2e8f0] rounded-lg focus:ring-1 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-200"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Photo and Document Upload Section */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Photo Upload */}
                  <div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="relative group">
                        <div 
                          className={`h-20 w-20 rounded-full overflow-hidden transition-all duration-300 ${previewUrl ? 'ring-2 ring-[#92a8bf] shadow-md' : 'bg-[#92a8bf]'} cursor-pointer`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className={`h-full w-full flex items-center justify-center ${previewUrl ? 'transition-transform duration-300 group-hover:scale-110' : ''}`}>
                            {previewUrl ? (
                              <img
                                src={previewUrl}
                                alt="Garage preview"
                                className="h-full w-full object-cover object-center transform transition-transform duration-300 group-hover:scale-110"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <svg 
                                  className="h-10 w-10 text-white" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 backdrop-blur-[2px] rounded-full">
                          <div className="flex gap-2 transform transition-all duration-300 scale-95 group-hover:scale-100">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
                              title="Update photo"
                            >
                              <svg className="w-4 h-4 text-[#708eb3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                            </button>
                            {previewUrl && (
                              <button
                                type="button"
                                onClick={removePhoto}
                                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
                                title="Delete photo"
                              >
                                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                          disabled={loading}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-[#819bb9] font-medium">
                          {previewUrl ? (
                            <span className="flex items-center justify-center space-x-1">
                              <svg className="h-2.5 w-2.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Photo selected! Click to change</span>
                            </span>
                          ) : (
                            <span className="flex items-center justify-center space-x-1">
                              <span>Click to upload a garage photo</span>
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-[8px] text-gray-400">
                          This is optional. You can add a photo later.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Document Upload */}
                  <div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="relative group">
                        <div 
                          className={`h-20 w-20 rounded-lg overflow-hidden transition-all duration-300 ${document ? 'ring-2 ring-[#92a8bf] shadow-md' : 'bg-[#92a8bf]'} cursor-pointer`}
                          onClick={() => documentInputRef.current?.click()}
                        >
                          <div className="h-full w-full flex items-center justify-center">
                            {document ? (
                              <div className="h-full w-full bg-white flex flex-col items-center justify-center p-2 transform transition-transform duration-300 group-hover:scale-110">
                                <svg className="h-8 w-8 text-[#708eb3] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="text-[8px] text-[#708eb3] font-medium text-center truncate w-full">
                                  {document.name}
                                </span>
                              </div>
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <svg 
                                  className="h-10 w-10 text-white" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 backdrop-blur-[2px] rounded-lg">
                          <div className="flex gap-2 transform transition-all duration-300 scale-95 group-hover:scale-100">
                            <button
                              type="button"
                              onClick={() => documentInputRef.current?.click()}
                              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
                              title="Update document"
                            >
                              <svg className="w-4 h-4 text-[#708eb3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                            </button>
                            {document && (
                              <button
                                type="button"
                                onClick={removeDocument}
                                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
                                title="Delete document"
                              >
                                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          ref={documentInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handleDocumentChange}
                          className="hidden"
                          disabled={loading}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-[#819bb9] font-medium">
                          {document ? (
                            <span className="flex items-center justify-center space-x-1">
                              <svg className="h-2.5 w-2.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Document selected! Click to change</span>
                            </span>
                          ) : (
                            <span className="flex items-center justify-center space-x-1">
                              <span>Click to upload a PDF document</span>
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-[8px] text-gray-400">
                          This is optional. You can add a document later.
                        </p>
                      </div>
                    </div>
                  </div>
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
                  onClick={handleClose}
                  className="px-6 py-3 text-[#819bb9] hover:text-[#708eb3] disabled:opacity-50 transition-all duration-300 hover:scale-105 active:scale-95"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#92a8bf] hover:bg-[#819bb9] text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Adding...
                    </>
                  ) : (
                    'Add Garage'
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

export default CreateGarageModal;
