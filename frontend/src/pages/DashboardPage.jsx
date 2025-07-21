import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getAnalyticsSummary } from '../services/api';
import { FiTrendingUp, FiDollarSign, FiShoppingBag } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import Skeleton from 'react-loading-skeleton';

// --- Styled Components untuk Dashboard ---

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  width: 100%;
  padding: 30px;
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
  background-color: ${props => props.color || 'var(--primary-color)'}20; // Warna dengan transparansi
  color: ${props => props.color || 'var(--primary-color)'};
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
  grid-column: 1 / -1; /* Membuat chart mengambil lebar penuh */
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
            <Skeleton height={36} width={150} />
            <Skeleton height={24} width={100} />
        </div>
    </StatCard>
);

// --- Komponen React ---
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

    if (loading) {
        return (
            <DashboardGrid>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <ChartContainer>
                    <Skeleton height={300} />
                </ChartContainer>
            </DashboardGrid>
        );
    }

    return (
        <DashboardGrid>
            <StatCard>
                <StatIcon color="#6A5AF9">
                    <FiDollarSign size={28} />
                </StatIcon>
                <StatInfo>
                    <StatValue>Rp {new Intl.NumberFormat('id-ID').format(summary.todayRevenue)}</StatValue>
                    <StatLabel>Pendapatan Hari Ini</StatLabel>
                </StatInfo>
            </StatCard>
            
            <StatCard>
                <StatIcon color="#20C997">
                    <FiShoppingBag size={28} />
                </StatIcon>
                <StatInfo>
                    <StatValue>{summary.todayTransactions}</StatValue>
                    <StatLabel>Transaksi Hari Ini</StatLabel>
                </StatInfo>
            </StatCard>

            <StatCard>
                <StatIcon color="#FA5A7D">
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
                    <LineChart data={summary.salesLast7Days} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="date" stroke="var(--text-secondary)" />
                        <YAxis stroke="var(--text-secondary)" />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }} />
                        <Legend />
                        <Line type="monotone" dataKey="dailySales" name="Penjualan" stroke="var(--primary-color)" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>

             <ChartContainer>
                <ChartTitle>Produk Terlaris</ChartTitle>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={summary.topProducts} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis type="number" stroke="var(--text-secondary)" />
                        <YAxis type="category" dataKey="name" width={120} stroke="var(--text-secondary)" />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }} />
                        <Legend />
                        <Bar dataKey="totalSold" name="Jumlah Terjual" fill="var(--primary-color)" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </DashboardGrid>
    );
}

export default DashboardPage;