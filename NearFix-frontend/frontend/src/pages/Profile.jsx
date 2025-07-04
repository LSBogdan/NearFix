import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import AddressMapModal from '../components/AddressMapModal';
import api from '../utils/axios';
import { ENDPOINTS } from '../config';
import ChangePasswordModal from '../components/ChangePasswordModal';
import EditProfileModal from '../components/EditProfileModal';

const Profile = () => {
  const { user, refreshProfilePhotoUrl } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  const formatRole = (role) => {
    if (!role) return '';
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get(ENDPOINTS.USERS.PROFILE);
      setUserData(response.data);
    } catch (err) {
      setError('Failed to load profile data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoError = async () => {
    // If the photo fails to load, try to refresh the URL
    try {
      const success = await refreshProfilePhotoUrl();
      if (!success) {
        // If refresh failed, try to fetch the full user data
        await fetchUserData();
      }
    } catch (err) {
      console.error('Failed to refresh profile photo URL:', err);
      // If both refresh and fetch fail, show error
      setError('Failed to load profile photo. Please try again later.');
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);
    setUploading(true);

    try {
      const response = await api.put(ENDPOINTS.AUTH.PROFILE_PHOTO_UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data && response.data.profilePhotoUrl) {
        setUserData(prev => ({ ...prev, profilePhotoUrl: response.data.profilePhotoUrl }));
      } else {
        await fetchUserData();
      }
    } catch (err) {
      setError('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      await api.delete(ENDPOINTS.AUTH.PROFILE_PHOTO_DELETE);
      setUserData(prev => ({ ...prev, profilePhotoUrl: null }));
    } catch (err) {
      setError('Failed to delete photo. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f3e3] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6f3e3] flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f3e3] py-8 px-4 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
            {/* Profile Photo Section */}
            <div className="relative group">
              <div className={`w-32 h-32 rounded-full overflow-hidden transition-all duration-300 ${userData?.profilePhotoUrl ? 'ring-4 ring-[#92a8bf] shadow-lg' : 'bg-[#92a8bf]'}`}>
                {userData?.profilePhotoUrl ? (
                  <img
                    src={userData.profilePhotoUrl}
                    alt="Profile"
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                    onError={handlePhotoError}
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
                  <label className="cursor-pointer p-2 bg-white rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110 active:scale-95">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <svg className="w-6 h-6 text-[#708eb3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </label>
                  {userData?.profilePhotoUrl && (
                    <button
                      onClick={handleDeletePhoto}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110 active:scale-95"
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

            {/* User Info Header */}
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-[#708eb3] mb-2">
                {userData?.firstName} {userData?.lastName}
              </h1>
              <p className="text-[#819bb9]">{userData?.email}</p>
              <div className="mt-2 inline-block bg-[#f6f3e3] text-[#708eb3] px-3 py-1 rounded-full text-sm font-medium">
                {formatRole(userData?.role)}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#f8fafc] rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#e2e8f0]">
              <h2 className="text-xl font-semibold text-[#708eb3] mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#819bb9]">Phone Number</label>
                  <p className="text-[#708eb3] font-medium">{userData?.phoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm text-[#819bb9]">Email</label>
                  <p className="text-[#708eb3] font-medium">{userData?.email}</p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-[#f8fafc] rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#e2e8f0]">
              <h2 className="text-xl font-semibold text-[#708eb3] mb-4">Address</h2>
              {userData?.address ? (
                <div 
                  className="space-y-4 cursor-pointer group"
                  onClick={() => setIsMapModalOpen(true)}
                >
                  <div>
                    <label className="block text-sm text-[#819bb9]">Street</label>
                    <p className="text-[#708eb3] font-medium group-hover:text-[#92a8bf] transition-colors duration-300">
                      {userData.address.street} {userData.address.number}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-[#819bb9]">City</label>
                    <p className="text-[#708eb3] font-medium group-hover:text-[#92a8bf] transition-colors duration-300">{userData.address.city}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-[#819bb9]">Country</label>
                    <p className="text-[#708eb3] font-medium group-hover:text-[#92a8bf] transition-colors duration-300">{userData.address.country}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-[#819bb9]">ZIP Code</label>
                    <p className="text-[#708eb3] font-medium group-hover:text-[#92a8bf] transition-colors duration-300">{userData.address.zipCode}</p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMapModalOpen(true);
                      }}
                      className="w-9 h-9 sm:w-auto sm:h-auto p-2 sm:px-4 sm:py-2 bg-[#92a8bf] hover:bg-[#819bb9] text-white rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      title="View address on map"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="hidden sm:inline">View Map</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[#819bb9]">No address provided</p>
              )}
            </div>
          </div>

          {/* Action buttons under both cards */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setIsEditProfileModalOpen(true)}
              className="w-9 h-9 sm:w-auto sm:h-auto p-2 sm:px-4 sm:py-2 bg-[#92a8bf] hover:bg-[#819bb9] text-white rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              title="Edit Profile"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span className="hidden sm:inline">Edit Profile</span>
            </button>
            <button
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="w-9 h-9 sm:w-auto sm:h-auto p-2 sm:px-4 sm:py-2 bg-[#92a8bf] hover:bg-[#819bb9] text-white rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              title="Change Password"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden sm:inline">Change Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Address Map Modal */}
      <AddressMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        address={userData?.address}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        userData={userData}
        onProfileUpdated={fetchUserData}
      />
    </div>
  );
};

export default Profile;
