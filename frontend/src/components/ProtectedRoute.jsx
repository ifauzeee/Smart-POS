import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  // Cek apakah ada token di local storage
  const token = localStorage.getItem('token');

  // Jika ada token, tampilkan konten halaman (menggunakan <Outlet />).
  // Jika tidak, redirect ke halaman /login.
  return token ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;