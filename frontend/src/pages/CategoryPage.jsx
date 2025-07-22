import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getCategories, createCategory, deleteCategory, getSubCategories, createSubCategory, deleteSubCategory } from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiChevronRight, FiArrowLeft } from 'react-icons/fi';

const PageContainer = styled.div`
  padding: 30px;
  height: 100%;
  overflow-y: auto;
`;

const Panel = styled.div`
  background-color: var(--bg-surface);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  padding: 25px;
  max-width: 800px;
  margin: 0 auto;
`;

const PanelHeader = styled.div`
  margin: 0 0 20px 0;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
`;

const PanelTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  &:hover { color: var(--primary-color); }
`;

const Form = styled.form`
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
`;

const Button = styled.button`
  padding: 0 20px;
  border-radius: 8px;
  border: none;
  background-color: var(--primary-color);
  color: white;
  font-weight: 600;
  cursor: pointer;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  
  &:hover {
    background-color: var(--bg-main);
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  &:hover { color: var(--red-color); }
`;

function CategoryPage() {
    const [view, setView] = useState('categories');
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newSubCategoryName, setNewSubCategoryName] = useState('');
    const [newSubCategoryImageUrl, setNewSubCategoryImageUrl] = useState('');

    const fetchCategories = async () => {
        try {
            const res = await getCategories();
            setCategories(res.data);
        } catch (error) { toast.error("Gagal memuat kategori."); }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleSelectCategory = async (category) => {
        setSelectedCategory(category);
        try {
            const res = await getSubCategories(category.id);
            setSubCategories(res.data);
            setView('subcategories');
        } catch (error) { toast.error("Gagal memuat sub-kategori."); }
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
        setSubCategories([]);
        setView('categories');
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return toast.warn("Nama kategori tidak boleh kosong.");
        await toast.promise(createCategory(newCategoryName), {
            pending: 'Menyimpan...', success: 'Kategori dibuat!', error: 'Gagal membuat kategori.'
        });
        setNewCategoryName('');
        fetchCategories();
    };
    
    const handleCreateSubCategory = async (e) => {
        e.preventDefault();
        if (!newSubCategoryName.trim()) return toast.warn("Nama sub-kategori tidak boleh kosong.");
        const subCategoryData = {
            name: newSubCategoryName,
            image_url: newSubCategoryImageUrl
        };
        await toast.promise(createSubCategory(selectedCategory.id, subCategoryData), {
            pending: 'Menyimpan...', success: 'Sub-kategori dibuat!', error: 'Gagal membuat sub-kategori.'
        });
        setNewSubCategoryName('');
        setNewSubCategoryImageUrl('');
        handleSelectCategory(selectedCategory);
    };
    
    const handleDeleteCategory = async (id) => {
        if (window.confirm("Yakin ingin menghapus kategori ini? Semua sub-kategori di dalamnya akan ikut terhapus.")) {
            await toast.promise(deleteCategory(id), {
                pending: 'Menghapus...', success: 'Kategori dihapus!', error: 'Gagal menghapus kategori.'
            });
            fetchCategories();
        }
    };

    const handleDeleteSubCategory = async (id) => {
        if (window.confirm("Yakin ingin menghapus sub-kategori ini?")) {
            await toast.promise(deleteSubCategory(id), {
                pending: 'Menghapus...', success: 'Sub-kategori dihapus!', error: 'Gagal menghapus sub-kategori.'
            });
            handleSelectCategory(selectedCategory);
        }
    };

    return (
        <PageContainer>
            <Panel>
                {view === 'categories' && (
                    <>
                        <PanelHeader><PanelTitle>Manajemen Kategori</PanelTitle></PanelHeader>
                        <Form onSubmit={handleCreateCategory}>
                            <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Nama kategori baru..." />
                            <Button type="submit"><FiPlus /></Button>
                        </Form>
                        <List>
                            {categories.map(cat => (
                                <ListItem key={cat.id} $clickable onClick={() => handleSelectCategory(cat)}>
                                    <span>{cat.name}</span>
                                    <div>
                                        <DeleteButton onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}><FiTrash2 /></DeleteButton>
                                        <FiChevronRight />
                                    </div>
                                </ListItem>
                            ))}
                        </List>
                    </>
                )}

                {view === 'subcategories' && selectedCategory && (
                    <>
                        <PanelHeader>
                            <PanelTitle>
                                <BackButton onClick={handleBackToCategories}><FiArrowLeft size={24} /></BackButton>
                                Sub-Kategori: {selectedCategory.name}
                            </PanelTitle>
                        </PanelHeader>
                        <Form onSubmit={handleCreateSubCategory}>
                            <Input value={newSubCategoryName} onChange={(e) => setNewSubCategoryName(e.target.value)} placeholder="Nama sub-kategori..." />
                            <Input value={newSubCategoryImageUrl} onChange={(e) => setNewSubCategoryImageUrl(e.target.value)} placeholder="URL Gambar (Opsional)..." />
                            <Button type="submit"><FiPlus /></Button>
                        </Form>
                        <List>
                            {subCategories.map(sub => (
                                <ListItem key={sub.id}>
                                    <span>{sub.name}</span>
                                    <DeleteButton onClick={() => handleDeleteSubCategory(sub.id)}><FiTrash2 /></DeleteButton>
                                </ListItem>
                            ))}
                        </List>
                    </>
                )}
            </Panel>
        </PageContainer>
    );
}

export default CategoryPage;