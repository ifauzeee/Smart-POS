// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\Dashboard\components\TopProductsChart.jsx

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import Skeleton from 'react-loading-skeleton';
import { FiTrendingUp } from 'react-icons/fi';

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

const getColor = (index) => {
    const colors = ['#9D4EDD', '#A968E3', '#B583E8', '#C19DEC', '#CDA7F1', '#007bff', '#28a745', '#FFA500', '#dc3545', '#6f42c4'];
    return colors[index % colors.length];
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length && label) {
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
                <p style={{ color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: '500' }}>{label}</p>
                <p style={{ color: 'var(--primary-color)', margin: 0 }}>
                    Terjual: <span style={{ fontWeight: '600' }}>{payload[0].value} unit</span>
                </p>
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

function TopProductsChart({ loading, data = [] }) {
    if (loading) {
        return (
            <ChartContainer>
                <ChartTitle><FiTrendingUp size={22} /> Performa Penjualan Produk</ChartTitle>
                <Skeleton height={300} />
            </ChartContainer>
        );
    }

    const formattedData = React.useMemo(() => {
        return data.map(item => ({
            ...item,
            shortName: item.name.length > 25 ? `${item.name.substring(0, Math.floor(window.innerWidth / 100))}...` : item.name,
        }));
    }, [data]);

    const top10Data = formattedData.slice(0, 10);

    return (
        <ChartContainer>
            <ChartTitle><FiTrendingUp size={22} /> Performa Penjualan Produk (Unit Terjual)</ChartTitle>
            {top10Data.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={top10Data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                        <YAxis
                            dataKey="shortName"
                            type="category"
                            width={180}
                            tick={{ fill: 'var(--text-primary)', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(204, 204, 204, 0.2)' }} />
                        <Bar dataKey="totalSold" name="Unit Terjual" barSize={20} radius={[0, 10, 10, 0]}>
                            {top10Data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getColor(index)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <EmptyStateContainer>
                    <FiTrendingUp size={48} />
                    <p>Belum ada data penjualan produk untuk ditampilkan pada periode ini.</p>
                </EmptyStateContainer>
            )}
        </ChartContainer>
    );
}

TopProductsChart.propTypes = {
    loading: PropTypes.bool.isRequired,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            totalSold: PropTypes.number.isRequired
        })
    )
};

TopProductsChart.defaultProps = {
    data: []
};

export default React.memo(TopProductsChart);