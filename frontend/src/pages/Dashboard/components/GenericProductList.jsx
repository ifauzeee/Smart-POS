// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\Dashboard\components\GenericProductList.jsx

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import * as FiIcons from 'react-icons/fi';
import { Link } from 'react-router-dom';

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
    flex-grow: 1;
`;

const ListItem = styled.li`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    margin-bottom: 8px;
    background-color: var(--bg-main);
    transition: all 0.2s ease;
    &:hover {
        background-color: var(--bg-hover, rgba(0, 0, 0, 0.02));
        border-color: var(--primary-color, #007bff);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    &:last-child {
        margin-bottom: 0;
    }
`;

const ProductInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    flex-grow: 1;
`;

const ProductImage = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
`;

const ProductName = styled.span`
    font-weight: 500;
    color: var(--text-primary);
    font-size: 0.95rem;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const ItemValue = styled.span`
    color: var(--text-secondary);
    font-weight: 600;
    flex-shrink: 0;
    margin-left: 15px;
    font-size: 0.9rem;
`;

const StockIndicator = styled.div`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${props => props.$color};
    margin-right: 8px;
    flex-shrink: 0;
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
    color: var(--text-tertiary, #ccc);
    margin-bottom: 10px;
`;

const EmptyStateText = styled.p`
    margin: 0;
    font-size: 1rem;
    color: var(--text-secondary);
`;

const SkeletonContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const GenericProductList = React.memo(({ loading, items, title, icon, renderItemValue, renderItemLink, emptyMessage, showImage, getStockColor }) => {
    if (loading) {
        return (
            <ListContainer>
                <ListTitle>{icon} {title}</ListTitle>
                <SkeletonContainer>
                    {[...Array(5)].map((_, index) => (
                        <Skeleton
                            key={index}
                            count={1}
                            height={60}
                            style={{ marginBottom: '8px', borderRadius: '12px' }}
                        />
                    ))}
                </SkeletonContainer>
            </ListContainer>
        );
    }

    return (
        <ListContainer>
            <ListTitle>{icon} {title}</ListTitle>
            {items?.length > 0 ? (
                <List>
                    {items.map(item => (
                        renderItemLink ? (
                            <Link to={renderItemLink(item)} key={item.id}>
                                <ListItem>
                                    <ProductInfo>
                                        {showImage && <ProductImage src={item.image_url || 'https://placehold.co/100'} alt={item.name} />}
                                        {getStockColor && <StockIndicator $color={getStockColor(item.stock)} />}
                                        <ProductName>{item.name}</ProductName>
                                    </ProductInfo>
                                    <ItemValue style={getStockColor ? { color: getStockColor(item.stock), fontWeight: '700' } : {}}>
                                        {renderItemValue(item)}
                                    </ItemValue>
                                </ListItem>
                            </Link>
                        ) : (
                            <ListItem key={item.id}>
                                <ProductInfo>
                                    {showImage && <ProductImage src={item.image_url || 'https://placehold.co/100'} alt={item.name} />}
                                    {getStockColor && <StockIndicator $color={getStockColor(item.stock)} />}
                                    <ProductName>{item.name}</ProductName>
                                </ProductInfo>
                                <ItemValue style={getStockColor ? { color: getStockColor(item.stock), fontWeight: '700' } : {}}>
                                    {renderItemValue(item)}
                                </ItemValue>
                            </ListItem>
                        )
                    ))}
                </List>
            ) : (
                <EmptyStateContainer>
                    <EmptyStateIcon>{icon}</EmptyStateIcon>
                    <EmptyStateText>{emptyMessage}</EmptyStateText>
                </EmptyStateContainer>
            )}
        </ListContainer>
    );
});

GenericProductList.propTypes = {
    loading: PropTypes.bool.isRequired,
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
            stock: PropTypes.number,
            image_url: PropTypes.string,
            lastSoldDate: PropTypes.string,
            totalSpent: PropTypes.number,
            totalOrders: PropTypes.number
        })
    ),
    title: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    renderItemValue: PropTypes.func.isRequired,
    renderItemLink: PropTypes.func,
    emptyMessage: PropTypes.string.isRequired,
    showImage: PropTypes.bool,
    getStockColor: PropTypes.func
};

export default GenericProductList;