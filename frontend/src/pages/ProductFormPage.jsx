// frontend/src/pages/ProductFormPage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { getCategories, getSubCategories, getSuppliers, getProductById, createProduct, updateProduct, uploadImage } from '../services/api';
import { toast } from 'react-toastify';
import { FiSave, FiPlus, FiTrash2, FiArrowLeft, FiUpload } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
// PERBAIKAN: Impor diubah untuk menggunakan alias
import { formatRupiah as formatCurrency, parseRupiah as parseCurrency } from '../utils/formatters';

// --- Styled Components ---
const PageContainer = styled.div` padding: 30px; max-width: 900px; margin: 0 auto; `;
const PageHeader = styled.header` display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; `;
const Title = styled.h1` font-size: 1.8rem; `;
const BackLink = styled(Link)` display: inline-flex; align-items: center; gap: 8px; color: var(--text-secondary); text-decoration: none; margin-bottom: 20px; font-weight: 500; &:hover { color: var(--text-primary); } `;
const Form = styled.form` background-color: var(--bg-surface); border-radius: 16px; border: 1px solid var(--border-color); padding: 25px; `;
const FormGrid = styled.div` display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px 20px; `;
const InputGroup = styled.div` grid-column: ${props => props.$fullWidth ? '1 / -1' : 'span 1'}; `;
const Label = styled.label` display: block; margin-bottom: 8px; font-weight: 500; font-size: 0.9rem; color: var(--text-secondary); `;
const Input = styled.input` width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--bg-main); color: var(--text-primary); font-size: 1rem; &[type="number"] { -moz-appearance: textfield; } &::-webkit-outer-spin-button, &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; } `;
const FileInputContainer = styled.div` display: flex; gap: 10px; align-items: center; width: 100%; `;
const UploadButton = styled.button` background-color: var(--primary-color); color: white; border: none; border-radius: 8px; padding: 12px 15px; font-weight: 600; display: flex; align-items: center; gap: 5px; cursor: pointer; flex-shrink: 0; &:hover { background-color: var(--primary-hover); } &:disabled { opacity: 0.5; cursor: not-allowed; } `;
const FileInput = styled.input` display: none; `;
const Select = styled.select` width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--bg-main); color: var(--text-primary); font-size: 1rem; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-size: 20px; &:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 98, 0, 234), 0.2); } `;
const VariantSection = styled.div` grid-column: 1 / -1; border-top: 1px solid var(--border-color); margin-top: 10px; padding-top: 20px; `;
const VariantRow = styled.div` display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr 50px; gap: 15px; align-items: center; margin-bottom: 10px; `;
const AddVariantButton = styled.button` display: flex; align-items: center; gap: 5px; background-color: var(--primary-color); color: white; padding: 8px 15px; border-radius: 8px; border: none; cursor: pointer; font-weight: 500; margin-top: 10px; &:hover { opacity: 0.9; } `;
const ActionButton = styled.button` background: none; border: none; cursor: pointer; color: var(--red-color); `;
const FormFooter = styled.div` padding-top: 25px; margin-top: 25px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; `;
const SaveButton = styled.button` background-color: var(--primary-color); color: white; border: none; border-radius: 8px; padding: 12px 25px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; &:hover { background-color: var(--primary-hover); } &:disabled { opacity: 0.5; cursor: not-allowed; } `;

function ProductFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
        sub_category_id: '',
        supplier_id: '',
        stock: 0,
        low_stock_threshold: 5,
        image_url: '',
        expiration_date: '',
        variants: [{ name: 'Reguler', price: '', cost_price: '', barcode: '' }]
    });

    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const fetchProductData = useCallback(async () => {
        if (isEditing) {
            try {
                const res = await getProductById(id);
                const product = res.data;
                if (product.category_id) {
                    const subCatRes = await getSubCategories(product.category_id);
                    setSubCategories(subCatRes.data);
                }
                setFormData({
                    name: product.name || '',
                    description: product.description || '',
                    category_id: product.category_id || '',
                    sub_category_id: product.sub_category_id || '',
                    supplier_id: product.supplier_id || '',
                    stock: product.stock || 0,
                    low_stock_threshold: product.low_stock_threshold || 5,
                    image_url: product.image_url || '',
                    expiration_date: product.expiration_date ? new Date(product.expiration_date).toISOString().split('T')[0] : '',
                    variants: product.variants && product.variants.length > 0
                        ? product.variants.map(v => ({
                            id: v.id,
                            name: v.name || '',
                            price: v.price !== undefined ? v.price : '',
                            cost_price: v.cost_price !== undefined ? v.cost_price : '',
                            barcode: v.barcode || '',
                          }))
                        : [{ name: 'Reguler', price: '', cost_price: '', barcode: '' }]
                });
            } catch (error) {
                console.error("Error fetching product data:", error);
                toast.error("Gagal memuat data produk. Mungkin produk tidak ditemukan.");
                navigate('/products');
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [id, isEditing, navigate]);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [catRes, supRes] = await Promise.all([getCategories(), getSuppliers()]);
                setCategories(catRes.data);
                setSuppliers(supRes.data);
            } catch (error) {
                toast.error("Gagal memuat data kategori atau pemasok.");
            }
        };
        fetchDropdownData();
        fetchProductData();
    }, [fetchProductData]);

    useEffect(() => {
        if (formData.category_id) {
            getSubCategories(formData.category_id)
                .then(res => setSubCategories(res.data))
                .catch(err => toast.error("Gagal memuat sub-kategori."));
        } else {
            setSubCategories([]);
        }
    }, [formData.category_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "category_id") {
            setFormData({ ...formData, category_id: value, sub_category_id: '' });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...formData.variants];
        if (field === 'price' || field === 'cost_price') {
            newVariants[index][field] = value === '' ? '' : parseCurrency(value);
        } else {
            newVariants[index][field] = value;
        }
        setFormData({ ...formData, variants: newVariants });
    };

    const addVariant = () => {
        setFormData({
            ...formData,
            variants: [...formData.variants, { name: '', price: '', cost_price: '', barcode: '' }]
        });
    };

    const removeVariant = (index) => {
        if (formData.variants.length <= 1) {
            toast.warn("Produk harus memiliki setidaknya satu varian.");
            return;
        }
        const newVariants = formData.variants.filter((_, i) => i !== index);
        setFormData({ ...formData, variants: newVariants });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFormData(prev => ({ ...prev, image_url: '' }));
            toast.info(`File dipilih: ${file.name}`);
        } else {
            setSelectedFile(null);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const validVariants = formData.variants.filter(v =>
            v.name &&
            v.price !== '' &&
            !isNaN(parseFloat(v.price)) &&
            v.cost_price !== '' &&
            !isNaN(parseFloat(v.cost_price))
        ).map(v => ({
            ...v,
            price: parseFloat(v.price),
            cost_price: parseFloat(v.cost_price),
        }));
        if (validVariants.length === 0) {
            toast.error('Setidaknya satu varian produk harus diisi lengkap (nama, harga beli, dan harga jual).');
            setIsSubmitting(false);
            return;
        }
        let imageUrlToSend = formData.image_url;
        if (selectedFile) {
            const formDataForUpload = new FormData();
            formDataForUpload.append('image', selectedFile);
            try {
                const uploadRes = await uploadImage(formDataForUpload);
                imageUrlToSend = uploadRes.data.url;
                toast.success("Gambar berhasil diunggah!");
            } catch (error) {
                console.error("Error uploading image:", error);
                toast.error("Gagal mengunggah gambar.");
                setIsSubmitting(false);
                return;
            }
        }
        const productData = {
            ...formData,
            image_url: imageUrlToSend,
            variants: validVariants,
            expiration_date: formData.expiration_date || null
        };
        const promise = isEditing
            ? updateProduct(id, productData)
            : createProduct(productData);
        try {
            await toast.promise(promise, {
                pending: 'Menyimpan produk...',
                success: 'Produk berhasil disimpan!',
                error: 'Gagal menyimpan produk.'
            });
            navigate('/products');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <PageContainer><Skeleton height={400} /></PageContainer>;
    }

    return (
        <PageContainer>
            <BackLink to="/products"><FiArrowLeft /> Kembali ke Daftar Produk</BackLink>
            <PageHeader>
                <Title>{isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}</Title>
            </PageHeader>
            <Form onSubmit={handleSubmit}>
                <FormGrid>
                    <InputGroup $fullWidth>
                        <Label>Nama Produk</Label>
                        <Input name="name" value={formData.name} onChange={handleChange} required autoFocus />
                    </InputGroup>
                    <InputGroup>
                        <Label>Kategori</Label>
                        <Select name="category_id" value={formData.category_id} onChange={handleChange}>
                            <option value="">-- Pilih Kategori --</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </Select>
                    </InputGroup>
                    <InputGroup>
                        <Label>Sub-Kategori</Label>
                        <Select name="sub_category_id" value={formData.sub_category_id} onChange={handleChange} disabled={subCategories.length === 0}>
                            <option value="">-- Pilih Sub-Kategori --</option>
                            {subCategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                        </Select>
                    </InputGroup>
                    <InputGroup>
                        <Label>Pemasok</Label>
                        <Select name="supplier_id" value={formData.supplier_id} onChange={handleChange}>
                            <option value="">-- Pilih Pemasok --</option>
                            {suppliers.map(sup => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
                        </Select>
                    </InputGroup>
                    <InputGroup>
                        <Label>Tanggal Kadaluarsa (Opsional)</Label>
                        <Input type="date" name="expiration_date" value={formData.expiration_date} onChange={handleChange} />
                    </InputGroup>
                    <InputGroup>
                        <Label>Total Stok</Label>
                        <Input name="stock" type="number" value={formData.stock} onChange={handleChange} required />
                    </InputGroup>
                    
                    <InputGroup>
                        <Label>Ambang Batas Stok Rendah</Label>
                        <Input name="low_stock_threshold" type="number" value={formData.low_stock_threshold} onChange={handleChange} required />
                    </InputGroup>

                    <VariantSection>
                        <Label style={{ fontWeight: 600, marginBottom: '15px' }}>Varian Produk</Label>
                        {formData.variants.map((variant, index) => (
                            <VariantRow key={index}>
                                <Input placeholder="Nama Varian (cth: Panas)" value={variant.name} onChange={e => handleVariantChange(index, 'name', e.target.value)} required />
                                <Input
                                    type="text" placeholder="Harga Beli (Modal)" value={formatCurrency(variant.cost_price)}
                                    onChange={e => handleVariantChange(index, 'cost_price', e.target.value)}
                                    onFocus={e => { const rawValue = parseCurrency(e.target.value); e.target.value = isNaN(rawValue) ? '' : rawValue; }}
                                    onBlur={e => { const rawValue = parseCurrency(e.target.value); e.target.value = formatCurrency(rawValue); }}
                                    required
                                />
                                <Input
                                    type="text" placeholder="Harga Jual" value={formatCurrency(variant.price)}
                                    onChange={e => handleVariantChange(index, 'price', e.target.value)}
                                    onFocus={e => { const rawValue = parseCurrency(e.target.value); e.target.value = isNaN(rawValue) ? '' : rawValue; }}
                                    onBlur={e => { const rawValue = parseCurrency(e.target.value); e.target.value = formatCurrency(rawValue); }}
                                    required
                                />
                                <Input placeholder="Barcode/SKU" value={variant.barcode || ''} onChange={e => handleVariantChange(index, 'barcode', e.target.value)} />
                                <ActionButton type="button" onClick={() => removeVariant(index)}><FiTrash2 size={18} /></ActionButton>
                            </VariantRow>
                        ))}
                        <AddVariantButton type="button" onClick={addVariant}><FiPlus /> Tambah Varian</AddVariantButton>
                    </VariantSection>
                    <InputGroup $fullWidth>
                        <Label>URL Gambar (atau Unggah)</Label>
                        <FileInputContainer>
                            <Input name="image_url" value={selectedFile ? selectedFile.name : formData.image_url} onChange={handleChange} placeholder="URL Gambar atau pilih file" disabled={!!selectedFile} />
                            <UploadButton type="button" onClick={triggerFileInput}> <FiUpload /> Unggah </UploadButton>
                            <FileInput type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
                        </FileInputContainer>
                        {selectedFile && <small style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>File dipilih: {selectedFile.name}</small>}
                        {formData.image_url && !selectedFile && <small style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>URL Gambar: {formData.image_url}</small>}
                    </InputGroup>
                    <InputGroup $fullWidth>
                        <Label>Deskripsi</Label>
                        <Input as="textarea" rows="3" name="description" value={formData.description} onChange={handleChange} />
                    </InputGroup>
                </FormGrid>
                <FormFooter>
                    <SaveButton type="submit" disabled={isSubmitting}>
                        <FiSave /> {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                    </SaveButton>
                </FormFooter>
            </Form>
        </PageContainer>
    );
}

export default ProductFormPage;