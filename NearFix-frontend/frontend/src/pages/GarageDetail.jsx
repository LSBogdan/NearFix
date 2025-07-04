import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Spinner from '../components/Spinner';
import GarageLocationMap from '../components/GarageLocationMap';
import EmployeeCard from '../components/EmployeeCard';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { ENDPOINTS } from '../config';
import CreateEmployeeModal from '../components/CreateEmployeeModal';

const GarageDetail = () => {
  const { garageId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [garage, setGarage] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateEmployeeModalOpen, setCreateEmployeeModalOpen] = useState(false);

  // Determine entry point
  const entryPoint = location.state?.from || 'my-garages';
  const prevGarages = location.state?.garages;
  const prevFormData = location.state?.formData;

  const fetchGarage = async () => {
    try {
      const response = await api.get(ENDPOINTS.GARAGES.DETAIL(garageId));
      setGarage(response.data);
    } catch (err) {
      setError('Failed to fetch garage details');
      console.error('Error fetching garage:', err);
    } 
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get(ENDPOINTS.GARAGES.EMPLOYEES(garageId));
      setEmployees(response.data);
    } catch (err) {
      setError('Failed to fetch employees');
      console.error('Error fetching employees:', err);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchGarage(), fetchEmployees()]);
      setLoading(false);
    }
    fetchData();
  }, [garageId]);

  const handleEmployeeCreated = () => {
    setCreateEmployeeModalOpen(false);
    fetchEmployees();
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
    if (!garage?.schedule) return null;
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
    return user && user.email === garage?.ownerEmail;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f3e3] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!garage) {
    return (
      <div className="min-h-screen bg-[#f6f3e3] flex items-center justify-center">
        <div className="text-xl text-gray-800">Garage not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f3e3] py-4 sm:py-8 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => {
            if (entryPoint === 'search-results') {
              navigate('/search-results', { state: prevFormData ? { formData: prevFormData, garages: prevGarages } : undefined });
            } else {
              navigate('/garages');
            }
          }}
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
          {entryPoint === 'search-results' ? 'Back to Search Results' : 'Back to My Garages'}
        </button>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 animate-fade-in text-sm sm:text-base">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 sm:mb-8">
          {/* Hero Section with Photo */}
          <div className="relative h-64 sm:h-80">
            {garage.photoUrl ? (
              <img
                src={garage.photoUrl}
                alt={garage.name}
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              {garage.status && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium bg-white/90 backdrop-blur-sm flex items-center justify-center ${
                  garage.status === 'APPROVED' ? 'text-green-600' :
                  garage.status === 'PENDING' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {garage.status}
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-white/90 backdrop-blur-sm flex items-center justify-center ${isOpenNow() ? 'text-green-600' : 'text-red-600'}`}> 
                {isOpenNow() ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 sm:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#708eb3] mb-2">{garage.name}</h1>
              <p className="text-[#819bb9] text-base sm:text-lg">
                Professional automotive services and repairs
              </p>
            </div>

            {/* Owner Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
              <div className="bg-[#f8fafc] rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#e2e8f0]">
                <h3 className="text-lg sm:text-xl font-semibold text-[#708eb3] mb-4">Owner Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-[#819bb9] mb-1">Owner Name</p>
                    <p className="font-medium text-[#708eb3]">{garage.ownerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#819bb9] mb-1">Phone Number</p>
                    <p className="font-medium text-[#708eb3]">{garage.ownerPhoneNumber ? garage.ownerPhoneNumber : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#819bb9] mb-1">Contact Email</p>
                    <p className="font-medium text-[#708eb3] break-all">{garage.ownerEmail}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#f8fafc] rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#e2e8f0]">
                <h3 className="text-lg sm:text-xl font-semibold text-[#708eb3] mb-4">Location</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-[#819bb9] mb-1">Address</p>
                    <p className="font-medium text-[#708eb3]">
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
                        'No address available'
                      )}
                    </p>
                  </div>
                  <div className="mt-4">
                    <GarageLocationMap address={garage.address} />
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="bg-[#f8fafc] rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#e2e8f0] mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-[#708eb3] mb-4">Operating Hours</h3>
              {garage.schedule && garage.schedule.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {garage.schedule.map((day) => (
                    <div key={day.scheduleId} className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 border border-[#e2e8f0]">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[#708eb3]">{getDayName(day.dayOfWeek)}</span>
                        <span className="text-sm text-[#819bb9]">
                          {day.isClosed ? (
                            'Closed'
                          ) : (
                            `${formatTime(day.openingTime)} - ${formatTime(day.closingTime)}`
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#819bb9]">No schedule available</p>
              )}
            </div>

            {/* Our Team Section */}
            <div className="bg-[#f8fafc] rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#e2e8f0] mb-6 sm:mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-[#708eb3]">Our Team</h3>
                {isGarageOwner() && (
                  <button
                    onClick={() => setCreateEmployeeModalOpen(true)}
                    className="bg-[#92a8bf] hover:bg-[#819bb9] text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center gap-2 text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Employee
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Owner Card */}
                {garage && (
                  <EmployeeCard 
                    employee={{
                      firstName: garage.ownerName.split(' ')[0],
                      lastName: garage.ownerName.split(' ')[1] || '',
                      profilePhotoUrl: garage.ownerProfilePhotoUrl,
                      email: garage.ownerEmail,
                      phoneNumber: garage.ownerPhoneNumber
                    }}
                    isOwner={true}
                  />
                )}
                {/* Employee Cards */}
                {employees.map(employee => (
                  <EmployeeCard key={employee.userId} employee={employee} />
                ))}
              </div>
            </div>

            {/* Documents Section */}
            {garage.documentUrl && (
              <div className="bg-[#f8fafc] rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#e2e8f0] mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-semibold text-[#708eb3] mb-4">Documents</h3>
                <div className="flex items-center gap-3">
                  <svg className="h-6 w-6 text-[#819bb9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <a
                    href={garage.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    View Garage Documents
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <CreateEmployeeModal
        isOpen={isCreateEmployeeModalOpen}
        onClose={() => setCreateEmployeeModalOpen(false)}
        onEmployeeCreated={handleEmployeeCreated}
        garageId={garageId}
      />
    </div>
  );
};

export default GarageDetail;