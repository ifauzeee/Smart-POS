// frontend/src/context/BusinessContext.jsx
import React, { useState, useEffect, createContext, useCallback } from 'react';
import { getBusinessSettings } from '../services/api';
import { toast } from 'react-toastify';

export const BusinessContext = createContext();

export const BusinessProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        payment_methods: ['Tunai', 'Kartu', 'QRIS'],
        tax_rate: 0,
        receipt_logo_url: '',
        receipt_footer_message: 'Terima Kasih!',
        // low_stock_threshold: 10, // Removed this line
    });
    const [loading, setLoading] = useState(true);

    const fetchBusinessSettings = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const res = await getBusinessSettings();
            if (res.data) {
                setSettings({
                    ...res.data,
                    payment_methods: JSON.parse(res.data.payment_methods || '[]'),
                    tax_rate: parseFloat(res.data.tax_rate) || 0,
                    receipt_footer_message: res.data.receipt_footer_text || 'Terima Kasih!',
                    // low_stock_threshold: parseInt(res.data.low_stock_threshold) || 10, // Removed this line
                });
            }
        } catch (error) {
            console.error("Gagal memuat setelan bisnis:", error);
            toast.error("Gagal memuat setelan bisnis.");
        } finally {
            setLoading(false);
        }
    }, []);

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