// C:\Users\Ibnu\Project\smart-pos\frontend\src\components\SyncManager.jsx

import { useEffect, useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { getAllOfflineOrders, deleteOfflineOrder } from '../utils/offlineDb';
import { createOrder } from '../services/api';
import { toast } from 'react-toastify';
import { useLiveQuery } from 'dexie-react-hooks';
import { db as offlineDB } from '../utils/offlineDb';

function SyncManager() {
  const isOnline = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Hook ini akan memantau jumlah order di Dexie secara real-time
  const offlineOrderCount = useLiveQuery(() => offlineDB.offlineOrders.count(), []);

  useEffect(() => {
    const syncOfflineOrders = async () => {
      if (isOnline && !isSyncing && offlineOrderCount > 0) {
        setIsSyncing(true);
        const toastId = toast.info(`Sinkronisasi dimulai: ${offlineOrderCount} transaksi tertunda...`, { autoClose: false });

        const ordersToSync = await getAllOfflineOrders();
        let successCount = 0;

        for (const order of ordersToSync.data) {
          try {
            await createOrder(order.orderData);
            await deleteOfflineOrder(order.id);
            successCount++;
          } catch (error) {
            console.error(`Gagal sinkronisasi order ID lokal ${order.id}:`, error);
            // Hentikan jika ada error, coba lagi nanti
            toast.update(toastId, { render: `Sinkronisasi gagal pada satu transaksi. Mencoba lagi nanti.`, type: 'error', autoClose: 5000 });
            setIsSyncing(false);
            return;
          }
        }
        
        toast.update(toastId, { render: `${successCount} transaksi berhasil disinkronkan!`, type: 'success', autoClose: 5000 });
        setIsSyncing(false);
      }
    };

    syncOfflineOrders();
  }, [isOnline, isSyncing, offlineOrderCount]);

  // Komponen ini tidak me-render apapun ke UI
  return null;
}

export default SyncManager;