// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\ShiftHistoryPage.jsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getShiftHistory, deleteShift, clearShiftHistory, exportShiftHistory } from '../services/api';
import { toast } from 'react-toastify';
import { FiClock, FiTrash2, FiAlertTriangle, FiDownload } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import { jwtDecode } from 'jwt-decode';
import ConfirmationModal from '../components/ConfirmationModal';

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
const HeaderActions = styled.div`
    display: flex;
    gap: 15px;
`;
const Title = styled.h1`
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    gap: 12px;
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
    min-width: 800px;
`;
const Th = styled.th`
    text-align: center; 
    padding: 15px 20px;
    background-color: var(--bg-main);
    border-bottom: 1px solid var(--border-color);
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.9rem;
    white-space: nowrap; 
    text-transform: uppercase;
`;
const Td = styled.td`
    text-align: center; 
    padding: 15px 20px;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-primary);
    vertical-align: middle;
    
    &.nowrap { white-space: nowrap; }
    &.text-left { text-align: left; }
`;
const Tr = styled.tr`
    &:last-child > td { border-bottom: none; }
`;
const ActionButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    margin: 0 5px;
    &:hover { color: var(--red-color); }
`;
const TimePeriodCell = styled.div`
    font-size: 0.85rem;
    line-height: 1.3; 
    .start-time { font-weight: 600; }
    .end-time { color: var(--text-secondary); }
`;
const SalesDetail = styled.div`
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: 4px;
`;
const ExportButton = styled.button`
    background-color: var(--green-color);
    color: white; border: none; border-radius: 8px; padding: 10px 20px;
    font-weight: 600; display: flex; align-items: center; gap: 8px;
    cursor: pointer; &:hover { opacity: 0.9; }
`;
const ClearHistoryButton = styled.button`
    background-color: var(--red-color);
    color: white; border: none; border-radius: 8px; padding: 10px 20px;
    font-weight: 600; display: flex; align-items: center; gap: 8px;
    cursor: pointer; &:hover { opacity: 0.9; }
`;

const formatCurrency = (value) => `Rp ${new Intl.NumberFormat('id-ID').format(value || 0)}`;
const formatDateTimeCombined = (start, end) => {
    if (!start || !end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dateStr = startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const startTime = startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const endTime = endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return (
        <TimePeriodCell>
            <div className="start-time">{dateStr}</div>
            <div className="end-time">{startTime} - {endTime}</div>
        </TimePeriodCell>
    );
};

function ShiftHistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState({ action: null, id: null });
    const [modalContent, setModalContent] = useState({ title: '', message: '' });

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await getShiftHistory();
            setHistory(res.data);
        } catch (error) { toast.error("Gagal memuat riwayat shift."); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserRole(decoded.role ? decoded.role.toLowerCase() : null);
            } catch (error) {
                console.error("Invalid token:", error);
                setUserRole(null);
            }
        }
        fetchHistory();
    }, []);

    const openConfirmation = (action, id = null) => {
        setConfirmAction({ action, id });
        if (action === 'delete') {
            setModalContent({ title: 'Hapus Shift', message: `Yakin ingin menghapus riwayat shift #${id}?` });
        } else if (action === 'clearAll') {
            setModalContent({ title: 'Hapus Semua Riwayat', message: 'Yakin ingin menghapus SELURUH riwayat shift? Aksi ini tidak dapat dibatalkan.' });
        }
        setIsConfirmOpen(true);
    };
    
    const handleExport = async () => {
        toast.info("Mempersiapkan data untuk diunduh...");
        try {
            const response = await exportShiftHistory();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `riwayat-shift-${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal mengekspor data.");
        }
    };

    const handleConfirm = async () => {
        const { action, id } = confirmAction;
        setIsConfirmOpen(false);
        let promise;
        if (action === 'delete') promise = deleteShift(id);
        else if (action === 'clearAll') promise = clearShiftHistory();
        if (promise) {
            await toast.promise(promise, {
                pending: 'Memproses...',
                success: 'Aksi berhasil dijalankan!',
                error: (err) => err.response?.data?.message || 'Gagal menjalankan aksi.'
            });
            fetchHistory();
        }
    };

    return (
        <>
            <PageContainer>
                <PageHeader>
                    <Title><FiClock /> Riwayat Shift</Title>
                    {userRole === 'admin' && (
                        <HeaderActions>
                            <ExportButton onClick={handleExport}><FiDownload/> Ekspor CSV</ExportButton>
                            <ClearHistoryButton onClick={() => openConfirmation('clearAll')}>
                                <FiAlertTriangle /> Hapus Semua Riwayat
                            </ClearHistoryButton>
                        </HeaderActions>
                    )}
                </PageHeader>
                
                <TableContainer>
                    {loading ? ( <div style={{ padding: '20px' }}><Skeleton count={10} height={50} /></div> ) 
                    : history.length > 0 ? (
                        <TableWrapper>
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>Kasir</Th> 
                                        <Th>Waktu Shift</Th>
                                        <Th>Kas Awal</Th> 
                                        <Th>Total Penjualan</Th>
                                        <Th>Kas Akhir Sistem</Th>
                                        {userRole === 'admin' && <Th>Aksi</Th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map(shift => {
                                        const nonCashSales = (shift.card_sales || 0) + (shift.qris_sales || 0) + (shift.other_sales || 0);
                                        return (
                                            <Tr key={shift.id}>
                                                <Td className="text-left">{shift.user_name}</Td> 
                                                <Td>{formatDateTimeCombined(shift.start_time, shift.end_time)}</Td>
                                                <Td className="nowrap">{formatCurrency(shift.starting_cash)}</Td>
                                                <Td className="nowrap">
                                                    <strong>{formatCurrency(shift.total_sales)}</strong>
                                                    <SalesDetail>
                                                        Tunai: {formatCurrency(shift.cash_sales)} <br/>
                                                        Non-Tunai: {formatCurrency(nonCashSales)}
                                                    </SalesDetail>
                                                </Td>
                                                <Td className="nowrap">{formatCurrency(shift.ending_cash)}</Td>
                                                {userRole === 'admin' && (
                                                    <Td>
                                                        <ActionButton onClick={() => openConfirmation('delete', shift.id)}>
                                                            <FiTrash2 size={18} />
                                                        </ActionButton>
                                                    </Td>
                                                )}
                                            </Tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </TableWrapper>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
                            <FiClock size={48} />
                            <p style={{marginTop: '15px'}}>Belum ada riwayat shift yang ditutup.</p>
                        </div>
                    )}
                </TableContainer>
            </PageContainer>
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirm}
                title={modalContent.title}
                message={modalContent.message}
            />
        </>
    );
}

export default ShiftHistoryPage;