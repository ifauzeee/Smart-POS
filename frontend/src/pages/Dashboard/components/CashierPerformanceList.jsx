import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import * as FiIcons from 'react-icons/fi';

// =================================================================
// STYLED COMPONENTS
// =================================================================

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

/**
 * @description Komponen List yang sudah diperbaiki.
 * @comment
 * Menghapus properti `overflow-y` dan `max-height` agar semua item dalam
 * daftar ditampilkan secara penuh, tidak terbatas pada tinggi tertentu
 * yang memerlukan scrollbar. Ini memungkinkan `ListContainer` untuk
 * menyesuaikan tingginya secara dinamis.
 */
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

const ItemValue = styled.div`
    color: var(--text-secondary);
    font-weight: 600;
    flex-shrink: 0;
    margin-left: 15px;
    text-align: right;
    font-size: 0.9rem;
    line-height: 1.4;
`;

const SalesAmount = styled.div`
    color: var(--primary-color, #007bff);
    font-weight: 700;
    font-size: 1rem;
`;

const TransactionCount = styled.div`
    color: var(--text-tertiary, #888);
    font-size: 0.8rem;
    margin-top: 2px;
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

// =================================================================
// KOMPONEN UTAMA
// =================================================================

/**
 * @description Komponen untuk menampilkan daftar performa kasir.
 * @param {boolean} loading - Menunjukkan status loading untuk menampilkan skeleton.
 * @param {Array<object>} cashierPerformance - Data performa kasir.
 */
function CashierPerformanceList({ loading, cashierPerformance = [] }) {

    /**
     * @description Mengubah nilai angka menjadi format mata uang Rupiah.
     * @param {number} amount - Nilai mata uang.
     * @returns {string} - Nilai dalam format Rupiah.
     */
    const formatCurrency = (amount) => {
        try {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount || 0);
        } catch (error) {
            // Fallback jika Intl.NumberFormat gagal
            return `Rp ${(amount || 0).toLocaleString('id-ID')}`;
        }
    };

    /**
     * @description Mengubah nilai angka menjadi string jumlah transaksi.
     * @param {number} count - Jumlah transaksi.
     * @returns {string} - String yang menunjukkan jumlah transaksi.
     */
    const formatTransactionCount = (count) => {
        return `${count || 0} transaksi`;
    };

    if (loading) {
        return (
            <ListContainer>
                <ListTitle>
                    <FiIcons.FiUserCheck size={22} />
                    Performa Kasir
                </ListTitle>
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
            <ListTitle>
                <FiIcons.FiUserCheck size={22} />
                Performa Kasir
            </ListTitle>

            {/* Menampilkan daftar atau empty state berdasarkan data */}
            {cashierPerformance && cashierPerformance.length > 0 ? (
                <List>
                    {cashierPerformance.map((cashier, index) => (
                        <ListItem key={cashier?.id || `cashier-${index}`}>
                            <ProductName title={cashier?.name || 'Nama tidak tersedia'}>
                                {cashier?.name || 'Nama tidak tersedia'}
                            </ProductName>
                            <ItemValue>
                                <SalesAmount>
                                    {formatCurrency(cashier?.totalSales)}
                                </SalesAmount>
                                <TransactionCount>
                                    {formatTransactionCount(cashier?.totalTransactions)}
                                </TransactionCount>
                            </ItemValue>
                        </ListItem>
                    ))}
                </List>
            ) : (
                <EmptyStateContainer>
                    <EmptyStateIcon>
                        <FiIcons.FiUserCheck size={48} />
                    </EmptyStateIcon>
                    <EmptyStateText>
                        Belum ada data performa kasir tersedia.
                    </EmptyStateText>
                </EmptyStateContainer>
            )}
        </ListContainer>
    );
}

// =================================================================
// PROP TYPES
// =================================================================

CashierPerformanceList.propTypes = {
    loading: PropTypes.bool.isRequired,
    cashierPerformance: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            name: PropTypes.string,
            totalSales: PropTypes.number,
            totalTransactions: PropTypes.number,
        })
    ),
};

export default CashierPerformanceList;