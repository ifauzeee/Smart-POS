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
    overflow-y: auto;
    flex-grow: 1;
    max-height: 350px;
`;

const ListItem = styled.li`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-radius: 12px;
    border: 1px solid transparent;
    margin: 4px 0;
    background-color: var(--bg-main);
    transition: all 0.2s ease;
    
    &:hover {
        border-color: var(--primary-color);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
`;

const ItemValue = styled.span`
    color: var(--text-secondary);
    font-weight: 600;
    flex-shrink: 0;
    margin-left: 15px;
    font-size: 0.9rem;
`;

const StyledLink = styled(Link)`
    text-decoration: none;
    color: inherit;
    display: block;
`;

const ProductName = styled.span`
    font-weight: 500;
    color: var(--text-primary);
    font-size: 0.95rem;
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
`;

function TopCustomersList({ loading, topCustomers = [] }) {
    if (loading) {
        return (
            <ListContainer>
                <ListTitle><FiIcons.FiUsers size={22}/> Pelanggan Teratas</ListTitle>
                <Skeleton count={5} height={60} style={{ marginBottom: '8px', borderRadius: '12px' }} />
            </ListContainer>
        );
    }

    return (
        <ListContainer>
            <ListTitle><FiIcons.FiUsers size={22}/> Pelanggan Teratas</ListTitle>
            {topCustomers?.length > 0 ? (
                <List>
                    {topCustomers.map(c => (
                        <StyledLink to={`/customers/${c.id}`} key={c.id}>
                            <ListItem>
                                <ProductName>{c.name}</ProductName>
                                <ItemValue>Rp {new Intl.NumberFormat('id-ID').format(c.totalSpent)} ({c.totalOrders} order)</ItemValue>
                            </ListItem>
                        </StyledLink>
                    ))}
                </List>
            ) : (
                <EmptyStateContainer>
                    <FiIcons.FiUsers size={48}/><p style={{marginTop: '15px'}}>Belum ada data pelanggan.</p>
                </EmptyStateContainer>
            )}
        </ListContainer>
    );
}

TopCustomersList.propTypes = {
    loading: PropTypes.bool.isRequired,
    topCustomers: PropTypes.array,
};

export default TopCustomersList;