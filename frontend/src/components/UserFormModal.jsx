import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const ModalBackdrop = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
`;
const ModalContainer = styled(motion.div)`
  background-color: var(--bg-surface); border-radius: 16px;
  border: 1px solid var(--border-color); width: 100%;
  max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
`;
const ModalHeader = styled.div`
  padding: 20px 25px; border-bottom: 1px solid var(--border-color);
  display: flex; justify-content: space-between; align-items: center;
`;
const ModalTitle = styled.h3` font-size: 1.2rem; font-weight: 600; `;
const CloseButton = styled.button` background: none; border: none; color: var(--text-secondary); cursor: pointer; &:hover { color: var(--text-primary); } `;
const ModalBody = styled.div` padding: 25px; display: grid; grid-template-columns: 1fr; gap: 20px; `;
const InputGroup = styled.div` grid-column: ${props => props.$fullWidth ? '1 / -1' : 'auto'}; `;
const Label = styled.label` display: block; margin-bottom: 8px; font-weight: 500; font-size: 0.9rem; color: var(--text-secondary); `;
const Input = styled.input` width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--bg-main); color: var(--text-primary); font-size: 1rem; `;
const Select = styled.select` width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--bg-main); color: var(--text-primary); font-size: 1rem; `;
const ModalFooter = styled.div` padding: 20px 25px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 15px; `;
const Button = styled.button`
  padding: 10px 25px; border-radius: 8px; border: 1px solid var(--border-color);
  font-weight: 600; cursor: pointer;
  background-color: ${props => props.$primary ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.$primary ? 'white' : 'var(--text-primary)'};
  &:hover { opacity: 0.9; }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function UserFormModal({ isOpen, onClose, onSave, user, isSubmitting }) {
  const [formData, setFormData] = useState({});
  const isEditing = Boolean(user);

  useEffect(() => {
    setFormData(user || { name: '', email: '', password: '', role: 'kasir' });
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const modalVariants = { hidden: { y: "-50px", opacity: 0 }, visible: { y: "0", opacity: 1 } };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalBackdrop initial="hidden" animate="visible" exit="hidden" variants={backdropVariants}>
          <ModalContainer variants={modalVariants}>
            <form onSubmit={handleSubmit}>
              <ModalHeader>
                <ModalTitle>{isEditing ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</ModalTitle>
                <CloseButton type="button" onClick={onClose}><FiX size={24} /></CloseButton>
              </ModalHeader>
              <ModalBody>
                <InputGroup $fullWidth>
                  <Label>Nama</Label>
                  <Input name="name" value={formData.name || ''} onChange={handleChange} required autoFocus />
                </InputGroup>
                <InputGroup $fullWidth>
                  <Label>Email</Label>
                  <Input type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
                </InputGroup>
                {!isEditing && (
                  <InputGroup $fullWidth>
                    <Label>Password</Label>
                    <Input type="password" name="password" value={formData.password || ''} onChange={handleChange} required />
                  </InputGroup>
                )}
                <InputGroup $fullWidth>
                  <Label>Peran (Role)</Label>
                  <Select name="role" value={formData.role || 'kasir'} onChange={handleChange}>
                    <option value="kasir">Kasir</option>
                    <option value="admin">Admin</option>
                  </Select>
                </InputGroup>
              </ModalBody>
              <ModalFooter>
                <Button type="button" onClick={onClose}>Batal</Button>
                <Button type="submit" $primary disabled={isSubmitting}>
                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </ModalFooter>
            </form>
          </ModalContainer>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
}

export default UserFormModal;

UserFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  user: PropTypes.object,
  isSubmitting: PropTypes.bool.isRequired,
};