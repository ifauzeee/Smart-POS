import React from 'react';
import styled from 'styled-components';
import { FiRefreshCw, FiPrinter } from 'react-icons/fi';

const HeaderContainer = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: var(--bg-surface);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const TimeDisplay = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--primary-hover);
  }

  &:disabled {
    background-color: var(--disabled-color);
    cursor: not-allowed;
  }
`;

const DashboardHeader = ({ currentTime, onRefresh, onPrint, onManualPrint }) => {
  return (
    <HeaderContainer>
      <TimeDisplay>
        {currentTime.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </TimeDisplay>
      <ButtonGroup>
        <Button onClick={onRefresh}>
          <FiRefreshCw /> Refresh
        </Button>
        <Button onClick={onPrint}>
          <FiPrinter /> Siapkan Laporan
        </Button>
        <Button onClick={onManualPrint}>
          <FiPrinter /> Cetak Laporan
        </Button>
      </ButtonGroup>
    </HeaderContainer>
  );
};

export default DashboardHeader;