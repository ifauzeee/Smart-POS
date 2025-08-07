// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\Dashboard\components\SalesChart.jsx

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Skeleton from 'react-loading-skeleton';
import { FiDollarSign } from 'react-icons/fi';
import { formatRupiah } from '../../utils/formatters';

const ChartContainer = styled.div`
    background-color: var(--bg-surface);
    padding: 30px;
    border-radius: 24px;
    border: 1px solid var(--border-color);
    grid-column: span 2;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    @media (max-width: 1200px) {
        grid-column: 1 / -1;
    }
`;

const ChartTitle = styled.h3`
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 25px;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
    text-align: center;
`;

const EmptyStateContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: var(--text-secondary);
    padding: 50px 20px;
    min-height: 250px;
`;

// Fungsi untuk menghasilkan warna secara dinamis
const getColor = (index) => {
    const colors = ['#007bff', '#28a745', '#FFA500', '#dc3545', '#6f42c4'];
    return colors[index % colors.length];
};

const formatDate = (dateString) => {
    const cache = new Map();
    if (cache.has(dateString)) return cache.get(dateString);
    const formatted = new Date(dateString).toLocaleDateString('id-ID');
    cache.set(dateString, formatted);
    return formatted;
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: '500' }}>
                    {formatDate(label)}
                </p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: getColor(index), margin: 0 }}>
                        {entry.name}: <span style={{ fontWeight: '600' }}>{formatRupiah(entry.value)}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
    label: PropTypes.string,
};

function SalesChart({ loading, data }) {
    if (loading) {
        return (
            <ChartContainer>
                <ChartTitle><FiDollarSign size={22} /> Penjualan Harian</ChartTitle>
                <Skeleton height={300} />
            </ChartContainer>
        );
    }

    return (
        <ChartContainer>
            <ChartTitle><FiDollarSign size={22} /> Penjualan Harian</ChartTitle>
            {data?.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                        <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            name="Pendapatan"
                            stroke={getColor(0)}
                            fill={getColor(0)}
                            fillOpacity={0.2}
                        />
                        <Area
                            type="monotone"
                            dataKey="profit"
                            name="Laba"
                            stroke={getColor(1)}
                            fill={getColor(1)}
                            fillOpacity={0.2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <EmptyStateContainer>
                    <FiDollarSign size={48} />
                    <p>Belum ada data penjualan harian untuk rentang tanggal ini.</p>
                </EmptyStateContainer>
            )}
        </ChartContainer>
    );
}

SalesChart.propTypes = {
    loading: PropTypes.bool.isRequired,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            date: PropTypes.string.isRequired,
            revenue: PropTypes.number.isRequired,
            profit: PropTypes.number.isRequired
        })
    )
};

export default SalesChart;