// frontend/src/context/ShiftContext.jsx

import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { getCurrentShift } from '../services/api';

export const ShiftContext = createContext();

export const useShift = () => useContext(ShiftContext);

export const ShiftProvider = ({ children }) => {
    const [activeShift, setActiveShift] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkActiveShift = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            setActiveShift(null);
            return;
        }

        try {
            setIsLoading(true);
            const res = await getCurrentShift();
            if (res.data.active) {
                setActiveShift(res.data.shift);
            } else {
                setActiveShift(null);
            }
        } catch (error) {
            console.error("Failed to check active shift:", error);
            setActiveShift(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkActiveShift();
    }, [checkActiveShift]);

    const value = {
        activeShift,
        setActiveShift,
        isLoadingShift: isLoading,
        refreshShiftStatus: checkActiveShift
    };

    return (
        <ShiftContext.Provider value={value}>
            {children}
        </ShiftContext.Provider>
    );
};