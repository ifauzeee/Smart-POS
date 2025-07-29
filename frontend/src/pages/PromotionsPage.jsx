// frontend/src/pages/PromotionsPage.jsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getPromotions, deletePromotion } from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiTag, FiEdit } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';

const PageContainer = styled.div` padding: 30px; height: 100%; display: flex; flex-direction: column; `;
const PageHeader = styled.header` display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-shrink: 0; `;
const Title = styled.h1` font-size: 1.8rem; `;
const AddButton = styled.button` background-color: var(--primary-color); color: white; border: none; border-radius: 8px; padding: 12px 20px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; &:hover { background-color: var(--primary-hover); } `;
const TableContainer = styled.div` background-color: var(--bg-surface); border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; flex-grow: 1; display: flex; flex-direction: column; `;
const TableWrapper = styled.div` overflow-x: auto; flex-grow: 1; `;
const Table = styled.table` width: 100%; border-collapse: collapse; `;
const Th = styled.th` text-align: left; padding: 15px 20px; background-color: var(--bg-main); border-bottom: 1px solid var(--border-color); font-weight: 600; color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase; white-space: nowrap;`;
const Td = styled.td` padding: 15px 20px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); vertical-align: middle; `;
const Tr = styled.tr` &:last-child > td { border-bottom: none; } `;
const ActionButton = styled.button` background: none; border: none; cursor: pointer; color: var(--text-secondary); margin-right: 15px; &:hover { color: ${props => props.$danger ? 'var(--red-color)' : 'var(--primary-color)'}; } `;
const EmptyStateContainer = styled.div` flex-grow: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: var(--text-secondary); `;

function PromotionsPage() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const res = await getPromotions();
            setPromotions(res.data);
        } catch (error) {
            toast.error("Gagal memuat data promosi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus promosi ini?')) {
            await toast.promise(deletePromotion(id), {
                pending: 'Menghapus...',
                success: 'Promosi berhasil dihapus!',
                error: 'Gagal menghapus promosi.'
            });
            fetchPromotions();
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <Title>Manajemen Promosi</Title>
                <AddButton onClick={() => navigate('/promotions/new')}>
                    <FiPlus /> Tambah Promosi
                </AddButton>
            </PageHeader>
            
            <TableContainer>
                {loading ? (
                    <div style={{ padding: '20px' }}><Skeleton count={5} height={50} /></div>
                ) : promotions.length > 0 ? (
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
                                {promotions.map(promo => (
                                    <Tr key={promo.id}>
                                        <Td>{promo.name}</Td>
                                        <Td>{promo.code || '-'}</Td>
                                        <Td>{promo.type === 'percentage' ? 'Persentase' : 'Potongan Tetap'}</Td>
                                        <Td>{promo.type === 'percentage' ? `${promo.value}%` : `Rp ${new Intl.NumberFormat('id-ID').format(promo.value)}`}</Td>
                                        <Td>{promo.is_active ? 'Aktif' : 'Tidak Aktif'}</Td>
                                        <Td>
                                            <ActionButton onClick={() => navigate(`/promotions/edit/${promo.id}`)}><FiEdit size={18} /></ActionButton>
                                            <ActionButton $danger onClick={() => handleDelete(promo.id)}><FiTrash2 size={18} /></ActionButton>
                                        </Td>
                                    </Tr>
                                ))}
                            </tbody>
                        </Table>
                    </TableWrapper>
                ) : (
                    <EmptyStateContainer>
                        <FiTag size={48} />
                        <h3>Belum Ada Promosi</h3>
                        <p>Klik tombol di atas untuk membuat promosi pertama Anda.</p>
                    </EmptyStateContainer>
                )}
            </TableContainer>
        </PageContainer>
    );
}

export default PromotionsPage;