import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getAnalyticsSummary } from '../services/api';
import { FiTrendingUp, FiDollarSign, FiShoppingBag } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import Skeleton from 'react-loading-skeleton';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  width: 100%;
  padding: 30px;
  overflow-y: auto;
  height: 100%;
`;

const StatCard = styled.div`
  background-color: var(--bg-surface);
  padding: 25px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 20px;
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.color}1A;
  color: ${props => props.color};
`;

const StatInfo = styled.div``;

const StatValue = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const StatLabel = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
`;

const ChartContainer = styled.div`
  background-color: var(--bg-surface);
  padding: 30px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  grid-column: 1 / -1;
`;

const ChartTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 25px;
`;

const SkeletonCard = () => (
    <StatCard>
        <Skeleton circle width={60} height={60} />
        <div>
            <Skeleton height={36} width={150} style={{marginBottom: '5px'}} />
            <Skeleton height={24} width={100} />
        </div>
    </StatCard>
);

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'k';
  }
  return num;
};

function DashboardPage() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getAnalyticsSummary();
                setSummary(res.data);
            } catch (error) {
                console.error("Failed to fetch summary", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading || !summary) {
        return (
            <DashboardGrid>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <ChartContainer style={{gridColumn: '1 / -1'}}>
                    <Skeleton height={300} />
                </ChartContainer>
            </DashboardGrid>
        );
    }

    return (
        <DashboardGrid>
            <StatCard>
                <StatIcon color="var(--primary-color)">
                    <FiDollarSign size={28} />
                </StatIcon>
                <StatInfo>
                    <StatValue>Rp {new Intl.NumberFormat('id-ID').format(summary.todayRevenue)}</StatValue>
                    <StatLabel>Pendapatan Hari Ini</StatLabel>
                </StatInfo>
            </StatCard>
            
            <StatCard>
                <StatIcon color="var(--green-color)">
                    <FiShoppingBag size={28} />
                </StatIcon>
                <StatInfo>
                    <StatValue>{summary.todayTransactions}</StatValue>
                    <StatLabel>Transaksi Hari Ini</StatLabel>
                </StatInfo>
            </StatCard>

            <StatCard>
                <StatIcon color="#FFA500">
                    <FiTrendingUp size={28} />
                </StatIcon>
                <StatInfo>
                    <StatValue>{summary.topProducts[0]?.name || '-'}</StatValue>
                    <StatLabel>Produk Terlaris</StatLabel>
                </StatInfo>
            </StatCard>

            <ChartContainer>
                <ChartTitle>Penjualan 7 Hari Terakhir</ChartTitle>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={summary.salesLast7Days} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)' }} />
                        <YAxis tick={{ fill: 'var(--text-secondary)' }} tickFormatter={formatNumber} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                        <Legend />
                        <Line type="monotone" dataKey="dailySales" name="Penjualan (Rp)" stroke="var(--primary-color)" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
            
            <ChartContainer>
                <ChartTitle>Produk Terlaris</ChartTitle>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={summary.topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis type="number" tick={{ fill: 'var(--text-secondary)' }} />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fill: 'var(--text-secondary)' }} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                        <Legend />
                        <Bar dataKey="totalSold" name="Jumlah Terjual" fill="var(--primary-color)" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </DashboardGrid>
    );
}

export default DashboardPage;