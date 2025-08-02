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
  backdrop-filter: blur(5px);
`;
const ModalContainer = styled(motion.div)`
  background-color: var(--bg-surface); border-radius: 16px;
  width: 100%; max-width: 400px; padding: 30px; text-align: center;
`;
const ModalTitle = styled.h2` font-size: 1.5rem; margin-bottom: 20px; color: var(--text-primary); `;

// --- PERBAIKAN DIMULAI: Menambahkan Form, Label, dan Input ---
const Form = styled.form``;
const Label = styled.label` display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-secondary); text-align: left; `;
const Input = styled.input` width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--bg-main); color: var(--text-primary); font-size: 1.2rem; text-align: right; margin-bottom: 25px; `;
// --- PERBAIKAN SELESAI ---

const Button = styled.button`
  padding: 12px 20px; border-radius: 8px; border: none; background-color: var(--red-color);
  color: white; font-weight: 600; cursor: pointer; display: flex;
  align-items: center; justify-content: center; gap: 8px; width: 100%;
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #CC2222;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
`;

function CloseShiftModal({ shiftId, onShiftClosed, onClose }) {
    // --- PERBAIKAN DIMULAI: State untuk kas akhir fisik ---
    const [endingCash, setEndingCash] = useState('');
    // --- PERBAIKAN SELESAI ---
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // --- PERBAIKAN DIMULAI: Mengirim data kas akhir fisik ke backend ---
            const physicalCash = parseRupiah(endingCash);
            if (physicalCash === '' || isNaN(parseFloat(physicalCash))) {
                toast.warn("Harap masukkan jumlah kas fisik yang valid.");
                setIsSubmitting(false);
                return;
            }
            await toast.promise(
                closeShift(shiftId, { ending_cash: physicalCash }),
            // --- PERBAIKAN SELESAI ---
                {
                    pending: 'Menutup shift...',
                    success: 'Shift berhasil ditutup & direkap!',
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
                <ModalTitle>Tutup & Rekap Shift</ModalTitle>
                <p style={{color: 'var(--text-secondary)', marginBottom: '30px', textAlign: 'left'}}>
                    Hitung total uang tunai fisik di laci Anda dan masukkan jumlahnya di bawah untuk menyelesaikan shift.
                </p>
                {/* --- PERBAIKAN DIMULAI: Menambahkan form input --- */}
                <Form onSubmit={handleSubmit}>
                    <Label htmlFor="ending_cash">Jumlah Kas Fisik (Rp)</Label>
                    <Input
                        id="ending_cash"
                        type="text"
                        value={formatRupiah(endingCash)}
                        onChange={(e) => setEndingCash(e.target.value)}
                        placeholder="0"
                        required
                        autoFocus
                    />
                    <Button type="submit" disabled={isSubmitting}>
                        <FiLogOut /> {isSubmitting ? 'Memproses...' : 'Konfirmasi & Tutup Shift'}
                    </Button>
                </Form>
                {/* --- PERBAIKAN SELESAI --- */}
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