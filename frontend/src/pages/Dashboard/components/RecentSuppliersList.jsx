// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\Dashboard\components\RecentSuppliersList.jsx

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import * as FiIcons from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';

const ListContainer = styled.div`
    background-color: var(--bg-surface);
    padding: 30px;
    border-radius: 24px;
    border: 1px solid var(--border-color);
    grid-column: span 1;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    @media (max-width: 1200px) {
        grid-column: span 2;
    }
    @media (max-width: 768px) {
        grid-column: 1 / -1;
    }
`;

const ListTitle = styled.h3`
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 25px;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 10px;
`;

const List = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

const ListItem = styled.li`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: var(--bg-primary);
    border-radius: 12px;
    margin-bottom: 8px;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    &:hover {
        background-color: var(--bg-hover);
    }
`;

const ProductName = styled.span`
    font-weight: 500;
    color: var(--text-primary);
    max-width: 60%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ItemValue = styled.span`
    color: var(--text-secondary);
    font-size: 0.9rem;
`;

const SkeletonContainer = styled.div`
    margin-top: 10px;
`;

const EmptyStateContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 30px 20px;
    color: var(--text-secondary);
`;

const EmptyStateIcon = styled.div`
    margin-bottom: 15px;
`;

const EmptyStateText = styled.p`
    font-size: 1rem;
    margin: 0;
`;

function RecentSuppliersList({ loading, recentSuppliers = [] }) {
    if (loading) {
        return (
            <ListContainer>
                <ListTitle>
                    <FiIcons.FiTruck size={22} /> Pemasok Terbaru
                </ListTitle>
                <SkeletonContainer>
                    {[...Array(5)].map((_, index) => (
                        <Skeleton
                            key={index}
                            count={1}
                            height={60}
                            style={{
                                marginBottom: '8px',
                                borderRadius: '12px',
                            }}
                        />
                    ))}
                </SkeletonContainer>
            </ListContainer>
        );
    }
    return (
        <ListContainer>
            <ListTitle>
                <FiIcons.FiTruck size={22} /> Pemasok Terbaru
            </ListTitle>
            {recentSuppliers.length > 0 ? (
                <List>
                    {recentSuppliers.map((s) => (
                        <ListItem key={s.id}>
                            <ProductName>{s.name}</ProductName>
                            <ItemValue>{new Date(s.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</ItemValue>
                        </ListItem>
                    ))}
                </List>
            ) : (
                <EmptyStateContainer>
                    <EmptyStateIcon>
                        <FiIcons.FiTruck size={48} />
                    </EmptyStateIcon>
                    <EmptyStateText>Belum ada data pemasok.</EmptyStateText>
                </EmptyStateContainer>
            )}
        </ListContainer>
    );
}

RecentSuppliersList.propTypes = {
    loading: PropTypes.bool.isRequired,
    recentSuppliers: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
            created_at: PropTypes.string.isRequired,
        }).isRequired
    ),
};

RecentSuppliersList.defaultProps = {
    recentSuppliers: [],
};

export default React.memo(RecentSuppliersList);