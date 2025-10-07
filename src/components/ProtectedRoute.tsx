import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute: React.FC = () => {
  const { user, role } = useAuth();
  
  const ALLOWED_ROLE = 'prestador'; 

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role !== ALLOWED_ROLE) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;