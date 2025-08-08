// C:\Users\Ibnu\Project\smart-pos\frontend\src\components\RewardFormModal.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const ModalBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled(motion.div)`
  background-color: var(--bg-surface);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
`;

const ModalHeader = styled.div`
  padding: 20px 25px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  &:hover { color: var(--text-primary); }
`;

const ModalBody = styled.div`
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div``;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-main);
  color: var(--text-primary);
  font-size: 1rem;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  label {
    margin-bottom: 0;
    cursor: pointer;
  }
`;

const ModalFooter = styled.div`
  padding: 20px 25px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 15px;
`;

const Button = styled.button`
  padding: 10px 25px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  font-weight: 600;
  cursor: pointer;
  background-color: ${props => props.$primary ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.$primary ? 'white' : 'var(--text-primary)'};
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function RewardFormModal({ isOpen, onClose, onSave, reward, isSubmitting }) {
    const [formData, setFormData] = useState({ name: '', description: '', points_cost: '', is_active: true });
    const isEditing = Boolean(reward);

    useEffect(() => {
        if (isOpen) {
            // Jika sedang mengedit, isi form dengan data hadiah. Jika tidak, reset form.
            setFormData(reward || { name: '', description: '', points_cost: '', is_active: true });
        }
    }, [reward, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Pastikan biaya poin dikirim sebagai angka
        onSave({ ...formData, points_cost: parseInt(formData.points_cost, 10) });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <ModalBackdrop initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ModalContainer initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: 50 }}>
                        <form onSubmit={handleSubmit}>
                            <ModalHeader>
                                <ModalTitle>{isEditing ? 'Edit Hadiah' : 'Tambah Hadiah Baru'}</ModalTitle>
                                <CloseButton type="button" onClick={onClose}><FiX size={24} /></CloseButton>
                            </ModalHeader>
                            <ModalBody>
                                <InputGroup>
                                    <Label htmlFor="name">Nama Hadiah</Label>
                                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required autoFocus />
                                </InputGroup>
                                <InputGroup>
                                    <Label htmlFor="description">Deskripsi (Opsional)</Label>
                                    <Input as="textarea" rows="3" id="description" name="description" value={formData.description} onChange={handleChange} />
                                </InputGroup>
                                <InputGroup>
                                    <Label htmlFor="points_cost">Biaya Poin</Label>
                                    <Input id="points_cost" type="number" name="points_cost" value={formData.points_cost} onChange={handleChange} required min="1" />
                                </InputGroup>
                                <CheckboxContainer>
                                    <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange} />
                                    <Label htmlFor="is_active">Aktifkan Hadiah</Label>
                                </CheckboxContainer>
                            </ModalBody>
                            <ModalFooter>
                                <Button type="button" onClick={onClose}>Batal</Button>
                                <Button type="submit" $primary disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</Button>
                            </ModalFooter>
                        </form>
                    </ModalContainer>
                </ModalBackdrop>
            )}
        </AnimatePresence>
    );
}

RewardFormModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    reward: PropTypes.object,
    isSubmitting: PropTypes.bool.isRequired,
};

export default RewardFormModal;