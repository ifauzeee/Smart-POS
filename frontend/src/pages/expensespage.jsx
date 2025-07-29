import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../services/api'; // Assuming this connects to your database
import { toast } from 'react-toastify';
import { FiPlus, FiEdit, FiTrash2, FiDollarSign } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import EditExpenseModal from '../components/EditExpenseModal';

// Styled Components
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

const TableContainer = styled.div`
    background-color: var(--bg-surface);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    overflow: hidden;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
`;

const TableWrapper = styled.div`
    overflow-x: auto;
    flex-grow: 1;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const Th = styled.th`
    text-align: left;
    padding: 15px 20px;
    background-color: var(--bg-main);
    border-bottom: 1px solid var(--border-color);
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.9rem;
    text-transform: uppercase;
`;

const Td = styled.td`
    padding: 15px 20px;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-primary);
    vertical-align: middle;
`;

const Tr = styled.tr`
    &:last-child > td {
        border-bottom: none;
    }
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    margin-right: 15px;
    &:hover { color: ${props => props.$danger ? 'var(--red-color)' : 'var(--primary-color)'}; }
`;

const EmptyStateContainer = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: var(--text-secondary);
`;

const EmptyStateTitle = styled.h3`
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 20px;
    margin-bottom: 10px;
`;

function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await getExpenses();
            setExpenses(res.data);
        } catch (error) {
            toast.error("Gagal memuat data pengeluaran.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);
    const handleOpenModal = (expense = null) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
    };

    const handleSaveExpense = async (expenseData) => {
        setIsSubmitting(true);
        const promise = editingExpense
            ? updateExpense(editingExpense.id, expenseData)
            : createExpense(expenseData);

        try {
            await toast.promise(promise, {
                pending: 'Menyimpan data...',
                success: 'Data pengeluaran berhasil disimpan!',
                error: 'Gagal menyimpan data.'
            });
            fetchExpenses();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
            handleCloseModal();
        }
    };

    const handleDeleteExpense = async (id) => {
        if (window.confirm('Yakin ingin menghapus pengeluaran ini?')) {
            await toast.promise(deleteExpense(id), {
                pending: 'Menghapus data...',
                success: 'Pengeluaran berhasil dihapus!',
                error: 'Gagal menghapus data.'
            });
            fetchExpenses();
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <Title>Manajemen Pengeluaran</Title>
                <AddButton onClick={() => handleOpenModal()}>
                    <FiPlus /> Catat Pengeluaran
                </AddButton>
            </PageHeader>
            
            <TableContainer>
                {loading ? (
                    <div style={{ padding: '20px' }}>
                        <Skeleton count={8} height={50} />
                    </div>
                ) : expenses.length > 0 ? (
                    <TableWrapper>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Tanggal</Th>
                                    <Th>Deskripsi</Th>
                                    <Th>Jumlah</Th>
                                    <Th>Dicatat Oleh</Th>
                                    <Th>Aksi</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map(expense => (
                                    <Tr key={expense.id}>
                                        <Td>{new Date(expense.created_at).toLocaleString('id-ID')}</Td>
                                        <Td>{expense.description}</Td>
                                        <Td>Rp {new Intl.NumberFormat('id-ID').format(expense.amount)}</Td>
                                        <Td>{expense.user_name}</Td>
                                        <Td>
                                            <ActionButton onClick={() => handleOpenModal(expense)}><FiEdit size={18} /></ActionButton>
                                            <ActionButton $danger onClick={() => handleDeleteExpense(expense.id)}><FiTrash2 size={18} /></ActionButton>
                                        </Td>
                                    </Tr>
                                ))}
                            </tbody>
                        </Table>
                    </TableWrapper>
                ) : (
                    <EmptyStateContainer>
                        <FiDollarSign size={48} />
                        <EmptyStateTitle>Belum Ada Pengeluaran</EmptyStateTitle>
                        <p>Klik tombol di pojok kanan atas untuk mencatat pengeluaran pertama Anda.</p>
                    </EmptyStateContainer>
                )}
            </TableContainer>

            <EditExpenseModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveExpense}
                expense={editingExpense}
                isSubmitting={isSubmitting}
            />
        </PageContainer>
    );
}

export default ExpensesPage;