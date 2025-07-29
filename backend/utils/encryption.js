// backend/utils/encryption.js
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32; // Kunci harus 32 byte untuk aes-256-gcm

// Kunci utama dari environment variable, JANGAN DIUBAH SEMBARANGAN
const MASTER_KEY = process.env.ENCRYPTION_KEY;

function encrypt(text) {
    // 1. Buat salt acak untuk setiap enkripsi
    const salt = crypto.randomBytes(SALT_LENGTH);

    // 2. Buat kunci enkripsi unik menggunakan master key dan salt acak
    // Setiap enkripsi akan memiliki kunci turunan yang berbeda karena salt acak yang berbeda
    const key = crypto.scryptSync(MASTER_KEY, salt, KEY_LENGTH); // <-- PERBAIKAN: Gunakan salt acak di sini

    // 3. Buat IV (Initialization Vector) acak
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // 4. Enkripsi data
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv); // <-- Gunakan key turunan yang unik
    const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    // 5. Gabungkan salt, iv, tag, dan data terenkripsi untuk disimpan
    // Salt harus disimpan bersama data terenkripsi agar bisa digunakan saat dekripsi
    return Buffer.concat([salt, iv, tag, encrypted]).toString('hex');
}

function decrypt(encryptedText) {
    const data = Buffer.from(String(encryptedText), 'hex');

    // 1. Ekstrak salt, iv, tag, dan data terenkripsi dari hasil gabungan
    const salt = data.slice(0, SALT_LENGTH);
    const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = data.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = data.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    // 2. Buat kembali kunci enkripsi yang sama persis menggunakan master key dan salt yang diekstrak
    // Ini memastikan kunci yang sama digunakan untuk dekripsi
    const key = crypto.scryptSync(MASTER_KEY, salt, KEY_LENGTH); // <-- PERBAIKAN: Gunakan salt yang diekstrak di sini

    // 3. Dekripsi data
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv); // <-- Gunakan key turunan yang unik
    decipher.setAuthTag(tag);

    return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}

module.exports = { encrypt, decrypt };