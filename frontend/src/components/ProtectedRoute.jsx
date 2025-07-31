import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = () => {
    const location = useLocation();
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    try {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();
        if (isExpired) {
            localStorage.removeItem('token');
            return <Navigate to="/login" state={{ from: location }} replace />;
        }
    } catch (error) {
        localStorage.removeItem('token');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;