import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getShiftHistory, deleteShift } from '../services/api';
import { toast } from 'react-toastify';
import { FiClock, FiTrash2 } from 'react-icons/fi'; // FiFileText removed
import Skeleton from 'react-loading-skeleton';
import { jwtDecode } from 'jwt-decode';

const PageContainer = styled.div`
    padding: 30px;
    height: 100%;
    display: flex;
    flex-direction: column;
`;
const PageHeader = styled.header`
    margin-bottom: 30px;
    flex-shrink: 0;
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
    overflow-x: auto; /* Changed to auto to allow horizontal scroll if content overflows */
    flex-grow: 1;
`;
const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    min-width: 580px; 
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
    white-space: normal; 
    word-break: break-word; 
    
    &.nowrap {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    &.text-left {
        text-align: left;
    }
`;
const Tr = styled.tr`
    &:last-child > td { border-bottom: none; }
`;
// DifferenceText styled component removed as it's no longer used
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
    color: var(--text-primary);
    line-height: 1.3; 
    .start-time {
        font-weight: 600;
    }
    .end-time {
        color: var(--text-secondary);
    }
`;

const formatCurrency = (value) => `Rp ${new Intl.NumberFormat('id-ID').format(value || 0)}`;
const formatDateTimeCombined = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const dateStr = startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const startTime = startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const endTime = endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    return (
        <>
            <div className="start-time">{dateStr}</div>
            <div className="end-time">{startTime} - {endTime}</div>
        </>
    );
};


function ShiftHistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserRole(decoded.role);
            } catch (error) {
                console.error("Invalid token:", error);
                setUserRole(null);
            }
        }

        const fetchHistory = async () => {
            setLoading(true);
            try {
                const res = await getShiftHistory();
                setHistory(res.data);
            } catch (error) {
                toast.error("Gagal memuat riwayat shift.");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleDeleteShift = async (shiftId) => {
        // IMPORTANT: In a real application, replace window.confirm with a custom modal UI.
        // window.confirm is blocking and not user-friendly in an iframe environment.
        if (window.confirm(`Yakin ingin menghapus shift #${shiftId} ini? Aksi ini tidak dapat dibatalkan.`)) {
            try {
                await toast.promise(deleteShift(shiftId), {
                    pending: 'Menghapus shift...',
                    success: 'Shift berhasil dihapus!',
                    error: (err) => err.response?.data?.message || 'Gagal menghapus shift.'
                });
                setHistory(prevHistory => prevHistory.filter(shift => shift.id !== shiftId));
            } catch (error) {
                console.error("Error deleting shift:", error);
            }
        }
    };


    return (
        <PageContainer>
            <PageHeader>
                <Title><FiClock /> Riwayat Shift</Title>
            </PageHeader>
            
            <TableContainer>
                {loading ? (
                    <div style={{ padding: '20px' }}><Skeleton count={10} height={50} /></div>
                ) : history.length > 0 ? (
                    <TableWrapper>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Kasir</Th> 
                                    <Th>Waktu Shift</Th>
                                    <Th>Kas Awal</Th> 
                                    <Th>Penjualan Tunai</Th> {/* Changed from Penjualan */}
                                    <Th>Kas Akhir Sistem</Th> {/* Changed from Fisik Akhir */}
                                    {/* Selisih column removed */}
                                    {userRole === 'admin' && <Th>Aksi</Th>}
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(shift => (
                                    <Tr key={shift.id}>
                                        <Td className="text-left">{shift.user_name}</Td> 
                                        <Td><TimePeriodCell>{formatDateTimeCombined(shift.start_time, shift.end_time)}</TimePeriodCell></Td>
                                        <Td className="nowrap">{formatCurrency(shift.starting_cash)}</Td>
                                        <Td className="nowrap">{formatCurrency(shift.cash_sales)}</Td> {/* Changed from total_sales to cash_sales */}
                                        <Td className="nowrap">{formatCurrency(shift.ending_cash)}</Td>
                                        {/* Difference Td removed */}
                                        {userRole === 'admin' && (
                                            <Td>
                                                <ActionButton onClick={() => handleDeleteShift(shift.id)}>
                                                    <FiTrash2 size={18} />
                                                </ActionButton>
                                            </Td>
                                        )}
                                    </Tr>
                                ))}
                            </tbody>
                        </Table>
                    </TableWrapper>
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
                        <FiClock size={48} /> {/* Changed icon to FiClock for consistency */}
                        <p style={{marginTop: '15px'}}>Belum ada riwayat shift yang ditutup.</p>
                    </div>
                )}
            </TableContainer>
        </PageContainer>
    );
}

export default ShiftHistoryPage;
