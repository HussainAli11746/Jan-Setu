import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-orange-100 text-primary',
    success: 'bg-green-100 text-secondary',
    danger: 'bg-red-100 text-red-800',
    accent: 'bg-blue-100 text-accent',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
