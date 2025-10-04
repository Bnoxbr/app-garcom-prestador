import React from 'react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loading: React.FC<LoadingProps> = ({ message, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-24 w-24',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`animate-spin rounded-full border-t-4 border-b-4 border-gray-900 ${sizeClasses[size]}`}></div>
      {message && <p className="text-lg text-gray-700">{message}</p>}
    </div>
  );
};