import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadCurrentUser } from '../features/auth/authSlice';

// Components & Guard
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import Landing from '../pages/public/Landing';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import BecomeDriver from '../pages/public/BecomeDriver';

// Farmer Pages
import FarmerDashboard from '../pages/farmer/FarmerDashboard';
import NewBooking from '../pages/farmer/NewBooking';

// Driver Pages
import DriverDashboard from '../pages/driver/DriverDashboard';
import DriverProfile from '../pages/driver/DriverProfile';

// Fleet Control Pages
import FleetDashboard from '../pages/fleet/FleetDashboard';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageOperators from '../pages/admin/ManageOperators';
import DriverApplications from '../pages/admin/DriverApplications';

export default function AppRouter() {
  const dispatch = useDispatch();
  const { token, initialized } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(loadCurrentUser());
    }
  }, [dispatch, token]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/become-driver" element={<BecomeDriver />} />

        {/* Farmer Core Routes */}
        <Route 
          path="/farmer" 
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <FarmerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/farmer/new-booking" 
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <NewBooking />
            </ProtectedRoute>
          } 
        />

        {/* Driver Core Routes */}
        <Route 
          path="/driver/login" 
          element={<Navigate to="/login" replace />} 
        />
        <Route 
          path="/driver" 
          element={<DriverDashboard />} 
        />
        <Route 
          path="/driver/profile" 
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverProfile />
            </ProtectedRoute>
          } 
        />

        {/* Fleet Logistics Routes (Admin and Fleet Manager access) */}
        <Route 
          path="/fleet/*" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'fleet_manager']}>
              <FleetDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Admin Core Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/bookings" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageOperators />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/applications" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DriverApplications />
            </ProtectedRoute>
          } 
        />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
