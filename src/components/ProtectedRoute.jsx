import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import api from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      setIsValid(false);
      return;
    }

    api.get('/api/auth/verify')
      .then(() => setIsValid(true))
      .catch(() => {
        localStorage.removeItem('adminToken');
        setIsValid(false);
      });
  }, [token]);

  if (isValid === null) {
    return <LoadingSpinner />;
  }

  if (!isValid) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
