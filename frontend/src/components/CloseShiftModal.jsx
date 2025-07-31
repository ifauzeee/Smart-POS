import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiLogOut } from 'react-icons/fi';
import { closeShift } from '../services/api';
import { toast } from 'react-toastify';
// Removed formatRupiah, parseRupiah as they are no longer needed

const ModalBackdrop = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7); display: flex;
  justify-content: center; align-items: center; z-index: 1001;
  backdrop-filter: blur(5px); /* Added backdrop-filter for consistency */
`;
const ModalContainer = styled(motion.div)`
  background-color: var(--bg-surface); border-radius: 16px;
  width: 100%; max-width: 400px; padding: 30px; text-align: center;
`;
const ModalTitle = styled.h2` font-size: 1.5rem; margin-bottom: 20px; color: var(--text-primary); `;
// Removed Form, Label, Input styled components as they are no longer needed
const Button = styled.button`
  padding: 12px 20px; border-radius: 8px; border: none; background-color: var(--red-color);
  color: white; font-weight: 600; cursor: pointer; display: flex;
  align-items: center; justify-content: center; gap: 8px; width: 100%;
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease; /* Added transition */

  &:hover:not(:disabled) { /* Added not(:disabled) for hover effect */
    background-color: #CC2222; /* Darker red on hover */
    transform: translateY(-2px); /* Slight lift effect */
    box-shadow: 0 4px 8px rgba(0,0,0,0.2); /* Subtle shadow */
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; } /* Disabled state */
`;

function CloseShiftModal({ shiftId, onShiftClosed, onClose }) {
    // endingCash state removed as it's no longer needed
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await toast.promise(
                closeShift(shiftId, {}), // No longer sending ending_cash
                {
                    pending: 'Menutup shift...',
                    success: 'Shift berhasil ditutup & direkap!',
                    error: (err) => err.response?.data?.message || 'Gagal menutup shift.'
                }
            );
            onShiftClosed();
        } catch (error) {
            console.error(error);
            // Display more specific error message if available from backend
            const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan tidak dikenal.';
            toast.error(`Gagal menutup shift: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
       <ModalBackdrop initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
            <ModalContainer initial={{ y: -50 }} animate={{ y: 0 }} onClick={e => e.stopPropagation()}>
                <ModalTitle>Tutup & Rekap Shift?</ModalTitle>
                <p style={{color: 'var(--text-secondary)', marginBottom: '30px'}}>Sistem akan merekap semua penjualan dan memperbarui saldo laci kas secara otomatis.</p>
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