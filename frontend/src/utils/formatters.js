// C:\Users\Ibnu\Project\smart-pos\frontend\src\utils\formatters.js

export const parseRupiah = (value) => {
    // PERBAIKAN: Menambahkan validasi input untuk mencegah error pada nilai null/undefined
    if (value === null || value === undefined || (typeof value !== 'string' && typeof value !== 'number')) {
        // Melempar error agar bisa ditangkap jika diperlukan, atau bisa juga return ''
        console.error('Invalid input to parseRupiah:', value);
        return '';
    }
    // Menghapus semua karakter non-digit
    return String(value).replace(/[^0-9]/g, '');
};

export const formatRupiah = (value) => {
    try {
        const cleanValue = parseRupiah(value);
        // ✅ PERBAIKAN DI SINI: Jika value setelah dibersihkan adalah string kosong, kembalikan string kosong
        if (cleanValue === '') return '';

        const number = Number(cleanValue);
        // PERBAIKAN: Menambahkan pengecekan jika hasil parse bukan angka
        if (isNaN(number)) return '';

        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(number);
    } catch (error) {
        // PERBAIKAN: Menambahkan logging error untuk debugging
        console.error('Format Rupiah error:', error.message);
        return ''; // Mengembalikan string kosong jika terjadi error
    }
};