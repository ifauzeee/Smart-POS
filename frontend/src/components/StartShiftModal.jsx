// frontend/src/components/StartShiftModal.jsx

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiLogIn } from 'react-icons/fi';
import { startShift } from '../services/api';
import { toast } from 'react-toastify';

// Helper Functions for Currency Formatting
// Fungsi ini akan memformat angka menjadi string dengan pemisah ribuan dan simbol Rp.
const formatCurrency = (value) => {
    // Jika nilai kosong, null, atau tidak terdefinisi, kembalikan string kosong
    if (value === null || value === undefined || value === '') return '';
    const number = parseFloat(value);
    // Jika setelah di-parse masih bukan angka, kembalikan nilai aslinya (misal 'abc')
    if (isNaN(number)) return String(number); // Mengembalikan String(number) agar NaN tidak ditampilkan
    // Gunakan Intl.NumberFormat untuk format Rupiah tanpa desimal dan tambahkan prefiks "Rp "
    return `Rp ${new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(number)}`;
};

// Fungsi ini akan membersihkan string dari format mata uang menjadi angka yang dapat di-parse
const parseCurrency = (value) => {
    // Pastikan nilai adalah string
    if (typeof value !== 'string') return value;
    // Hapus "Rp ", spasi, dan titik sebagai pemisah ribuan. Ubah koma menjadi titik untuk desimal.
    let cleanedValue = value.trim();
    cleanedValue = cleanedValue.replace(/Rp\s?/g, ''); // Hapus "Rp" prefix dan spasi setelahnya
    cleanedValue = cleanedValue.replace(/\s/g, ''); // Hapus semua spasi
    cleanedValue = cleanedValue.replace(/\./g, ''); // Hapus pemisah ribuan (titik)
    cleanedValue = cleanedValue.replace(/,/g, '.'); // Ubah koma (jika digunakan sebagai desimal) menjadi titik
    
    const parsed = parseFloat(cleanedValue);
    // Jika hasil parse bukan angka, kembalikan string asli agar input tidak jadi NaN
    return isNaN(parsed) ? cleanedValue : parsed; 
};


const ModalBackdrop = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7); display: flex;
  justify-content: center; align-items: center; z-index: 1001; backdrop-filter: blur(5px);
`;
const ModalContainer = styled(motion.div)`
  background-color: var(--bg-surface); border-radius: 16px;
  width: 100%; max-width: 400px; padding: 30px;
`;
const ModalTitle = styled.h2` font-size: 1.5rem; margin-bottom: 20px; text-align: center; color: var(--text-primary); `;
const Form = styled.form` display: flex; flex-direction: column; gap: 20px; `;
const Label = styled.label` font-weight: 500; color: var(--text-secondary); margin-bottom: 5px; display: block; `;
const Input = styled.input`
    width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 1rem; background-color: var(--bg-main); color: var(--text-primary);
    
    /* Styles to remove spin buttons (up/down arrows) */
    &[type="number"] {
        -moz-appearance: textfield; /* Firefox */
    }
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none; /* Safari, Chrome */
        margin: 0; /* Important for Safari, Chrome to remove extra space */
    }
`;
const Button = styled.button` padding: 12px 20px; border-radius: 8px; border: none; background-color: var(--primary-color); color: white; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; &:disabled { opacity: 0.5; } `;

function StartShiftModal({ onShiftStarted }) {
    const [startingCash, setStartingCash] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Gunakan parseFloat langsung pada state startingCash yang sudah diproses oleh parseCurrency
        const cashAmount = parseFloat(startingCash); 
        if (isNaN(cashAmount) || cashAmount < 0) {
            return toast.error("Masukkan jumlah kas awal yang valid.");
        }
        setIsSubmitting(true);
        try {
            await toast.promise(
                startShift({ starting_cash: cashAmount }),
                {
                    pending: 'Memulai shift...',
                    success: 'Shift berhasil dimulai!',
                    error: 'Gagal memulai shift.'
                }
            );
            onShiftStarted();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ModalBackdrop initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ModalContainer initial={{ y: -50 }} animate={{ y: 0 }}>
                <ModalTitle>Buka Shift Baru</ModalTitle>
                <Form onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="startingCash">Kas Awal (Rp)</Label>
                        {/* * Ubah `type="number"` menjadi `type="text"`
                         * Gunakan `formatCurrency` untuk menampilkan nilai dengan prefiks "Rp" dan pemisah ribuan
                         * Gunakan `parseCurrency` untuk membersihkan nilai saat perubahan input
                         */}
                        <Input
                            id="startingCash"
                            type="text" // Mengizinkan karakter non-angka untuk format Rupiah
                            value={formatCurrency(startingCash)} // Menampilkan nilai dalam format Rupiah
                            onChange={(e) => {
                                // Saat input berubah, bersihkan nilai dan simpan sebagai angka (atau string bersih jika tidak valid)
                                setStartingCash(parseCurrency(e.target.value));
                            }}
                            placeholder="Contoh: Rp 500.000"
                            required
                            autoFocus
                        />
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                        <FiLogIn /> {isSubmitting ? 'Memproses...' : 'Mulai Shift'}
                    </Button>
                </Form>
            </ModalContainer>
        </ModalBackdrop>
    );
}

export default StartShiftModal;