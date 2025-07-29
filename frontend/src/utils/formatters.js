// frontend/src/utils/formatters.js

// Fungsi ini akan memformat angka menjadi string Rupiah
export const formatRupiah = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const number = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    if (isNaN(number)) return '';
    return `Rp ${new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(number)}`;
};

// Fungsi ini akan membersihkan string Rupiah menjadi angka mentah (string)
export const parseRupiah = (value) => {
    if (typeof value !== 'string') return String(value);
    return value.replace(/Rp\s?|\./g, '');
};