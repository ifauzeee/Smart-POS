import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { getCategories, getSubCategories, getSuppliers } from '../services/api';

const ModalBackdrop = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
`;
const ModalContainer = styled(motion.div)`
  background-color: var(--bg-surface); border-radius: 16px;
  border: 1px solid var(--border-color); width: 100%;
  max-width: 900px; /* Dilebarkan untuk 3 kolom */
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
`;
const ModalHeader = styled.div`
  padding: 20px 25px; border-bottom: 1px solid var(--border-color);
  display: flex; justify-content: space-between; align-items: center;
`;
const ModalTitle = styled.h3` font-size: 1.2rem; font-weight: 600; `;
const CloseButton = styled.button` background: none; border: none; color: var(--text-secondary); cursor: pointer; &:hover { color: var(--text-primary); } `;
const ModalBody = styled.div` 
  padding: 25px; 
  display: grid; 
  grid-template-columns: repeat(3, 1fr); /* <-- DIUBAH MENJADI 3 KOLOM */
  gap: 18px 20px;
`;
const InputGroup = styled.div` 
  /* Mengatur lebar kolom secara dinamis */
  grid-column: ${props => props.$span === 2 ? 'span 2' : (props.$span === 3 ? 'span 3' : 'span 1')};
`;
const Label = styled.label` display: block; margin-bottom: 8px; font-weight: 500; font-size: 0.9rem; color: var(--text-secondary); `;
const Input = styled.input` width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--bg-main); color: var(--text-primary); font-size: 1rem; `;
const Select = styled.select` width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--bg-main); color: var(--text-primary); font-size: 1rem; `;
const ModalFooter = styled.div` padding: 20px 25px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 15px; `;
const Button = styled.button`
  padding: 10px 25px; border-radius: 8px; border: 1px solid var(--border-color);
  font-weight: 600; cursor: pointer;
  background-color: ${props => props.$primary ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.$primary ? 'white' : 'var(--text-primary)'};
  &:hover { opacity: 0.9; }
`;

function ProductFormModal({ isOpen, onClose, onSave, product }) {
    const [formData, setFormData] = useState({});
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const isEditing = Boolean(product);

    useEffect(() => {
        if (isOpen) {
            getCategories().then(res => setCategories(res.data));
            getSuppliers().then(res => setSuppliers(res.data));
        }
    }, [isOpen]);
    
    useEffect(() => {
        if (isOpen) {
            if (product) {
                setFormData({
                    name: product.name || '',
                    description: product.description || '',
                    price: product.price || '',
                    cost_price: product.cost_price || '',
                    stock: product.stock || '',
                    low_stock_threshold: product.low_stock_threshold || '5',
                    category_id: product.category_id || '',
                    sub_category_id: product.sub_category_id || '',
                    supplier_id: product.supplier_id || '',
                    image_url: product.image_url || '',
                });
                if (product.category_id) {
                    getSubCategories(product.category_id).then(res => setSubCategories(res.data));
                }
            } else {
                setFormData({
                    name: '', description: '', price: '', cost_price: '', stock: '',
                    low_stock_threshold: '5', image_url: '', category_id: '',
                    sub_category_id: '', supplier_id: '',
                });
                setSubCategories([]);
            }
        }
    }, [product, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === "category_id") {
            setFormData(prev => ({ ...prev, sub_category_id: '' }));
            if (value) {
                getSubCategories(value).then(res => setSubCategories(res.data));
            } else {
                setSubCategories([]);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };
    
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <ModalBackdrop>
                <ModalContainer>
                    <form onSubmit={handleSubmit}>
                        <ModalHeader>
                            <ModalTitle>{isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}</ModalTitle>
                            <CloseButton type="button" onClick={onClose}><FiX size={24} /></CloseButton>
                        </ModalHeader>
                        
                        <ModalBody>
                            {/* Baris 1 */}
                            <InputGroup $span={2}>
                                <Label>Nama Produk</Label>
                                <Input name="name" value={formData.name || ''} onChange={handleChange} required />
                            </InputGroup>
                            <InputGroup>
                                <Label>Pemasok (Supplier)</Label>
                                <Select name="supplier_id" value={formData.supplier_id || ''} onChange={handleChange}>
                                    <option value="">-- Tidak Ada --</option>
                                    {suppliers.map(sup => (<option key={sup.id} value={sup.id}>{sup.name}</option>))}
                                </Select>
                            </InputGroup>

                            {/* Baris 2 */}
                            <InputGroup>
                                <Label>Harga Jual</Label>
                                <Input type="number" name="price" value={formData.price || ''} onChange={handleChange} required />
                            </InputGroup>
                            <InputGroup>
                                <Label>Harga Beli (Modal)</Label>
                                <Input type="number" name="cost_price" value={formData.cost_price || ''} onChange={handleChange} required />
                            </InputGroup>
                            <InputGroup>
                                <Label>Stok</Label>
                                <Input type="number" name="stock" value={formData.stock || ''} onChange={handleChange} required />
                            </InputGroup>
                            
                            {/* Baris 3 */}
                            <InputGroup>
                                <Label>Kategori</Label>
                                <Select name="category_id" value={formData.category_id || ''} onChange={handleChange}>
                                    <option value="">-- Pilih Kategori --</option>
                                    {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                                </Select>
                            </InputGroup>
                            <InputGroup>
                                <Label>Sub-Kategori</Label>
                                <Select name="sub_category_id" value={formData.sub_category_id || ''} onChange={handleChange} disabled={subCategories.length === 0}>
                                    <option value="">-- Pilih Sub-Kategori --</option>
                                    {subCategories.map(sub => (<option key={sub.id} value={sub.id}>{sub.name}</option>))}
                                </Select>
                            </InputGroup>
                            <InputGroup>
                                <Label>Ambang Stok Rendah</Label>
                                <Input type="number" name="low_stock_threshold" value={formData.low_stock_threshold || ''} onChange={handleChange} required />
                            </InputGroup>
                            
                            {/* Baris 4 */}
                            <InputGroup $span={3}>
                                <Label>URL Gambar</Label>
                                <Input name="image_url" value={formData.image_url || ''} onChange={handleChange} />
                            </InputGroup>

                            {/* Baris 5 */}
                            <InputGroup $span={3}>
                                <Label>Deskripsi</Label>
                                <Input as="textarea" rows="2" name="description" value={formData.description || ''} onChange={handleChange} />
                            </InputGroup>
                        </ModalBody>

                        <ModalFooter>
                            <Button type="button" onClick={onClose}>Batal</Button>
                            <Button type="submit" $primary>Simpan</Button>
                        </ModalFooter>
                    </form>
                </ModalContainer>
            </ModalBackdrop>
        </AnimatePresence>
    );
}

export default ProductFormModal;