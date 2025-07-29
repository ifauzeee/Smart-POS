import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUserPlus } from 'react-icons/fi';
import { getCustomers, createCustomer } from '../services/api';
import { toast } from 'react-toastify';

const ModalBackdrop = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
`;
const ModalContainer = styled(motion.div)`
  background-color: var(--bg-surface); border-radius: 16px;
  width: 100%; max-width: 500px; overflow: hidden;
  border: 1px solid var(--border-color);
  display: flex; flex-direction: column;
`;
const ModalHeader = styled.div`
  padding: 20px 25px; border-bottom: 1px solid var(--border-color);
  display: flex; justify-content: space-between; align-items: center;
`;
const ModalTitle = styled.h3` font-size: 1.2rem; font-weight: 600; margin: 0;`;
const CloseButton = styled.button` background: none; border: none; cursor: pointer; color: var(--text-secondary); `;
const ModalBody = styled.div` padding: 25px; display: flex; flex-direction: column; gap: 20px;`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  font-size: 1rem;
  background-color: var(--bg-main);
  color: var(--text-primary);
  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.8;
  }
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 98, 0, 234), 0.2);
  }
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
  user-select: text !important;
`;

const CustomerList = styled.ul`
  list-style: none; padding: 0; margin: 0;
  max-height: 300px; overflow-y: auto;
`;
const CustomerItem = styled.li`
  padding: 15px; border-radius: 8px; cursor: pointer;
  color: var(--text-primary);
  &:hover { background-color: var(--bg-main); }
`;
const AddCustomerForm = styled.form`
  display: flex; gap: 10px; border-top: 1px solid var(--border-color);
  padding: 20px 25px;
`;
const AddButton = styled.button`
  padding: 0 15px;
  border-radius: 8px; border: none;
  background-color: var(--primary-color);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { opacity: 0.9; }
`;

function CustomerSelectModal({ isOpen, onClose, onSelectCustomer }) {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newCustomerName, setNewCustomerName] = useState('');

    const fetchCustomers = async (search = '') => {
        try {
            const res = await getCustomers(search);
            setCustomers(res.data);
        } catch (error) {
            toast.error("Gagal memuat pelanggan.");
        }
    };

    useEffect(() => {
        if (isOpen) {
            const handler = setTimeout(() => {
                fetchCustomers(searchTerm);
            }, 300);
            return () => clearTimeout(handler);
        }
    }, [searchTerm, isOpen]);

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        if (!newCustomerName.trim()) {
            toast.warn("Nama pelanggan tidak boleh kosong.");
            return;
        }
        try {
            const res = await createCustomer({ name: newCustomerName });
            const newCustomer = { id: res.data.customerId, name: newCustomerName };
            toast.success(`Pelanggan "${newCustomerName}" ditambahkan!`);
            onSelectCustomer(newCustomer);
            setNewCustomerName('');
            onClose();
        } catch (error) {
            console.error("Error adding customer:", error);
            toast.error("Gagal menambahkan pelanggan.");
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <ModalBackdrop
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <ModalContainer
                    initial={{ y: "-100vh", opacity: 0 }}
                    animate={{ y: "0", opacity: 1 }}
                    exit={{ y: "100vh", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                >
                    <ModalHeader>
                        <ModalTitle>Pilih Pelanggan</ModalTitle>
                        <CloseButton onClick={onClose}><FiX size={24} /></CloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <SearchInput 
                            placeholder="Cari nama atau no. telepon..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <CustomerList>
                            {customers.length > 0 ? customers.map(customer => (
                                <CustomerItem key={customer.id} onClick={() => onSelectCustomer(customer)}>
                                    {customer.name} {customer.phone ? `(${customer.phone})` : ''}
                                </CustomerItem>
                            )) : <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Pelanggan tidak ditemukan.</p>}
                        </CustomerList>
                    </ModalBody>
                    <AddCustomerForm onSubmit={handleAddCustomer}>
                        <SearchInput 
                            placeholder="atau tambah pelanggan baru..."
                            value={newCustomerName}
                            onChange={(e) => setNewCustomerName(e.target.value)}
                        />
                        <AddButton type="submit"><FiUserPlus/></AddButton>
                    </AddCustomerForm>
                </ModalContainer>
            </ModalBackdrop>
        </AnimatePresence>
    );
}

export default CustomerSelectModal;