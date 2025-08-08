// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\AdminRewardsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getRewards, createReward, updateReward, deleteReward } from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit, FiTrash2, FiGift, FiAward } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import ConfirmationModal from '../components/ConfirmationModal';
import RewardFormModal from '../components/RewardFormModal';

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
    transition: all 0.2s ease;
    &:hover { 
        background-color: var(--primary-hover);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
`;

const RewardGrid = styled(motion.div)`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 25px;
    flex-grow: 1;
    overflow-y: auto;
    padding: 5px;
`;

const RewardCard = styled(motion.div)`
    background-color: var(--bg-surface);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    transition: all 0.2s ease-in-out;
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        border-color: var(--primary-color);
    }
`;

const CardHeader = styled.div`
    padding: 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const CardTitle = styled.h3`
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 10px;
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 5px;
    border-radius: 50%;
    display: flex;
    &:hover { 
        color: ${props => props.$danger ? 'var(--red-color)' : 'var(--primary-color)'};
        background-color: var(--bg-main);
    }
`;

const CardBody = styled.div`
    padding: 20px;
    flex-grow: 1;
`;

const CardDescription = styled.p`
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0 0 20px 0;
`;

const PointsCost = styled.div`
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
    display: flex;
    align-items: center;
    gap: 8px;
`;

const CardFooter = styled.div`
    padding: 15px 20px;
    border-top: 1px solid var(--border-color);
    background-color: var(--bg-main);
    border-radius: 0 0 16px 16px;
`;

const StatusBadge = styled.span`
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    color: ${props => props.$active ? 'var(--green-text)' : 'var(--grey-text)'};
    background-color: ${props => props.$active ? 'var(--green-bg)' : 'var(--grey-bg)'};
`;

const EmptyStateContainer = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: var(--text-secondary);
    border: 2px dashed var(--border-color);
    border-radius: 16px;
    padding: 40px;
`;

const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.07 }
    }
};

const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

function AdminRewardsPage() {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReward, setEditingReward] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [rewardToDelete, setRewardToDelete] = useState(null);

    const fetchRewards = useCallback(async () => {
        try {
            const res = await getRewards();
            setRewards(res.data);
        } catch (error) {
            toast.error("Gagal memuat data hadiah.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRewards(); }, [fetchRewards]);

    const handleOpenModal = (reward = null) => {
        setEditingReward(reward);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingReward(null);
    };

    const handleSaveReward = async (rewardData) => {
        setIsSubmitting(true);
        const promise = editingReward
            ? updateReward(editingReward.id, rewardData)
            : createReward(rewardData);
        try {
            await toast.promise(promise, {
                pending: 'Menyimpan hadiah...',
                success: 'Hadiah berhasil disimpan!',
                error: 'Gagal menyimpan hadiah.'
            });
            fetchRewards();
            handleCloseModal();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDeleteConfirmation = (reward) => {
        setRewardToDelete(reward);
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!rewardToDelete) return;
        try {
            await toast.promise(deleteReward(rewardToDelete.id), {
                pending: 'Menghapus hadiah...',
                success: 'Hadiah berhasil dihapus!',
                error: 'Gagal menghapus hadiah.'
            });
            fetchRewards();
        } catch (error) {
            console.error(error);
        } finally {
            setIsConfirmOpen(false);
            setRewardToDelete(null);
        }
    };

    const renderContent = () => {
        if (loading) {
            return <p>Memuat...</p>;
        }
        if (rewards.length === 0) {
            return (
                <EmptyStateContainer>
                    <FiGift size={48} />
                    <h3 style={{ marginTop: '20px' }}>Belum Ada Hadiah</h3>
                    <p>Klik tombol di atas untuk membuat hadiah pertama yang bisa ditukarkan pelanggan.</p>
                </EmptyStateContainer>
            );
        }
        return (
            <RewardGrid variants={gridVariants} initial="hidden" animate="visible">
                {rewards.map(reward => (
                    <RewardCard key={reward.id} variants={cardVariants}>
                        <CardHeader>
                            <CardTitle><FiGift /> {reward.name}</CardTitle>
                            <ActionButtons>
                                <ActionButton onClick={() => handleOpenModal(reward)}><FiEdit size={18} /></ActionButton>
                                <ActionButton $danger onClick={() => openDeleteConfirmation(reward)}><FiTrash2 size={18} /></ActionButton>
                            </ActionButtons>
                        </CardHeader>
                        <CardBody>
                            <CardDescription>{reward.description || 'Tidak ada deskripsi.'}</CardDescription>
                            <PointsCost><FiAward /> {reward.points_cost.toLocaleString('id-ID')} Poin</PointsCost>
                        </CardBody>
                        <CardFooter>
                            <StatusBadge $active={reward.is_active}>{reward.is_active ? 'Aktif' : 'Tidak Aktif'}</StatusBadge>
                        </CardFooter>
                    </RewardCard>
                ))}
            </RewardGrid>
        );
    };

    return (
        <>
            <PageWrapper loading={loading}>
                <PageContainer>
                    <PageHeader>
                        <Title><FiGift /> Manajemen Hadiah</Title>
                        <AddButton onClick={() => handleOpenModal()}><FiPlus /> Tambah Hadiah</AddButton>
                    </PageHeader>
                    {renderContent()}
                </PageContainer>
            </PageWrapper>

            <RewardFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveReward}
                reward={editingReward}
                isSubmitting={isSubmitting}
            />
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Konfirmasi Hapus Hadiah"
                message={`Yakin ingin menghapus hadiah "${rewardToDelete?.name}"?`}
            />
        </>
    );
}

export default AdminRewardsPage;