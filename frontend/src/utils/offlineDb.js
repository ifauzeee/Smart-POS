import Dexie from 'dexie';

export const db = new Dexie('SmartPOSDatabase');

// Definisikan skema database
db.version(1).stores({
  offlineOrders: '++id, orderData', // '++id' adalah primary key auto-increment
});

// Fungsi untuk menambahkan order baru ke database offline
export async function addOfflineOrder(orderData) {
    try {
        await db.offlineOrders.add({ orderData });
    } catch (error) {
        console.error("Gagal menyimpan order offline:", error);
    }
}

// Fungsi untuk mengambil semua order offline
export async function getAllOfflineOrders() {
    try {
        return await db.offlineOrders.toArray();
    } catch (error) {
        console.error("Gagal mengambil order offline:", error);
        return [];
    }
}

// Fungsi untuk menghapus order dari database offline setelah berhasil sinkronisasi
export async function deleteOfflineOrder(id) {
    try {
        await db.offlineOrders.delete(id);
    } catch (error) {
        console.error(`Gagal menghapus order offline ID ${id}:`, error);
    }
}