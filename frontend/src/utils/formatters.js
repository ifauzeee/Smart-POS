// C:\Users\Ibnu\Project\smart-pos\frontend\src\utils\formatters.js

/**
 * Membersihkan string Rupiah (misal: "Rp 10.000") menjadi string angka mentah ("10000").
 * @param {string | number} value Nilai yang akan dibersihkan.
 * @returns {string} String angka mentah.
 */
export const parseRupiah = (value) => {
    if (typeof value !== 'string' && typeof value !== 'number') return '';
    return String(value).replace(/Rp\s?|\./g, '');
};

/**
 * Memformat angka atau string angka menjadi format Rupiah (misal: 10000 -> "Rp 10.000").
 * @param {string | number} value Nilai yang akan diformat.
 * @returns {string} String dalam format Rupiah.
 */
export const formatRupiah = (value) => {
    if (value === null || value === undefined || value === '') return '';
    
    // PERBAIKAN: Gunakan parseRupiah terlebih dahulu untuk membersihkan nilai sebelum memformat.
    const number = parseFloat(parseRupiah(value));

    if (isNaN(number)) return '';
    
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number);
};