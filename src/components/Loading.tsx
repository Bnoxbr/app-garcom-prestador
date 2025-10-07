import React from 'react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
};

const Loading: React.FC<LoadingProps> = ({ message = 'Carregando...', size = 'md' }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div
        className={`animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-gray-800 ${sizeClasses[size]}`}
      ></div>
      {message && <p className="text-gray-600">{message}</p>}
    </div>
  );
};

export default Loading;