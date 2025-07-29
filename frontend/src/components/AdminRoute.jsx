// frontend/src/components/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

function AdminRoute() {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    const isAdmin = decoded.role === 'admin';

    if (isAdmin) {
      return <Outlet />;
    } else {
      toast.error('Anda tidak memiliki hak akses Admin.');
      return <Navigate to="/" />;
    }
  } catch (error) {
    toast.error('Sesi tidak valid, silakan login kembali.');
    return <Navigate to="/login" />;
  }
}

export default AdminRoute;