// C:\Users\Ibnu\Project\smart-pos\frontend\src\utils\formatters.js

/**
 * Membersihkan nilai apapun (string/number) menjadi string angka murni.
 * Contoh: "Rp 50.000" -> "50000"
 * @param {string | number} value Nilai yang akan dibersihkan.
 * @returns {string} String yang hanya berisi angka.
 */
export const parseRupiah = (value) => {
    if (value === null || value === undefined || (typeof value !== 'string' && typeof value !== 'number')) {
        return '';
    }
    return String(value).replace(/[^0-9]/g, '');
};

/**
 * Memformat string angka atau angka menjadi format mata uang Rupiah.
 * Contoh: "50000" -> "Rp 50.000"
 * @param {string | number} value Nilai yang akan diformat.
 * @returns {string} String dalam format Rupiah.
 */
export const formatRupiah = (value) => {
    const cleanValue = parseRupiah(value);
    if (cleanValue === '') return '';

    const number = Number(cleanValue);
    if (isNaN(number)) return '';

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number);
};