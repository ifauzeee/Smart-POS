// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\ReceiveStockPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getProducts, receiveStock } from '../services/api';
import { toast } from 'react-toastify';
import { FiSave, FiSearch, FiPlusCircle, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';

const PageContainer = styled.div` padding: 30px; max-width: 1000px; margin: 0 auto; `;
const PageHeader = styled.header` display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; `;
const Title = styled.h1` font-size: 1.8rem; `;
const BackButton = styled.button` background-color: var(--bg-surface); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 18px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; &:hover { background-color: var(--bg-main); } `;
const MainGrid = styled.div` display: grid; grid-template-columns: 1fr 1.5fr; gap: 30px; @media (max-width: 768px) { grid-template-columns: 1fr; }`;
const Panel = styled.div` background-color: var(--bg-surface); border-radius: 16px; border: 1px solid var(--border-color); padding: 25px; height: 70vh; display: flex; flex-direction: column; `;
const PanelTitle = styled.h2` font-size: 1.2rem; font-weight: 600; margin: 0 0 20px 0; padding-bottom: 20px; border-bottom: 1px solid var(--border-color); `;
const SearchInput = styled.input` width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 15px; background-color: var(--bg-main); color: var(--text-primary); &::placeholder { color: var(--text-placeholder); opacity: 0.8; } &:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 98, 0, 234), 0.2); } `;
const ProductList = styled.ul` list-style: none; padding: 0; overflow-y: auto; flex-grow: 1; `;
const ListItem = styled.li` display: flex; justify-content: space-between; align-items: center; padding: 12px; border-radius: 8px; cursor: pointer; background-color: ${props => props.$isSelected ? 'var(--primary-color)15' : 'transparent'}; &:hover { background-color: var(--bg-main); } `;
const Form = styled.form` display: flex; flex-direction: column; height: 100%; `;
const ReceiveListTable = styled.table` width: 100%; border-collapse: collapse; `;
const Th = styled.th` text-align: left; padding-bottom: 10px; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); `;
const Td = styled.td` padding: 10px 0; vertical-align: middle; `;
const QuantityInput = styled.input` width: 80px; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); text-align: center; background-color: var(--bg-main); color: var(--text-primary); &:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 98, 0, 234), 0.2); } `;
const SaveButton = styled.button` background-color: var(--primary-color); color: white; border: none; border-radius: 8px; padding: 12px 25px; font-weight: 600; cursor: pointer; align-self: flex-end; margin-top: auto; &:disabled { opacity: 0.5; cursor: not-allowed; } &:hover:not(:disabled) { background-color: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); } `;

function ReceiveStockPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [receiveList, setReceiveList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [poContext, setPoContext] = useState(null);

    useEffect(() => {
        const fetchAndPrepareData = async () => {
            setLoading(true);
            try {
                const res = await getProducts();
                const productsData = res.data;
                setAllProducts(productsData);
                setFilteredProducts(productsData);

                if (location.state?.poItems) {
                    const { poItems, poId, poNumber } = location.state;
                    setPoContext({ id: poId, number: poNumber });

                    const listFromPO = poItems.map(item => {
                        const productDetails = productsData.find(p => p.id === item.product_id);
                        return {
                            ...productDetails,
                            id: item.product_id,
                            name: productDetails ? productDetails.name : `Produk ID ${item.product_id}`,
                            quantityToAdd: item.quantity
                        };
                    });
                    setReceiveList(listFromPO);
                    if (poNumber) {
                        toast.info(`Mengisi item dari PO #${poNumber}`);
                    }
                }
            } catch (error) {
                toast.error("Gagal memuat produk.");
            } finally {
                setLoading(false);
            }
        };
        fetchAndPrepareData();
    }, [location.state]);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setFilteredProducts(allProducts.filter(p => p.name.toLowerCase().includes(term)));
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
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const itemsToSubmit = receiveList
            .filter(item => item.quantityToAdd > 0)
            .map(item => ({
                productId: parseInt(item.id, 10),
                quantity: parseInt(item.quantityToAdd, 10)
            }));

        if (itemsToSubmit.length === 0) {
            toast.warn("Tidak ada stok untuk ditambahkan. Isi kuantitas minimal 1.");
            return;
        }

        setIsSubmitting(true);
        
        const submissionData = {
            items: itemsToSubmit,
            purchase_order_id: poContext ? parseInt(poContext.id, 10) : null,
        };

        try {
            await toast.promise(
                receiveStock(submissionData),
                {
                    pending: 'Menyimpan stok...',
                    success: 'Stok berhasil diperbarui!',
                    error: (err) => {
                        const errorData = err.data?.errors?.[0];
                        if (errorData) {
                            return `Validasi Gagal: ${errorData.msg} di kolom '${errorData.path}'`;
                        }
                        return err.data?.message || 'Gagal memperbarui stok.';
                    }
                }
            );

            if (poContext) {
                navigate(`/purchase-orders/${poContext.id}`);
            } else {
                navigate('/products');
            }
        } catch (error) {
            console.error("Submit error in ReceiveStockPage:", error.data || error); 
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <Title>{poContext ? `Terima Stok untuk PO #${poContext.number}` : 'Terima Stok Barang'}</Title>
                <BackButton onClick={() => navigate(poContext ? `/purchase-orders/${poContext.id}` : '/quick-actions')}>
                    <FiArrowLeft size={18} /> Kembali
                </BackButton>
            </PageHeader>
            <MainGrid>
                <Panel>
                    <PanelTitle>Pilih Produk</PanelTitle>
                    <SearchInput placeholder="Cari produk..." onChange={handleSearch} />
                    {loading ? <Skeleton count={10} /> : (
                        <ProductList>
                            {filteredProducts.map(p => (
                                <ListItem key={p.id} onClick={() => addProductToReceiveList(p)} $isSelected={receiveList.some(item => item.id === p.id)}>
                                    <span>{p.name} <small>(Stok: {p.stock})</small></span>
                                    <button style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)'}}>
                                        <FiPlusCircle size={20} />
                                    </button>
                                </ListItem>
                            ))}
                        </ProductList>
                    )}
                </Panel>
                <Panel>
                    <PanelTitle>Daftar Penerimaan</PanelTitle>
                    <Form onSubmit={handleSubmit}>
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
                                                    min="0"
                                                    value={item.quantityToAdd}
                                                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                />
                                            </Td>
                                            <Td>
                                                <button type="button" onClick={() => removeFromReceiveList(item.id)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red-color)'}}>
                                                    <FiTrash2 />
                                                </button>
                                            </Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </ReceiveListTable>
                        </div>
                        {receiveList.length > 0 && (
                            <SaveButton type="submit" disabled={isSubmitting}>
                                <FiSave /> {isSubmitting ? 'Menyimpan...' : 'Simpan Stok Diterima'}
                            </SaveButton>
                        )}
                    </Form>
                </Panel>
            </MainGrid>
        </PageContainer>
    );
}

export default ReceiveStockPage;