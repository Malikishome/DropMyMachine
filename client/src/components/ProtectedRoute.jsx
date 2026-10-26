import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';

function ProtectedRoute({ children }) {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
