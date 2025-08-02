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
            // --- PERBAIKAN DIMULAI ---
            // Menggunakan optional chaining (?.) untuk mencegah error jika decoded.role tidak ada
            if (decoded?.role?.toLowerCase() === 'admin') {
            // --- PERBAIKAN SELESAI ---
                isAdmin = true;
            }
        } catch (error) {
            console.error("Invalid token on AdminRoute:", error);
            isAdmin = false;
        }
    }

    useEffect(() => {
        if (!isAdmin) {
            toast.error("Akses ditolak. Hanya untuk admin.");
            navigate('/pos', { state: { from: location }, replace: true });
        }
    }, [isAdmin, navigate, location]);

    return isAdmin ? <Outlet /> : null;
};

export default AdminRoute;