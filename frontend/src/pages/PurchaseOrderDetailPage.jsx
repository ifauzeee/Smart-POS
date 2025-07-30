import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPurchaseOrderById } from '../services/api';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiClipboard, FiTruck } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';

const PageContainer = styled.div` padding: 30px; max-width: 900px; margin: 0 auto; `;
const PageHeader = styled.header` margin-bottom: 20px; `;
const Title = styled.h1` font-size: 1.8rem; display: flex; align-items: center; gap: 12px; `;
const BackLink = styled(Link)` display: inline-flex; align-items: center; gap: 8px; color: var(--text-secondary); text-decoration: none; margin-bottom: 20px; font-weight: 500; &:hover { color: var(--text-primary); } `;
const Grid = styled.div` display: grid; grid-template-columns: 1fr 2fr; gap: 30px; @media (max-width: 768px) { grid-template-columns: 1fr; }`;
const InfoCard = styled.div` background-color: var(--bg-surface); border-radius: 16px; border: 1px solid var(--border-color); padding: 25px; `;
const CardTitle = styled.h3` font-size: 1.2rem; font-weight: 600; padding-bottom: 15px; margin: 0 0 20px 0; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 10px; `;
const InfoText = styled.p` color: var(--text-secondary); margin: 0 0 10px 0; strong { color: var(--text-primary); display: block; margin-bottom: 2px; }`;
const Table = styled.table` width: 100%; border-collapse: collapse; `;
const Th = styled.th` text-align: left; padding: 12px; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); `;
const Td = styled.td` padding: 12px; border-bottom: 1px solid var(--border-color); `;
const ReceiveButton = styled.button` background-color: var(--green-color); color: white; border: none; border-radius: 8px; padding: 12px 25px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; margin-top: 20px; &:hover { opacity: 0.9; } `;

const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value || 0);

function PurchaseOrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [poDetails, setPoDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDetails = useCallback(async () => {
        try {
            const res = await getPurchaseOrderById(id);
            setPoDetails(res.data);
        } catch (error) {
            toast.error("Gagal memuat detail Purchase Order.");
            navigate('/purchase-orders');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleReceiveStock = () => {
        // We pass the items as state through the navigation
        navigate('/receive-stock', { state: { poItems: poDetails.items } });
    };

    if (loading) {
        return <PageContainer><Skeleton height={400} /></PageContainer>;
    }

    if (!poDetails) {
        return <PageContainer>Data tidak ditemukan.</PageContainer>;
    }

    return (
        <PageContainer>
            <PageHeader>
                <BackLink to="/purchase-orders"><FiArrowLeft /> Kembali ke Daftar PO</BackLink>
                <Title><FiClipboard /> Detail Purchase Order #{poDetails.po_number}</Title>
            </PageHeader>
            <Grid>
                <InfoCard>
                    <CardTitle><FiTruck /> Info Pemasok & PO</CardTitle>
                    <InfoText><strong>Pemasok:</strong> {poDetails.supplier_name}</InfoText>
                    <InfoText><strong>Status:</strong> {poDetails.status}</InfoText>
                    <InfoText><strong>Tanggal Dibuat:</strong> {new Date(poDetails.created_at).toLocaleDateString('id-ID')}</InfoText>
                    <InfoText><strong>Catatan:</strong> {poDetails.notes || '-'}</InfoText>
                    {poDetails.status === 'SUBMITTED' && (
                        <ReceiveButton onClick={handleReceiveStock}>Terima Barang</ReceiveButton>
                    )}
                </InfoCard>
                <InfoCard>
                    <CardTitle>Item Dipesan</CardTitle>
                    <Table>
                        <thead><tr><Th>Produk</Th><Th>Jumlah</Th><Th>Harga Beli</Th><Th>Subtotal</Th></tr></thead>
                        <tbody>
                            {poDetails.items.map(item => (
                                <tr key={item.id}>
                                    <Td>{item.product_name}</Td>
                                    <Td>{item.quantity}</Td>
                                    <Td>{formatCurrency(item.cost_price)}</Td>
                                    <Td>{formatCurrency(item.quantity * item.cost_price)}</Td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </InfoCard>
            </Grid>
        </PageContainer>
    );
}

export default PurchaseOrderDetailPage;