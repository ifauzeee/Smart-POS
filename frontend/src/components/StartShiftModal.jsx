// frontend/src/components/StartShiftModal.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiLogIn } from 'react-icons/fi';
import { startShift } from '../services/api';
import { toast } from 'react-toastify';
import { formatRupiah, parseRupiah } from '../utils/formatters';


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
    
    &[type="number"] {
        -moz-appearance: textfield;
    }
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
`;
const Button = styled.button` padding: 12px 20px; border-radius: 8px; border: none; background-color: var(--primary-color); color: white; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; &:disabled { opacity: 0.5; } `;

function StartShiftModal({ onShiftStarted }) {
    const [startingCash, setStartingCash] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                        <Input
                            id="startingCash"
                            type="text"
                            value={formatRupiah(startingCash)}
                            onChange={(e) => {
                                setStartingCash(parseRupiah(e.target.value));
                            }}
                            placeholder="Contoh: 500.000"
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

StartShiftModal.propTypes = {
  onShiftStarted: PropTypes.func.isRequired,
};