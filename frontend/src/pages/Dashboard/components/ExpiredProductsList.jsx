import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import * as FiIcons from 'react-icons/fi';

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

// --- PERUBAHAN DI SINI: Hapus properti scrollbar ---
const List = styled.ul`
    list-style: none;
    padding: 0;
    flex-grow: 1;
    /* Menghapus overflow-y dan max-height agar semua item ditampilkan */
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

function ExpiredProductsList({ loading, expiredProducts = [] }) {
    if (loading) {
        return (
            <ListContainer>
                <ListTitle><FiIcons.FiClipboard size={22}/> Produk Kadaluarsa</ListTitle>
                <SkeletonContainer>
                    {[...Array(5)].map((_, index) => (
                        <Skeleton 
                            key={index}
                            count={1} 
                            height={60} 
                            style={{ 
                                marginBottom: '8px',
                                borderRadius: '12px'
                            }} 
                        />
                    ))}
                </SkeletonContainer>
            </ListContainer>
        );
    }
    return (
        <ListContainer>
            <ListTitle><FiIcons.FiClipboard size={22}/> Produk Kadaluarsa</ListTitle>
            {expiredProducts?.length > 0 ? (
                <List>
                    {expiredProducts.map(p => (
                        <ListItem key={p.id}>
                            <ProductName>{p.name}</ProductName>
                            <ItemValue>{`Exp: ${new Date(p.expiration_date).toLocaleDateString('id-ID')}`}</ItemValue>
                        </ListItem>
                    ))}
                </List>
            ) : (
                <EmptyStateContainer>
                    <EmptyStateIcon>
                        <FiIcons.FiClipboard size={48}/>
                    </EmptyStateIcon>
                    <EmptyStateText>
                        Tidak ada produk mendekati kadaluarsa.
                    </EmptyStateText>
                </EmptyStateContainer>
            )}
        </ListContainer>
    );
}

ExpiredProductsList.propTypes = {
    loading: PropTypes.bool.isRequired,
    expiredProducts: PropTypes.array,
};

export default ExpiredProductsList;