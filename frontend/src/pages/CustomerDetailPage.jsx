import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import { getCustomerById, getCustomerHistory, getCustomerStats, redeemCustomerPoints } from '../services/api';
import { toast } from 'react-toastify';
import Skeleton from 'react-loading-skeleton';
import { FiArrowLeft, FiUser, FiAward, FiShoppingBag, FiGift, FiCalendar, FiTrendingUp, FiStar, FiRefreshCw } from 'react-icons/fi';

// --- Animations ---
const fadeIn = keyframes` from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`;
const pulse = keyframes` 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); }`;

// --- Styled Components ---
const PageContainer = styled.div` padding: 20px; max-width: 1200px; margin: 0 auto; animation: ${fadeIn} 0.6s ease-out; `;
const BackLink = styled(Link)` display: inline-flex; align-items: center; gap: 8px; color: var(--text-secondary); text-decoration: none; margin-bottom: 15px; font-weight: 500; padding: 8px 16px; border-radius: 8px; transition: all 0.2s ease; &:hover { color: var(--primary-color); background-color: var(--bg-surface); transform: translateX(-2px); }`;
const Header = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px; `;
const CustomerName = styled.h1` font-size: 2rem; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 12px; `;
const StatusBadge = styled.span` padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; background: linear-gradient(135deg, var(--primary-color), #4f46e5); color: white; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); `;
const RefreshButton = styled.button` display: flex; align-items: center; gap: 8px; padding: 10px 16px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-surface); color: var(--text-secondary); cursor: pointer; transition: all 0.2s ease; &:hover { background: var(--primary-color); color: white; border-color: var(--primary-color); } &:disabled { opacity: 0.5; cursor: not-allowed; } svg { transition: transform 0.2s ease; } &:hover svg { transform: rotate(90deg); }`;
const TopCardsGrid = styled.div` display: grid; grid-template-columns: 350px 1fr; gap: 20px; align-items: flex-start; margin-bottom: 20px; @media (max-width: 1024px) { grid-template-columns: 320px 1fr; gap: 15px; } @media (max-width: 768px) { grid-template-columns: 1fr; }`;
const InfoCard = styled.div` background: var(--bg-surface); border-radius: 16px; border: 1px solid var(--border-color); padding: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); transition: all 0.3s ease; &:hover { box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); transform: translateY(-2px); }`;
const CardTitle = styled.h3` font-size: 1.1rem; font-weight: 600; padding-bottom: 10px; margin: 0 0 15px 0; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 8px; color: var(--text-primary); svg { color: var(--primary-color); }`;
const InfoGrid = styled.div` display: grid; gap: 10px; `;
const InfoItem = styled.div` display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--bg-main); border-radius: 8px; border: 1px solid var(--border-color); transition: all 0.2s ease; &:hover { background: var(--bg-surface); border-color: var(--primary-color); }`;
const InfoLabel = styled.span` color: var(--text-secondary); font-weight: 500; font-size: 0.85rem; `;
const InfoValue = styled.span` color: var(--text-primary); font-weight: 600; font-size: 0.95rem; `;
const PointsCard = styled(InfoCard)` text-align: center; `;
const PointsDisplay = styled.div` margin: 15px 0; position: relative; z-index: 1; p { margin: 0 0 8px 0; opacity: 0.9; font-size: 0.95rem; color: var(--text-secondary); } h2 { font-size: 2.5rem; margin: 0; animation: ${pulse} 2s infinite; color: var(--primary-color); text-shadow: none; }`;
const RedeemForm = styled.form` display: flex; flex-direction: column; gap: 10px; margin-top: 20px; position: relative; z-index: 1; `;
const RedeemInput = styled.input` width: 100%; padding: 10px 14px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-main); color: var(--text-primary); font-size: 0.9rem; transition: all 0.2s ease; &::placeholder { color: var(--text-secondary); } &:focus { outline: none; border-color: var(--primary-color); background: var(--bg-surface); }`;
const RedeemButton = styled.button` padding: 10px 18px; border-radius: 8px; border: 1px solid var(--primary-color); background: var(--primary-color); color: white; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.2s ease; backdrop-filter: none; &:hover:not(:disabled) { background: #4f46e5; border-color: #4f46e5; transform: translateY(-1px); } &:disabled { opacity: 0.5; cursor: not-allowed; }`;
const StatsGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px; `;
const StatCard = styled.div` background: var(--bg-surface); border-radius: 12px; border: 1px solid var(--border-color); padding: 15px; text-align: center; transition: all 0.3s ease; &:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); }`;
const StatIcon = styled.div` width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, var(--primary-color), #4f46e5); display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; color: white; font-size: 1rem; `;
const StatLabel = styled.p` color: var(--text-secondary); margin: 0 0 6px 0; font-size: 0.8rem; `;
const StatValue = styled.h3` color: var(--text-primary); margin: 0; font-size: 1.3rem; `;
const HistoryTableContainer = styled(InfoCard)` padding: 0; overflow: hidden; margin-top: 20px; `;
const TableControls = styled.div` display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid var(--border-color); background: var(--bg-main); `;
const SearchInput = styled.input` padding: 6px 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-surface); color: var(--text-primary); width: 180px; &::placeholder { color: var(--text-secondary); }`;
const Table = styled.table` width: 100%; border-collapse: collapse; `;
const Th = styled.th` text-align: left; padding: 12px 15px; background: var(--bg-main); border-bottom: 1px solid var(--border-color); font-weight: 600; color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; position: sticky; top: 0; z-index: 10; `;
const Td = styled.td` padding: 12px 15px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); vertical-align: middle; font-size: 0.9rem; `;
const Tr = styled.tr` transition: background-color 0.2s ease; &:hover { background: var(--bg-main); } &:last-child > td { border-bottom: none; }`;
const PointsBadge = styled.span` padding: 3px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; color: white; background: ${props => props.$positive ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--red-bg)'}; color: ${props => props.$positive ? 'white' : 'var(--red-text)'};`;
const EmptyState = styled.div` text-align: center; padding: 40px 20px; color: var(--text-secondary); svg { font-size: 2.5rem; margin-bottom: 12px; opacity: 0.5; } h3 { margin: 0 0 6px 0; color: var(--text-primary); font-size: 1.1rem; } p { margin: 0; font-size: 0.85rem; }`;

function CustomerDetailPage() {
    const { id } = useParams();
    const [customer, setCustomer] = useState(null);
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [redeemAmount, setRedeemAmount] = useState('');
    const [redeemDesc, setRedeemDesc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const [customerRes, historyRes, statsRes] = await Promise.all([ getCustomerById(id), getCustomerHistory(id), getCustomerStats(id) ]);
            setCustomer(customerRes.data);
            setHistory(historyRes.data);
            setStats(statsRes.data);
        } catch (error) { toast.error("Gagal memuat data pelanggan."); } finally { setLoading(false); setRefreshing(false); }
    }, [id]);

    useEffect(() => { fetchData(false); }, [fetchData]);
    const handleRefresh = () => fetchData(true);

    const handleRedeem = async (e) => {
        e.preventDefault();
        const pointsToRedeem = parseInt(redeemAmount, 10);
        if (isNaN(pointsToRedeem) || pointsToRedeem <= 0) return toast.warn("Masukkan jumlah poin yang valid.");
        if (pointsToRedeem > customer.points) return toast.warn("Poin tidak mencukupi.");
        if (!redeemDesc) return toast.warn("Masukkan deskripsi/alasan penukaran.");
        setIsSubmitting(true);
        try {
            await toast.promise(redeemCustomerPoints(id, { pointsToRedeem, description: redeemDesc }), { pending: "Memproses penukaran...", success: "Poin berhasil ditukarkan!", error: (err) => err.response?.data?.message || "Gagal menukarkan poin." });
            setRedeemAmount('');
            setRedeemDesc('');
            fetchData();
        } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
    };

    const filteredHistory = history.filter(item => new Date(item.created_at).toLocaleString('id-ID').toLowerCase().includes(searchTerm.toLowerCase()) || (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())));
    
    if (loading) { return ( <PageContainer> <Skeleton count={5} height={40} style={{ marginBottom: '20px' }} /> <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}> <Skeleton height={120} /> <Skeleton height={120} /> <Skeleton height={120} /> </div> </PageContainer> ); }
    if (!customer) { return ( <PageContainer> <EmptyState> <FiUser /> <h3>Pelanggan Tidak Ditemukan</h3> <p>Pelanggan dengan ID tersebut tidak ditemukan dalam sistem.</p> </EmptyState> </PageContainer> ); }

    return (
        <PageContainer>
            <BackLink to="/customers"><FiArrowLeft /> Kembali ke Daftar Pelanggan</BackLink>
            <Header>
                <div>
                    <CustomerName>
                        <FiUser /> {customer.name} <StatusBadge>Pelanggan Aktif</StatusBadge>
                    </CustomerName>
                </div>
                <RefreshButton onClick={handleRefresh} disabled={refreshing}>
                    <FiRefreshCw /> {refreshing ? 'Memuat...' : 'Refresh'}
                </RefreshButton>
            </Header>
            <StatsGrid>
                <StatCard>
                    <StatIcon><FiShoppingBag /></StatIcon>
                    <StatLabel>Total Pesanan</StatLabel>
                    <StatValue>{stats?.totalOrders || 0}</StatValue>
                </StatCard>
                <StatCard>
                    <StatIcon><FiTrendingUp /></StatIcon>
                    <StatLabel>Total Belanja</StatLabel>
                    <StatValue>Rp {new Intl.NumberFormat('id-ID').format(stats?.totalSpent || 0)}</StatValue>
                </StatCard>
                <StatCard>
                    <StatIcon><FiStar /></StatIcon>
                    <StatLabel>Total Poin Diperoleh</StatLabel>
                    <StatValue>{stats?.totalPointsEarned || 0}</StatValue>
                </StatCard>
                <StatCard>
                    <StatIcon><FiGift /></StatIcon>
                    <StatLabel>Rata-rata Belanja</StatLabel>
                    <StatValue>Rp {new Intl.NumberFormat('id-ID').format(Math.round(stats?.avgOrderValue || 0))}</StatValue>
                </StatCard>
            </StatsGrid>
            <TopCardsGrid>
                <div>
                    <InfoCard>
                        <CardTitle><FiUser /> Detail Pelanggan</CardTitle>
                        <InfoGrid>
                            <InfoItem>
                                <InfoLabel>Nama</InfoLabel>
                                <InfoValue>{customer.name}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>Telepon</InfoLabel>
                                <InfoValue>{customer.phone || '-'}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>Email</InfoLabel>
                                <InfoValue>{customer.email || '-'}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>Alamat</InfoLabel>
                                <InfoValue>{customer.address || '-'}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>Bergabung</InfoLabel>
                                <InfoValue>{customer.created_at ? new Date(customer.created_at).toLocaleDateString('id-ID') : '-'}</InfoValue>
                            </InfoItem>
                        </InfoGrid>
                    </InfoCard>
                </div>
                <div>
                    <PointsCard>
                        <CardTitle><FiAward /> Poin Loyalitas</CardTitle>
                        <PointsDisplay>
                            <p>Total Poin Saat Ini</p>
                            <h2>{customer.points.toLocaleString('id-ID')}</h2>
                        </PointsDisplay>
                        <RedeemForm onSubmit={handleRedeem}>
                            <RedeemInput type="number" value={redeemAmount} onChange={(e) => setRedeemAmount(e.target.value)} placeholder="Jumlah poin" max={customer.points} required />
                            <RedeemInput value={redeemDesc} onChange={(e) => setRedeemDesc(e.target.value)} placeholder="Deskripsi (cth: Tukar Merchandise)" required />
                            <RedeemButton type="submit" disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : 'Tukarkan Poin'}</RedeemButton>
                        </RedeemForm>
                    </PointsCard>
                </div>
            </TopCardsGrid>
            <HistoryTableContainer>
                <TableControls>
                    <CardTitle style={{ margin: 0, padding: 0 }}><FiShoppingBag /> Riwayat Aktivitas ({filteredHistory.length})</CardTitle>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <SearchInput type="text" placeholder="Cari..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </TableControls>
                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    <Table>
                        <thead>
                            <tr>
                                <Th><FiCalendar style={{ marginRight: '8px' }} />Tanggal</Th>
                                <Th>Deskripsi</Th>
                                <Th>Total Belanja</Th>
                                <Th>Perubahan Poin</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.length > 0 ? filteredHistory.map(item => (
                                <Tr key={`${item.type}-${item.id}`}>
                                    <Td>{new Date(item.created_at).toLocaleString('id-ID')}</Td>
                                    <Td>{item.description}</Td>
                                    <Td style={{ fontWeight: '600' }}>
                                        {item.total_amount ? new Intl.NumberFormat('id-ID').format(item.total_amount) : '-'}
                                    </Td>
                                    <Td>
                                        <PointsBadge $positive={item.points_change > 0}>
                                            {item.points_change > 0 ? `+${item.points_change}` : item.points_change}
                                        </PointsBadge>
                                    </Td>
                                </Tr>
                            )) : (
                                <Tr>
                                    <Td colSpan="4">
                                        <EmptyState>
                                            <FiShoppingBag />
                                            <h3>Belum Ada Aktivitas</h3>
                                            <p>Pelanggan ini belum melakukan transaksi atau aktivitas poin.</p>
                                        </EmptyState>
                                    </Td>
                                </Tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </HistoryTableContainer>
        </PageContainer>
    );
}

export default CustomerDetailPage;