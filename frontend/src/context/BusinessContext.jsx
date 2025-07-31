import React, { useState, useEffect, createContext, useCallback } from 'react';
import { getBusinessSettings } from '../services/api';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

export const BusinessContext = createContext();

export const BusinessProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        payment_methods: ['Tunai', 'Kartu', 'QRIS'],
        tax_rate: 0,
        receipt_logo_url: '',
        receipt_footer_text: 'Terima Kasih!',
    });
    const [loading, setLoading] = useState(true);

    const fetchBusinessSettings = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            
            const decoded = jwtDecode(token);
            const userRole = decoded.role;

            if (userRole?.toLowerCase() === 'admin') {
                setLoading(true);
                const res = await getBusinessSettings();
                
                if (res.data) {
                    // --- FIXED CODE ---
                    // Check if payment_methods is a string before parsing
                    let paymentMethods = res.data.payment_methods;
                    if (typeof paymentMethods === 'string') {
                        try {
                            paymentMethods = JSON.parse(paymentMethods);
                        } catch (e) {
                            console.error("Failed to parse payment_methods:", e);
                            paymentMethods = ['Tunai', 'Kartu', 'QRIS']; // Default fallback
                        }
                    }
                    
                    const parsedSettings = {
                        ...res.data,
                        payment_methods: Array.isArray(paymentMethods) ? paymentMethods : ['Tunai', 'Kartu', 'QRIS'],
                        tax_rate: parseFloat(res.data.tax_rate) || 0,
                        receipt_footer_text: res.data.receipt_footer_text || 'Terima Kasih!',
                    };
                    setSettings(parsedSettings);
                    // --- END OF FIX ---
                }
            }
        } catch (error) {
            console.error("[DEBUG] Error details:", {
                message: error.message,
                status: error.status,
                response: error.response?.data,
                stack: error.stack
            });
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