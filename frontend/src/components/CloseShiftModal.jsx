// C:\Users\Ibnu\Project\smart-pos\frontend\src\components\CloseShiftModal.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiLogOut } from 'react-icons/fi';
import { closeShift } from '../services/api';
import { toast } from 'react-toastify';

// ... (Styled components biarkan seperti semula) ...
const ModalBackdrop = styled(motion.div)` position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 1001; backdrop-filter: blur(5px); `;
const ModalContainer = styled(motion.div)` background-color: var(--bg-surface); border-radius: 16px; width: 100%; max-width: 400px; padding: 30px; text-align: center; `;
const ModalTitle = styled.h2` font-size: 1.5rem; margin-bottom: 20px; color: var(--text-primary); `;
const Button = styled.button` padding: 12px 20px; border-radius: 8px; border: none; background-color: var(--red-color); color: white; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease; &:hover:not(:disabled) { background-color: #CC2222; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); } &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; } `;


function CloseShiftModal({ shiftId, onShiftClosed, onClose }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // =================================================================
            // PERBAIKAN DI SINI: Hapus toast.promise dan jalankan API langsung
            // =================================================================
            await closeShift(shiftId);
            // Langsung panggil fungsi dari parent (Sidebar) untuk menangani notifikasi dan navigasi
            onShiftClosed();
        } catch (error) {
            console.error(error);
            // Tampilkan notifikasi error jika API gagal
            toast.error(error.response?.data?.message || 'Gagal menutup shift.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
       <ModalBackdrop initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
            <ModalContainer initial={{ y: -50 }} animate={{ y: 0 }} onClick={e => e.stopPropagation()}>
                <ModalTitle>Konfirmasi Tutup Shift</ModalTitle>
                <p style={{color: 'var(--text-secondary)', marginBottom: '30px', textAlign: 'left', lineHeight: '1.6'}}>
                    Setelah shift ditutup, Anda akan otomatis keluar (logout). Sistem akan menghitung kas akhir secara otomatis.
                </p>
                <form onSubmit={handleSubmit}>
                    <Button type="submit" disabled={isSubmitting}>
                        <FiLogOut /> {isSubmitting ? 'Memproses...' : 'Konfirmasi & Tutup Shift'}
                    </Button>
                </form>
            </ModalContainer>
        </ModalBackdrop>
    );
}

CloseShiftModal.propTypes = {
  shiftId: PropTypes.number.isRequired,
  onShiftClosed: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CloseShiftModal;