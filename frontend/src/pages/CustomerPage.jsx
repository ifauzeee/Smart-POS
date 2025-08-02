import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/api';
import CustomerFormModal from '../components/CustomerFormModal';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiAward, FiPhone, FiMail, FiUsers } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import PageWrapper from '../components/PageWrapper'; 

// --- Styled Components ---
const PageContainer = styled.div`
    padding: 30px;
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const PageHeader = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-shrink: 0;
    
    /* --- PERBAIKAN FINAL DI SINI --- */
    position: relative; 
    z-index: 2; 
    /* Menambahkan background solid sesuai warna halaman untuk menutupi elemen di belakangnya */
    background-color: var(--bg-main); 
    padding-bottom: 30px; /* Menambah padding agar tidak terlalu mepet */
    margin-bottom: 0; /* Margin dipindahkan ke padding */
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
const GridWrapper = styled.div`
    position: relative;
    z-index: 1; 
    flex-grow: 1;
    overflow-y: auto;
    padding-top: 30px; /* Memberi jarak dari header */
`;

const CustomerGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding-right: 10px;
`;

const CustomerCard = styled.div`
    background-color: var(--bg-surface);
    border-radius: 12px;
    border: 1px solid var(--border-color);
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    &:hover {
        border-color: var(--primary-color);
        transform: translateY(-5px); /* Sedikit diperbesar efeknya */
        box-shadow: 0 6px 16px rgba(0,0,0,0.1);
    }
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
`;

const CustomerName = styled.h3`
    font-size: 1.1rem;
    font-weight: 600;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 10px;
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    &:hover { color: ${props => props.$danger ? 'var(--red-color)' : 'var(--primary-color)'}; }
`;

const CardBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 15px;
`;

const InfoRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    font-size: 0.9rem;
`;

const CardFooter = styled.div`
    border-top: 1px solid var(--border-color);
    padding-top: 15px;
    margin-top: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--primary-color);
    font-weight: 600;
`;

const EmptyStateContainer = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: var(--text-secondary);
    background-color: var(--bg-surface);
    border-radius: 16px;
    border: 1px dashed var(--border-color);
`;

const EmptyStateTitle = styled.h3`
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 20px;
    margin-bottom: 10px;
`;


function CustomerPage() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await getCustomers();
            setCustomers(res.data);
        } catch (error) {
            toast.error("Gagal memuat data pelanggan.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleOpenModal = (customer = null) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    const handleSaveCustomer = async (customerData) => {
        setIsSubmitting(true);
        const promise = editingCustomer
            ? updateCustomer(editingCustomer.id, customerData)
            : createCustomer(customerData);
        try {
            await toast.promise(promise, {
                pending: 'Menyimpan data...',
                success: 'Data pelanggan berhasil disimpan!',
                error: 'Gagal menyimpan data.'
            });
            fetchCustomers();
        } catch (error) {
            console.error("Save customer failed:", error);
        } finally {
            setIsSubmitting(false);
            handleCloseModal();
        }
    };

    const handleDeleteCustomer = async (id) => {
        if (window.confirm('Yakin ingin menghapus pelanggan ini?')) {
            const promise = deleteCustomer(id);
            toast.promise(promise, {
                pending: 'Menghapus data...',
                success: 'Pelanggan berhasil dihapus!',
                error: 'Gagal menghapus data.'
            });
            try {
                await promise;
                fetchCustomers();
            } catch (error) {
                console.error("Delete customer failed:", error);
            }
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <Title>Manajemen Pelanggan</Title>
                <AddButton onClick={() => handleOpenModal()}>
                    <FiPlus /> Tambah Pelanggan
                </AddButton>
            </PageHeader>
            
            {loading ? (
                <GridWrapper>
                    <CustomerGrid>
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton key={index} height={180} borderRadius={12} />
                        ))}
                    </CustomerGrid>
                </GridWrapper>
            ) : customers.length > 0 ? (
                <GridWrapper>
                    <CustomerGrid>
                        {customers.map(customer => (
                            <CustomerCard key={customer.id} onClick={() => navigate(`/customers/${customer.id}`)}>
                                <div>
                                    <CardHeader>
                                        <CustomerName>{customer.name}</CustomerName>
                                        <ActionButtons>
                                            <ActionButton onClick={(e) => { e.stopPropagation(); handleOpenModal(customer); }}><FiEdit size={16} /></ActionButton>
                                            <ActionButton $danger onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(customer.id); }}><FiTrash2 size={16} /></ActionButton>
                                        </ActionButtons>
                                    </CardHeader>
                                    <CardBody>
                                        {customer.phone && <InfoRow><FiPhone size={14}/> {customer.phone}</InfoRow>}
                                        {customer.email && <InfoRow><FiMail size={14}/> {customer.email}</InfoRow>}
                                    </CardBody>
                                </div>
                                <CardFooter>
                                    <FiAward size={16}/> {customer.points || 0} Poin
                                </CardFooter>
                            </CustomerCard>
                        ))}
                    </CustomerGrid>
                </GridWrapper>
            ) : (
                <EmptyStateContainer>
                    <FiUsers size={48} />
                    <EmptyStateTitle>Belum Ada Pelanggan</EmptyStateTitle>
                    <p>Klik tombol di pojok kanan atas untuk menambahkan pelanggan pertama Anda.</p>
                </EmptyStateContainer>
            )}

            <CustomerFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveCustomer}
                customer={editingCustomer}
                isSubmitting={isSubmitting}
            />
        </PageContainer>
    );
}

export default CustomerPage;