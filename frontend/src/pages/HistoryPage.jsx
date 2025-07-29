// frontend/src/pages/HistoryPage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { getOrders, getOrderById, deleteOrder, exportOrders, clearOrderHistory } from '../services/api';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import { FiEye, FiTrash2, FiDownload, FiAlertTriangle } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import OrderDetailModal from '../components/OrderDetailModal';
import Receipt from '../components/Receipt';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const PageContainer = styled.div` padding: 30px; height: 100%; display: flex; flex-direction: column; `;
const PageHeader = styled.header` display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-shrink: 0; `;
const Title = styled.h1` font-size: 1.8rem; `;
const FilterContainer = styled.div` display: flex; gap: 15px; align-items: center; margin-bottom: 25px; flex-wrap: wrap; `;
const ExportButton = styled.button` background-color: var(--green-color); color: white; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; margin-left: auto; &:hover { opacity: 0.9; } &:disabled { opacity: 0.5; cursor: not-allowed; } `;
const TableContainer = styled.div` background-color: var(--bg-surface); border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; flex-grow: 1; display: flex; flex-direction: column; `;
const TableWrapper = styled.div` overflow-x: auto; flex-grow: 1; `;
const Table = styled.table` width: 100%; min-width: 800px; border-collapse: collapse; white-space: nowrap; `;
const Th = styled.th` text-align: left; padding: 15px 20px; background-color: var(--bg-main); border-bottom: 1px solid var(--border-color); font-weight: 600; color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase; `;
const Td = styled.td` padding: 15px 20px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); vertical-align: middle; `;
const Tr = styled.tr` &:last-child { ${Td} { border-bottom: none; } } `;
const ActionButton = styled.button` background: none; border: none; cursor: pointer; color: var(--text-secondary); margin: 0 5px; &:hover { color: ${props => props.$danger ? 'var(--red-color)' : 'var(--primary-color)'}; } `;
const ClearHistoryButton = styled.button` background-color: var(--red-color); color: white; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; margin-left: 15px; &:hover { opacity: 0.9; } &:disabled { opacity: 0.5; cursor: not-allowed; } `;
const DatePickerWrapper = styled.div`
    .react-datepicker-wrapper input {
        padding: 10px 15px;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        background-color: var(--bg-main);
        color: var(--text-primary);
        font-weight: 500;
        width: 130px;
        cursor: pointer;
        text-align: center;
    }
`;

function HistoryPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderToPrint, setOrderToPrint] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
    const [endDate, setEndDate] = useState(new Date());
    
    const receiptRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => receiptRef.current,
        documentTitle: `Struk-Pesanan-${orderToPrint?.id || ''}`,
        onAfterPrint: () => setOrderToPrint(null),
    });

    const handlePrintFromModal = async (orderId) => {
        try {
            const res = await getOrderById(orderId);
            setOrderToPrint(res.data);
        } catch (error) {
            console.error("Error preparing for print:", error);
            toast.error("Gagal menyiapkan data untuk dicetak.");
        }
    };
    
    useEffect(() => {
        if (orderToPrint) {
            const timer = setTimeout(() => {
                if (receiptRef.current) {
                    handlePrint();
                } else {
                    toast.error("Gagal mencetak: Komponen struk tidak siap.");
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [orderToPrint, handlePrint]);
    
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getOrders(startDate, endDate);
            setOrders(res.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
            } else {
                toast.error("Gagal memuat riwayat transaksi.");
            }
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
    
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
        if (window.confirm(`Yakin ingin menghapus pesanan #${orderId}? Stok akan dikembalikan.`)) {
            await toast.promise(deleteOrder(orderId), {
                pending: 'Menghapus pesanan...',
                success: 'Pesanan berhasil dihapus!',
                error: 'Gagal menghapus pesanan.'
            });
            fetchOrders();
        }
    };

    const handleExport = async () => {
        toast.info("Mempersiapkan data untuk diunduh...");
        try {
            const response = await exportOrders(startDate, endDate);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const fileName = `laporan-transaksi-${new Date().toISOString().slice(0, 10)}.csv`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Ekspor berhasil!");
        } catch (error) {
            console.error("Export error:", error);
            toast.error(error.response?.data?.message || "Gagal mengekspor data.");
        }
    };

    const handleClearHistory = async () => {
        if (window.confirm('PERINGATAN: Anda akan menghapus SELURUH riwayat transaksi. Aksi ini tidak dapat dibatalkan. Lanjutkan?')) {
            try {
                await toast.promise(clearOrderHistory(), {
                    pending: 'Menghapus seluruh riwayat...',
                    success: 'Seluruh riwayat berhasil dihapus!',
                    error: 'Gagal menghapus riwayat.'
                });
                fetchOrders();
            } catch (error) {
                console.error("Clear history error:", error);
            }
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <Title>Riwayat Transaksi</Title>
            </PageHeader>
            
            <FilterContainer>
                <span style={{fontWeight: 500}}>Filter Tanggal:</span>
                <DatePickerWrapper>
                    <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} dateFormat="dd/MM/yyyy" maxDate={endDate} />
                </DatePickerWrapper>
                <span>sampai</span>
                <DatePickerWrapper>
                    <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} dateFormat="dd/MM/yyyy" minDate={startDate} />
                </DatePickerWrapper>
                <ExportButton onClick={handleExport}><FiDownload size={16}/> Ekspor CSV</ExportButton>
                <ClearHistoryButton onClick={handleClearHistory}><FiAlertTriangle size={16}/> Hapus Riwayat</ClearHistoryButton>
            </FilterContainer>

            <TableContainer>
                <TableWrapper>
                    <Table>
                        <thead>
                            <tr>
                                <Th style={{width: '10%'}}>ID Pesanan</Th>
                                <Th style={{width: '25%'}}>Tanggal</Th>
                                <Th style={{width: '15%'}}>Kasir</Th>
                                <Th style={{width: '15%'}}>Pelanggan</Th>
                                <Th style={{width: '10%', textAlign: 'center'}}>Metode</Th>
                                <Th style={{width: '15%', textAlign: 'right'}}>Total</Th>
                                <Th style={{width: '10%', textAlign: 'center'}}>Aksi</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 10 }).map((_, index) => (
                                    <Tr key={index}>
                                        {[...Array(7)].map((_, i) => <Td key={i}><Skeleton /></Td>)}
                                    </Tr>
                                ))
                            ) : orders.length > 0 ? (
                                orders.map(order => (
                                    <Tr key={order.id}>
                                        <Td>#{order.id}</Td>
                                        <Td>{new Date(order.created_at).toLocaleString('id-ID')}</Td>
                                        <Td>{order.cashier_name}</Td>
                                        <Td>{order.customer_name || '-'}</Td>
                                        <Td style={{textAlign: 'center'}}>{order.payment_method}</Td>
                                        <Td style={{textAlign: 'right', fontWeight: 600}}>Rp {new Intl.NumberFormat('id-ID').format(order.total_amount)}</Td>
                                        <Td style={{textAlign: 'center'}}>
                                            <ActionButton onClick={() => handleViewDetail(order.id)}>
                                                <FiEye size={18} />
                                            </ActionButton>
                                            <ActionButton $danger onClick={() => handleDeleteOrder(order.id)}>
                                                <FiTrash2 size={18} />
                                            </ActionButton>
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <Tr>
                                    <Td colSpan="7" style={{textAlign: 'center', padding: '50px 0'}}>
                                        Tidak ada riwayat transaksi pada rentang tanggal ini.
                                    </Td>
                                </Tr>
                            )}
                        </tbody>
                    </Table>
                </TableWrapper>
            </TableContainer>

            {isModalOpen && selectedOrder && (
                <OrderDetailModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    order={selectedOrder}
                    onPrint={handlePrintFromModal}
                />
            )}

            <div style={{ display: 'none' }}>
                <Receipt ref={receiptRef} order={orderToPrint} />
            </div>
        </PageContainer>
    );
}

export default HistoryPage;