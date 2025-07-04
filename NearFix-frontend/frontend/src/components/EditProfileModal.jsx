import React, { useState } from 'react';
import api from '../utils/axios';
import { ENDPOINTS } from '../config';

const EditProfileModal = ({ isOpen, onClose, userData, onProfileUpdated }) => {
  const [email, setEmail] = useState(userData?.email || '');
  const [firstName, setFirstName] = useState(userData?.firstName || '');
  const [lastName, setLastName] = useState(userData?.lastName || '');
  const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber || '');
  const [address, setAddress] = useState(userData?.address || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    setEmail(userData?.email || '');
    setFirstName(userData?.firstName || '');
    setLastName(userData?.lastName || '');
    setPhoneNumber(userData?.phoneNumber || '');
    setAddress(userData?.address || {});
  }, [userData]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.put(ENDPOINTS.USERS.PROFILE, {
        email,
        firstName,
        lastName,
        phoneNumber,
        address
      });
      onProfileUpdated && onProfileUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-xl transform transition-all duration-300 hover:shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#708eb3]">Edit Profile</h2>
            <button onClick={onClose} className="text-[#a4b5c5] hover:text-[#819bb9] transition-colors duration-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {error && <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#819bb9] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#a4b5c5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#819bb9] mb-2">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full px-4 py-3 border border-[#a4b5c5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#819bb9] mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full px-4 py-3 border border-[#a4b5c5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#819bb9] mb-2">Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 border border-[#a4b5c5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#819bb9] mb-2">Street</label>
                <input
                  type="text"
                  name="street"
                  value={address.street || ''}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-[#a4b5c5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#819bb9] mb-2">Number</label>
                <input
                  type="text"
                  name="number"
                  value={address.number || ''}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-[#a4b5c5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#819bb9] mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={address.city || ''}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-[#a4b5c5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#819bb9] mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  value={address.country || ''}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-[#a4b5c5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#819bb9] mb-2">ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={address.zipCode || ''}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-[#a4b5c5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button type="button" onClick={onClose} className="px-6 py-3 text-[#819bb9] hover:text-[#708eb3] transition-all duration-300 hover:scale-105 active:scale-95" disabled={loading}>Cancel</button>
              <button type="submit" className="bg-[#92a8bf] hover:bg-[#819bb9] text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2" disabled={loading}>
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal; 