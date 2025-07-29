// frontend/src/pages/Dashboard/components/InfoTabs.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import * as FiIcons from 'react-icons/fi';

const ChartContainer = styled.div` background-color: var(--bg-surface); padding: 30px; border-radius: 24px; border: 1px solid var(--border-color); grid-column: 1 / -1; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); display: flex; flex-direction: column;`;
const TabContainer = styled.div` display: flex; gap: 10px; border-bottom: 1px solid var(--border-color); margin-bottom: 25px; flex-wrap: wrap; justify-content: center; padding: 0 20px;`;
const TabButton = styled.button` padding: 12px 24px; border: none; background: ${props => props.$isActive ? 'var(--primary-color)' : 'transparent'}; cursor: pointer; border-radius: 12px; transition: all 0.3s ease; font-weight: 600; color: ${props => props.$isActive ? 'white' : 'var(--text-secondary)'}; margin: 0 5px -1px 5px; display: flex; align-items: center; justify-content: center; gap: 8px; &:hover { background: ${props => props.$isActive ? 'var(--primary-color)' : 'var(--primary-color)15'}; color: ${props => props.$isActive ? 'white' : 'var(--primary-color)'}; } `;
const TabContent = styled.div` flex-grow: 1; min-height: 350px; display: flex; flex-direction: column; `;
const EmptyStateContainer = styled.div` flex-grow: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: var(--text-secondary); padding: 50px 20px; `;
const List = styled.ul` list-style: none; padding: 0; overflow-y: auto; flex-grow: 1; `;
const ListItem = styled.li` display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-radius: 12px; border-bottom: 1px solid var(--border-color); margin: 4px 0; &:last-child { border-bottom: none; } `;
const ItemValue = styled.span` color: var(--text-secondary); font-weight: 600; flex-shrink: 0; margin-left: 15px; `;

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
`;

function InfoTabs({ loading, data }) {
    const [activeProductStockTab, setActiveProductStockTab] = useState('stockInfo');
    const [activeUserInfoTab, setActiveUserInfoTab] = useState('topCustomers');

    const getStockColor = (stock) => {
        if (stock <= 10) return 'var(--red-color)';
        if (stock <= 40) return '#FFA500'; // Orange
        return 'var(--green-color)';
    };

    return (
        <>
            <ChartContainer>
                <TabContainer>
                    <TabButton $isActive={activeProductStockTab === 'stockInfo'} onClick={() => setActiveProductStockTab('stockInfo')}><FiIcons.FiArchive size={18}/> Informasi Stok</TabButton>
                    <TabButton $isActive={activeProductStockTab === 'staleProducts'} onClick={() => setActiveProductStockTab('staleProducts')}><FiIcons.FiLayers size={18}/> Tidak Laku</TabButton>
                    <TabButton $isActive={activeProductStockTab === 'expiredProducts'} onClick={() => setActiveProductStockTab('expiredProducts')}><FiIcons.FiClipboard size={18}/> Kadaluarsa</TabButton>
                </TabContainer>
                <TabContent>
                    {loading ? <Skeleton count={5} height={50} style={{ marginBottom: '10px' }} /> : (
                        <>
                            {activeProductStockTab === 'stockInfo' && (data.stockInfo?.length > 0 ? (
                                <List>
                                    {data.stockInfo.map(p => {
                                        const stockColor = getStockColor(p.stock);
                                        return (
                                            <ListItem key={p.id}>
                                                <ProductInfo>
                                                    <ProductImage src={p.image_url || 'https://placehold.co/100'} alt={p.name} />
                                                    <ProductName>{p.name}</ProductName>
                                                </ProductInfo>
                                                <ItemValue style={{ color: stockColor, fontSize: '1.1rem', fontWeight: '700' }}>
                                                    {p.stock} unit
                                                </ItemValue>
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            ) : <EmptyStateContainer><FiIcons.FiBox size={48}/><p>Tidak ada produk untuk ditampilkan.</p></EmptyStateContainer> )}
                            
                            {activeProductStockTab === 'staleProducts' && (data.staleProducts?.length > 0 ? (<List>{data.staleProducts.map(p => <ListItem key={p.id}><ProductName>{p.name}</ProductName><ItemValue>{p.stock} Tersisa ({p.lastSoldDate ? new Date(p.lastSoldDate).toLocaleDateString('id-ID') : 'Belum Terjual'})</ItemValue></ListItem>)}</List>) : <EmptyStateContainer><FiIcons.FiLayers size={48}/><p>Tidak ada produk yang tidak laku.</p></EmptyStateContainer> )}
                            
                            {activeProductStockTab === 'expiredProducts' && (data.expiredProducts?.length > 0 ? (<List>{data.expiredProducts.map(p => <ListItem key={p.id}><ProductName>{p.name}</ProductName><ItemValue>{`Exp: ${new Date(p.expiration_date).toLocaleDateString('id-ID')}`}</ItemValue></ListItem>)}</List>) : <EmptyStateContainer><FiIcons.FiClipboard size={48}/><p>Tidak ada produk mendekati kadaluarsa.</p></EmptyStateContainer> )}
                        </>
                    )}
                </TabContent>
            </ChartContainer>
            
            <ChartContainer>
                <TabContainer>
                    <TabButton $isActive={activeUserInfoTab === 'topCustomers'} onClick={() => setActiveUserInfoTab('topCustomers')}><FiIcons.FiUsers size={18}/> Pelanggan</TabButton>
                     <TabButton $isActive={activeUserInfoTab === 'cashierPerf'} onClick={() => setActiveUserInfoTab('cashierPerf')}><FiIcons.FiUserCheck size={18}/> Kasir</TabButton>
                    <TabButton $isActive={activeUserInfoTab === 'recentSuppliers'} onClick={() => setActiveUserInfoTab('recentSuppliers')}><FiIcons.FiTruck size={18}/> Pemasok</TabButton>
                </TabContainer>
                <TabContent>
                    {loading ? <Skeleton count={5} height={40} style={{ marginBottom: '10px' }} /> : (
                        <>
                            {activeUserInfoTab === 'topCustomers' && (data.topCustomers?.length > 0 ? (<List>{data.topCustomers.map(c => <ListItem key={c.id}><ProductName>{c.name}</ProductName><ItemValue>Rp {new Intl.NumberFormat('id-ID').format(c.totalSpent)} ({c.totalOrders} order)</ItemValue></ListItem>)}</List>) : <EmptyStateContainer><FiIcons.FiUsers size={48}/><p>Belum ada data pelanggan.</p></EmptyStateContainer> )}
                            
                            {activeUserInfoTab === 'cashierPerf' && (data.cashierPerformance?.length > 0 ? (<List>{data.cashierPerformance.map(c => <ListItem key={c.id}><ProductName>{c.name}</ProductName><ItemValue>Rp {new Intl.NumberFormat('id-ID').format(c.totalSales)} ({c.totalTransactions} trx)</ItemValue></ListItem>)}</List>) : <EmptyStateContainer><FiIcons.FiUserCheck size={48}/><p>Belum ada data performa kasir.</p></EmptyStateContainer> )}

                            {activeUserInfoTab === 'recentSuppliers' && (data.recentSuppliers?.length > 0 ? (<List>{data.recentSuppliers.map(s => <ListItem key={s.id}><ProductName>{s.name}</ProductName><ItemValue>{new Date(s.created_at).toLocaleDateString('id-ID')}</ItemValue></ListItem>)}</List>) : <EmptyStateContainer><FiIcons.FiTruck size={48}/><p>Belum ada data pemasok.</p></EmptyStateContainer> )}
                        </>
                    )}
                </TabContent>
            </ChartContainer>
        </>
    );
}

export default InfoTabs;

InfoTabs.propTypes = {
  loading: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
};