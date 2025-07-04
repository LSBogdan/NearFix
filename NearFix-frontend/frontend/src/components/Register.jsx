import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';
import { geocodeAddress } from '../utils/geocode';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'CUSTOMER',
    address: {
      country: '',
      city: '',
      street: '',
      number: '',
      zipCode: ''
    }
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();
  const { register } = useAuth();

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhoneNumber = (number) => {
    const re = /^[+]?[\d\s\-().]{7,}$/;
    return re.test(String(number).toLowerCase());
  };

  const validateName = (value) => {
    if (!value.trim()) {
      return 'This field is required';
    }
    return '';
  };

  const validateEmailInput = (value) => {
    if (!value.trim()) {
      return 'Email is required';
    } else if (!validateEmail(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePhoneInput = (value) => {
    if (!value.trim()) {
      return 'Phone number is required';
    } else if (!validatePhoneNumber(value)) {
      return 'Please enter a valid phone number';
    }
    return '';
  };

  const validatePasswordInput = (value) => {
    if (!value.trim()) {
      return 'Password is required';
    } else if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const validateConfirmPassword = (value) => {
    if (!value.trim()) {
      return 'Please confirm your password';
    } else if (value !== formData.password) {
      return 'Passwords do not match';
    }
    return '';
  };

  const validateAddressField = (value) => {
    if (!value.trim()) {
      return 'This field is required';
    }
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
      case 'password':
        return validatePasswordInput(value);
      case 'confirmPassword':
        return validateConfirmPassword(value);
      case 'address.country':
      case 'address.city':
      case 'address.street':
      case 'address.number':
      case 'address.zipCode':
        return validateAddressField(value);
      default:
        return '';
    }
  };

  const handleAddressChange = async (addressField, value) => {
    setFormData(prev => {
      const updatedAddress = { ...prev.address, [addressField]: value };
      const newFormData = { ...prev, address: updatedAddress };
      // Check if all required fields are filled
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
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      handleAddressChange(addressField, value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validatePasswords()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create FormData object
      const formDataToSend = new FormData();
      
      // Add user data as JSON string
      formDataToSend.append('userData', new Blob([JSON.stringify(formData)], {
        type: 'application/json'
      }));
      
      // Add profile photo if selected
      if (profilePhoto) {
        formDataToSend.append('profilePhoto', profilePhoto);
      }

      const result = await register(formDataToSend);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validatePasswords = () => {
    if (formData.password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const isFormValid = () => {
    // Check all required fields
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      validateEmail(formData.email) &&
      formData.phoneNumber.trim() &&
      validatePhoneNumber(formData.phoneNumber) &&
      formData.password.trim() &&
      formData.password.length >= 6 &&
      formData.password === confirmPassword &&
      formData.address.country.trim() &&
      formData.address.city.trim() &&
      formData.address.street.trim() &&
      formData.address.number.toString().trim() &&
      formData.address.zipCode.toString().trim()
    );
  };

  return (
    <div className="min-h-screen w-screen bg-[#f6f3e3] flex items-center justify-center py-8 overflow-x-hidden">
      <div className="w-full max-w-2xl px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
          <h2 className="text-4xl font-bold text-[#708eb3] mb-8 text-center">Create Account</h2>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded mb-6 animate-fade-in">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center space-y-4 mb-8">
              <div className="relative group">
                <div className={`h-48 w-48 rounded-full overflow-hidden transition-all duration-300 ${profilePhoto ? 'ring-4 ring-[#92a8bf] shadow-lg' : 'bg-[#92a8bf]'}`}>
                  {profilePhoto ? (
                    <img
                      src={URL.createObjectURL(profilePhoto)}
                      alt="Profile preview"
                      className="h-full w-full object-cover object-center transform transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <svg 
                        className="w-24 h-24 text-white" 
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
                      onClick={() => document.getElementById('profilePhoto').click()}
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
                        onClick={() => setProfilePhoto(null)}
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
                  id="profilePhoto"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={isLoading}
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
              <div className="space-y-2">
                <label className="block text-[#819bb9] font-medium" htmlFor="firstName">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#a4b5c5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[#819bb9] font-medium" htmlFor="lastName">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#a4b5c5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[#819bb9] font-medium" htmlFor="email">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#a4b5c5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                  required
                  disabled={isLoading}
                  onBlur={handleBlur}
                />
                {errors.email && <p className="text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-[#819bb9] font-medium" htmlFor="phoneNumber">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#a4b5c5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                  required
                  disabled={isLoading}
                  onBlur={handleBlur}
                />
                {errors.phoneNumber && <p className="text-red-500 mt-1">{errors.phoneNumber}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[#819bb9] font-medium" htmlFor="role">
                Role <span className="text-red-400">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#a4b5c5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                required
                disabled={isLoading}
              >
                <option value="CUSTOMER">Customer</option>
                <option value="GARAGE_OWNER">Garage Owner</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[#819bb9] font-medium" htmlFor="password">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#a4b5c5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                  required
                  disabled={isLoading}
                  onBlur={handleBlur}
                />
                {errors.password && <p className="text-red-500 mt-1">{errors.password}</p>}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#819bb9] transition-colors duration-300"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              <div className="space-y-2">
                <label className="block text-[#819bb9] font-medium" htmlFor="confirmPassword">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={validatePasswords}
                    className={`w-full px-4 py-3 border ${
                      passwordError ? 'border-red-400' : 'border-[#a4b5c5]'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300`}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#819bb9] transition-colors duration-300"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-500 mt-1">{passwordError}</p>
                )}
              </div>
            </div>

            <div className="border-t border-[#a4b5c5] pt-6 mt-6">
              <h3 className="text-xl font-semibold text-[#708eb3] mb-6">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[#819bb9] font-medium" htmlFor="country">
                    Country <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="country"
                    name="address.country"
                    type="text"
                    value={formData.address.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#a4b5c5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[#819bb9] font-medium" htmlFor="city">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="city"
                    name="address.city"
                    type="text"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#a4b5c5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[#819bb9] font-medium" htmlFor="street">
                    Street <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="street"
                    name="address.street"
                    type="text"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#a4b5c5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[#819bb9] font-medium" htmlFor="number">
                    Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="number"
                    name="address.number"
                    type="number"
                    value={formData.address.number}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#a4b5c5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[#819bb9] font-medium" htmlFor="zipCode">
                    ZIP Code <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="zipCode"
                    name="address.zipCode"
                    type="number"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#a4b5c5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#92a8bf] hover:bg-[#819bb9] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md hover:shadow-lg"
              disabled={!isFormValid() || isLoading}
              title={!isFormValid() ? 'Please fill in all required fields' : ''}
            >
              {isLoading ? <Spinner /> : 'Create Account'}
            </button>
          </form>
          <p className="mt-6 text-center text-[#a4b5c5]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#92a8bf] hover:text-[#819bb9] font-medium transition-colors duration-300">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 
