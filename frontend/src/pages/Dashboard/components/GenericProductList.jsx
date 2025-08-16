// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\Dashboard\components\GenericProductList.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import * as FiIcons from 'react-icons/fi';

const ListContainer = styled.div`
    background-color: var(--bg-surface);
    padding: 30px;
    border-radius: 24px;
    border: 1px solid var(--border-color);
    grid-column: span 1;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    @media (max-width: 1200px) {
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
    padding: 15px 0;
    border-bottom: 1px solid var(--border-color);
    &:last-child {
        border-bottom: none;
    }
`;

const ProductName = styled.span`
    font-weight: 500;
    color: var(--text-primary);
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
`;

const ItemValue = styled.span`
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 400;
    ${({ $stockColor }) => $stockColor && `color: ${$stockColor};`}
`;

const ProductImage = styled.img`
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 8px;
`;

const PlaceholderImage = styled.div`
    width: 40px;
    height: 40px;
    background-color: var(--bg-secondary);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    font-size: 0.8rem;
    text-align: center;
    line-height: 1;
    padding: 5px;
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

const EmptyStateIcon = styled.div`
    margin-bottom: 20px;
    color: var(--text-secondary);
`;

const EmptyStateText = styled.p`
    font-size: 1rem;
    font-weight: 400;
    margin: 0;
`;

const SkeletonContainer = styled.div`
    > span {
        margin-bottom: 15px;
        &:last-child {
            margin-bottom: 0;
        }
    }
`;

function GenericProductList({
    loading,
    items = [],
    title,
    icon,
    renderItemValue,
    renderItemLink,
    emptyMessage,
    showImage = false,
    getStockColor,
}) {
    if (loading) {
        return (
            <ListContainer>
                <ListTitle>{icon} {title}</ListTitle>
                <SkeletonContainer>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} height={50} style={{ borderRadius: '12px' }} />
                    ))}
                </SkeletonContainer>
            </ListContainer>
        );
    }

    const safeItems = Array.isArray(items) ? items : [];

    return (
        <ListContainer>
            <ListTitle>{icon} {title}</ListTitle>
            {safeItems.length > 0 ? (
                <List>
                    {safeItems.map(item => (
                        <ListItem key={item.id}>
                            {renderItemLink ? (
                                <Link to={renderItemLink(item)} style={{ textDecoration: 'none', flex: 1 }}>
                                    <ProductName>
                                        {showImage && (item.image_url ? <ProductImage src={item.image_url} alt={item.name} /> : <PlaceholderImage>No Img</PlaceholderImage>)}
                                        {item.name}
                                    </ProductName>
                                </Link>
                            ) : (
                                <ProductName>
                                    {showImage && (item.image_url ? <ProductImage src={item.image_url} alt={item.name} /> : <PlaceholderImage>No Img</PlaceholderImage>)}
                                    {item.name}
                                </ProductName>
                            )}
                            <ItemValue $stockColor={getStockColor?.(item.stock)}>
                                {renderItemValue(item)}
                            </ItemValue>
                        </ListItem>
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
}

GenericProductList.propTypes = {
    loading: PropTypes.bool.isRequired,
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
            stock: PropTypes.number,
            image_url: PropTypes.string,
        })
    ),
    title: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    renderItemValue: PropTypes.func.isRequired,
    renderItemLink: PropTypes.func,
    emptyMessage: PropTypes.string.isRequired,
    showImage: PropTypes.bool,
    getStockColor: PropTypes.func,
};

export default GenericProductList;