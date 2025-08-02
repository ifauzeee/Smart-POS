// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\ProductsPage.jsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit, FiTrash2, FiBox } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ConfirmationModal from '../components/ConfirmationModal';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';

// --- PERBAIKAN DI SINI ---
// Buat sebuah container baru untuk konten internal halaman
const PageContent = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
`;
// --- AKHIR PERBAIKAN ---

// --- Styled Components ---
const PageHeader = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-shrink: 0; /* Mencegah header mengecil */
`;

const Title = styled.h1`
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    gap: 12px;
`;

const AddButton = styled.button`
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    &:hover {
        background-color: var(--primary-hover);
    }
`;

const TableContainer = styled.div`
    background-color: var(--bg-surface);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    overflow: hidden;
    flex-grow: 1; /* Mengisi sisa ruang vertikal */
    display: flex;
    flex-direction: column;
`;

// --- PERBAIKAN DI SINI: Menyembunyikan scrollbar pada TableWrapper ---
const TableWrapper = styled.div`
    overflow-x: auto;
    flex-grow: 1;
    
    /* Menghilangkan scrollbar di Chrome, Safari, dan Opera */
    &::-webkit-scrollbar {
        display: none;
    }
    /* Menghilangkan scrollbar di Firefox */
    scrollbar-width: none;
    /* Menghilangkan scrollbar di IE dan Edge */
    -ms-overflow-style: none;
`;
// --- AKHIR PERBAIKAN ---

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const Th = styled.th`
    text-align: left;
    padding: 15px 20px;
    background-color: var(--bg-main);
    border-bottom: 1px solid var(--border-color);
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.9rem;
    text-transform: uppercase;
`;

const Td = styled.td`
    padding: 15px 20px;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-primary);
    vertical-align: middle;
`;

const Tr = styled(motion.tr)`
    &:last-child > td {
        border-bottom: none;
    }
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    margin: 0 5px;
    &:hover {
        color: ${props => props.$danger ? 'var(--red-color)' : 'var(--primary-color)'};
    }
`;

const ProductImage = styled.img`
    width: 50px;
    height: 50px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid var(--border-color);
`;

const StockStatus = styled.span`
    font-weight: 600;
    color: ${props => props.$lowStock ? 'var(--orange-color)' : 'inherit'};
`;

const EmptyStateContainer = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: var(--text-secondary);
    background-color: var(--bg-surface);
    border-radius: 16px;
    border: 1px dashed var(--border-color);
`;

const EmptyStateTitle = styled.h3`
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 20px;
    margin-bottom: 10px;
`;

const tableRowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.05,
        },
    }),
};
// --- Akhir Styled Components ---

function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await getProducts();
            setProducts(res.data);
        } catch (error) {
            toast.error("Gagal memuat data produk.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const openDeleteConfirmation = (product) => {
        setProductToDelete(product);
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        try {
            await toast.promise(
                deleteProduct(productToDelete.id),
                {
                    pending: 'Menghapus produk...',
                    success: 'Produk berhasil dihapus!',
                    error: (err) => err.response?.data?.message || 'Gagal menghapus produk.'
                }
            );
            fetchProducts();
        } catch (error) {
            console.error("Delete product error:", error);
        } finally {
            setIsConfirmOpen(false);
            setProductToDelete(null);
        }
    };

    return (
        <>
            <PageWrapper loading={loading}>
                <PageContent>
                    <PageHeader>
                        <Title><FiBox/> Daftar Produk</Title>
                        <AddButton onClick={() => navigate('/products/new')}>
                            <FiPlus size={18} /> Tambah Produk
                        </AddButton>
                    </PageHeader>
                    
                    {products.length > 0 ? (
                        <TableContainer>
                            <TableWrapper>
                                <Table>
                                    <thead>
                                        <tr>
                                            <Th>Gambar</Th>
                                            <Th>Nama Produk</Th>
                                            <Th>Kategori</Th>
                                            <Th>Stok</Th>
                                            <Th>Harga</Th>
                                            <Th style={{ textAlign: 'center' }}>Aksi</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product, i) => (
                                            <Tr key={product.id} custom={i} initial="hidden" animate="visible" variants={tableRowVariants}>
                                                <Td>
                                                    <ProductImage src={product.image_url || `https://placehold.co/100`} alt={product.name} />
                                                </Td>
                                                <Td>{product.name}</Td>
                                                <Td>{product.category_name || '-'}</Td>
                                                <Td>
                                                    <StockStatus $lowStock={product.stock <= product.low_stock_threshold}>
                                                        {product.stock}
                                                    </StockStatus>
                                                </Td>
                                                <Td>
                                                    {product.variants.length > 1
                                                        ? `${new Intl.NumberFormat('id-ID').format(product.variants[0].price)} (Varian)`
                                                        : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.variants[0]?.price || 0)}
                                                </Td>
                                                <Td style={{ textAlign: 'center' }}>
                                                    <ActionButton onClick={() => navigate(`/products/edit/${product.id}`)}>
                                                        <FiEdit size={18} />
                                                    </ActionButton>
                                                    <ActionButton $danger onClick={() => openDeleteConfirmation(product)}>
                                                        <FiTrash2 size={18} />
                                                    </ActionButton>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </TableWrapper>
                        </TableContainer>
                    ) : (
                        <EmptyStateContainer>
                            <FiBox size={48} />
                            <EmptyStateTitle>Belum Ada Produk</EmptyStateTitle>
                            <p>Klik tombol di pojok kanan atas untuk menambahkan produk pertama Anda.</p>
                        </EmptyStateContainer>
                    )}
                </PageContent>
            </PageWrapper>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Konfirmasi Penghapusan"
                message={`Apakah Anda yakin ingin menghapus produk "${productToDelete?.name}"? Aksi ini akan mengarsipkan produk.`}
            />
        </>
    );
}

export default ProductsPage;