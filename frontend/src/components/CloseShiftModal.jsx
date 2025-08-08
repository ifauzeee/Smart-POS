// C:\Users\Ibnu\Project\smart-pos\frontend\src\components\CloseShiftModal.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiLogOut } from 'react-icons/fi';
import { closeShift } from '../services/api';
import { toast } from 'react-toastify';
import { formatRupiah, parseRupiah } from '../utils/formatters';

const ModalBackdrop = styled(motion.div)` position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 1001; backdrop-filter: blur(5px); `;
const ModalContainer = styled(motion.div)` background-color: var(--bg-surface); border-radius: 16px; width: 100%; max-width: 400px; padding: 30px; text-align: center; `;
const ModalTitle = styled.h2` font-size: 1.5rem; margin-bottom: 20px; color: var(--text-primary); `;
const Button = styled.button` padding: 12px 20px; border-radius: 8px; border: none; background-color: var(--red-color); color: white; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease; &:hover:not(:disabled) { background-color: #CC2222; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); } &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; } `;

const Input = styled.input`
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 1.2rem;
    text-align: center;
    margin-bottom: 20px;
    background-color: var(--bg-main);
    color: var(--text-primary);
`;

function CloseShiftModal({ shiftId, onShiftClosed, onClose }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [physicalEndingCash, setPhysicalEndingCash] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        // FIXED: Added validation for the input
        const cashAmount = parseFloat(parseRupiah(physicalEndingCash));
        if (isNaN(cashAmount) || cashAmount < 0) {
            return toast.error("Masukkan jumlah kas yang valid (angka positif).");
        }
        setIsSubmitting(true);
        try {
            await closeShift(shiftId, { physicalEndingCash: cashAmount });
            onShiftClosed();
        } catch (error) {
            console.error(error);
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
                    Anda akan otomatis keluar. Hitung uang tunai fisik di laci dan masukkan jumlahnya di bawah ini.
                </p>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="physicalEndingCash" style={{fontWeight: 500, marginBottom: '8px', display: 'block'}}>Kas Akhir Fisik (Rp)</label>
                    <Input
                        id="physicalEndingCash"
                        type="text"
                        value={formatRupiah(physicalEndingCash)}
                        onChange={(e) => setPhysicalEndingCash(e.target.value)}
                        placeholder="Contoh: 550.000"
                        required
                        autoFocus
                    />
                    <Button type="submit" disabled={isSubmitting || !physicalEndingCash}>
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