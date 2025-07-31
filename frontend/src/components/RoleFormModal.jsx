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
  max-width: 800px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
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
  &:hover {
    color: var(--text-primary);
  }
`;

const ModalBody = styled.div`
  padding: 25px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
`;

const InputGroup = styled.div`
  flex: 1;
`;

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

const PermissionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 10px;
`;

const PermissionCheckbox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  label {
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

function RoleFormModal({ isOpen, onClose, onSave, role, permissionsList, isSubmitting }) {
    const [formData, setFormData] = useState({ name: '', description: '', permissions: [] });
    const isEditing = Boolean(role);

    useEffect(() => {
        if (isOpen) {
            setFormData(role ? { ...role, permissions: role.permissions || [] } : { name: '', description: '', permissions: [] });
        }
    }, [role, isOpen]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handlePermissionChange = (permissionId) => {
        const currentPermissions = formData.permissions;
        const newPermissions = currentPermissions.includes(permissionId)
            ? currentPermissions.filter(id => id !== permissionId)
            : [...currentPermissions, permissionId];
        setFormData({ ...formData, permissions: newPermissions });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <ModalBackdrop initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ModalContainer initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: 50 }}>
                        <form onSubmit={handleSubmit}>
                            <ModalHeader>
                                <ModalTitle>{isEditing ? 'Edit Peran' : 'Tambah Peran Baru'}</ModalTitle>
                                <CloseButton type="button" onClick={onClose}><FiX size={24} /></CloseButton>
                            </ModalHeader>
                            <ModalBody>
                                <FormRow>
                                    <InputGroup>
                                        <Label>Nama Peran</Label>
                                        <Input name="name" value={formData.name || ''} onChange={handleChange} required autoFocus />
                                    </InputGroup>
                                    <InputGroup>
                                        <Label>Deskripsi</Label>
                                        <Input name="description" value={formData.description || ''} onChange={handleChange} />
                                    </InputGroup>
                                </FormRow>
                                <div>
                                    <Label style={{ marginBottom: '15px' }}>Izin (Permissions)</Label>
                                    <PermissionGrid>
                                        {permissionsList.map(p => (
                                            <PermissionCheckbox key={p.id}>
                                                <input
                                                    type="checkbox"
                                                    id={`perm-${p.id}`}
                                                    checked={formData.permissions.includes(p.id)}
                                                    onChange={() => handlePermissionChange(p.id)}
                                                />
                                                <label htmlFor={`perm-${p.id}`}>{p.description}</label>
                                            </PermissionCheckbox>
                                        ))}
                                    </PermissionGrid>
                                </div>
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

RoleFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  role: PropTypes.object,
  permissionsList: PropTypes.array.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};

export default RoleFormModal;
