import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/motion';

const AdminIndex = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <PageLoader label="Loading Admin Portal..." />
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? "/admin/dashboard" : "/admin/login"} replace />;
};

export default AdminIndex;
