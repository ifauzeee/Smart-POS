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
    // FIXED: Added robust validation for various invalid inputs.
    if (value === null || value === undefined || (typeof value !== 'string' && typeof value !== 'number')) {
        return '';
    }
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
        
        // FIXED: Return empty string if parsed value is empty to avoid formatting '0' incorrectly.
        if (cleanValue === '') {
            return '';
        }

        const number = Number(cleanValue);

        // FIXED: Check for NaN to prevent crashes on invalid number conversions.
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
        // FIXED: Added error logging for easier debugging.
        console.error('Format Rupiah error:', error.message);
        return ''; // Return empty string to prevent app crashes.
    }
};