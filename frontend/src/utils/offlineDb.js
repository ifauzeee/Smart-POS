// C:\Users\Ibnu\Project\smart-pos\frontend\src\utils\offlineDb.js

import Dexie from 'dexie';

export const db = new Dexie('SmartPOSDatabase');

db.version(1).stores({
    offlineOrders: '++id, orderData.createdAt',
});

export async function addOfflineOrder(orderData) {
    try {
        if (!orderData || typeof orderData !== 'object') {
            return { success: false, error: 'Invalid order data' };
        }
        if (!orderData.createdAt) {
            return { success: false, error: 'Missing required field: createdAt' };
        }
        const id = await db.offlineOrders.add({ orderData });
        return { success: true, id };
    } catch (error) {
        console.error('Gagal menyimpan order offline:', error);
        return { success: false, error: error.message };
    }
}

export async function getAllOfflineOrders() {
    try {
        const data = await db.offlineOrders.toArray();
        return { success: true, data };
    } catch (error) {
        console.error('Gagal mengambil order offline:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteOfflineOrder(id) {
    try {
        if (typeof id !== 'number') {
            return { success: false, error: 'Invalid order ID' };
        }
        await db.offlineOrders.delete(id);
        return { success: true };
    } catch (error) {
        console.error(`Gagal menghapus order offline ID ${id}:`, error);
        return { success: false, error: error.message };
    }
}