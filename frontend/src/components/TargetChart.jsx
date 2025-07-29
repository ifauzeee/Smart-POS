// frontend/src/pages/Dashboard/components/TargetChart.jsx

import React from 'react';
import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import { FiTarget } from 'react-icons/fi';

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

const ProgressBarContainer = styled.div`
    width: 100%;
    height: 20px;
    background-color: var(--bg-main);
    border-radius: 10px;
    overflow: hidden;
    margin: 10px 0;
`;
const ProgressBarFill = styled.div`
    height: 100%;
    width: ${props => props.$percentage}%;
    background: linear-gradient(90deg, var(--primary-color) 0%, #B583E6 100%);
    border-radius: 10px;
    transition: width 0.5s ease-in-out;
    text-align: right;
    color: white;
    font-size: 12px;
    line-height: 20px;
    padding-right: 8px;
`;

const StatsText = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 0.95rem;
    margin-top: 10px;
    color: var(--text-secondary);

    strong {
        color: var(--text-primary);
        font-weight: 600;
    }
`;


function TargetChart({ loading, stats }) {
    if (loading) {
        return (
            <ChartContainer>
                <ChartTitle><FiTarget size={22} /> Target Pendapatan Bulanan</ChartTitle>
                <Skeleton height={60} />
            </ChartContainer>
        );
    }

    const target = stats?.monthly_revenue_target || 0;
    const currentRevenue = stats?.totalRevenue || 0;
    const percentage = target > 0 ? (currentRevenue / target) * 100 : 0;
    const cappedPercentage = Math.min(percentage, 100);
    const formatCurrency = (value) => `Rp ${new Intl.NumberFormat('id-ID').format(value || 0)}`;

    return (
        <ChartContainer>
           <ChartTitle><FiTarget size={22} /> Target Pendapatan Bulanan</ChartTitle>
            {target > 0 ? (
                <div>
                    <ProgressBarContainer>
                        <ProgressBarFill $percentage={cappedPercentage}>
                            {percentage.toFixed(0)}%
                        </ProgressBarFill>
                    </ProgressBarContainer>
                    <StatsText>
                        <span>Tercapai: <strong>{formatCurrency(currentRevenue)}</strong></span>
                        <span>Target: <strong>{formatCurrency(target)}</strong></span>
                    </StatsText>
                </div>
            ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Target pendapatan bulanan belum diatur.
                </p>
            )}
        </ChartContainer>
    );
}

export default TargetChart;