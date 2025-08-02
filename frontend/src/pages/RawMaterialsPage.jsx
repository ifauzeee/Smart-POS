// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\RawMaterialsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getRawMaterials, createRawMaterial, updateRawMaterial, deleteRawMaterial } from '../services/api';
import RawMaterialFormModal from '../components/RawMaterialFormModal';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiBox } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';

// --- Styled Components ---
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
    overflow-x: auto;
    flex-grow: 1;
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
    &:last-child > td { border-bottom: none; }
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

// --- Animation Variants & Helper Functions ---
const tableRowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05 },
    }),
};

const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value || 0);

// --- Component Logic ---
function RawMaterialsPage() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getRawMaterials();
            setMaterials(res.data);
        } catch (error) {
            toast.error("Gagal memuat data bahan baku.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const handleOpenModal = (material = null) => {
        setEditingMaterial(material);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMaterial(null);
    };

    const handleSaveMaterial = async (materialData) => {
        setIsSubmitting(true);
        const promise = editingMaterial
            ? updateRawMaterial(editingMaterial.id, materialData)
            : createRawMaterial(materialData);
        try {
            await toast.promise(promise, {
                pending: 'Menyimpan data...',
                success: 'Bahan baku berhasil disimpan!',
                error: (err) => err.response?.data?.message || 'Gagal menyimpan data.'
            });
            fetchMaterials();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
            handleCloseModal();
        }
    };

    const handleDeleteMaterial = async (id) => {
        if (window.confirm('Yakin ingin menghapus bahan baku ini?')) {
            try {
                await toast.promise(deleteRawMaterial(id), {
                    pending: 'Menghapus data...',
                    success: 'Bahan baku berhasil dihapus!',
                    error: (err) => err.response?.data?.message || 'Gagal menghapus bahan baku.'
                });
                fetchMaterials();
            } catch (error) {
                console.error(error);
            }
        }
    };
    
    const renderTableContent = () => {
        if (materials.length > 0) {
            return (
                <TableContainer>
                    <TableWrapper>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Nama Bahan</Th>
                                    <Th>Stok</Th>
                                    <Th>Satuan</Th>
                                    <Th>Harga Beli / Satuan</Th>
                                    <Th>Aksi</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.map((material, i) => (
                                    <Tr key={material.id} custom={i} initial="hidden" animate="visible" variants={tableRowVariants}>
                                        <Td>{material.name}</Td>
                                        <Td>{material.stock_quantity}</Td>
                                        <Td>{material.unit}</Td>
                                        <Td>{formatCurrency(material.cost_per_unit)}</Td>
                                        <Td>
                                            <ActionButton onClick={() => handleOpenModal(material)}><FiEdit size={18} /></ActionButton>
                                            <ActionButton $danger onClick={() => handleDeleteMaterial(material.id)}><FiTrash2 size={18} /></ActionButton>
                                        </Td>
                                    </Tr>
                                ))}
                            </tbody>
                        </Table>
                    </TableWrapper>
                </TableContainer>
            );
        }
        
        return (
            <EmptyStateContainer>
                <FiBox size={48} />
                <h3 style={{ marginTop: '20px' }}>Belum Ada Bahan Baku</h3>
                <p>Klik tombol di atas untuk menambahkan bahan baku pertama Anda.</p>
            </EmptyStateContainer>
        );
    };

    return (
        <>
            <PageWrapper loading={loading}>
                <PageHeader>
                    <Title>Manajemen Bahan Baku</Title>
                    <AddButton onClick={() => handleOpenModal()}>
                        <FiPlus /> Tambah Bahan Baku
                    </AddButton>
                </PageHeader>
                {renderTableContent()}
            </PageWrapper>
            
            <RawMaterialFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveMaterial}
                material={editingMaterial}
                isSubmitting={isSubmitting}
            />
        </>
    );
}

export default RawMaterialsPage;