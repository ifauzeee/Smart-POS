// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\Dashboard\components\StatCardGrid.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';
// =================================================================
// PERBAIKAN DI SINI: Tambahkan FiArchive
// =================================================================
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiTag, FiUsers, FiUserCheck, FiList, FiArrowUp, FiArrowDown, FiChevronDown, FiChevronUp, FiArchive } from 'react-icons/fi';
// =================================================================

const GridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px;
    width: 100%;
`;
const ComparisonChip = styled.div`
    display: inline-flex; align-items: center; gap: 4px; font-size: 0.8rem; font-weight: 600;
    padding: 2px 8px; border-radius: 20px; margin-top: 6px;
    color: ${props => props.color};
    background-color: ${props => props.color}20;
`;
const StatIcon = styled.div`
    width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center;
    background-color: ${props => props.color}15;
    color: ${props => props.color};
    flex-shrink: 0;
`;
const Card = styled.div`
    background: var(--bg-surface); padding: 28px; border-radius: 24px; border: 1px solid var(--border-color);
    display: flex; align-items: center; gap: 24px; grid-column: span 3;
    transition: all 0.3s ease-in-out;
    &:hover { transform: translateY(-5px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08); }
    @media (max-width: 1600px) { grid-column: span 4; }
    @media (max-width: 1200px) { grid-column: span 6; }
    @media (max-width: 768px) { grid-column: 1 / -1; }
`;
const StatInfo = styled.div` flex-grow: 1; `;
const StatValue = styled.h2` font-size: 1.8rem; font-weight: 700; color: var(--text-primary); margin: 0; `;
const StatLabel = styled.p` font-size: 0.95rem; color: var(--text-secondary); margin: 0; `;
const ExpandButton = styled.button`
    grid-column: 1 / -1; background: var(--bg-surface); color: var(--primary-color);
    border: 1px solid var(--border-color); border-radius: 16px; padding: 12px 20px; cursor: pointer;
    font-weight: 600; font-size: 1rem; display: flex; align-items: center; justify-content: center;
    gap: 8px; transition: all 0.3s ease;
    &:hover { background-color: var(--primary-color); color: white; }
`;
const calculatePercentageChange = (current, previous) => {
    if (previous === null || previous === undefined || previous === 0) return current > 0 ? Infinity : 0;
    return ((current - previous) / previous) * 100;
};

const StatCard = ({ icon, value, label, color, comparisonChange, positiveIsGood = true }) => {
    let chip = null;
    if (comparisonChange !== null && isFinite(comparisonChange)) {
        const isPositive = comparisonChange >= 0;
        const isGood = positiveIsGood ? isPositive : !isPositive;
        const displayValue = `${isPositive ? '+' : ''}${comparisonChange.toFixed(1)}%`;
        const chipColor = isGood ? 'var(--green-color)' : 'var(--red-color)';
        const chipIcon = isPositive ? <FiArrowUp size={12}/> : <FiArrowDown size={12}/>;
        chip = <ComparisonChip color={chipColor}>{chipIcon}{displayValue}</ComparisonChip>;
    }
    return (
        <Card>
            <StatIcon color={color}>{icon}</StatIcon>
            <StatInfo>
                <StatValue>{value}</StatValue>
                <StatLabel>{label}</StatLabel>
                {chip}
            </StatInfo>
        </Card>
    );
};
StatCard.propTypes = { icon: PropTypes.node.isRequired, value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, label: PropTypes.string.isRequired, color: PropTypes.string.isRequired, comparisonChange: PropTypes.number, positiveIsGood: PropTypes.bool };
const StatCardSkeleton = () => ( <Card as="div"> <Skeleton circle width={60} height={60} /> <div> <Skeleton height={30} width={150} style={{marginBottom: '5px'}} /> <Skeleton height={20} width="60%" /> </div> </Card> );

function StatCardGrid({ loading, stats, previousStats, userName }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const handleToggleExpand = () => setIsExpanded(!isExpanded);

    if (loading || !stats) {
        return ( <GridContainer> {Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)} </GridContainer> );
    }
    
    const revenueChange = calculatePercentageChange(stats.totalRevenue, previousStats?.totalRevenue);
    const transactionsChange = calculatePercentageChange(stats.totalTransactions, previousStats?.totalTransactions);
    const profitChange = calculatePercentageChange(stats.totalProfit, previousStats?.totalProfit);
    const expensesChange = calculatePercentageChange(stats.totalExpenses, previousStats?.totalExpenses);
    const formatCurrency = (val) => `Rp ${new Intl.NumberFormat('id-ID').format(val || 0)}`;

    return (
        <GridContainer>
            <StatCard icon={<FiDollarSign size={28} />} value={formatCurrency(stats.totalRevenue)} label="Pendapatan" color="var(--primary-color)" comparisonChange={revenueChange} />
            <StatCard icon={<FiShoppingBag size={28} />} value={stats.totalTransactions || 0} label="Total Transaksi" color="var(--green-color)" comparisonChange={transactionsChange} />
            <StatCard icon={<FiTrendingUp size={28} />} value={formatCurrency(stats.totalProfit)} label="Total Laba" color="#FFA500" comparisonChange={profitChange} />
            {/* ================================================================= */}
            {/* PERBAIKAN DI SINI: Menambahkan Kartu Kas Akhir */}
            {/* ================================================================= */}
            <StatCard icon={<FiArchive size={28} />} value={formatCurrency(stats.cashInDrawer)} label="Total Kas di Laci" color="#17a2b8" />
            {/* ================================================================= */}
            
            <StatCard icon={<FiTag size={28} />} value={stats.totalSoldUnits || 0} label="Produk Terjual" color="#007bff" />
            <StatCard icon={<FiUsers size={28} />} value={stats.newCustomers || 0} label="Pelanggan Baru" color="#6f42c4" />
            
            {isExpanded && (
                <>
                    <StatCard icon={<FiDollarSign size={28} />} value={formatCurrency(stats.totalExpenses)} label="Total Pengeluaran" color="#dc3545" comparisonChange={expensesChange} positiveIsGood={false} />
                    <StatCard icon={<FiList size={28} />} value={`${formatCurrency(stats.totalRevenue / (stats.totalTransactions || 1))} / trx`} label="Rata-rata Transaksi" color="#6c757d" />
                    <StatCard icon={<FiUserCheck size={28} />} value={userName} label="Kasir Aktif" color="#20c997" />
                </>
            )}
            <ExpandButton onClick={handleToggleExpand}>
                {isExpanded ? <><FiChevronUp size={20} /> Sembunyikan Detail</> : <><FiChevronDown size={20} /> Lihat Detail Lainnya</>}
            </ExpandButton>
        </GridContainer>
    );
}

StatCardGrid.propTypes = { loading: PropTypes.bool.isRequired, stats: PropTypes.object, previousStats: PropTypes.object, userName: PropTypes.string, };

export default StatCardGrid;