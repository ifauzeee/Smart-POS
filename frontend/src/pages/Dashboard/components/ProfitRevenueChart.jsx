import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
    return (
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', fontSize: '0.9rem', color: 'var(--text-primary)', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: '500' }}>{label}</p>
        <p style={{ color: 'var(--primary-color)', margin: 0 }}>Pendapatan: <span style={{ fontWeight: '600' }}>{formatCurrency(payload[0].value)}</span></p>
        <p style={{ color: 'var(--green-color)', margin: 0 }}>Laba: <span style={{ fontWeight: '600' }}>{formatCurrency(payload[1].value)}</span></p>
      </div>
    );
  }
  return null;
};
CustomTooltip.propTypes = { active: PropTypes.bool, payload: PropTypes.array, label: PropTypes.string };

const formatNumberYAxis = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}Jt`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}Rb`;
  return num;
};

function ProfitRevenueChart({ loading, data }) {
  if (loading) {
    return (
      <ChartContainer>
        <ChartTitle><FiTrendingUp size={22}/> Pendapatan vs Laba</ChartTitle>
        <Skeleton height={300} />
      </ChartContainer>
    );
  }
    
  return (
    <ChartContainer>
      <ChartTitle><FiTrendingUp size={22}/> Pendapatan vs Laba Harian</ChartTitle>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} animationDuration={1000}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.7}/>
                <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickFormatter={formatNumberYAxis} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize: "0.9rem"}}/>
            <Area type="monotone" dataKey="revenue" name="Pendapatan" stroke="var(--primary-color)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} animationDuration={1000}/>
            <Line type="monotone" dataKey="profit" name="Laba" stroke="var(--green-color)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} animationDuration={1000}/>
          </ComposedChart>
        </ResponsiveContainer>
      ) : ( 
        <EmptyStateContainer>
          <FiTrendingUp size={48}/>
          <p>Belum ada data untuk ditampilkan pada rentang tanggal ini.</p>
        </EmptyStateContainer>
      )}
    </ChartContainer>
  );
}

ProfitRevenueChart.propTypes = { loading: PropTypes.bool.isRequired, data: PropTypes.array };
export default ProfitRevenueChart;
