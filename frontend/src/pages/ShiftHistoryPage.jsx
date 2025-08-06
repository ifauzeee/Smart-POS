// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\ShiftHistoryPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getShiftHistory, deleteShift, clearShiftHistory, exportShiftHistory } from '../services/api';
import { toast } from 'react-toastify';
import { FiClock, FiTrash2, FiAlertTriangle, FiDownload } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import ConfirmationModal from '../components/ConfirmationModal';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';

// --- Styled Components dengan Perbaikan Mobile ---
const PageContent = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: 30px;

    @media (max-width: 768px) {
        padding: 15px;
    }
`;

const PageHeader = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-shrink: 0;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
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
    flex-grow: 1;
    overflow: hidden;
`;

// --- DESKTOP TABLE STYLES ---
const TableWrapper = styled.div`
    display: none;
    @media (min-width: 769px) {
        display: block;
        background-color: var(--bg-surface);
        border-radius: 16px;
        border: 1px solid var(--border-color);
        overflow-x: auto;
    }
`;
const Table = styled.table` width: 100%; border-collapse: collapse; min-width: 800px; `;
const Th = styled.th` text-align: center; padding: 15px 20px; background-color: var(--bg-main); border-bottom: 1px solid var(--border-color); font-weight: 600; color: var(--text-secondary); font-size: 0.9rem; white-space: nowrap; text-transform: uppercase; `;
const Td = styled.td` text-align: center; padding: 15px 20px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); vertical-align: middle; &.nowrap { white-space: nowrap; } &.text-left { text-align: left; } `;
const Tr = styled(motion.tr)` &:last-child > td { border-bottom: none; } `;

// --- MOBILE CARD STYLES ---
const CardList = styled.div`
    display: none;
    @media (max-width: 768px) {
        display: grid;
        gap: 15px;
    }
`;
const ShiftCard = styled(motion.div)`
    background-color: var(--bg-surface);
    border-radius: 12px;
    border: 1px solid var(--border-color);
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;
const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 10px;
`;
const CardTitle = styled.div`
    font-weight: 600;
    color: var(--text-primary);
`;
const CardDate = styled.div`
    font-size: 0.8rem;
    color: var(--text-secondary);
`;
const CardBody = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
`;
const InfoItem = styled.div`
    font-size: 0.9rem;
    & > strong {
        display: block;
        font-weight: 600;
        color: var(--text-primary);
    }
    & > span {
        color: var(--text-secondary);
        font-size: 0.8rem;
    }
`;


// --- SHARED STYLES ---
const ActionButton = styled.button` background: none; border: none; cursor: pointer; color: var(--text-secondary); margin: 0 5px; &:hover { color: var(--red-color); } `;
const TimePeriodCell = styled.div` font-size: 0.85rem; line-height: 1.3; .start-time { font-weight: 600; } .end-time { color: var(--text-secondary); } `;
const SalesDetail = styled.div` font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px; `;
const ExportButton = styled.button` background-color: var(--green-color); color: white; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; &:hover { opacity: 0.9; } `;
const ClearHistoryButton = styled.button` background-color: var(--red-color); color: white; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; &:hover { opacity: 0.9; } `;
const EmptyStateContainer = styled.div` flex-grow: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: var(--text-secondary); `;

const tableRowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 }, }),
};

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
    const [modalState, setModalState] = useState({ isOpen: false, action: null, id: null, title: '', message: '' });

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getShiftHistory();
            setHistory(res.data);
        } catch (error) {
            toast.error("Gagal memuat riwayat shift.");
        } finally {
            setLoading(false);
        }
    }, []);

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
    }, [fetchHistory]);

    const openConfirmation = (action, id = null) => {
        let title = '';
        let message = '';
        if (action === 'delete') {
            title = 'Hapus Shift';
            message = `Yakin ingin menghapus riwayat shift #${id}?`;
        } else if (action === 'clearAll') {
            title = 'Hapus Semua Riwayat';
            message = 'Yakin ingin menghapus SELURUH riwayat shift? Aksi ini tidak dapat dibatalkan.';
        }
        setModalState({ isOpen: true, action, id, title, message });
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
            toast.success("Laporan berhasil diunduh!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal mengekspor data.");
        }
    };

    const handleConfirm = async () => {
        const { action, id } = modalState;
        setModalState({ isOpen: false, action: null, id: null, title: '', message: '' });
        let promise;
        if (action === 'delete') {
            promise = deleteShift(id);
        } else if (action === 'clearAll') {
            promise = clearShiftHistory();
        }
        if (promise) {
            await toast.promise(promise, {
                pending: 'Memproses...',
                success: 'Aksi berhasil dijalankan!',
                error: (err) => err.response?.data?.message || 'Gagal menjalankan aksi.'
            });
            fetchHistory();
        }
    };
    
    // Perbaikan: Hapus logika loading dari sini, serahkan ke PageWrapper
    const renderContent = () => {
        if (history.length === 0) {
            return (
                <EmptyStateContainer>
                    <FiClock size={48} />
                    <p style={{marginTop: '15px'}}>Belum ada riwayat shift yang ditutup.</p>
                </EmptyStateContainer>
            );
        }
        return (
            <>
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
                            {history.map((shift, i) => {
                                const nonCashSales = (parseFloat(shift.card_sales) || 0) + (parseFloat(shift.qris_sales) || 0) + (parseFloat(shift.other_sales) || 0);
                                return (
                                    <Tr key={shift.id} custom={i} initial="hidden" animate="visible" variants={tableRowVariants}>
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
                                        <Td className="nowrap">{formatCurrency(shift.expected_cash)}</Td>
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

                <CardList>
                    {history.map((shift, i) => {
                        const nonCashSales = (parseFloat(shift.card_sales) || 0) + (parseFloat(shift.qris_sales) || 0) + (parseFloat(shift.other_sales) || 0);
                        return (
                            <ShiftCard key={shift.id} custom={i} initial="hidden" animate="visible" variants={tableRowVariants}>
                                <CardHeader>
                                    <div>
                                        <CardTitle>{shift.user_name}</CardTitle>
                                        <CardDate>{new Date(shift.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</CardDate>
                                    </div>
                                    {userRole === 'admin' && (
                                        <ActionButton onClick={() => openConfirmation('delete', shift.id)}>
                                            <FiTrash2 size={18} />
                                        </ActionButton>
                                    )}
                                </CardHeader>
                                <CardBody>
                                    <InfoItem><strong>{formatCurrency(shift.starting_cash)}</strong><span>Kas Awal</span></InfoItem>
                                    <InfoItem><strong>{formatCurrency(shift.total_sales)}</strong><span>Total Penjualan</span></InfoItem>
                                    <InfoItem><strong>{formatCurrency(shift.expected_cash)}</strong><span>Kas Akhir Sistem</span></InfoItem>
                                    <InfoItem>
                                        <strong>{formatCurrency(shift.cash_sales)}</strong>
                                        <span>Penjualan Tunai</span>
                                    </InfoItem>
                                    <InfoItem>
                                        <strong>{formatCurrency(nonCashSales)}</strong>
                                        <span>Penjualan Non-Tunai</span>
                                    </InfoItem>
                                </CardBody>
                            </ShiftCard>
                        );
                    })}
                </CardList>
            </>
        );
    };

    return (
        <>
            <PageWrapper loading={loading}>
                <PageContent>
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
                        {renderContent()}
                    </TableContainer>
                </PageContent>
            </PageWrapper>
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                onConfirm={handleConfirm}
                title={modalState.title}
                message={modalState.message}
            />
        </>
    );
}

export default ShiftHistoryPage;