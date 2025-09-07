// C:\Users\Ibnu\Project\smart-pos\frontend\src\components\CustomerSelectModal.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { getCustomers } from '../services/api';
import { toast } from 'react-toastify';
import { FiSearch, FiX, FiUserPlus } from 'react-icons/fi';
import CustomerFormModal from './CustomerFormModal';
import { useDebounce } from '../hooks/useDebounce';

const ModalBackdrop = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7); display: flex;
  justify-content: center; align-items: center; z-index: 1001;
`;
const ModalContainer = styled(motion.div)`
  background-color: var(--bg-surface);
  border-radius: 16px;
  width: 100%; max-width: 500px; padding: 30px;
  display: flex; flex-direction: column; height: 70vh;
`;
const ModalHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; `;
const ModalTitle = styled.h2` font-size: 1.5rem; margin: 0; color: var(--text-primary);`;
const CloseButton = styled.button` background: none; border: none; cursor: pointer; color: var(--text-secondary); `;
const SearchInput = styled.input`
    width: 100%; padding: 12px; border: 1px solid var(--border-color);
    border-radius: 8px; margin-bottom: 20px; background-color: var(--bg-main);
    color: var(--text-primary); font-size: 1rem;
    &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 98, 0, 234), 0.2);
    }
`;
const CustomerList = styled.ul` list-style: none; padding: 0; margin: 0; overflow-y: auto; flex-grow: 1; `;
const CustomerItem = styled.li`
  padding: 15px; border-bottom: 1px solid var(--border-color); cursor: pointer;
  &:hover { background-color: var(--bg-main); }
  &:last-child { border-bottom: none; }
`;
const AddCustomerButton = styled.button`
  width: 100%; padding: 12px; margin-top: 15px; border: 1px dashed var(--border-color);
  border-radius: 8px; background-color: transparent; color: var(--primary-color);
  font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  &:hover { background-color: var(--bg-main); }
`;


function CustomerSelectModal({ isOpen, onClose, onSelectCustomer }) {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        if (!isOpen || isFormOpen) return;

        const fetchCustomers = async () => {
            setLoading(true);
            try {
                const res = await getCustomers(debouncedSearchTerm);
                setCustomers(res.data);
            } catch (error) {
                toast.error("Gagal memuat daftar pelanggan.");
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, [debouncedSearchTerm, isOpen, isFormOpen]);
    
    const handleCustomerCreated = (newCustomer) => {
        setIsFormOpen(false);
        // Manually add the new customer to the list for an instant UI update
        setCustomers(prevCustomers => [newCustomer, ...prevCustomers]);
        // Then select the customer, which will close this modal
        onSelectCustomer(newCustomer);
    };

    if (!isOpen) return null;

    return (
        <>
            <ModalBackdrop initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ModalContainer initial={{ y: -50 }} animate={{ y: 0 }}>
                    <ModalHeader>
                        <ModalTitle>Pilih Pelanggan</ModalTitle>
                        <CloseButton onClick={onClose}><FiX size={24} /></CloseButton>
                    </ModalHeader>
                    <SearchInput 
                        type="text"
                        placeholder="Ketik nama atau nomor telepon..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                    <CustomerList>
                        {loading ? <p>Mencari...</p> : customers.map(customer => (
                            <CustomerItem key={customer.id} onClick={() => onSelectCustomer(customer)}>
                                <p style={{margin: 0, fontWeight: '600'}}>{customer.name}</p>
                                <p style={{margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                                    {customer.phone}
                                </p>
                            </CustomerItem>
                        ))}
                    </CustomerList>
                    <AddCustomerButton onClick={() => setIsFormOpen(true)}>
                        <FiUserPlus/> Tambah Pelanggan Baru
                    </AddCustomerButton>
                </ModalContainer>
            </ModalBackdrop>

            <CustomerFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onCustomerCreated={handleCustomerCreated}
            />
        </>
    );
}

CustomerSelectModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSelectCustomer: PropTypes.func.isRequired,
};

export default CustomerSelectModal;