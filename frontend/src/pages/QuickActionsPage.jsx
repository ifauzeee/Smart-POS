// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\QuickActionsPage.jsx

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiZap, FiShoppingCart, FiDollarSign, FiTarget, FiClock, FiPackage, FiPlusSquare, FiArchive, FiUpload, FiEdit, FiClipboard, FiBox, FiHome, FiUserCheck, FiShield, FiUsers, FiTruck, FiList, FiTag, FiSettings, FiGift } from 'react-icons/fi';

const PageContainer = styled.div`
    padding: 30px;
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const PageHeader = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-shrink: 0;
`;

const Title = styled.h1`
    font-size: 1.8rem;
`;

const BackButton = styled.button`
    background-color: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 12px 20px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    &:hover {
        background-color: var(--bg-main);
    }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 20px;
    background-color: var(--bg-surface);
    padding: 30px;
    border-radius: 24px;
    border: 1px solid var(--border-color);
    justify-content: center;
`;

const GridTitle = styled.h3`
    grid-column: 1 / -1;
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 10px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: flex-start;
    text-align: left;
    &:not(:first-child) {
        margin-top: 20px;
    }
`;

const ActionButton = styled.button`
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    cursor: pointer;
    font-weight: 600;
    color: var(--text-primary);
    transition: all 0.3s ease;
    
    span { 
        font-size: 0.9rem; 
        text-align: center;
    }
    svg { 
        transition: all 0.3s ease; 
        color: var(--primary-color); 
    }
    &:hover { 
        background-color: var(--primary-color); 
        color: white; 
        transform: translateY(-3px); 
        svg { color: white; } 
    }
`;

function QuickActionsPage() {
    const navigate = useNavigate();
    return (
        <PageContainer>
            <PageHeader>
                <Title>Aksi Cepat & Manajemen</Title>
                <BackButton onClick={() => navigate('/dashboard')}>
                    <FiArrowLeft size={18} />
                    Kembali ke Dashboard
                </BackButton>
            </PageHeader>
            <Grid>
                {/* --- SEKSI 1: OPERASIONAL & TRANSAKSI --- */}
                <GridTitle><FiZap size={22}/> Operasional & Transaksi</GridTitle>
                <ActionButton onClick={() => navigate('/pos')}><FiShoppingCart size={30}/><span>Transaksi Baru</span></ActionButton>
                <ActionButton onClick={() => navigate('/expenses')}><FiDollarSign size={30}/><span>Catat Pengeluaran</span></ActionButton>
                <ActionButton onClick={() => navigate('/targets')}><FiTarget size={30}/><span>Atur Target</span></ActionButton>
                <ActionButton onClick={() => navigate('/shift-history')}><FiClock size={30}/><span>Riwayat Shift</span></ActionButton>

                {/* --- SEKSI 2: MANAJEMEN INVENTARIS --- */}
                <GridTitle><FiPackage size={22}/> Manajemen Inventaris</GridTitle>
                <ActionButton onClick={() => navigate('/products/new')}><FiPlusSquare size={30}/><span>Tambah Produk</span></ActionButton>
                <ActionButton onClick={() => navigate('/products')}><FiArchive size={30}/><span>Daftar Produk</span></ActionButton>
                <ActionButton onClick={() => navigate('/receive-stock')}><FiUpload size={30}/><span>Terima Stok</span></ActionButton>
                <ActionButton onClick={() => navigate('/stock-adjustment')}><FiEdit size={30}/><span>Penyesuaian Stok</span></ActionButton>
                <ActionButton onClick={() => navigate('/purchase-orders')}><FiClipboard size={30}/><span>Purchase Order</span></ActionButton>
                <ActionButton onClick={() => navigate('/raw-materials')}><FiBox size={30}/><span>Bahan Baku</span></ActionButton>


                {/* --- SEKSI 3: PENGELOLAAN TOKO --- */}
                <GridTitle><FiHome size={22}/> Pengelolaan Toko</GridTitle>
                <ActionButton onClick={() => navigate('/users')}><FiUserCheck size={30}/><span>Kelola Pengguna</span></ActionButton>
                <ActionButton onClick={() => navigate('/roles')}><FiShield size={30}/><span>Manajemen Peran</span></ActionButton>
                <ActionButton onClick={() => navigate('/customers')}><FiUsers size={30}/><span>Kelola Pelanggan</span></ActionButton>
                <ActionButton onClick={() => navigate('/suppliers')}><FiTruck size={30}/><span>Kelola Pemasok</span></ActionButton>
                <ActionButton onClick={() => navigate('/categories')}><FiList size={30}/><span>Kelola Kategori</span></ActionButton>
                <ActionButton onClick={() => navigate('/promotions')}><FiTag size={30}/><span>Kelola Promosi</span></ActionButton>
                <ActionButton onClick={() => navigate('/rewards')}><FiGift size={30}/><span>Kelola Hadiah</span></ActionButton>
                <ActionButton onClick={() => navigate('/settings')}><FiSettings size={30}/><span>Semua Pengaturan</span></ActionButton>
            </Grid>
        </PageContainer>
    );
}

export default QuickActionsPage;