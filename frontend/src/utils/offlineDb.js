// C:\Users\Ibnu\Project\smart-pos\frontend\src\utils\offlineDb.js

import Dexie from 'dexie';

export const db = new Dexie('SmartPOSDatabase');

db.version(1).stores({
    offlineOrders: '++id, orderData.createdAt',
});

/**
 * Adds an offline order to the Dexie database.
 * @param {Object} orderData - Order data with required fields: createdAt, items, total_amount.
 * @returns {Promise<{success: boolean, id?: number, error?: string}>} - Result of the operation.
 */
export async function addOfflineOrder(orderData) {
    try {
        if (!orderData || typeof orderData !== 'object') {
            return { success: false, error: 'Order data must be a valid object' };
        }
        if (!orderData.createdAt) {
            return { success: false, error: 'Missing required field: createdAt' };
        }
        if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
            return { success: false, error: 'Missing or invalid required field: items' };
        }
        // --- PERBAIKAN: Mengganti validasi dari 'total' menjadi 'total_amount' ---
        if (typeof orderData.total_amount !== 'number' || orderData.total_amount < 0) {
            return { success: false, error: 'Missing or invalid required field: total_amount' };
        }
        const id = await db.offlineOrders.add({ orderData });
        return { success: true, id };
    } catch (error) {
        console.error('Failed to save offline order:', error);
        return { success: false, error: `Failed to save offline order: ${error.message}` };
    }
}

/**
 * Retrieves all offline orders from the Dexie database.
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>} - Array of offline orders or error.
 */
export async function getAllOfflineOrders() {
    try {
        const data = await db.offlineOrders.toArray();
        return { success: true, data };
    } catch (error) {
        console.error('Failed to retrieve offline orders:', error);
        return { success: false, error: `Failed to retrieve offline orders: ${error.message}` };
    }
}

/**
 * Deletes an offline order by ID.
 * @param {number} id - ID of the order to delete.
 * @returns {Promise<{success: boolean, error?: string}>} - Result of the operation.
 */
export async function deleteOfflineOrder(id) {
    try {
        if (typeof id !== 'number' || id <= 0) {
            return { success: false, error: 'Invalid order ID: Must be a positive number' };
        }
        await db.offlineOrders.delete(id);
        return { success: true };
    } catch (error) {
        console.error(`Failed to delete offline order ID ${id}:`, error);
        return { success: false, error: `Failed to delete offline order: ${error.message}` };
    }
}