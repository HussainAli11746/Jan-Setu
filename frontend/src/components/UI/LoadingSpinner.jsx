import React from 'react';

const LoadingSpinner = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
