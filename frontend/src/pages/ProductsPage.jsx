import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../services/api';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiPackage } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// --- Styled Components (tidak ada perubahan) ---
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
const AddButton = styled.button`
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
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
    flex-grow: 1;
    display: flex;
    flex-direction: column;
`;
const TableWrapper = styled.div`
    overflow-x: auto;
    flex-grow: 1;
`;
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
const Tr = styled.tr`
    &:last-child {
        ${Td} {
            border-bottom: none;
        }
    }
`;
const ActionButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    margin-right: 15px;
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
const PriceRange = styled.span`
    display: block;
    font-size: 0.9rem;
`;
const StockTotal = styled.span`
    font-weight: 600;
    font-size: 1rem;
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


function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await getProducts();
            setProducts(res.data);
        } catch (error) {
            toast.error("Gagal memuat produk.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus produk ini? Semua variannya juga akan terhapus.')) {
            const promise = deleteProduct(id);
            toast.promise(promise, {
                pending: 'Menghapus produk...',
                success: 'Produk berhasil dihapus!',
                error: 'Gagal menghapus produk.'
            });
            try {
                await promise;
                fetchProducts();
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <Title>Manajemen Produk</Title>
                <AddButton onClick={() => navigate('/products/new')}>
                    <FiPlus /> Tambah Produk
                </AddButton>
            </PageHeader>

            {loading ? (
                <TableContainer>
                    <TableWrapper>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Gambar</Th>
                                    <Th>Nama Produk</Th>
                                    <Th>Harga</Th>
                                    <Th>Total Stok</Th>
                                    <Th>Aksi</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Tr key={index}>
                                        {[...Array(5)].map((_, i) => (
                                            <Td key={i}><Skeleton /></Td>
                                        ))}
                                    </Tr>
                                ))}
                            </tbody>
                        </Table>
                    </TableWrapper>
                </TableContainer>
            ) : products.length > 0 ? (
                <TableContainer>
                    <TableWrapper>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Gambar</Th>
                                    <Th>Nama Produk</Th>
                                    <Th>Harga</Th>
                                    <Th>Total Stok</Th>
                                    <Th>Aksi</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => {
                                    const prices = product.variants.map(v => v.price);
                                    // --- PERBAIKAN DI SINI ---
                                    // Ambil stok langsung dari produk, bukan dari varian lagi
                                    const totalStock = product.stock;

                                    return (
                                        <Tr key={product.id}>
                                            <Td>
                                                <ProductImage src={product.image_url || `https://placehold.co/100`} />
                                            </Td>
                                            <Td>{product.name}</Td>
                                            <Td>
                                                {prices.length > 0 ? (
                                                    <PriceRange>
                                                        Rp {new Intl.NumberFormat('id-ID').format(Math.min(...prices))} - Rp {new Intl.NumberFormat('id-ID').format(Math.max(...prices))}
                                                    </PriceRange>
                                                ) : 'N/A'}
                                            </Td>
                                            <Td>
                                                <StockTotal>{totalStock}</StockTotal>
                                            </Td>
                                            <Td>
                                                <ActionButton onClick={() => navigate(`/products/edit/${product.id}`)}>
                                                    <FiEdit size={18} />
                                                </ActionButton>
                                                <ActionButton $danger onClick={() => handleDeleteProduct(product.id)}>
                                                    <FiTrash2 size={18} />
                                                </ActionButton>
                                            </Td>
                                        </Tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </TableWrapper>
                </TableContainer>
            ) : (
                <EmptyStateContainer>
                    <FiPackage size={48} />
                    <EmptyStateTitle>Belum Ada Produk</EmptyStateTitle>
                    <p>Klik tombol di pojok kanan atas untuk menambahkan produk pertama Anda.</p>
                </EmptyStateContainer>
            )}
        </PageContainer>
    );
}

export default ProductsPage;