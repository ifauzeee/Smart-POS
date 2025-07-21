import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import ProductFormModal from '../components/ProductFormModal';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';

const PageContainer = styled.div`
  padding: 30px;
`;

const PageHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
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
  &:hover { background-color: var(--primary-hover); }
`;

const TableContainer = styled.div`
  background-color: var(--bg-surface);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  overflow: hidden;
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
`;

const Td = styled.td`
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  margin-right: 15px;
  &:hover { color: ${props => props.danger ? 'var(--red-color)' : 'var(--primary-color)'}; }
`;

function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchProducts = async () => {
        const res = await getProducts();
        setProducts(res.data);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleOpenModal = (product = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSaveProduct = async (productData) => {
        const promise = editingProduct
            ? updateProduct(editingProduct.id, productData)
            : createProduct(productData);

        toast.promise(promise, {
            pending: 'Menyimpan produk...',
            success: 'Produk berhasil disimpan!',
            error: 'Gagal menyimpan produk.'
        });

        await promise;
        fetchProducts();
        handleCloseModal();
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            const promise = deleteProduct(id);
            toast.promise(promise, {
                pending: 'Menghapus produk...',
                success: 'Produk berhasil dihapus!',
                error: 'Gagal menghapus produk.'
            });
            await promise;
            fetchProducts();
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <Title>Manajemen Produk</Title>
                <AddButton onClick={() => handleOpenModal()}>
                    <FiPlus /> Tambah Produk
                </AddButton>
            </PageHeader>
            <TableContainer>
                <Table>
                    <thead>
                        <tr>
                            <Th>ID</Th>
                            <Th>Nama Produk</Th>
                            <Th>Kategori</Th>
                            <Th>Harga</Th>
                            <Th>Stok</Th>
                            <Th>Aksi</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <Td>{product.id}</Td>
                                <Td>{product.name}</Td>
                                <Td>{product.category}</Td>
                                <Td>Rp {new Intl.NumberFormat('id-ID').format(product.price)}</Td>
                                <Td>{product.stock}</Td>
                                <Td>
                                    <ActionButton onClick={() => handleOpenModal(product)}><FiEdit size={18} /></ActionButton>
                                    <ActionButton danger onClick={() => handleDeleteProduct(product.id)}><FiTrash2 size={18} /></ActionButton>
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </TableContainer>
            <ProductFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveProduct}
                product={editingProduct}
            />
        </PageContainer>
    );
}

export default ProductsPage;