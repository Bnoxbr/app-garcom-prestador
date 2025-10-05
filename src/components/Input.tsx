import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, name, icon, error, ...rest }) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            {icon}
          </span>
        )}
        <input
          id={name}
          name={name}
          className={`block w-full py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${icon ? 'pl-10' : 'pl-3'} pr-3 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-800 focus:border-transparent'}`}
          {...rest}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};