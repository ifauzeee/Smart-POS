import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../services/api';
import SupplierFormModal from '../components/SupplierFormModal';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiTruck } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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
    overflow-x: auto; /* <-- UPDATED: Added horizontal scroll */
    flex-grow: 1; /* <-- UPDATED: Ensure it grows to fill space */
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
    vertical-align: middle; /* Added for better alignment */
`;

const Tr = styled.tr`
    &:last-child {
        ${Td} { border-bottom: none; }
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
    background-color: var(--bg-surface);
    border-radius: 16px;
    border: 1px dashed var(--border-color);
`;

const EmptyStateTitle = styled.h3`
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 20px;
    margin-bottom: 10px;
`;


function SupplierPage() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // Tambahkan state baru

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const res = await getSuppliers();
            setSuppliers(res.data);
        } catch (error) {
            toast.error("Gagal memuat data pemasok.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleOpenModal = (supplier = null) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSupplier(null);
    };

    const handleSaveSupplier = async (supplierData) => {
        setIsSubmitting(true); // Set true di awal
        const promise = editingSupplier
            ? updateSupplier(editingSupplier.id, supplierData)
            : createSupplier(supplierData);

        try {
            await toast.promise(promise, {
                pending: 'Menyimpan data...',
                success: 'Data berhasil disimpan!',
                error: 'Gagal menyimpan data.'
            });
            fetchSuppliers();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false); // Set false di akhir
            handleCloseModal();
        }
    };

    const handleDeleteSupplier = async (id) => {
        if (window.confirm('Yakin ingin menghapus pemasok ini?')) {
            await toast.promise(deleteSupplier(id), {
                pending: 'Menghapus data...',
                success: 'Pemasok berhasil dihapus!',
                error: 'Gagal menghapus data.'
            });
            fetchSuppliers();
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <Title>Manajemen Pemasok</Title>
                <AddButton onClick={() => handleOpenModal()}>
                    <FiPlus /> Tambah Pemasok
                </AddButton>
            </PageHeader>
            
            {loading ? (
                <TableContainer>
                    <Skeleton count={5} height={70} style={{borderRadius: '16px', margin: '15px 20px'}}/>
                </TableContainer>
            ) : suppliers.length > 0 ? (
                <TableContainer>
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
                                {suppliers.map(supplier => (
                                    <Tr key={supplier.id}>
                                        <Td>{supplier.name}</Td>
                                        <Td>{supplier.contact_person}</Td>
                                        <Td>{supplier.phone}</Td>
                                        <Td>{supplier.email}</Td>
                                        <Td>
                                            <ActionButton onClick={() => handleOpenModal(supplier)}><FiEdit size={18} /></ActionButton>
                                            <ActionButton $danger onClick={() => handleDeleteSupplier(supplier.id)}><FiTrash2 size={18} /></ActionButton>
                                        </Td>
                                    </Tr>
                                ))}
                            </tbody>
                        </Table>
                    </TableWrapper>
                </TableContainer>
            ) : (
                <EmptyStateContainer>
                    <FiTruck size={48} />
                    <EmptyStateTitle>Belum Ada Pemasok</EmptyStateTitle>
                    <p>Klik tombol di pojok kanan atas untuk menambahkan pemasok pertama Anda.</p>
                </EmptyStateContainer>
            )}

            <SupplierFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveSupplier}
                supplier={editingSupplier}
                isSubmitting={isSubmitting} // Kirim prop baru
            />
        </PageContainer>
    );
}

export default SupplierPage;