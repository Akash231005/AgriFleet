import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Route protection HOC checking authentication and roles.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user, initialized } = useSelector((state) => state.auth);

  if (!initialized && token) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: '#F8FAF8' }}>
        <div className="h-10 w-10 animate-spin rounded-full border-[3px]" style={{ borderColor: 'rgba(21,128,61,0.15)', borderTopColor: '#15803D' }}></div>
      </div>
    );
  }

  // Not authenticated -> redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role check fails -> redirect to dashboard or base public route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect user to their own role dashboard
    if (user.role === 'farmer') return <Navigate to="/farmer" replace />;
    if (user.role === 'driver') return <Navigate to="/driver" replace />;
    if (user.role === 'fleet_manager') return <Navigate to="/fleet" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
