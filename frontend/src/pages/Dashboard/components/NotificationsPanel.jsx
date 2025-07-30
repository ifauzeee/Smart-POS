import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import * as FiIcons from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'; // <-- 1. IMPORT useNavigate

const PanelContainer = styled.div`
  background-color: var(--bg-surface);
  padding: 30px;
  border-radius: 24px;
  border: 1px solid var(--border-color);
  grid-column: 1 / -1;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const PanelTitle = styled.h3`
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

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  border-radius: 12px;
  background-color: var(--bg-main);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 0.95rem;
  /* --- 2. Tambahkan cursor pointer untuk item yang bisa di-klik --- */
  cursor: ${props => props.isActionable ? 'pointer' : 'default'};
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${props => props.isActionable ? 'var(--bg-surface)' : 'var(--bg-main)'};
    border-color: ${props => props.isActionable ? 'var(--primary-color)' : 'var(--border-color)'};
  }
  
  svg {
    flex-shrink: 0;
    margin-top: 3px;
    color: var(--text-secondary);
  }

  &.warning { border-left: 4px solid #ffa500; svg { color: #ffa500; } }
  &.danger { border-left: 4px solid var(--red-color); svg { color: var(--red-color); } }
  &.info { border-left: 4px solid var(--primary-color); svg { color: var(--primary-color); } }
  &.success { border-left: 4px solid var(--green-color); svg { color: var(--green-color); } }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: var(--text-secondary);
  padding: 40px 20px;
`;

const getFiIconComponent = (iconName) => {
  const IconComponent = FiIcons[iconName] || FiIcons.FiBell;
  return <IconComponent size={20} />;
};

function NotificationsPanel({ loading, notifications, insights }) {
    const navigate = useNavigate(); // <-- 3. Inisialisasi useNavigate

    // --- 4. Fungsi untuk menangani klik pada notifikasi ---
    const handleNotificationClick = (item) => {
        // Hanya notifikasi stok (danger atau warning) yang bisa ditindaklanjuti
        if (item.type === 'danger' || item.type === 'warning') {
            navigate('/purchase-orders/new');
            toast.info('Buat Purchase Order baru untuk memesan ulang stok.');
        }
    };

  const allItems = [
    ...(Array.isArray(notifications) ? notifications : []).map((item, index) => ({
      id: item.id || `notification-${index}`,
      type: item.type || 'info',
      icon: item.icon || 'FiBell',
      text: item.text || 'No message',
      source: 'notification',
    })),
    ...(Array.isArray(insights) ? insights : []).map((item, index) => ({
      id: item.id || `insight-${index}`,
      type: item.type || 'info',
      icon: item.icon || 'FiInfo',
      text: item.text || 'No description',
      source: 'insight',
    })),
  ];

  if (loading) {
    return (
      <PanelContainer>
        <PanelTitle>
          <FiIcons.FiZap size={22} /> Notifikasi & Insight
        </PanelTitle>
        <Skeleton count={3} height={60} style={{ borderRadius: '12px', marginBottom: '15px' }} />
      </PanelContainer>
    );
  }

  return (
    <PanelContainer>
      <PanelTitle>
        <FiIcons.FiZap size={22} /> Notifikasi & Insight
      </PanelTitle>
      {allItems.length > 0 ? (
        <NotificationList>
          {allItems.map((item, index) => {
              const isActionable = item.source === 'notification' && (item.type === 'danger' || item.type === 'warning');
              return (
                <NotificationItem 
                    key={`${item.source}-${item.id}-${index}`} 
                    className={item.type}
                    isActionable={isActionable}
                    onClick={() => isActionable && handleNotificationClick(item)}
                >
                    {getFiIconComponent(item.icon)}
                    <span>{item.text}</span>
                </NotificationItem>
              );
          })}
        </NotificationList>
      ) : (
        <EmptyStateContainer>
          <FiIcons.FiCheckCircle size={48} />
          <p style={{ marginTop: '15px' }}>
            Semua aman. Tidak ada notifikasi penting saat ini.
          </p>
        </EmptyStateContainer>
      )}
    </PanelContainer>
  );
}

NotificationsPanel.propTypes = {
  loading: PropTypes.bool.isRequired,
  notifications: PropTypes.array,
  insights: PropTypes.array,
};

export default NotificationsPanel;