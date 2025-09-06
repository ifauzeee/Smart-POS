import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getCategories, createCategory, deleteCategory, getSubCategories, createSubCategory, deleteSubCategory } from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
import ConfirmationModal from '../components/ConfirmationModal';
import { useDataFetching } from '../hooks/useDataFetching';

// --- Styled Components ---
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
  background-color: var(--bg-main);
  color: var(--text-primary);
  font-size: 1rem;
  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.8;
  }
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 98, 0, 234), 0.2);
  }
`;
const Button = styled.button`
  padding: 0 20px;
  border-radius: 8px;
  border: none;
  background-color: var(--primary-color);
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: var(--primary-hover);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
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
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--bg-main);
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
`;
const ListItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;
const DeleteButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  &:hover { color: var(--red-color); }
`;
const ListItemText = styled.span`
  flex-grow: 1;
`;

function CategoryPage() {
    const { data: categories, refetch: fetchCategories } = useDataFetching(getCategories, "Gagal memuat kategori.");
    const [view, setView] = useState('categories');
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newSubCategoryName, setNewSubCategoryName] = useState('');
    const [modalState, setModalState] = useState({ isOpen: false, type: null, data: null });

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
        setNewSubCategoryName('');
        setView('categories');
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) {
            toast.warn("Nama kategori tidak boleh kosong.");
            return;
        }
        await toast.promise(createCategory({ name: newCategoryName }), {
            pending: 'Menyimpan...', success: 'Kategori dibuat!', error: 'Gagal membuat kategori.'
        });
        setNewCategoryName('');
        fetchCategories();
    };
    
    const handleCreateSubCategory = async (e) => {
        e.preventDefault();
        if (!newSubCategoryName.trim()) {
            toast.warn("Nama sub-kategori tidak boleh kosong.");
            return;
        }
        const subCategoryData = { name: newSubCategoryName };
        await toast.promise(createSubCategory(selectedCategory.id, subCategoryData), {
            pending: 'Menyimpan...', success: 'Sub-kategori dibuat!', error: 'Gagal membuat sub-kategori.'
        });
        setNewSubCategoryName('');
        handleSelectCategory(selectedCategory);
    };
    
    const openConfirmation = (type, data) => {
        setModalState({ isOpen: true, type, data });
    };

    const handleConfirmDelete = async () => {
        const { type, data } = modalState;
        if (!data) return;

        const promise = type === 'category' ? deleteCategory(data.id) : deleteSubCategory(data.id);
        const entityName = type === 'category' ? 'Kategori' : 'Sub-kategori';
        
        try {
            await toast.promise(promise, {
                pending: `Menghapus ${entityName}...`,
                success: `${entityName} berhasil dihapus!`,
                error: (err) => err.response?.data?.message || `Gagal menghapus ${entityName}.`
            });
            if (type === 'category') {
                fetchCategories();
            } else {
                handleSelectCategory(selectedCategory);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setModalState({ isOpen: false, type: null, data: null });
        }
    };

    return (
        <>
            <PageContainer>
                <Panel>
                    {view === 'categories' && (
                        <>
                            <PanelHeader><PanelTitle>Manajemen Kategori</PanelTitle></PanelHeader>
                            <Form onSubmit={handleCreateCategory}>
                                <Input
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Nama kategori baru..."
                                />
                                <Button type="submit"><FiPlus /></Button>
                            </Form>
                            <List>
                                {categories.map(cat => (
                                    <ListItem key={cat.id} $clickable onClick={() => handleSelectCategory(cat)}>
                                        <ListItemText>{cat.name}</ListItemText>
                                        <ListItemActions>
                                            <DeleteButton onClick={(e) => { e.stopPropagation(); openConfirmation('category', cat); }}><FiTrash2 /></DeleteButton>
                                            <FiChevronRight />
                                        </ListItemActions>
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
                                <Input
                                    value={newSubCategoryName}
                                    onChange={(e) => setNewSubCategoryName(e.target.value)}
                                    placeholder="Nama sub-kategori..."
                                />
                                <Button type="submit"><FiPlus /></Button>
                            </Form>
                            <List>
                                {subCategories.map(sub => (
                                    <ListItem key={sub.id}>
                                        <ListItemText>{sub.name}</ListItemText>
                                        <DeleteButton onClick={() => openConfirmation('subcategory', sub)}><FiTrash2 /></DeleteButton>
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
                </Panel>
            </PageContainer>
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, type: null, data: null })}
                onConfirm={handleConfirmDelete}
                title={`Konfirmasi Hapus ${modalState.type === 'category' ? 'Kategori' : 'Sub-Kategori'}`}
                message={`Yakin ingin menghapus "${modalState.data?.name}"? ${modalState.type === 'category' ? 'Semua sub-kategori di dalamnya juga akan terhapus.' : ''}`}
            />
        </>
    );
}

export default CategoryPage;