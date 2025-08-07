// C:\Users\Ibnu\Project\smart-pos\frontend\src\utils\offlineDb.js

import Dexie from 'dexie';

export const db = new Dexie('SmartPOSDatabase');

// Definisikan skema database
db.version(1).stores({
    offlineOrders: '++id, orderData.createdAt', // Tambahkan indeks untuk pencarian berdasarkan createdAt
});

/**
 * Menambahkan order baru ke database offline.
 * @param {Object} orderData Data order yang akan disimpan
 * @returns {Promise<{ success: boolean, id?: number, error?: string }>} Hasil operasi
 */
export async function addOfflineOrder(orderData) {
    try {
        if (!orderData || typeof orderData !== 'object') {
            return { success: false, error: 'Invalid order data' };
        }
        const id = await db.offlineOrders.add({ orderData });
        return { success: true, id };
    } catch (error) {
        console.error('Gagal menyimpan order offline:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Mengambil semua order offline.
 * @returns {Promise<{ success: boolean, data?: Array, error?: string }>} Daftar order offline
 */
export async function getAllOfflineOrders() {
    try {
        const data = await db.offlineOrders.toArray();
        return { success: true, data };
    } catch (error) {
        console.error('Gagal mengambil order offline:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Menghapus order dari database offline.
 * @param {number} id ID order yang akan dihapus
 * @returns {Promise<{ success: boolean, error?: string }>} Hasil operasi
 */
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