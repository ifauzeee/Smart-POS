/**
 * @fileoverview Modul ini berisi utilitas untuk memformat dan mengurai nilai mata uang Rupiah.
 */

/**
 * @description Mengurai string atau angka menjadi string hanya berisi digit.
 * Menangani input null, undefined, atau non-string/non-number dengan aman.
 * @param {string|number} value - Nilai yang akan diurai.
 * @returns {string} - String yang hanya berisi digit, atau string kosong jika input tidak valid.
 */
export const parseRupiah = (value) => {
    // Menambahkan validasi input untuk mencegah error pada nilai null/undefined atau tipe data yang tidak valid.
    if (value === null || value === undefined || (typeof value !== 'string' && typeof value !== 'number')) {
        console.error('Invalid input to parseRupiah:', value);
        return '';
    }
    // Menghapus semua karakter non-digit (termasuk titik, koma, dan simbol mata uang).
    return String(value).replace(/[^0-9]/g, '');
};

/**
 * @description Memformat string atau angka menjadi format mata uang Rupiah (contoh: Rp100.000).
 * Menangani input yang tidak valid dan mengembalikan string kosong.
 * @param {string|number} value - Nilai yang akan diformat.
 * @returns {string} - String dalam format Rupiah, atau string kosong jika input tidak valid.
 */
export const formatRupiah = (value) => {
    try {
        const cleanValue = parseRupiah(value);
        
        // PERBAIKAN: Jika nilai yang sudah diurai kosong (misalnya dari input null atau undefined),
        // langsung kembalikan string kosong. Ini mencegah `Number('')` yang menghasilkan 0.
        if (cleanValue === '') {
            return '';
        }

        const number = Number(cleanValue);

        // PERBAIKAN: Menambahkan pengecekan jika hasil konversi ke Number adalah NaN (Not a Number).
        // Ini melindungi dari kasus di mana `parseRupiah` mengembalikan sesuatu yang tidak bisa dikonversi.
        if (isNaN(number)) {
            return '';
        }

        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(number);
    } catch (error) {
        // PERBAIKAN: Menambahkan logging error untuk membantu debugging jika ada masalah tak terduga.
        console.error('Format Rupiah error:', error.message);
        return ''; // Mengembalikan string kosong untuk mencegah aplikasi crash
    }
};