// frontend/src/components/CloseShiftModal.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiLogOut } from 'react-icons/fi';
import { closeShift } from '../services/api';
import { toast } from 'react-toastify';
import { formatRupiah, parseRupiah } from '../utils/formatters';


const ModalBackdrop = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7); display: flex;
  justify-content: center; align-items: center; z-index: 1001;
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
const Button = styled.button` padding: 12px 20px; border-radius: 8px; border: none; background-color: var(--red-color); color: white; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; &:disabled { opacity: 0.5; } `;

function CloseShiftModal({ shiftId, onShiftClosed, onClose }) {
    const [endingCash, setEndingCash] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cashAmount = parseFloat(endingCash);
        if (isNaN(cashAmount) || cashAmount < 0) {
            return toast.error("Masukkan jumlah kas akhir yang valid.");
        }
        setIsSubmitting(true);
        try {
            await toast.promise(
                closeShift(shiftId, { ending_cash: cashAmount }),
                {
                    pending: 'Menutup shift...',
                    success: 'Shift berhasil ditutup!',
                    error: (err) => err.response?.data?.message || 'Gagal menutup shift.'
                }
            );
            onShiftClosed();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
       <ModalBackdrop initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
            <ModalContainer initial={{ y: -50 }} animate={{ y: 0 }} onClick={e => e.stopPropagation()}>
                <ModalTitle>Tutup Shift</ModalTitle>
                <Form onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="endingCash">Total Kas Fisik Akhir (Rp)</Label>
                        <Input
                            id="endingCash"
                            type="text"
                            value={formatRupiah(endingCash)}
                            onChange={(e) => {
                                setEndingCash(parseRupiah(e.target.value));
                            }}
                            placeholder="Hitung dan masukkan total uang tunai"
                            required
                            autoFocus
                        />
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                        <FiLogOut /> {isSubmitting ? 'Memproses...' : 'Konfirmasi & Tutup Shift'}
                    </Button>
                </Form>
            </ModalContainer>
        </ModalBackdrop>
    );
}

export default CloseShiftModal;

CloseShiftModal.propTypes = {
  shiftId: PropTypes.number.isRequired,
  onShiftClosed: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};