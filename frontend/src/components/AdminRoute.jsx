import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

function AdminRoute() {
  const token = localStorage.getItem('token');

  if (!token) {
    // Jika tidak ada token sama sekali, lempar ke halaman login
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    const isAdmin = decoded.role === 'admin';

    if (isAdmin) {
      // Jika adalah admin, izinkan akses ke halaman yang dituju
      return <Outlet />;
    } else {
      // Jika login tapi bukan admin, tolak akses dan lempar ke halaman utama
      toast.error('Anda tidak memiliki hak akses Admin.');
      return <Navigate to="/" />;
    }
  } catch (error) {
    // Jika token tidak valid
    toast.error('Sesi tidak valid, silakan login kembali.');
    return <Navigate to="/login" />;
  }
}

export default AdminRoute;