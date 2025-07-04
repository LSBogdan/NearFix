import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import Spinner from './Spinner';
import { ENDPOINTS } from '../config';
import { useNavigate } from 'react-router-dom';

const areaOptions = [
  { value: 'MECHANIC_GENERAL', label: 'General' },
  { value: 'MECHANIC_WHEELS', label: 'Wheels' },
  { value: 'MECHANIC_AC', label: 'A/C' },
  { value: 'MECHANIC_BODYWORK', label: 'Bodywork' },
  { value: 'MECHANIC_PAINT', label: 'Paint' },
  { value: 'MECHANIC_ELECTRIC', label: 'Electric' },
  { value: 'MECHANIC_ENGINE', label: 'Engine' },
  { value: 'MECHANIC_TRANSMISSION', label: 'Transmission' }
];

const AppointmentModal = ({ isOpen, onClose, userAddress }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    vehicleId: '',
    area: '',
    useCurrentLocation: false,
    openNow: false,
    date: ''
  });
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await api.get(ENDPOINTS.VEHICLES.BASE);
        setVehicles(response.data);
        console.log('Fetched vehicles:', response.data);
      } catch (err) {
        setError('Failed to fetch vehicles.');
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) fetchVehicles();
  }, [isOpen]);

  useEffect(() => {
    if (form.useCurrentLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            });
          },
          () => setError('Could not get current location.')
        );
      } else {
        setError('Geolocation not supported.');
      }
    } else if (userAddress) {
      setLocation({
        latitude: userAddress.latitude,
        longitude: userAddress.longitude
      });
    }
  }, [form.useCurrentLocation, userAddress]);

  const isFormValid = () => {
    return (
      form.vehicleId &&
      form.area &&
      location &&
      form.date
    );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    const data = {
      ...form,
      location,
    };
    navigate('/search-results', { state: data });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-xl transform transition-all duration-300 hover:shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-2xl font-bold text-[#708eb3]">Make an Appointment</h2>
              <button onClick={onClose} className="text-[#a4b5c5] hover:text-[#819bb9] transition-colors duration-300">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-32"><Spinner /></div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#819bb9] mb-2">Your Car <span className="text-red-400">*</span></label>
                  <select
                    name="vehicleId"
                    value={form.vehicleId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-[#a4b5c5] focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300 hover:border-[#92a8bf] cursor-pointer appearance-none bg-white bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2392a8bf%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:8px_10px] bg-[right_0.5rem_center] bg-no-repeat pr-8"
                    required
                  >
                    <option value="">Select a car</option>
                    {vehicles.map((v) => (
                      <option key={v.vehicleId} value={v.vehicleId}>{v.brand} {v.model} ({v.plateNumber || v.vin})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#819bb9] mb-2">Problem Area <span className="text-red-400">*</span></label>
                  <select
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-[#a4b5c5] focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300 hover:border-[#92a8bf] cursor-pointer appearance-none bg-white bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2392a8bf%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:8px_10px] bg-[right_0.5rem_center] bg-no-repeat pr-8"
                    required
                  >
                    <option value="">Select area</option>
                    {areaOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-[#e2e8f0] hover:border-[#92a8bf] transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5 text-[#708eb3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-[#819bb9] font-medium">Use Current Location</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="useCurrentLocation"
                        checked={form.useCurrentLocation}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                        form.useCurrentLocation ? 'peer-checked:bg-[#92a8bf]' : 'peer-checked:bg-gray-400'
                      }`}></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-[#e2e8f0] hover:border-[#92a8bf] transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5 text-[#708eb3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[#819bb9] font-medium">Open Now</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="openNow"
                        checked={form.openNow}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                        form.openNow ? 'peer-checked:bg-[#92a8bf]' : 'peer-checked:bg-gray-400'
                      }`}></div>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#819bb9] mb-2">Date <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-[#a4b5c5] focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent"
                    required
                  />
                </div>
                {error && <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg">{error}</div>}
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={onClose} className="px-6 py-3 text-[#819bb9] hover:text-[#708eb3] transition-all duration-300 hover:scale-105 active:scale-95">Cancel</button>
                  <button
                    type="submit"
                    disabled={!isFormValid()}
                    className="bg-[#92a8bf] hover:bg-[#819bb9] text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    Search Services
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal; 