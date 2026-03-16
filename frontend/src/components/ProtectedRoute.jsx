import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/components/ProtectedRoute.css';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="protected-route__screen">
        <div className="protected-route__spinner-wrap">
          <div className="spinner spinner--md" />
          <p className="protected-route__loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
