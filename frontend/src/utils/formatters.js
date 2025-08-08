// C:\Users\Ibnu\Project\smart-pos\frontend\src\utils\formatters.js

export const parseRupiah = (value) => {
    // FIXED: Added robust validation for various invalid inputs.
    if (value === null || value === undefined || (typeof value !== 'string' && typeof value !== 'number')) {
        return '';
    }
    return String(value).replace(/[^0-9]/g, '');
};

export const formatRupiah = (value) => {
    try {
        const cleanValue = parseRupiah(value);
        // FIXED: Return empty string if parsed value is empty
        if (cleanValue === '') {
            return '';
        }
        const number = Number(cleanValue);
        // FIXED: Check for NaN to prevent crashes
        if (isNaN(number)) {
            return '';
        }
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0,
        }).format(number);
    } catch (error) {
        console.error('Format Rupiah error:', error.message);
        return ''; // Return empty string to prevent app crashes.
    }
};