import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Skeleton from 'react-loading-skeleton';
import { FiBarChart2 } from 'react-icons/fi';

const ChartContainer = styled.div`
    background-color: var(--bg-surface);
    padding: 30px;
    border-radius: 24px;
    border: 1px solid var(--border-color);
    grid-column: 1 / -1;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
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

const CustomTooltip = ({ active, payload, formatter }) => {
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
                <p style={{ color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: '500' }}>{payload[0].payload.date}</p>
                <p style={{ color: 'var(--primary-color)', margin: 0 }}>
                    Penjualan: <span style={{ fontWeight: '600' }}>{formatter(payload[0].value)}</span>
                </p>
            </div>
        );
    }
    return null;
};

CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
    formatter: PropTypes.func,
};

const formatNumberYAxis = (value) => {
    if (value >= 1000000) return `${value / 1000000} jt`;
    if (value >= 1000) return `${value / 1000} rb`;
    return value;
};

function SalesChart({ loading, data }) {
    if (loading) {
        return (
            <ChartContainer>
                <ChartTitle><FiBarChart2 size={22}/> Penjualan Harian</ChartTitle>
                <Skeleton height={300} />
            </ChartContainer>
        );
    }

    return (
        <ChartContainer>
            <ChartTitle><FiBarChart2 size={22}/> Penjualan Harian</ChartTitle>
            {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} animationDuration={1000}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }} angle={-45} textAnchor="end" height={60} interval="preserveStartEnd" />
                        <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }} tickFormatter={formatNumberYAxis} />
                        <Tooltip content={<CustomTooltip formatter={(value) => `Rp ${new Intl.NumberFormat('id-ID').format(value)}`} />} />
                        <Area type="monotone" dataKey="sales" name="Penjualan (Rp)" stroke="var(--primary-color)" fill="url(#colorSales)" strokeWidth={3} activeDot={{ r: 8, stroke: 'var(--primary-color)', strokeWidth: 2, fill: 'white' }} animationDuration={1000} />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <EmptyStateContainer>
                    <FiBarChart2 size={48}/>
                    <p>Belum ada data penjualan harian untuk rentang tanggal ini.</p>
                </EmptyStateContainer>
            )}
        </ChartContainer>
    );
}

export default SalesChart;

SalesChart.propTypes = {
    loading: PropTypes.bool.isRequired,
    data: PropTypes.array,
};