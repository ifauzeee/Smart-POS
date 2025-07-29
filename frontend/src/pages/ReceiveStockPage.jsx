// frontend/src/pages/ReceiveStockPage.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getProducts, receiveStock } from '../services/api';
import { toast } from 'react-toastify';
import { FiSave, FiSearch, FiPlusCircle, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
const PageContainer = styled.div`
    padding: 30px;
    max-width: 1000px;
    margin: 0 auto;
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

const BackButton = styled.button`
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

const MainGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
`;

const Panel = styled.div`
    background-color: var(--bg-surface);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    padding: 25px;
    height: 65vh;
    display: flex;
    flex-direction: column;
`;

const PanelTitle = styled.h2`
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 20px 0;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    margin-bottom: 15px;
    background-color: var(--bg-main); /* Sinkron dengan theme */
    color: var(--text-primary); /* Sinkron dengan theme */

    &::placeholder {
        color: var(--text-placeholder); /* Sinkron dengan theme */
        opacity: 0.8; /* Sedikit transparansi untuk placeholder */
    }

    &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 98, 0, 234), 0.2);
    }
`;

const ProductList = styled.ul`
    list-style: none;
    padding: 0;
    overflow-y: auto;
    flex-grow: 1;
`;

const ListItem = styled.li`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-radius: 8px;
    &:hover { background-color: var(--bg-main); }
`;

const AddButton = styled.button`
    background: none; border: none; cursor: pointer;
    color: var(--primary-color);
`;
const ReceiveListTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    flex-grow: 1;
`;
const Th = styled.th`
    text-align: left;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-secondary);
`;
const Td = styled.td`
    padding: 10px 0;
    vertical-align: middle;
`;
const QuantityInput = styled.input`
    width: 80px;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    text-align: center;
`;
const SaveButton = styled.button`
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 25px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 20px;
    float: right;
    &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
function ReceiveStockPage() {
    const navigate = useNavigate();
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [receiveList, setReceiveList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const res = await getProducts();
                setAllProducts(res.data);
                setFilteredProducts(res.data);
            } catch (error) {
                toast.error("Gagal memuat produk.");
            } finally {
                setLoading(false);
            }
        };
        fetchAllProducts();
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setFilteredProducts(
            allProducts.filter(p => p.name.toLowerCase().includes(term))
        );
    };
    const addProductToReceiveList = (product) => {
        if (receiveList.some(item => item.id === product.id)) {
            toast.warn("Produk sudah ada di dalam daftar penerimaan.");
            return;
        }
        setReceiveList([...receiveList, { ...product, quantityToAdd: 1 }]);
    };

    const handleQuantityChange = (productId, quantity) => {
        setReceiveList(
            receiveList.map(item =>
                item.id === productId ? { ...item, quantityToAdd: parseInt(quantity, 10) || 0 } : item
            )
        );
    };

    const removeFromReceiveList = (productId) => {
        setReceiveList(receiveList.filter(item => item.id !== productId));
    };

    const handleSubmit = async () => {
        const itemsToSubmit = receiveList
            .filter(item => item.quantityToAdd > 0)
            .map(item => ({ productId: item.id, quantity: item.quantityToAdd }));

        if (itemsToSubmit.length === 0) {
            toast.warn("Tidak ada stok untuk ditambahkan. Isi kuantitas minimal 1.");
            return;
        }

        setIsSubmitting(true);
        try {
            await toast.promise(
                receiveStock({ items: itemsToSubmit }),
                {
                    pending: 'Menyimpan stok...',
                    success: 'Stok berhasil diperbarui!',
                    error: 'Gagal memperbarui stok.'
                }
            );
            setReceiveList([]);
            const res = await getProducts();
            setAllProducts(res.data);
            setFilteredProducts(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <PageContainer>
            <PageHeader>
                <Title>Terima Stok Barang</Title>
                <BackButton onClick={() => navigate('/dashboard')}>
                    <FiArrowLeft size={18} /> Kembali ke Dashboard
                </BackButton>
            </PageHeader>
            <MainGrid>
                <Panel>
                    <PanelTitle>Daftar Produk</PanelTitle>
                    <SearchInput placeholder="Cari produk..." onChange={handleSearch} />
                    {loading ? <Skeleton count={8} /> : (
                        <ProductList>
                            {filteredProducts.map(p => (
                                <ListItem key={p.id}>
                                    <span>{p.name} <small>(Stok: {p.stock})</small></span>
                                    <AddButton onClick={() => addProductToReceiveList(p)}>
                                        <FiPlusCircle size={20} />
                                    </AddButton>
                                </ListItem>
                            ))}
                        </ProductList>
                    )}
                </Panel>
                <Panel>
                    <PanelTitle>Daftar Penerimaan</PanelTitle>
                    <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                        <ReceiveListTable>
                            <thead>
                                <tr>
                                    <Th>Produk</Th>
                                    <Th>Jumlah Tambah</Th>
                                    <Th>Aksi</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {receiveList.map(item => (
                                    <tr key={item.id}>
                                        <Td>{item.name}</Td>
                                        <Td>
                                            <QuantityInput
                                                type="number"
                                                min="1"
                                                value={item.quantityToAdd}
                                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                            />
                                        </Td>
                                        <Td>
                                            <AddButton onClick={() => removeFromReceiveList(item.id)}>
                                                <FiTrash2 />
                                            </AddButton>
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </ReceiveListTable>
                    </div>
                    {receiveList.length > 0 && (
                        <SaveButton onClick={handleSubmit} disabled={isSubmitting}>
                            <FiSave /> {isSubmitting ? 'Menyimpan...' : 'Simpan Stok Diterima'}
                        </SaveButton>
                    )}
                </Panel>
            </MainGrid>
        </PageContainer>
    );
}

export default ReceiveStockPage;