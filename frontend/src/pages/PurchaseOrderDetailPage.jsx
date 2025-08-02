// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\PurchaseOrderDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { getPurchaseOrderById } from '../services/api';
import { toast } from 'react-toastify';
import Skeleton from 'react-loading-skeleton';
import { FiArrowLeft, FiPlusCircle } from 'react-icons/fi'; // <-- FiEdit sudah dihapus

const PageContainer = styled.div` padding: 30px; max-width: 900px; margin: 0 auto; `;
const PageHeader = styled.header` display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; `;
const Title = styled.h1` font-size: 1.8rem; `;
const HeaderActions = styled.div` display: flex; gap: 15px; `;
const BackButton = styled.button`
    background-color: var(--bg-surface); color: var(--text-primary); border: 1px solid var(--border-color);
    border-radius: 8px; padding: 10px 18px; font-weight: 600; display: flex; align-items: center;
    gap: 8px; cursor: pointer; &:hover { background-color: var(--bg-main); }
`;
const ReceiveButton = styled.button`
    background-color: var(--primary-color); color: white; border: none;
    border-radius: 8px; padding: 10px 20px; font-weight: 600; display: flex;
    align-items: center; gap: 8px; cursor: pointer;
    &:hover { background-color: var(--primary-hover); }
`;
const DetailsGrid = styled.div`
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
    background-color: var(--bg-surface); border: 1px solid var(--border-color);
    padding: 25px; border-radius: 16px; margin-bottom: 30px;
`;
const DetailItem = styled.div``;
const DetailLabel = styled.p` font-weight: 500; color: var(--text-secondary); margin: 0 0 5px 0; `;
const DetailValue = styled.p` font-weight: 600; color: var(--text-primary); margin: 0; `;
const StatusBadge = styled.span`
    padding: 5px 12px; border-radius: 20px; font-weight: 600; font-size: 0.9rem;
    color: ${props => `var(--${props.$statusColor}-text)`};
    background-color: ${props => `var(--${props.$statusColor}-bg)`};
`;
const TableContainer = styled.div` background-color: var(--bg-surface); border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; `;
const Table = styled.table` width: 100%; border-collapse: collapse; `;
const Th = styled.th` text-align: left; padding: 15px 20px; background-color: var(--bg-main); border-bottom: 1px solid var(--border-color); font-weight: 600; color: var(--text-secondary); `;
const Td = styled.td` padding: 15px 20px; border-bottom: 1px solid var(--border-color); `;
const Tr = styled.tr` &:last-child > td { border-bottom: none; } `;

const getStatusInfo = (status) => {
    switch (status) {
        case 'PENDING': return { text: 'Tertunda', color: 'orange' };
        case 'COMPLETED': return { text: 'Selesai', color: 'green' };
        case 'CANCELLED': return { text: 'Dibatalkan', color: 'red' };
        default: return { text: status, color: 'grey' };
    }
};

function PurchaseOrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [poDetails, setPoDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const res = await getPurchaseOrderById(id);
                setPoDetails(res.data);
            } catch (error) {
                toast.error("Gagal memuat detail pesanan pembelian.");
                navigate('/purchase-orders');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, navigate]);

    const handleReceiveStock = () => {
        navigate('/receive-stock', { state: { poItems: poDetails.items, poId: id, poNumber: poDetails.po_number } });
    };

    if (loading) {
        return <PageContainer><Skeleton height={400} /></PageContainer>;
    }

    if (!poDetails) {
        return <PageContainer><p>Detail tidak ditemukan.</p></PageContainer>;
    }

    const statusInfo = getStatusInfo(poDetails.status);

    return (
        <PageContainer>
            <PageHeader>
                <Title>Detail Pesanan #{poDetails.po_number}</Title>
                <HeaderActions>
                    <BackButton onClick={() => navigate('/purchase-orders')}><FiArrowLeft /> Kembali</BackButton>
                    {poDetails.status === 'PENDING' && (
                        <ReceiveButton onClick={handleReceiveStock}>
                            <FiPlusCircle /> Terima Stok
                        </ReceiveButton>
                    )}
                </HeaderActions>
            </PageHeader>

            <DetailsGrid>
                <DetailItem>
                    <DetailLabel>Nomor PO</DetailLabel>
                    <DetailValue>{poDetails.po_number}</DetailValue>
                </DetailItem>
                <DetailItem>
                    <DetailLabel>Pemasok</DetailLabel>
                    <DetailValue>{poDetails.supplier_name}</DetailValue>
                </DetailItem>
                <DetailItem>
                    <DetailLabel>Status</DetailLabel>
                    <DetailValue>
                        <StatusBadge $statusColor={statusInfo.color}>{statusInfo.text}</StatusBadge>
                    </DetailValue>
                </DetailItem>
                <DetailItem>
                    <DetailLabel>Tanggal Pesan</DetailLabel>
                    <DetailValue>{new Date(poDetails.order_date).toLocaleDateString('id-ID')}</DetailValue>
                </DetailItem>
                 <DetailItem>
                    <DetailLabel>Total Pesanan</DetailLabel>
                    <DetailValue>Rp {new Intl.NumberFormat('id-ID').format(poDetails.total_amount)}</DetailValue>
                </DetailItem>
            </DetailsGrid>

            <TableContainer>
                <Table>
                    <thead>
                        <tr>
                            <Th>Produk</Th>
                            <Th>Jumlah</Th>
                            <Th>Harga Satuan</Th>
                            <Th>Subtotal</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {poDetails.items.map(item => (
                            <Tr key={item.id}>
                                <Td>{item.product_name}</Td>
                                <Td>{item.quantity}</Td>
                                <Td>Rp {new Intl.NumberFormat('id-ID').format(item.price)}</Td>
                                <Td>Rp {new Intl.NumberFormat('id-ID').format(item.quantity * item.price)}</Td>
                            </Tr>
                        ))}
                    </tbody>
                </Table>
            </TableContainer>
        </PageContainer>
    );
}

export default PurchaseOrderDetailPage;