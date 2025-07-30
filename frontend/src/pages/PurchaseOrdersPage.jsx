import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom'; // Added Link import
import { getPurchaseOrders, updatePurchaseOrderStatus } from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEye, FiCheckSquare, FiSend, FiXCircle, FiClipboard } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';

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
    &:hover {
        background-color: var(--primary-hover);
    }
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
const Tr = styled.tr`
    &:last-child > td {
        border-bottom: none;
    }
`;
const ActionButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    align-items: center;
`;
const ActionButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px;
    border-radius: 5px;
    &:hover {
        color: ${props => props.color || 'var(--primary-color)'};
        background-color: var(--bg-main);
    }
`;
const StatusBadge = styled.span`
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
    background-color: ${props => {
        switch (props.status) {
            case 'DRAFT': return '#6c757d'; // Gray
            case 'SUBMITTED': return '#0d6efd'; // Blue
            case 'COMPLETED': return 'var(--green-color)'; // Green
            case 'CANCELLED': return 'var(--red-color)'; // Red
            default: return '#6c757d';
        }
    }};
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

const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value || 0);
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

function PurchaseOrdersPage() {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchPurchaseOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getPurchaseOrders();
            setPurchaseOrders(res.data);
        } catch (error) {
            toast.error("Gagal memuat data Purchase Order.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPurchaseOrders();
    }, [fetchPurchaseOrders]);

    const handleStatusUpdate = async (id, newStatus, confirmationMessage) => {
        // IMPORTANT: In a real application, replace window.confirm with a custom modal UI.
        // window.confirm is blocking and not user-friendly in an iframe environment.
        if (window.confirm(confirmationMessage)) {
            try {
                await toast.promise(
                    updatePurchaseOrderStatus(id, newStatus),
                    {
                        pending: 'Memperbarui status...',
                        success: 'Status berhasil diperbarui!',
                        error: 'Gagal memperbarui status.'
                    }
                );
                fetchPurchaseOrders(); // Refresh data
            } catch (error) {
                console.error("Failed to update status:", error);
            }
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <Title>Purchase Orders</Title>
                <AddButton onClick={() => navigate('/purchase-orders/new')}>
                    <FiPlus /> Buat PO Baru
                </AddButton>
            </PageHeader>
            <TableContainer>
                {loading ? (
                    <div style={{ padding: '20px' }}><Skeleton count={8} height={50} /></div>
                ) : purchaseOrders.length > 0 ? (
                    <TableWrapper>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Nomor PO</Th>
                                    <Th>Pemasok</Th>
                                    <Th>Tanggal</Th>
                                    <Th>Total</Th>
                                    <Th>Status</Th>
                                    <Th>Aksi</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchaseOrders.map(po => (
                                    <Tr key={po.id}>
                                        <Td>
                                            {/* Changed to Link for navigation */}
                                            <Link to={`/purchase-orders/${po.id}`} style={{color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none'}}>
                                                {po.po_number}
                                            </Link>
                                        </Td>
                                        <Td>{po.supplier_name}</Td>
                                        <Td>{formatDate(po.created_at)}</Td>
                                        <Td>{formatCurrency(po.total_amount)}</Td>
                                        <Td><StatusBadge status={po.status}>{po.status}</StatusBadge></Td>
                                        <Td>
                                            <ActionButtonGroup>
                                                {po.status === 'DRAFT' && (
                                                    <ActionButton color="#0d6efd" onClick={() => handleStatusUpdate(po.id, 'SUBMITTED', 'Kirim PO ini ke pemasok?')}>
                                                        <FiSend size={16} /> Submit
                                                    </ActionButton>
                                                )}
                                                {po.status === 'SUBMITTED' && (
                                                    <ActionButton color="var(--green-color)" onClick={() => handleStatusUpdate(po.id, 'COMPLETED', 'Tandai PO ini sebagai selesai (barang diterima)?')}>
                                                        <FiCheckSquare size={16} /> Tandai Selesai
                                                    </ActionButton>
                                                )}
                                                {(po.status === 'DRAFT' || po.status === 'SUBMITTED') && (
                                                    <ActionButton color="var(--red-color)" onClick={() => handleStatusUpdate(po.id, 'CANCELLED', 'Yakin ingin membatalkan PO ini?')}>
                                                        <FiXCircle size={16} /> Batalkan
                                                    </ActionButton>
                                                )}
                                                {/* Removed FiEye button as PO number is now clickable */}
                                            </ActionButtonGroup>
                                        </Td>
                                    </Tr>
                                ))}
                            </tbody>
                        </Table>
                    </TableWrapper>
                ) : (
                    <EmptyStateContainer>
                        <FiClipboard size={48} />
                        <h3 style={{ marginTop: '20px' }}>Belum Ada Purchase Order</h3>
                        <p>Klik tombol di atas untuk membuat PO pertama Anda.</p>
                    </EmptyStateContainer>
                )}
            </TableContainer>
        </PageContainer>
    );
}

export default PurchaseOrdersPage;
