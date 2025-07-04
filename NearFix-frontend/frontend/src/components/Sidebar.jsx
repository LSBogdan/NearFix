import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../config';

const Sidebar = ({ isCollapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div 
      className={`fixed left-0 top-0 h-screen bg-white shadow-lg border-r border-[#a4b5c5] flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo and App Name */}
      <div className="p-6 border-b border-[#a4b5c5] flex items-center justify-between">
        {!isCollapsed && <span className="text-2xl font-bold text-[#708eb3]">NearFix</span>}
        {!isMobile && (
          <button
            onClick={() => onCollapse(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-[#f6f3e3] transition-colors duration-200"
          >
            <svg
              className={`h-5 w-5 text-[#819bb9] transform transition-transform duration-300 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6">
        <nav className="space-y-2 px-4">
          {/* Home Button */}
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 flex items-center ${
              isCollapsed ? 'justify-center' : 'gap-3'
            } ${
              isActive(ROUTES.HOME)
                ? 'bg-[#92a8bf] text-white shadow-md'
                : 'text-[#819bb9] hover:bg-[#f6f3e3] hover:text-[#708eb3]'
            }`}
          >
            <svg 
              className="h-5 w-5 flex-shrink-0" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
              />
            </svg>
            {!isCollapsed && <span>Home</span>}
          </button>

          {/* Feed Button */}
          <button
            onClick={() => navigate(ROUTES.FEED)}
            className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 flex items-center ${
              isCollapsed ? 'justify-center' : 'gap-3'
            } ${
              isActive(ROUTES.FEED)
                ? 'bg-[#92a8bf] text-white shadow-md'
                : 'text-[#819bb9] hover:bg-[#f6f3e3] hover:text-[#708eb3]'
            }`}
          >
            <svg 
              className="h-5 w-5 flex-shrink-0" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" 
              />
            </svg>
            {!isCollapsed && <span>Feed</span>}
          </button>

          {/* My Vehicles Button */}
          <button
            onClick={() => navigate(ROUTES.VEHICLES)}
            className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 flex items-center ${
              isCollapsed ? 'justify-center' : 'gap-3'
            } ${
              isActive(ROUTES.VEHICLES)
                ? 'bg-[#92a8bf] text-white shadow-md'
                : 'text-[#819bb9] hover:bg-[#f6f3e3] hover:text-[#708eb3]'
            }`}
          >
            <svg 
              className="h-5 w-5 flex-shrink-0" 
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
            {!isCollapsed && <span>My Vehicles</span>}
          </button>

          {/* My Appointments Button */}
          <button
            onClick={() => navigate(ROUTES.APPOINTMENTS)}
            className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 flex items-center ${
              isCollapsed ? 'justify-center' : 'gap-3'
            } ${
              isActive(ROUTES.APPOINTMENTS)
                ? 'bg-[#92a8bf] text-white shadow-md'
                : 'text-[#819bb9] hover:bg-[#f6f3e3] hover:text-[#708eb3]'
            }`}
          >
            <svg 
              className="h-5 w-5 flex-shrink-0" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            {!isCollapsed && <span>My Appointments</span>}
          </button>

          {/* My Garages Button - Only visible for GARAGE_OWNER */}
          {user?.role === 'GARAGE_OWNER' && (
            <button
              onClick={() => navigate(ROUTES.GARAGES)}
              className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 flex items-center ${
                isCollapsed ? 'justify-center' : 'gap-3'
              } ${
                isActive(ROUTES.GARAGES)
                  ? 'bg-[#92a8bf] text-white shadow-md'
                  : 'text-[#819bb9] hover:bg-[#f6f3e3] hover:text-[#708eb3]'
              }`}
            >
              <svg 
                className="h-5 w-5 flex-shrink-0" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" 
                />
              </svg>
              {!isCollapsed && <span>My Garages</span>}
            </button>
          )}

          {/* Assigned Work Button - Only visible for mechanics */}
          {(user?.role === 'MECHANIC_GENERAL' || 
            user?.role === 'MECHANIC_WHEELS' || 
            user?.role === 'MECHANIC_AC' || 
            user?.role === 'MECHANIC_BODYWORK' || 
            user?.role === 'MECHANIC_PAINT' || 
            user?.role === 'MECHANIC_ELECTRIC' || 
            user?.role === 'MECHANIC_ENGINE' || 
            user?.role === 'MECHANIC_TRANSMISSION') && (
            <button
              onClick={() => navigate(ROUTES.ASSIGNED_WORK || '/assigned-work')}
              className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 flex items-center ${
                isCollapsed ? 'justify-center' : 'gap-3'
              } ${
                isActive(ROUTES.ASSIGNED_WORK || '/assigned-work')
                  ? 'bg-[#92a8bf] text-white shadow-md'
                  : 'text-[#819bb9] hover:bg-[#f6f3e3] hover:text-[#708eb3]'
              }`}
            >
              <svg 
                className="h-5 w-5 flex-shrink-0" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
              {!isCollapsed && <span>Assigned Work</span>}
            </button>
          )}

          {/* Analytics Button - Only visible for admin */}
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => navigate(ROUTES.ANALYTICS)}
              className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 flex items-center ${
                isCollapsed ? 'justify-center' : 'gap-3'
              } ${
                isActive(ROUTES.ANALYTICS)
                  ? 'bg-[#92a8bf] text-white shadow-md'
                  : 'text-[#819bb9] hover:bg-[#f6f3e3] hover:text-[#708eb3]'
              }`}
            >
              <svg 
                className="h-5 w-5 flex-shrink-0" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                />
              </svg>
              {!isCollapsed && <span>Analytics</span>}
            </button>
          )}

          {/* Admin Requests Button - Only visible for admin */}
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => navigate(ROUTES.ADMIN_REQUESTS)}
              className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 flex items-center ${
                isCollapsed ? 'justify-center' : 'gap-3'
              } ${
                isActive(ROUTES.ADMIN_REQUESTS)
                  ? 'bg-[#92a8bf] text-white shadow-md'
                  : 'text-[#819bb9] hover:bg-[#f6f3e3] hover:text-[#708eb3]'
              }`}
            >
              <svg
                className="h-5 w-5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 006 0M9 5a3 3 0 016 0"
                />
              </svg>
              {!isCollapsed && <span>Requests</span>}
            </button>
          )}

          {/* Profile Button */}
          <button
            onClick={() => navigate(ROUTES.PROFILE)}
            className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 flex items-center ${
              isCollapsed ? 'justify-center' : 'gap-3'
            } ${
              isActive(ROUTES.PROFILE)
                ? 'bg-[#92a8bf] text-white shadow-md'
                : 'text-[#819bb9] hover:bg-[#f6f3e3] hover:text-[#708eb3]'
            }`}
          >
            <svg 
              className="h-5 w-5 flex-shrink-0" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
              />
            </svg>
            {!isCollapsed && <span>Profile</span>}
          </button>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-[#a4b5c5]">
        <button
          onClick={handleLogout}
          className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 flex items-center ${
            isCollapsed ? 'justify-center' : 'gap-3'
          } text-[#819bb9] hover:bg-[#f6f3e3] hover:text-[#708eb3]`}
        >
          <svg 
            className="h-5 w-5 flex-shrink-0" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
            />
          </svg>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 