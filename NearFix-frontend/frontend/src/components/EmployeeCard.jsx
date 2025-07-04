import React from 'react';

const EmployeeCard = ({ employee, isOwner = false }) => {
  const formatRole = (role) => {
    if (!role) return '';
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 flex flex-col">
      <div className="relative h-48 group overflow-hidden">
        {employee.profilePhotoUrl ? (
          <img
            src={employee.profilePhotoUrl}
            alt={`${employee.firstName} ${employee.lastName}`}
            className="w-full h-full object-cover"
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-xl font-semibold text-[#708eb3] mb-1">
          {employee.firstName} {employee.lastName}
        </h3>
        <p className="text-[#819bb9] mb-4">{isOwner ? 'Owner' : formatRole(employee.role)}</p>

        <div className="space-y-3 mt-auto">
          {employee.phoneNumber && (
            <div className="flex items-center gap-2 text-sm text-[#819bb9]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <span>{employee.phoneNumber}</span>
            </div>
          )}
          {employee.email && (
            <div className="flex items-center gap-2 text-sm text-[#819bb9]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <span className="truncate">{employee.email}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard; 