import React, { useState, useEffect } from 'react';

const MAX_REASON_LENGTH = 250;

const RejectGarageModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) setReason('');
  }, [isOpen]);

  const handleReasonChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_REASON_LENGTH) {
      setReason(value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-xl transform transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#708eb3]">Reject Garage Request</h2>
            <button
              onClick={onClose}
              className="text-[#a4b5c5] hover:text-[#819bb9] transition-colors duration-300"
              disabled={loading}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-[#819bb9] font-medium" htmlFor="rejection-reason">
              Rejection Reason (optional)
            </label>
            <span className={`text-sm ${reason.length === MAX_REASON_LENGTH ? 'text-red-500' : 'text-[#a4b5c5]'}`}>{reason.length}/{MAX_REASON_LENGTH}</span>
          </div>
          <textarea
            id="rejection-reason"
            className="w-full px-4 py-3 border border-[#a4b5c5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300 min-h-[80px] mb-6"
            placeholder="Enter reason for rejection..."
            value={reason}
            onChange={handleReasonChange}
            disabled={loading}
            rows={3}
            maxLength={MAX_REASON_LENGTH}
          />
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-[#819bb9] hover:text-[#708eb3] disabled:opacity-50 transition-all duration-300 hover:scale-105 active:scale-95"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(reason)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
              disabled={loading}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectGarageModal; 