import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { getCategories, getSubCategories } from '../services/api';

const ModalBackdrop = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
`;
const ModalContainer = styled(motion.div)`
  background-color: var(--bg-surface); border-radius: 16px;
  border: 1px solid var(--border-color); width: 100%;
  max-width: 600px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
`;
const ModalHeader = styled.div`
  padding: 20px 25px; border-bottom: 1px solid var(--border-color);
  display: flex; justify-content: space-between; align-items: center;
`;
const ModalTitle = styled.h3` font-size: 1.2rem; font-weight: 600; `;
const CloseButton = styled.button` background: none; border: none; color: var(--text-secondary); cursor: pointer; &:hover { color: var(--text-primary); } `;
const ModalBody = styled.div` padding: 25px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; `;
const InputGroup = styled.div` grid-column: ${props => props.$fullWidth ? '1 / -1' : 'auto'}; `;
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
const UseCategoryImageButton = styled.button`
    font-size: 0.8rem; padding: 6px 12px; border-radius: 6px;
    border: 1px solid var(--primary-color); background-color: transparent;
    color: var(--primary-color); cursor: pointer; margin-top: 8px;
    &:hover { background-color: var(--primary-color); color: white; }
`;

function ProductFormModal({ isOpen, onClose, onSave, product }) {
  const [formData, setFormData] = useState({});
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const isEditing = Boolean(product);

  useEffect(() => {
    if (isOpen) {
      getCategories().then(res => setCategories(res.data));
    }
  }, [isOpen]);
  
  useEffect(() => {
    const initialData = product || { name: '', description: '', price: '', stock: '', image_url: '', category_id: '', sub_category_id: '' };
    setFormData(initialData);
    if (product?.category_id) {
      handleCategoryChange(product.category_id, false);
    } else {
      setSubCategories([]);
    }
  }, [product, isOpen]);

  const handleCategoryChange = async (categoryId, resetSubCategory = true) => {
    const newFormData = { ...formData, category_id: categoryId, ...(resetSubCategory && { sub_category_id: '' }) };
    setFormData(newFormData);
    setSelectedSubCategory(null);
    if (categoryId) {
        const res = await getSubCategories(categoryId);
        setSubCategories(res.data);
    } else {
        setSubCategories([]);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category_id") {
        handleCategoryChange(value);
    } else if (name === "sub_category_id") {
        setFormData(prev => ({ ...prev, sub_category_id: value }));
        const subCat = subCategories.find(sc => sc.id === parseInt(value));
        setSelectedSubCategory(subCat || null);
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const useSubCategoryImage = () => {
      if (selectedSubCategory && selectedSubCategory.image_url) {
          setFormData(prev => ({ ...prev, image_url: selectedSubCategory.image_url }));
      }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const modalVariants = { hidden: { y: "-50px", opacity: 0 }, visible: { y: "0", opacity: 1 } };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalBackdrop initial="hidden" animate="visible" exit="hidden" variants={backdropVariants}>
          <ModalContainer variants={modalVariants}>
            <form onSubmit={handleSubmit}>
              <ModalHeader>
                <ModalTitle>{isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}</ModalTitle>
                <CloseButton type="button" onClick={onClose}><FiX size={24} /></CloseButton>
              </ModalHeader>
              <ModalBody>
                <InputGroup $fullWidth>
                  <Label>Nama Produk</Label>
                  <Input name="name" value={formData.name || ''} onChange={handleChange} required />
                </InputGroup>
                <InputGroup>
                  <Label>Harga</Label>
                  <Input type="number" name="price" value={formData.price || ''} onChange={handleChange} required />
                </InputGroup>
                 <InputGroup>
                  <Label>Stok</Label>
                  <Input type="number" name="stock" value={formData.stock || ''} onChange={handleChange} required />
                </InputGroup>
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
                <InputGroup $fullWidth>
                  <Label>URL Gambar</Label>
                  <Input name="image_url" value={formData.image_url || ''} onChange={handleChange} />
                  {selectedSubCategory && selectedSubCategory.image_url && (
                      <UseCategoryImageButton type="button" onClick={useSubCategoryImage}>
                          Gunakan Gambar dari Sub-Kategori
                      </UseCategoryImageButton>
                  )}
                </InputGroup>
                <InputGroup $fullWidth>
                  <Label>Deskripsi</Label>
                  <Input as="textarea" name="description" value={formData.description || ''} onChange={handleChange} />
                </InputGroup>
              </ModalBody>
              <ModalFooter>
                <Button type="button" onClick={onClose}>Batal</Button>
                <Button type="submit" $primary>Simpan</Button>
              </ModalFooter>
            </form>
          </ModalContainer>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
}

export default ProductFormModal;