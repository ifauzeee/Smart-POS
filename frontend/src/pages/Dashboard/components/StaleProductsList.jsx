// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\Dashboard\components\StaleProductsList.jsx

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import { FiArchive } from 'react-icons/fi';

const ListContainer = styled.div`
    background-color: var(--bg-surface);
    padding: 30px;
    border-radius: 24px;
    border: 1px solid var(--border-color);
    grid-column: 1 / -1;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    min-height: 400px;
`;

const ListTitle = styled.h3`
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

const List = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    flex-grow: 1;
`;

const ListItem = styled.li`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid var(--border-color);

    &:last-child {
        border-bottom: none;
    }
`;

const ProductName = styled.div`
    font-weight: 500;
    color: var(--text-primary);
`;

const ProductDetails = styled.div`
    text-align: right;
    font-size: 0.9rem;
    color: var(--text-secondary);
`;

const StockValue = styled.span`
    font-weight: 600;
    color: var(--text-primary);
`;

const EmptyStateContainer = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: var(--text-secondary);
    padding: 50px 20px;
    gap: 15px;
`;

const EmptyStateIcon = styled.div`
    color: var(--text-secondary);
`;

const EmptyStateText = styled.p`
    margin: 0;
    font-size: 1rem;
`;

const SkeletonContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

function StaleProductsList({ loading, staleProducts = [] }) {
    if (loading) {
        return (
            <ListContainer>
                <ListTitle><FiArchive size={22} /> Produk Kurang Laku</ListTitle>
                <SkeletonContainer>
                    {[...Array(5)].map((_, index) => (
                        <Skeleton key={index} height={50} style={{ borderRadius: '12px' }} />
                    ))}
                </SkeletonContainer>
            </ListContainer>
        );
    }

    return (
        <ListContainer>
            <ListTitle><FiArchive size={22} /> Produk Kurang Laku</ListTitle>
            {staleProducts.length > 0 ? (
                <List>
                    {staleProducts.map((p) => (
                        <ListItem key={p.id}>
                            <ProductName>{p.name}</ProductName>
                            <ProductDetails>
                                <StockValue>{p.stock} unit</StockValue>
                                <div>Terakhir Terjual: {p.lastSoldDate ? new Date(p.lastSoldDate).toLocaleDateString('id-ID') : 'Belum Pernah'}</div>
                            </ProductDetails>
                        </ListItem>
                    ))}
                </List>
            ) : (
                <EmptyStateContainer>
                    <EmptyStateIcon><FiArchive size={48} /></EmptyStateIcon>
                    <EmptyStateText>Tidak ada produk yang kurang laku saat ini.</EmptyStateText>
                </EmptyStateContainer>
            )}
        </ListContainer>
    );
}

StaleProductsList.propTypes = {
  loading: PropTypes.bool,
  staleProducts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      stock: PropTypes.number.isRequired,
      lastSoldDate: PropTypes.string,
    })
  ),
};

export default StaleProductsList;