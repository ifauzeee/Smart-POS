// frontend/src/hooks/useDataFetching.js
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

export function useDataFetching(apiFunction, errorMessage) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiFunction();
            setData(res.data);
        } catch (error) {
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [apiFunction, errorMessage]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, refetch: fetchData };
}