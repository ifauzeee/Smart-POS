import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiLogIn } from 'react-icons/fi';
import { startShift } from '../services/api';
import { toast } from 'react-toastify';
// Removed formatRupiah, parseRupiah as they are no longer needed

const ModalBackdrop = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7); display: flex;
  justify-content: center; align-items: center; z-index: 1001; backdrop-filter: blur(5px);
`;
const ModalContainer = styled(motion.div)`
  background-color: var(--bg-surface); border-radius: 16px;
  width: 100%; max-width: 400px; padding: 30px; text-align: center; /* Centered text for better presentation */
`;
const ModalTitle = styled.h2` font-size: 1.5rem; margin-bottom: 20px; color: var(--text-primary); `;
// Removed Form, Label, Input styled components as they are no longer needed
const Button = styled.button` padding: 12px 20px; border-radius: 8px; border: none; background-color: var(--primary-color); color: white; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; /* Make button full width */ &:disabled { opacity: 0.5; } `;

function StartShiftModal({ onShiftStarted }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await toast.promise(
                startShift(), // No longer sending starting_cash
                {
                    pending: 'Memulai shift...',
                    success: 'Shift berhasil dimulai!',
                    error: 'Gagal memulai shift.'
                }
            );
            onShiftStarted();
        } catch (error) {
            console.error(error);
            // Display more specific error message if available from backend
            const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan tidak dikenal.';
            toast.error(`Gagal memulai shift: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ModalBackdrop initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ModalContainer initial={{ y: -50 }} animate={{ y: 0 }}>
                <ModalTitle>Mulai Shift Baru?</ModalTitle>
                <p style={{color: 'var(--text-secondary)', marginBottom: '30px'}}>Kas awal akan diambil secara otomatis dari saldo laci kas terakhir.</p>
                <form onSubmit={handleSubmit}>
                    <Button type="submit" disabled={isSubmitting}>
                        <FiLogIn /> {isSubmitting ? 'Memproses...' : 'Konfirmasi & Mulai Shift'}
                    </Button>
                </form>
            </ModalContainer>
        </ModalBackdrop>
    );
}

StartShiftModal.propTypes = {
  onShiftStarted: PropTypes.func.isRequired,
};

export default StartShiftModal;
