import React, { useState, useRef } from 'react';
import api from '../utils/axios';
import Spinner from './Spinner';
import { ENDPOINTS } from '../config';
import { geocodeAddress } from '../utils/geocode';

const employeeRoles = {
  MECHANIC_GENERAL: "General Mechanic",
  MECHANIC_WHEELS: "Wheels Mechanic",
  MECHANIC_AC: "A/C Mechanic",
  MECHANIC_BODYWORK: "Bodywork Mechanic",
  MECHANIC_PAINT: "Paint Specialist",
  MECHANIC_ELECTRIC: "Electrician",
  MECHANIC_ENGINE: "Engine Specialist",
  MECHANIC_TRANSMISSION: "Transmission Specialist",
  RECEPTIONIST: "Receptionist",
  CASHIER: "Cashier",
  CLEANER: "Cleaner",
  PARTS_MANAGER: "Parts Manager"
};

const CreateEmployeeModal = ({ isOpen, onClose, onEmployeeCreated, garageId }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'MECHANIC_GENERAL',
    address: {
      country: '',
      city: '',
      street: '',
      number: '',
      zipCode: ''
    },
    garageId: garageId
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const fileInputRef = useRef(null);

  const validateName = (value) => {
    if (!value.trim()) return 'This field is required';
    return '';
  };

  const validateEmailInput = (value) => {
    if (!value.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhoneInput = (value) => {
    if (!value.trim()) return 'Phone number is required';
    if (!/^[+]?[\d\s\-().]{7,}$/.test(value)) return 'Please enter a valid phone number';
    return '';
  };

  const validateAddressField = (value) => {
    if (!value.trim()) return 'This field is required';
    return '';
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return validateName(value);
      case 'email':
        return validateEmailInput(value);
      case 'phoneNumber':
        return validatePhoneInput(value);
      case 'address.country':
      case 'address.city':
      case 'address.street':
      case 'address.number':
      case 'address.zipCode':
        return validateAddressField(value.toString());
      default:
        return '';
    }
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
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      handleAddressChange(addressField, value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (fieldErrors[name]) {
        setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    setProfilePhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    let hasErrors = false;
    const fieldsToValidate = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      'address.country': formData.address?.country,
      'address.city': formData.address?.city,
      'address.street': formData.address?.street,
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
      const employeeData = { ...formData, garageId };
      formDataToSend.append('employeeData', new Blob([JSON.stringify(employeeData)], { type: 'application/json' }));
      if (profilePhoto) {
        formDataToSend.append('profilePhoto', profilePhoto);
      }

      const response = await api.post(ENDPOINTS.GARAGE_OWNER.EMPLOYEES, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onEmployeeCreated(response.data);
      handleClose();
    } catch (err) {
      console.error('Error creating employee:', err);
      setError(err.response?.data?.message || 'Failed to create employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '', lastName: '', email: '', phoneNumber: '', role: 'MECHANIC_GENERAL',
      address: { country: '', city: '', street: '', number: '', zipCode: '' },
      garageId: garageId
    });
    setProfilePhoto(null);
    setPreviewUrl(null);
    setError('');
    setFieldErrors({});
    setTouched({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-xl transform transition-all duration-300 hover:shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-2xl font-bold text-[#708eb3]">Add New Employee</h2>
              <button onClick={handleClose} className="text-[#a4b5c5] hover:text-[#819bb9] transition-colors duration-300" disabled={loading}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center space-y-4 mb-8">
                <div className="relative group">
                  <div className={`h-32 w-32 rounded-full overflow-hidden transition-all duration-300 ${profilePhoto ? 'ring-4 ring-[#92a8bf] shadow-lg' : 'bg-[#92a8bf]'}`}>
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile preview"
                        className="h-full w-full object-cover object-center transform transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <svg 
                          className="w-16 h-16 text-white" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 backdrop-blur-[2px] rounded-full">
                    <div className="flex gap-2 transform transition-all duration-300 scale-95 group-hover:scale-100">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110 active:scale-95"
                        title="Update photo"
                      >
                        <svg className="w-6 h-6 text-[#708eb3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </button>
                      {profilePhoto && (
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110 active:scale-95"
                          title="Delete photo"
                        >
                          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    id="profilePhoto"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    disabled={loading}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-[#819bb9] font-medium">
                    {profilePhoto ? (
                      <span className="flex items-center justify-center space-x-2">
                        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Photo selected! Click the image to change</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <span>Click to upload a profile photo</span>
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    This is optional. You can add a photo later.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#819bb9] mb-2">First Name <span className="text-red-400">*</span></label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-2 rounded-lg border ${fieldErrors.firstName ? 'border-red-400' : 'border-[#a4b5c5]'} focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent`} placeholder="Enter first name" disabled={loading} />
                  {fieldErrors.firstName && <p className="mt-1 text-sm text-red-500">{fieldErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#819bb9] mb-2">Last Name <span className="text-red-400">*</span></label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-2 rounded-lg border ${fieldErrors.lastName ? 'border-red-400' : 'border-[#a4b5c5]'} focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent`} placeholder="Enter last name" disabled={loading} />
                  {fieldErrors.lastName && <p className="mt-1 text-sm text-red-500">{fieldErrors.lastName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#819bb9] mb-2">Email <span className="text-red-400">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-2 rounded-lg border ${fieldErrors.email ? 'border-red-400' : 'border-[#a4b5c5]'} focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent`} placeholder="Enter email" disabled={loading} />
                  {fieldErrors.email && <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#819bb9] mb-2">Phone Number <span className="text-red-400">*</span></label>
                  <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-2 rounded-lg border ${fieldErrors.phoneNumber ? 'border-red-400' : 'border-[#a4b5c5]'} focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent`} placeholder="Enter phone number" disabled={loading} />
                  {fieldErrors.phoneNumber && <p className="mt-1 text-sm text-red-500">{fieldErrors.phoneNumber}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#819bb9] mb-2">Role <span className="text-red-400">*</span></label>
                  <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-[#a4b5c5] focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent" disabled={loading}>
                    {Object.entries(employeeRoles).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-xl font-semibold text-[#708eb3] mb-2 border-t pt-4">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input type="text" name="address.street" value={formData.address.street} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-2 rounded-lg border ${fieldErrors['address.street'] ? 'border-red-400' : 'border-[#a4b5c5]'} focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent`} placeholder="Street" disabled={loading} />
                      {fieldErrors['address.street'] && <p className="mt-1 text-sm text-red-500">{fieldErrors['address.street']}</p>}
                    </div>
                    <div>
                      <input type="number" name="address.number" value={formData.address.number} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-2 rounded-lg border ${fieldErrors['address.number'] ? 'border-red-400' : 'border-[#a4b5c5]'} focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent`} placeholder="Street Number" disabled={loading} />
                      {fieldErrors['address.number'] && <p className="mt-1 text-sm text-red-500">{fieldErrors['address.number']}</p>}
                    </div>
                    <div>
                      <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-2 rounded-lg border ${fieldErrors['address.city'] ? 'border-red-400' : 'border-[#a4b5c5]'} focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent`} placeholder="City" disabled={loading} />
                      {fieldErrors['address.city'] && <p className="mt-1 text-sm text-red-500">{fieldErrors['address.city']}</p>}
                    </div>
                    <div>
                      <input type="text" name="address.country" value={formData.address.country} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-2 rounded-lg border ${fieldErrors['address.country'] ? 'border-red-400' : 'border-[#a4b5c5]'} focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent`} placeholder="Country" disabled={loading} />
                      {fieldErrors['address.country'] && <p className="mt-1 text-sm text-red-500">{fieldErrors['address.country']}</p>}
                    </div>
                    <div>
                      <input type="number" name="address.zipCode" value={formData.address.zipCode} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-2 rounded-lg border ${fieldErrors['address.zipCode'] ? 'border-red-400' : 'border-[#a4b5c5]'} focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent`} placeholder="ZIP Code" disabled={loading} />
                      {fieldErrors['address.zipCode'] && <p className="mt-1 text-sm text-red-500">{fieldErrors['address.zipCode']}</p>}
                    </div>
                  </div>
                </div>
              </div>
              {error && <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg">{error}</div>}
              <div className="flex justify-end gap-4">
                <button type="button" onClick={handleClose} className="px-6 py-3 text-[#819bb9] hover:text-[#708eb3] disabled:opacity-50 transition-all duration-300 hover:scale-105 active:scale-95" disabled={loading}>Cancel</button>
                <button type="submit" disabled={loading} className="bg-[#92a8bf] hover:bg-[#819bb9] text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2">
                  {loading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Adding...</> : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEmployeeModal; 