// frontend/src/pages/PromotionsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getPromotions, deletePromotion } from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiTag, FiEdit } from 'react-icons/fi';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import ConfirmationModal from '../components/ConfirmationModal';

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
    white-space: nowrap;
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
    background-color: var(--bg-surface);
    border-radius: 16px;
    border: 1px dashed var(--border-color);
    margin: 30px;
`;

const EmptyStateTitle = styled.h3`
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 20px;
    margin-bottom: 10px;
`;

// Animation variants for table rows
const tableRowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05 },
    }),
};

// --- Component Logic ---
function PromotionsPage() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [promotionToDelete, setPromotionToDelete] = useState(null);

    const fetchPromotions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getPromotions();
            setPromotions(res.data);
        } catch (error) {
            toast.error("Gagal memuat data promosi.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);

    const openDeleteConfirmation = (promotion) => {
        setPromotionToDelete(promotion);
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!promotionToDelete) return;

        try {
            await toast.promise(deletePromotion(promotionToDelete.id), {
                pending: 'Menghapus promosi...',
                success: 'Promosi berhasil dihapus!',
                error: (err) => err.response?.data?.message || 'Gagal menghapus promosi.'
            });
            fetchPromotions();
        } catch (error) {
            console.error("Delete promotion error:", error);
        } finally {
            setIsConfirmOpen(false);
            setPromotionToDelete(null);
        }
    };

    const renderTableContent = () => {
        if (promotions.length > 0) {
            return (
                <TableContainer>
                    <TableWrapper>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Nama Promo</Th>
                                    <Th>Kode</Th>
                                    <Th>Tipe</Th>
                                    <Th>Nilai</Th>
                                    <Th>Status</Th>
                                    <Th>Aksi</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {promotions.map((promo, i) => (
                                    <Tr key={promo.id} custom={i} initial="hidden" animate="visible" variants={tableRowVariants}>
                                        <Td>{promo.name}</Td>
                                        <Td>{promo.code || '-'}</Td>
                                        <Td>{promo.type === 'percentage' ? 'Persentase' : 'Potongan Tetap'}</Td>
                                        <Td>
                                            {promo.type === 'percentage'
                                                ? `${promo.value}%`
                                                : `Rp ${new Intl.NumberFormat('id-ID').format(promo.value)}`
                                            }
                                        </Td>
                                        <Td>{promo.is_active ? 'Aktif' : 'Tidak Aktif'}</Td>
                                        <Td>
                                            <ActionButton onClick={() => navigate(`/promotions/edit/${promo.id}`)}><FiEdit size={18} /></ActionButton>
                                            <ActionButton $danger onClick={() => openDeleteConfirmation(promo)}><FiTrash2 size={18} /></ActionButton>
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
                <FiTag size={48} />
                <EmptyStateTitle>Belum Ada Promosi</EmptyStateTitle>
                <p>Klik tombol di atas untuk membuat promosi pertama Anda.</p>
            </EmptyStateContainer>
        );
    };

    return (
        <>
            <PageWrapper loading={loading}>
                <PageContainer>
                    <PageHeader>
                        <Title><FiTag /> Manajemen Promosi</Title>
                        <AddButton onClick={() => navigate('/promotions/new')}>
                            <FiPlus /> Tambah Promosi
                        </AddButton>
                    </PageHeader>
                    {renderTableContent()}
                </PageContainer>
            </PageWrapper>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Konfirmasi Penghapusan"
                message={`Apakah Anda yakin ingin menghapus promosi "${promotionToDelete?.name}"? Aksi ini tidak dapat dibatalkan.`}
            />
        </>
    );
}

export default PromotionsPage;