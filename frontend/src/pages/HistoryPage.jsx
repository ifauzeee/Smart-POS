import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getOrders, getOrderById, deleteOrder } from '../services/api';
import { toast } from 'react-toastify';
import { FiEye, FiTrash2 } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import OrderDetailModal from '../components/OrderDetailModal';

const PageContainer = styled.div`
  padding: 30px;
`;

const PageHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 1.8rem;
`;

const TableContainer = styled.div`
  background-color: var(--bg-surface);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  overflow: hidden;
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
`;

const Td = styled.td`
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
`;

const Tr = styled.tr`
  &:last-child {
    ${Td} {
      border-bottom: none;
    }
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  margin-right: 15px;
  &:hover { 
    color: ${props => props.$danger ? 'var(--red-color)' : 'var(--primary-color)'};
  }
`;

function HistoryPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await getOrders();
            setOrders(res.data);
        } catch (error) {
            toast.error("Gagal memuat riwayat transaksi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleViewDetail = async (orderId) => {
        try {
            const res = await getOrderById(orderId);
            setSelectedOrder(res.data);
            setIsModalOpen(true);
        } catch (error) {
            toast.error("Gagal memuat detail pesanan.");
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus pesanan #${orderId}? Aksi ini tidak bisa dibatalkan.`)) {
            const promise = deleteOrder(orderId);
            toast.promise(promise, {
                pending: 'Menghapus pesanan...',
                success: {
                    render(){
                        fetchOrders();
                        return 'Pesanan berhasil dihapus!';
                    }
                },
                error: 'Gagal menghapus pesanan.'
            });
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <Title>Riwayat Transaksi</Title>
            </PageHeader>
            <TableContainer>
                <Table>
                    <thead>
                        <tr>
                            <Th>ID Pesanan</Th>
                            <Th>Tanggal</Th>
                            <Th>Kasir</Th>
                            <Th>Total</Th>
                            <Th>Aksi</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <Tr key={index}>
                                    {[...Array(5)].map((_, i) => <Td key={i}><Skeleton /></Td>)}
                                </Tr>
                            ))
                        ) : (
                            orders.map(order => (
                                <Tr key={order.id}>
                                    <Td>#{order.id}</Td>
                                    <Td>{new Date(order.created_at).toLocaleString('id-ID')}</Td>
                                    <Td>{order.cashier_name}</Td>
                                    <Td>Rp {new Intl.NumberFormat('id-ID').format(order.total_amount)}</Td>
                                    <Td>
                                        <ActionButton onClick={() => handleViewDetail(order.id)}>
                                            <FiEye size={18} />
                                        </ActionButton>
                                        <ActionButton $danger onClick={() => handleDeleteOrder(order.id)}>
                                            <FiTrash2 size={18} />
                                        </ActionButton>
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </TableContainer>

            <OrderDetailModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                order={selectedOrder}
            />
        </PageContainer>
    );
}

export default HistoryPage;