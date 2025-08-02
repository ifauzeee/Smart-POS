// C:\Users\Ibnu\Project\smart-pos\frontend\src\components\CustomerFormModal.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiX, FiSave } from 'react-icons/fi';
import { createCustomer } from '../services/api';
import { toast } from 'react-toastify';

const ModalBackdrop = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7); display: flex;
  justify-content: center; align-items: center; z-index: 1002;
`;
const ModalContainer = styled(motion.div)`
  background-color: var(--bg-surface); border-radius: 16px;
  width: 100%; max-width: 450px; padding: 30px;
`;
const ModalHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; `;
const ModalTitle = styled.h2` font-size: 1.5rem; margin: 0; color: var(--text-primary);`;
const CloseButton = styled.button` background: none; border: none; cursor: pointer; color: var(--text-secondary); `;
const Form = styled.form` display: flex; flex-direction: column; gap: 20px; `;
const InputGroup = styled.div` display: flex; flex-direction: column; gap: 8px; `;
const Label = styled.label` font-weight: 500; color: var(--text-secondary); `;
const Input = styled.input`
    width: 100%; padding: 12px; border: 1px solid var(--border-color);
    border-radius: 8px; background-color: var(--bg-main); color: var(--text-primary);
`;
const SaveButton = styled.button`
    padding: 12px 20px; border-radius: 8px; border: none;
    background-color: var(--primary-color); color: white; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-top: 10px;
    &:disabled { opacity: 0.5; }
`;

function CustomerFormModal({ isOpen, onClose, onCustomerCreated }) {
    const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            return toast.warn("Nama pelanggan tidak boleh kosong.");
        }
        setIsSubmitting(true);
        try {
            // --- PERBAIKAN DIMULAI ---
            // Mengirim 'phone' sesuai dengan yang diharapkan backend, bukan 'phone_number'
            const res = await toast.promise(
                createCustomer({
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email
                }),
            // --- PERBAIKAN SELESAI ---
                {
                    pending: 'Menyimpan pelanggan...',
                    success: 'Pelanggan baru berhasil dibuat!',
                    error: (err) => err.response?.data?.message || "Gagal menyimpan pelanggan."
                }
            );
            onCustomerCreated({ id: res.data.customerId, ...formData });
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <ModalBackdrop initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ModalContainer initial={{ y: -50 }} animate={{ y: 0 }}>
                <ModalHeader>
                    <ModalTitle>Tambah Pelanggan Baru</ModalTitle>
                    <CloseButton onClick={onClose}><FiX size={24} /></CloseButton>
                </ModalHeader>
                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Label htmlFor="name">Nama Pelanggan*</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} required autoFocus />
                    </InputGroup>
                    <InputGroup>
                        <Label htmlFor="phone">Nomor Telepon</Label>
                        <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                    </InputGroup>
                    <InputGroup>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                    </InputGroup>
                    <SaveButton type="submit" disabled={isSubmitting}>
                        <FiSave/> {isSubmitting ? 'Menyimpan...' : 'Simpan Pelanggan'}
                    </SaveButton>
                </Form>
            </ModalContainer>
        </ModalBackdrop>
    );
}

CustomerFormModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onCustomerCreated: PropTypes.func.isRequired,
};

export default CustomerFormModal;