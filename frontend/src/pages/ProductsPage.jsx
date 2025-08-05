// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\ProductsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getProducts, deleteProduct } from '../services/api';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { FiPackage, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ConfirmationModal from '../components/ConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';

// --- Styled Components dengan Perbaikan UI dan Responsif ---
const PageContainer = styled.div`
    padding: 30px;
    height: 100%;
    display: flex;
    flex-direction: column;
    
    @media (max-width: 768px) {
        padding: 15px;
    }
`;

const PageHeader = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 15px;
`;

const Title = styled.h1`
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    gap: 12px;
`;

const AddButton = styled(Link)`
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
    text-decoration: none;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: var(--primary-hover);
    }
`;

const ContentContainer = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-surface);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    overflow: hidden;
`;

// --- DESKTOP TABLE STYLES ---
const TableWrapper = styled.div`
    display: none;
    @media (min-width: 769px) {
        display: block;
        overflow-x: auto;
        flex-grow: 1;
        &::-webkit-scrollbar { display: none; }
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
`;
const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    min-width: 900px;
`;
const Th = styled.th`
    text-align: left;
    padding: 15px 20px;
    background-color: var(--bg-main);
    border-bottom: 1px solid var(--border-color);
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.9rem;
    white-space: nowrap;
    text-transform: uppercase;
`;
const Td = styled.td`
    text-align: left;
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
const ProductImage = styled.img`
    width: 50px;
    height: 50px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid var(--border-color);
`;
const StockStatus = styled.span`
    font-weight: 600;
    color: ${props => props.$lowStock ? 'var(--red-color)' : 'inherit'};
`;
const ActionButtons = styled.div`
    display: flex;
    gap: 5px;
    align-items: center;
`;
const ActionButton = styled(Link)`
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 5px;
    display: flex;
    align-items: center;
    transition: color 0.2s ease;

    &:hover {
        color: var(--primary-color);
    }
`;
const DeleteButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 5px;
    display: flex;
    align-items: center;
    transition: color 0.2s ease;

    &:hover {
        color: var(--red-color);
    }
`;

// --- MOBILE CARD STYLES ---
const CardList = styled(motion.div)`
    display: none;
    @media (max-width: 768px) {
        display: flex;
        flex-direction: column;
        gap: 15px;
        padding: 15px;
    }
`;
const ProductCard = styled(motion.div)`
    background-color: var(--bg-main);
    border-radius: 12px;
    border: 1px solid var(--border-color);
    padding: 15px;
    display: flex;
    gap: 15px;
    align-items: center;
`;
const CardImage = styled.img`
    width: 60px;
    height: 60px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
`;
const CardContent = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;
const CardTitle = styled.h3`
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 5px 0;
    color: var(--text-primary);
`;
const CardDetail = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    color: var(--text-secondary);
`;
const CardStock = styled.span`
    font-weight: 500;
    color: ${props => props.$lowStock ? 'var(--red-color)' : 'var(--green-color)'};
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

// --- ANIMATION VARIANTS ---
const tableRowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.05,
        },
    }),
};

// --- HELPER FUNCTION ---
const formatCurrency = (value) => `Rp ${new Intl.NumberFormat('id-ID').format(value || 0)}`;

function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getProducts();
            setProducts(res.data);
        } catch (error) {
            toast.error("Gagal memuat data produk.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

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
    
    const getPriceRange = (variants) => {
        if (!variants || variants.length === 0) return 'Tidak tersedia';
        const prices = variants.map(v => parseFloat(v.price));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        if (minPrice === maxPrice) return formatCurrency(minPrice);
        return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
    };


    const renderTable = () => (
        <TableWrapper>
            <Table>
                <thead>
                    <tr>
                        <Th>Gambar</Th>
                        <Th>Nama Produk</Th>
                        <Th>Kategori</Th>
                        <Th>Pemasok</Th>
                        <Th>Stok</Th>
                        <Th>Harga</Th>
                        <Th>Aksi</Th>
                    </tr>
                </thead>
                <tbody>
                    <AnimatePresence>
                        {products.map((product, i) => (
                            <Tr key={product.id} custom={i} initial="hidden" animate="visible" variants={tableRowVariants}>
                                <Td><ProductImage src={product.image_url || `https://placehold.co/100`} alt={product.name} /></Td>
                                <Td>{product.name}</Td>
                                <Td>{product.category_name || '-'}</Td>
                                <Td>{product.supplier_name || '-'}</Td>
                                <Td><StockStatus $lowStock={product.stock <= (product.low_stock_threshold || 0)}>{product.stock}</StockStatus></Td>
                                <Td>{getPriceRange(product.variants)}</Td>
                                <Td>
                                    <ActionButtons>
                                        <ActionButton to={`/products/edit/${product.id}`}><FiEdit size={18} /></ActionButton>
                                        <DeleteButton onClick={() => openDeleteConfirmation(product)}><FiTrash2 size={18} /></DeleteButton>
                                    </ActionButtons>
                                </Td>
                            </Tr>
                        ))}
                    </AnimatePresence>
                </tbody>
            </Table>
        </TableWrapper>
    );

    const renderCards = () => (
        <CardList>
            <AnimatePresence>
                {products.map((product, i) => (
                    <ProductCard key={product.id} custom={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        <CardImage src={product.image_url || `https://placehold.co/100`} alt={product.name} />
                        <CardContent>
                            <CardTitle>{product.name}</CardTitle>
                            <CardDetail>
                                <span>Kategori: {product.category_name || '-'}</span>
                                <ActionButtons>
                                    <ActionButton to={`/products/edit/${product.id}`}><FiEdit size={16} /></ActionButton>
                                    <DeleteButton onClick={() => openDeleteConfirmation(product)}><FiTrash2 size={16} /></DeleteButton>
                                </ActionButtons>
                            </CardDetail>
                            <CardDetail>
                                <span>Harga: {getPriceRange(product.variants)}</span>
                                <span>Stok: <CardStock $lowStock={product.stock <= (product.low_stock_threshold || 0)}>{product.stock}</CardStock></span>
                            </CardDetail>
                        </CardContent>
                    </ProductCard>
                ))}
            </AnimatePresence>
        </CardList>
    );

    return (
        <>
            <PageWrapper loading={loading}>
                <PageContainer>
                    <PageHeader>
                        <Title><FiPackage /> Produk</Title>
                        <AddButton to="/products/new">
                            <FiPlus size={18} /> Tambah Produk
                        </AddButton>
                    </PageHeader>
                    
                    {loading ? (
                        <ContentContainer>
                            <div style={{ padding: '20px' }}>
                                <Skeleton height={50} count={5} style={{ marginBottom: '10px' }} />
                            </div>
                        </ContentContainer>
                    ) : products.length > 0 ? (
                        <ContentContainer>
                            {renderTable()}
                            {renderCards()}
                        </ContentContainer>
                    ) : (
                        <EmptyStateContainer>
                            <FiPackage size={48} />
                            <EmptyStateTitle>Belum Ada Produk</EmptyStateTitle>
                            <p>Klik tombol di pojok kanan atas untuk menambahkan produk pertama Anda.</p>
                        </EmptyStateContainer>
                    )}
                </PageContainer>
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