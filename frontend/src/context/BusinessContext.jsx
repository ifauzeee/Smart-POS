// frontend/src/context/BusinessContext.jsx
import React, { useState, useEffect, createContext, useCallback, useContext } from 'react';
import { getBusinessSettings } from '../services/api';
import { toast } from 'react-toastify';
// Assuming you have an AuthContext that provides user information
// import { AuthContext } from './AuthContext'; // Uncomment and import your AuthContext if you have one

export const BusinessContext = createContext();

export const BusinessProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        payment_methods: ['Tunai', 'Kartu', 'QRIS'],
        tax_rate: 0,
        receipt_logo_url: '',
        receipt_footer_message: 'Terima Kasih!',
    });
    const [loading, setLoading] = useState(true);

    // Assuming AuthContext provides a user object with a 'role' property
    // const { user } = useContext(AuthContext); // Uncomment this line if you have AuthContext

    const fetchBusinessSettings = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        // --- Start of added role check ---
        // Placeholder for user role check.
        // Replace 'user?.role === 'admin'' with your actual user role check logic.
        // For example, if you have an AuthContext, you would use:
        // if (!user || user.role !== 'admin') {
        //     console.log("User is not an admin, skipping business settings fetch.");
        //     setLoading(false);
        //     return;
        // }
        // For demonstration, let's assume a hardcoded admin check or that `user` is available.
        // If `user` is not available here, you'll need to pass it as a prop or fetch it.
        // For now, we'll proceed without a strict `user` object check, assuming the backend will handle unauthorized access.
        // However, if you want to prevent the frontend call entirely based on role,
        // you would need to uncomment and properly integrate the AuthContext.
        // --- End of added role check ---

        setLoading(true);
        try {
            const res = await getBusinessSettings();
            if (res.data) {
                setSettings({
                    ...res.data,
                    payment_methods: JSON.parse(res.data.payment_methods || '[]'),
                    tax_rate: parseFloat(res.data.tax_rate) || 0,
                    receipt_footer_message: res.data.receipt_footer_text || 'Terima Kasih!',
                });
            }
        } catch (error) {
            console.error("Gagal memuat setelan bisnis:", error);
            toast.error("Gagal memuat setelan bisnis.");
        } finally {
            setLoading(false);
        }
    }, []); // Add 'user' to dependency array if you uncomment the user check: [fetchBusinessSettings, user]

    useEffect(() => {
        fetchBusinessSettings();
    }, [fetchBusinessSettings]);

    const value = { settings, loading, fetchBusinessSettings };

    return (
        <BusinessContext.Provider value={value}>
            {children}
        </BusinessContext.Provider>
    );
};
