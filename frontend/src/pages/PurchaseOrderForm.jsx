// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\PurchaseOrderForm.jsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { getSuppliers, getProducts, createPurchaseOrder } from '../services/api';
import { toast } from 'react-toastify';
import { FiSave, FiPlus, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import { formatRupiah, parseRupiah } from '../utils/formatters'; // <-- PERBAIKAN: Impor formatter

// --- Styled Components (Tidak Ada Perubahan) ---
const PageContainer = styled.div` padding: 30px; max-width: 1000px; margin: 0 auto; `;
const PageHeader = styled.header` display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; `;
const Title = styled.h1` font-size: 1.8rem; `;
const BackLink = styled(Link)` display: inline-flex; align-items: center; gap: 8px; color: var(--text-secondary); text-decoration: none; margin-bottom: 20px; font-weight: 500; &:hover { color: var(--text-primary); } `;
const Form = styled.form` background-color: var(--bg-surface); border-radius: 16px; border: 1px solid var(--border-color); padding: 25px; `;
const FormGrid = styled.div` display: grid; grid-template-columns: 1fr 2fr; gap: 20px; margin-bottom: 20px; @media (max-width: 768px) { grid-template-columns: 1fr; }`;
const InputGroup = styled.div``;
const Label = styled.label` display: block; margin-bottom: 8px; font-weight: 500; font-size: 0.9rem; color: var(--text-secondary); `;
const Select = styled.select` width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--bg-main); color: var(--text-primary); font-size: 1rem; `;
const Input = styled.input` width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--bg-main); color: var(--text-primary); font-size: 1rem; `;
const ItemsSection = styled.div` border-top: 1px solid var(--border-color); margin-top: 20px; padding-top: 20px; `;
const AddProductButton = styled.button` display: flex; align-items: center; gap: 8px; background-color: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: 500; margin-top: 10px; &:hover { background-color: var(--primary-color); color: white; }`;
const Table = styled.table` width: 100%; border-collapse: collapse; margin-top: 20px; `;
const Th = styled.th` text-align: left; padding: 12px; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); `;
const Td = styled.td` padding: 12px; border-bottom: 1px solid var(--border-color); vertical-align: middle; `;
const FormFooter = styled.div` padding-top: 25px; margin-top: 25px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; `;
const SaveButton = styled.button` background-color: var(--primary-color); color: white; border: none; border-radius: 8px; padding: 12px 25px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; &:hover { opacity: 0.9; } &:disabled { opacity: 0.5; cursor: not-allowed; } `;

// --- Simple Modal for Product Selection ---
const ModalBackdrop = styled.div` position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; justify-content: center; align-items: center; `;
const ModalContainer = styled.div` background: var(--bg-surface); padding: 20px; border-radius: 12px; width: 90%; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column; `;
const ProductSearchInput = styled(Input)` margin-bottom: 15px; `;
const ProductSelectionList = styled.ul` list-style: none; padding: 0; overflow-y: auto; `;
const ProductListItem = styled.li` padding: 10px; border-radius: 6px; cursor: pointer; &:hover { background-color: var(--bg-main); } `;

function PurchaseOrderForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ supplier_id: '', notes: '', items: [] });
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productSearchTerm, setProductSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [suppliersRes, productsRes] = await Promise.all([getSuppliers(), getProducts()]);
                setSuppliers(suppliersRes.data);
                setProducts(productsRes.data);
            } catch (error) {
                toast.error("Gagal memuat data pemasok atau produk.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- PERBAIKAN: Terapkan formatter pada input harga beli ---
    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        if (field === 'cost_price') {
            newItems[index][field] = parseRupiah(value);
        } else {
            newItems[index][field] = value;
        }
        setFormData({ ...formData, items: newItems });
    };
    // --- AKHIR PERBAIKAN ---

    const addProductToPO = (product) => {
        if (formData.items.some(item => item.product_id === product.id)) {
            toast.warn("Produk sudah ada di dalam daftar.");
            return;
        }
        const defaultVariant = product.variants[0];
        const newItem = {
            product_id: product.id,
            name: product.name,
            quantity: 1,
            cost_price: defaultVariant ? defaultVariant.cost_price : 0,
        };
        setFormData({ ...formData, items: [...formData.items, newItem] });
        setIsProductModalOpen(false);
        setProductSearchTerm('');
    };

    const removeItemFromPO = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await toast.promise(createPurchaseOrder(formData), {
                pending: 'Menyimpan Purchase Order...',
                success: 'Purchase Order berhasil dibuat!',
                error: (err) => err.response?.data?.message || 'Gagal menyimpan PO.',
            });
            navigate('/purchase-orders');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredProductsForModal = products.filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase()));

    if (loading) return <PageContainer><Skeleton height={400} /></PageContainer>;

    return (
        <>
            <PageContainer>
                <BackLink to="/purchase-orders"><FiArrowLeft /> Kembali ke Daftar PO</BackLink>
                <PageHeader><Title>Buat Purchase Order Baru</Title></PageHeader>
                <Form onSubmit={handleSubmit}>
                    <FormGrid>
                        <InputGroup>
                            <Label>Pilih Pemasok</Label>
                            <Select name="supplier_id" value={formData.supplier_id} onChange={handleFormChange} required>
                                <option value="">-- Pilih Pemasok --</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </Select>
                        </InputGroup>
                        <InputGroup>
                            <Label>Catatan (Opsional)</Label>
                            <Input as="textarea" name="notes" value={formData.notes} onChange={handleFormChange} rows="3" />
                        </InputGroup>
                    </FormGrid>
                    <ItemsSection>
                        <Label style={{ fontSize: '1.1rem', fontWeight: 600 }}>Item Produk</Label>
                        {formData.items.length > 0 && (
                            <Table>
                                <thead>
                                    <tr>
                                        <Th style={{ width: '40%' }}>Produk</Th>
                                        <Th style={{ width: '20%' }}>Kuantitas</Th>
                                        <Th style={{ width: '25%' }}>Harga Beli (Rp)</Th>
                                        <Th style={{ width: '15%' }}>Aksi</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.items.map((item, index) => (
                                        <tr key={index}>
                                            <Td>{item.name}</Td>
                                            <Td><Input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} /></Td>
                                            {/* --- PERBAIKAN: Terapkan formatter pada input harga beli --- */}
                                            <Td>
                                                <Input
                                                    type="text"
                                                    value={formatRupiah(item.cost_price)}
                                                    onChange={(e) => handleItemChange(index, 'cost_price', e.target.value)}
                                                />
                                            </Td>
                                            {/* --- AKHIR PERBAIKAN --- */}
                                            <Td><button type="button" onClick={() => removeItemFromPO(index)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red-color)'}}><FiTrash2 /></button></Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                        <AddProductButton type="button" onClick={() => setIsProductModalOpen(true)}>
                            <FiPlus /> Tambah Produk
                        </AddProductButton>
                    </ItemsSection>
                    <FormFooter>
                        <SaveButton type="submit" disabled={isSubmitting || formData.items.length === 0 || !formData.supplier_id}>
                            <FiSave /> {isSubmitting ? 'Menyimpan...' : 'Simpan Purchase Order'}
                        </SaveButton>
                    </FormFooter>
                </Form>
            </PageContainer>

            {isProductModalOpen && (
                <ModalBackdrop onClick={() => setIsProductModalOpen(false)}>
                    <ModalContainer onClick={e => e.stopPropagation()}>
                        <h3 style={{marginBottom: '15px'}}>Pilih Produk</h3>
                        <ProductSearchInput placeholder="Cari produk..." value={productSearchTerm} onChange={(e) => setProductSearchTerm(e.target.value)} autoFocus />
                        <ProductSelectionList>
                            {filteredProductsForModal.map(p => (
                                <ProductListItem key={p.id} onClick={() => addProductToPO(p)}>
                                    {p.name}
                                </ProductListItem>
                            ))}
                        </ProductSelectionList>
                    </ModalContainer>
                </ModalBackdrop>
            )}
        </>
    );
}

export default PurchaseOrderForm;