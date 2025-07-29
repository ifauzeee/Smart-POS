// frontend/src/pages/Dashboard/components/StatCardGrid.jsx

import React from 'react';
import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiTag, FiUsers, FiUserCheck, FiList } from 'react-icons/fi';

const StatIcon = styled.div` width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; background-color: ${props => props.color}15; color: ${props => props.color}; flex-shrink: 0; transition: all 0.3s ease;`;

const Card = styled.div`
    background: var(--bg-surface);
    padding: 28px;
    border-radius: 24px;
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 24px;
    transition: all 0.3s ease;
    grid-column: span 3;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    &:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1); border-color: var(--primary-color); }
    @media (max-width: 1600px) { grid-column: span 4; }
    @media (max-width: 1200px) { grid-column: span 6; }
    @media (max-width: 768px) { grid-column: 1 / -1; }
`;

const StatInfo = styled.div` flex-grow: 1; `;
const StatValue = styled.h2` font-size: 1.8rem; font-weight: 700; color: var(--text-primary); margin: 0; `;
const StatLabel = styled.p` font-size: 0.95rem; color: var(--text-secondary); margin: 0; `;

const StatCard = ({ icon, value, label, color }) => (
    <Card>
        <StatIcon color={color}>{icon}</StatIcon>
        <StatInfo>
            <StatValue>{value}</StatValue>
            <StatLabel>{label}</StatLabel>
        </StatInfo>
    </Card>
);

const StatCardSkeleton = () => (
    <Card as="div">
        <Skeleton circle width={60} height={60} />
        <div>
            <Skeleton height={30} width={150} style={{marginBottom: '5px'}} />
            <Skeleton height={20} width="60%" />
        </div>
    </Card>
);

function StatCardGrid({ loading, stats, userName }) {
    if (loading) {
        return Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />);
    }
    return (
        <>
            <StatCard icon={<FiDollarSign size={28} />} value={`Rp ${new Intl.NumberFormat('id-ID').format(stats?.totalRevenue || 0)}`} label="Pendapatan" color="var(--primary-color)" />
            <StatCard icon={<FiShoppingBag size={28} />} value={stats?.totalTransactions || 0} label="Total Transaksi" color="var(--green-color)" />
            <StatCard icon={<FiTag size={28} />} value={stats?.totalSoldUnits || 0} label="Produk Terjual" color="#007bff" />
            <StatCard icon={<FiTrendingUp size={28} />} value={`Rp ${new Intl.NumberFormat('id-ID').format(stats?.totalProfit || 0)}`} label="Total Laba" color="#FFA500" />
            <StatCard icon={<FiUsers size={28} />} value={stats?.newCustomers || 0} label="Pelanggan Baru" color="#6f42c4" />
            <StatCard icon={<FiUserCheck size={28} />} value={userName} label="Kasir Aktif" color="#20c997" />
            <StatCard icon={<FiDollarSign size={28} />} value={`Rp ${new Intl.NumberFormat('id-ID').format(stats?.totalExpenses || 0)}`} label="Total Pengeluaran" color="#dc3545" />
            <StatCard icon={<FiList size={28} />} value={`Rp ${new Intl.NumberFormat('id-ID').format(stats?.totalRevenue / (stats?.totalTransactions || 1) || 0)} / trx`} label="Rata-rata Transaksi" color="#6c757d" />
        </>
    );
}
export default StatCardGrid;