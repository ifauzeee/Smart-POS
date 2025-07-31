import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const AdminRoute = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    
    let isAdmin = false;

    if (token) {
        try {
            const decoded = jwtDecode(token);
            // Menggunakan .toLowerCase() untuk memastikan perbandingan tidak case-sensitive
            if (decoded.role && decoded.role.toLowerCase() === 'admin') {
                isAdmin = true;
            }
        } catch (error) {
            console.error("Invalid token on AdminRoute:", error);
            isAdmin = false;
        }
    }

    useEffect(() => {
        // Logika untuk redirect dan notifikasi sekarang aman di dalam useEffect
        if (!isAdmin) {
            toast.error("Akses ditolak. Hanya untuk admin.");
            navigate('/pos', { state: { from: location }, replace: true });
        }
    }, [isAdmin, navigate, location]);

    // Jika pengguna adalah admin, tampilkan konten halaman (via <Outlet />).
    // Jika bukan, tampilkan null selagi useEffect melakukan redirect.
    return isAdmin ? <Outlet /> : null;
};

export default AdminRoute;