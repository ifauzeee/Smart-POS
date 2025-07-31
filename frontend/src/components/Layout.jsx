import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { toast } from 'react-toastify';
import { getAllOfflineOrders, deleteOfflineOrder } from '../utils/offlineDb';
import { createOrder } from '../services/api';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-main);
`;

const ContentWrapper = styled.main`
  flex: 1;
  height: 100vh;
  overflow-y: auto;
`;

function Layout() {
    // Logika sinkronisasi offline berada di sini
    useEffect(() => {
        const syncOfflineOrders = async () => {
            const offlineOrders = await getAllOfflineOrders();
            if (offlineOrders.length > 0) {
                toast.info(`Memulai sinkronisasi ${offlineOrders.length} transaksi offline...`);
                
                for (const order of offlineOrders) {
                    try {
                        await createOrder(order.orderData);
                        await deleteOfflineOrder(order.id);
                    } catch (error) {
                        console.error('Gagal sinkronisasi order:', order, error);
                        toast.error('Gagal menyinkronkan salah satu transaksi. Proses dihentikan.');
                        return; 
                    }
                }
                toast.success('Semua transaksi offline berhasil disinkronkan!');
            }
        };

        const handleOnline = () => {
            toast.success('Koneksi internet kembali pulih.');
            syncOfflineOrders();
        };

        const handleOffline = () => {
            toast.warn('Koneksi terputus. Anda sekarang dalam mode offline.');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        if (navigator.onLine) {
            syncOfflineOrders();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AppContainer>
            <Sidebar />
            <ContentWrapper>
                <Outlet />
            </ContentWrapper>
        </AppContainer>
    );
}

export default Layout;