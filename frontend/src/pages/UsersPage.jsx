import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getUsers, createUserByAdmin, updateUser, deleteUser } from '../services/api'; // <-- Ubah import
import UserFormModal from '../components/UserFormModal';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiUsers } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // Make sure this is imported for Skeleton styles

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
    overflow-x: auto; /* <-- UPDATED: Added horizontal scroll */
    flex-grow: 1; /* <-- UPDATED: Ensure it grows to fill space */
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
    &:last-child {
        ${Td} { border-bottom: none; }
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


function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // Tambahkan state baru

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await getUsers();
            setUsers(res.data);
        } catch (error) {
            toast.error("Gagal memuat data pengguna.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenModal = (user = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSaveUser = async (userData) => {
        setIsSubmitting(true); // Set true di awal
        // Logika IF/ELSE untuk membedakan mode
        const promise = editingUser
            ? updateUser(editingUser.id, userData)
            : createUserByAdmin(userData); // <-- Panggil fungsi baru untuk membuat user

        try {
            await toast.promise(promise, {
                pending: 'Menyimpan data pengguna...',
                success: 'Data berhasil disimpan!',
                error: 'Gagal menyimpan data.'
            });
            fetchUsers();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false); // Set false di akhir
            handleCloseModal();
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            await toast.promise(deleteUser(id), {
                pending: 'Menghapus pengguna...',
                success: 'Pengguna berhasil dihapus!',
                error: 'Gagal menghapus pengguna.'
            });
            fetchUsers();
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <Title>Manajemen Pengguna</Title>
                <AddButton onClick={() => handleOpenModal()}>
                    <FiPlus /> Tambah Pengguna
                </AddButton>
            </PageHeader>
            
            {loading ? (
                <TableContainer>
                    <Skeleton count={5} height={70} style={{ borderRadius: '16px', margin: '15px 20px' }} />
                </TableContainer>
            ) : users.length > 0 ? (
                <TableContainer>
                    <TableWrapper>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>ID</Th>
                                    <Th>Nama</Th>
                                    <Th>Email</Th>
                                    <Th>Peran</Th>
                                    <Th>Aksi</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <Tr key={user.id}>
                                        <Td>{user.id}</Td>
                                        <Td>{user.name}</Td>
                                        <Td>{user.email}</Td>
                                        <Td>{user.role}</Td>
                                        <Td>
                                            <ActionButton onClick={() => handleOpenModal(user)}><FiEdit size={18} /></ActionButton>
                                            <ActionButton $danger onClick={() => handleDeleteUser(user.id)}><FiTrash2 size={18} /></ActionButton>
                                        </Td>
                                    </Tr>
                                ))}
                            </tbody>
                        </Table>
                    </TableWrapper>
                </TableContainer>
            ) : (
                <EmptyStateContainer>
                    <FiUsers size={48} />
                    <EmptyStateTitle>Belum Ada Pengguna</EmptyStateTitle>
                    <p>Klik tombol di pojok kanan atas untuk menambahkan pengguna pertama Anda.</p>
                </EmptyStateContainer>
            )}

            <UserFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveUser}
                user={editingUser}
                isSubmitting={isSubmitting} // Kirim prop baru
            />
        </PageContainer>
    );
}

export default UsersPage;