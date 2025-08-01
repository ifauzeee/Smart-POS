// C:\Users\Ibnu\Project\smart-pos\frontend\src\components\StartShiftModal.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiLogIn } from 'react-icons/fi';
import { startShift } from '../services/api';
import { toast } from 'react-toastify';

const ModalBackdrop = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7); display: flex;
  justify-content: center; align-items: center; z-index: 1001; backdrop-filter: blur(5px);
`;
const ModalContainer = styled(motion.div)`
  background-color: var(--bg-surface); border-radius: 16px;
  width: 100%; max-width: 400px; padding: 30px; text-align: center;
`;
const ModalTitle = styled.h2` font-size: 1.5rem; margin-bottom: 20px; color: var(--text-primary); `;
const Button = styled.button` padding: 12px 20px; border-radius: 8px; border: none; background-color: var(--primary-color); color: white; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; &:disabled { opacity: 0.5; } `;

function StartShiftModal({ onShiftStarted }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // PERBAIKAN: Tidak perlu mengirim data apa pun
            await toast.promise(startShift(), {
                pending: 'Memulai shift...',
                success: 'Shift berhasil dimulai!',
                error: (err) => err.response?.data?.message || 'Gagal memulai shift.'
            });
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
                <ModalTitle>Mulai Shift Baru?</ModalTitle>
                <p style={{color: 'var(--text-secondary)', marginBottom: '30px'}}>Kas awal akan diisi secara otomatis sesuai pengaturan admin.</p>
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