import React, { useState } from 'react';
import api from '../utils/axios';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', color: 'yellow', class: 'text-yellow-600', btn: 'bg-yellow-500 hover:bg-yellow-600' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'blue', class: 'text-blue-600', btn: 'bg-blue-500 hover:bg-blue-600' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'purple', class: 'text-purple-600', btn: 'bg-purple-500 hover:bg-purple-600' },
  { value: 'COMPLETED', label: 'Completed', color: 'green', class: 'text-green-600', btn: 'bg-green-500 hover:bg-green-600' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'red', class: 'text-red-600', btn: 'bg-red-500 hover:bg-red-600' },
];

const AppointmentCard = ({ appointment, view = 'customer', onStatusChange }) => {
  const [updating, setUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(appointment.status);
  // Determine which info to show based on view
  const personLabel = view === 'employee' ? 'Owner' : 'Employee';
  const personName = view === 'employee' ? appointment.vehicleOwnerName : appointment.employeeName;
  const personEmail = view === 'employee' ? appointment.vehicleOwnerEmail : appointment.employeeEmail;
  const personPhone = view === 'employee' ? appointment.vehicleOwnerPhoneNumber : appointment.employeePhoneNumber;

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) return;
    setUpdating(true);
    try {
      await api.put('/garage-owner/employees/appointments/status', {
        appointmentId: appointment.appointmentId,
        status: newStatus,
      });
      setCurrentStatus(newStatus);
      if (onStatusChange) onStatusChange(newStatus);
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const statusObj = STATUS_OPTIONS.find(s => s.value === currentStatus) || STATUS_OPTIONS[0];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col">
      <div className="relative h-48 group overflow-hidden">
        {appointment.garagePhotoUrl ? (
          <img
            src={appointment.garagePhotoUrl}
            alt={appointment.garageName}
            className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
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
                strokeWidth={2}
                d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-[#708eb3]">{appointment.garageName}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium bg-[#f5f7fa] flex items-center justify-center ${statusObj.class}`}>
            {statusObj.label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <p className="text-sm text-[#819bb9] mb-1">Service Area</p>
            <p className="font-medium text-[#708eb3]">{appointment.area || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-[#819bb9] mb-1">Date</p>
            <p className="font-medium text-[#708eb3]">{appointment.selectedDate}</p>
          </div>
          <div>
            <p className="text-sm text-[#819bb9] mb-1">Vehicle</p>
            <p className="font-medium text-[#708eb3]">{appointment.vehicleBrand} {appointment.vehicleModel}</p>
          </div>
          <div>
            <p className="text-sm text-[#819bb9] mb-1">VIN</p>
            <p className="font-medium text-[#708eb3]">{appointment.vehicleVin}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-[#819bb9] mb-1">{personLabel} Name</p>
            <p className="font-medium text-[#708eb3]">{personName}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-[#819bb9] mb-1">{personLabel} Email</p>
            <p className="font-medium text-[#708eb3]">{personEmail}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-[#819bb9] mb-1">{personLabel} Phone</p>
            <p className="font-medium text-[#708eb3]">{personPhone}</p>
          </div>
        </div>
      </div>
      {view === 'employee' && (
        <div className="flex flex-wrap gap-2 justify-end p-4 pt-0">
          {STATUS_OPTIONS.filter(s => s.value !== currentStatus).map((status) => (
            <button
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              className={`w-9 h-9 sm:w-auto sm:h-auto p-2 sm:px-4 sm:py-2 ${status.btn} text-white rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed`}
              title={`Set as ${status.label}`}
              disabled={updating}
            >
              {status.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentCard; 