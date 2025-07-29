// frontend/src/pages/StockAdjustmentPage.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getProducts, adjustStock } from '../services/api';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSave, FiSearch } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';

// --- Styled Components ---
const PageContainer = styled.div`
    padding: 30px;
    max-width: 1200px;
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
    background-color: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    &:hover {
        background-color: var(--bg-main);
    }
`;

const MainGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 30px;
`;

const Panel = styled.div`
    background-color: var(--bg-surface);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    padding: 25px;
    height: 70vh;
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
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    background-color: ${props => props.$isSelected ? 'var(--primary-color)15' : 'transparent'};
    &:hover {
        background-color: var(--bg-main);
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const InputGroup = styled.div``;

const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    font-size: 0.9rem;
    color: var(--text-secondary);
`;

const Input = styled.input`
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--bg-main);
    color: var(--text-primary);
    font-size: 1rem;
`;
const Select = styled.select`
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--bg-main);
    color: var(--text-primary);
    font-size: 1rem;
`;

const SaveButton = styled.button`
    padding: 12px 25px;
    border-radius: 8px;
    border: none;
    background-color: var(--primary-color);
    color: white;
    font-weight: 600;
    cursor: pointer;
    align-self: flex-end;
    margin-top: 10px;
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

function StockAdjustmentPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({ newStockQuantity: '', type: 'adjustment', reason: '' });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const res = await getProducts();
                setProducts(res.data);
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
        setFilteredProducts(products.filter(p => p.name.toLowerCase().includes(term)));
    };

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setFormData({ newStockQuantity: product.stock, type: 'adjustment', reason: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProduct) return toast.warn("Pilih produk terlebih dahulu.");
        if (formData.newStockQuantity === '' || isNaN(formData.newStockQuantity)) return toast.error("Jumlah stok baru harus berupa angka.");

        setIsSubmitting(true);
        const dataToSend = {
            productId: selectedProduct.id,
            newStockQuantity: parseInt(formData.newStockQuantity, 10),
            type: formData.type,
            reason: formData.reason,
        };

        try {
            await toast.promise(adjustStock(dataToSend), {
                pending: 'Menyimpan penyesuaian stok...',
                success: 'Stok berhasil diperbarui!',
                error: 'Gagal memperbarui stok.'
            });
            // Reset state & refresh data
            setSelectedProduct(null);
            setFormData({ newStockQuantity: '', type: 'adjustment', reason: '' });
            const res = await getProducts();
            setProducts(res.data);
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
                <Title>Penyesuaian Stok</Title>
                <BackButton onClick={() => navigate('/dashboard')}><FiArrowLeft size={18} /> Kembali</BackButton>
            </PageHeader>
            <MainGrid>
                <Panel>
                    <PanelTitle>Pilih Produk</PanelTitle>
                    <SearchInput placeholder="Cari produk..." onChange={handleSearch} />
                    {loading ? <Skeleton count={10} /> : (
                        <ProductList>
                            {filteredProducts.map(p => (
                                <ListItem key={p.id} onClick={() => handleSelectProduct(p)} $isSelected={selectedProduct?.id === p.id}>
                                    <span>{p.name}</span>
                                    <strong>Stok: {p.stock}</strong>
                                </ListItem>
                            ))}
                        </ProductList>
                    )}
                </Panel>
                <Panel>
                    <PanelTitle>Detail Penyesuaian</PanelTitle>
                    {selectedProduct ? (
                        <Form onSubmit={handleSubmit}>
                            <h3>{selectedProduct.name}</h3>
                            <p>Stok saat ini di sistem: <strong>{selectedProduct.stock}</strong></p>
                            <InputGroup>
                                <Label>Tipe Penyesuaian</Label>
                                <Select name="type" value={formData.type} onChange={handleChange}>
                                    <option value="adjustment">Stok Opname / Penyesuaian</option>
                                    <option value="damage">Barang Rusak</option>
                                    <option value="return">Retur Barang</option>
                                    <option value="other">Lainnya</option>
                                </Select>
                            </InputGroup>
                            <InputGroup>
                                <Label>Jumlah Stok Fisik Baru</Label>
                                <Input type="number" name="newStockQuantity" value={formData.newStockQuantity} onChange={handleChange} required />
                            </InputGroup>
                            <InputGroup>
                                <Label>Alasan/Catatan (Opsional)</Label>
                                <Input as="textarea" rows="3" name="reason" value={formData.reason} onChange={handleChange} />
                            </InputGroup>
                            <SaveButton type="submit" disabled={isSubmitting}>
                                <FiSave /> {isSubmitting ? 'Menyimpan...' : 'Simpan Penyesuaian'}
                            </SaveButton>
                        </Form>
                    ) : (
                        <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <p>Silakan pilih produk dari daftar di sebelah kiri untuk melakukan penyesuaian stok.</p>
                        </div>
                    )}
                </Panel>
            </MainGrid>
        </PageContainer>
    );
}

export default StockAdjustmentPage;