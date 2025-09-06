import React, { useState } from 'react';
import styled from 'styled-components';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../services/api';
import SupplierFormModal from '../components/SupplierFormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiTruck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { useDataFetching } from '../hooks/useDataFetching';

// --- Styled Components ---
const PageContainer = styled.div`
    padding: 30px;
    height: 100%;
    display: flex;
    flex-direction: column;
`;
const PageHeader = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-shrink: 0;
`;
const Title = styled.h1`
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    gap: 12px;
`;
const AddButton = styled.button`
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    &:hover { background-color: var(--primary-hover); }
`;
const TableContainer = styled.div`
    background-color: var(--bg-surface);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    overflow: hidden;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
`;
const TableWrapper = styled.div`
    flex-grow: 1;
    overflow-y: auto;
`;
const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;
const Th = styled.th`
    text-align: left;
    padding: 15px 20px;
    background-color: var(--bg-main);
    border-bottom: 1px solid var(--border-color);
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.9rem;
    text-transform: uppercase;
`;
const Td = styled.td`
    padding: 15px 20px;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-primary);
    vertical-align: middle;
`;
const Tr = styled(motion.tr)`
    &:last-child > td {
        border-bottom: none;
    }
`;
const ActionButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    margin-right: 15px;
    &:hover { color: ${props => props.$danger ? 'var(--red-color)' : 'var(--primary-color)'}; }
`;
const EmptyStateContainer = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: var(--text-secondary);
`;
const EmptyStateTitle = styled.h3`
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 20px;
    margin-bottom: 10px;
`;

const tableRowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }),
};

function SupplierPage() {
    const { data: suppliers, loading, refetch: fetchSuppliers } = useDataFetching(getSuppliers, "Gagal memuat data pemasok.");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState(null);

    const handleOpenModal = (supplier = null) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSupplier(null);
    };

    const handleSaveSupplier = async (supplierData) => {
        setIsSubmitting(true);
        const promise = editingSupplier
            ? updateSupplier(editingSupplier.id, supplierData)
            : createSupplier(supplierData);
        try {
            await toast.promise(promise, {
                pending: 'Menyimpan data...',
                success: 'Data berhasil disimpan!',
                error: (err) => err.response?.data?.message || 'Gagal menyimpan data.'
            });
            fetchSuppliers();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
            handleCloseModal();
        }
    };
    
    const openDeleteConfirmation = (supplier) => {
        setSupplierToDelete(supplier);
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!supplierToDelete) return;
        try {
            await toast.promise(deleteSupplier(supplierToDelete.id), {
                pending: 'Menghapus data...',
                success: 'Pemasok berhasil diarsipkan!',
                error: (err) => err.response?.data?.message || 'Gagal menghapus data.'
            });
            fetchSuppliers();
        } catch (err) {
            console.error("Delete supplier error:", err);
        } finally {
            setIsConfirmOpen(false);
            setSupplierToDelete(null);
        }
    };

    const renderTableContent = () => {
        if (!loading && suppliers.length === 0) {
            return (
                <EmptyStateContainer>
                    <FiTruck size={48} />
                    <EmptyStateTitle>Belum Ada Pemasok</EmptyStateTitle>
                    <p>Klik tombol di pojok kanan atas untuk menambahkan pemasok pertama Anda.</p>
                </EmptyStateContainer>
            );
        }
        return (
            <TableWrapper>
                <Table>
                    <thead>
                        <tr>
                            <Th>Nama Pemasok</Th>
                            <Th>Narahubung</Th>
                            <Th>Telepon</Th>
                            <Th>Email</Th>
                            <Th>Aksi</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map((supplier, i) => (
                            <Tr key={supplier.id} custom={i} initial="hidden" animate="visible" variants={tableRowVariants}>
                                <Td>{supplier.name}</Td>
                                <Td>{supplier.contact_person || '-'}</Td>
                                <Td>{supplier.phone || '-'}</Td>
                                <Td>{supplier.email || '-'}</Td>
                                <Td>
                                    <ActionButton onClick={() => handleOpenModal(supplier)}><FiEdit size={18} /></ActionButton>
                                    <ActionButton $danger onClick={() => openDeleteConfirmation(supplier)}><FiTrash2 size={18} /></ActionButton>
                                </Td>
                            </Tr>
                        ))}
                    </tbody>
                </Table>
            </TableWrapper>
        );
    };

    return (
        <>
            <PageWrapper loading={loading}>
                <PageContainer>
                    <PageHeader>
                        <Title><FiTruck /> Manajemen Pemasok</Title>
                        <AddButton onClick={() => handleOpenModal()}>
                            <FiPlus /> Tambah Pemasok
                        </AddButton>
                    </PageHeader>
                    <TableContainer>
                        {renderTableContent()}
                    </TableContainer>
                </PageContainer>
            </PageWrapper>

            <SupplierFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveSupplier}
                supplier={editingSupplier}
                isSubmitting={isSubmitting}
            />
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Konfirmasi Pengarsipan"
                message={`Apakah Anda yakin ingin mengarsipkan pemasok "${supplierToDelete?.name}"? Aksi ini tidak dapat dibatalkan.`}
            />
        </>
    );
}

export default SupplierPage;