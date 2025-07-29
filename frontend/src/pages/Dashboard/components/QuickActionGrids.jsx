// frontend/src/pages/Dashboard/components/QuickActionGrids.jsx

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
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

function QuickActionGrids() {
    const navigate = useNavigate();
    return (
        <Grid>
            {/* --- SEKSI 1: OPERASIONAL & TRANSAKSI --- */}
            <GridTitle><FiIcons.FiZap size={22}/> Operasional & Transaksi</GridTitle>
            <ActionButton onClick={() => navigate('/pos')}><FiIcons.FiShoppingCart size={30}/><span>Transaksi Baru</span></ActionButton>
            <ActionButton onClick={() => navigate('/expenses')}><FiIcons.FiDollarSign size={30}/><span>Catat Pengeluaran</span></ActionButton>
            <ActionButton onClick={() => navigate('/targets')}><FiIcons.FiTarget size={30}/><span>Atur Target</span></ActionButton>

            {/* --- SEKSI 2: MANAJEMEN INVENTARIS --- */}
            <GridTitle><FiIcons.FiPackage size={22}/> Manajemen Inventaris</GridTitle>
            <ActionButton onClick={() => navigate('/products/new')}><FiIcons.FiPlusSquare size={30}/><span>Tambah Produk</span></ActionButton>
            <ActionButton onClick={() => navigate('/products')}><FiIcons.FiArchive size={30}/><span>Daftar Produk</span></ActionButton>
            <ActionButton onClick={() => navigate('/receive-stock')}><FiIcons.FiUpload size={30}/><span>Terima Stok</span></ActionButton>
            {/* --- PERBAIKAN DI SINI --- */}
            <ActionButton onClick={() => navigate('/stock-adjustment')}><FiIcons.FiEdit size={30}/><span>Penyesuaian Stok</span></ActionButton>

            {/* --- SEKSI 3: PENGELOLAAN TOKO --- */}
            <GridTitle><FiIcons.FiHome size={22}/> Pengelolaan Toko</GridTitle>
            <ActionButton onClick={() => navigate('/categories')}><FiIcons.FiList size={30}/><span>Kelola Kategori</span></ActionButton>
            {/* --- PERBAIKAN DI SINI --- */}
            <ActionButton onClick={() => navigate('/promotions')}><FiIcons.FiTag size={30}/><span>Kelola Promosi</span></ActionButton>
            <ActionButton onClick={() => navigate('/suppliers')}><FiIcons.FiTruck size={30}/><span>Kelola Pemasok</span></ActionButton>
            <ActionButton onClick={() => navigate('/customers')}><FiIcons.FiUsers size={30}/><span>Kelola Pelanggan</span></ActionButton>
            <ActionButton onClick={() => navigate('/users')}><FiIcons.FiUserCheck size={30}/><span>Kelola Pengguna</span></ActionButton>
            <ActionButton onClick={() => navigate('/settings')}><FiIcons.FiSettings size={30}/><span>Semua Pengaturan</span></ActionButton>
        </Grid>
    );
}

export default QuickActionGrids;