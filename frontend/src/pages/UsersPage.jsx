import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getUsers, createUserByAdmin, updateUser, deleteUser, getRoles } from '../services/api';
import UserFormModal from '../components/UserFormModal';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiUsers } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';

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

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([getUsers(), getRoles()]);
            setUsers(usersRes.data);
            setRoles(rolesRes.data);
        } catch (error) {
            toast.error("Gagal memuat data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenModal = (user = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSaveUser = async (userData) => {
        setIsSubmitting(true);
        const promise = editingUser ? updateUser(editingUser.id, userData) : createUserByAdmin(userData);
        try {
            await toast.promise(promise, {
                pending: 'Menyimpan data...',
                success: 'Data berhasil disimpan!',
                error: (err) => err.response?.data?.message || 'Gagal menyimpan data.'
            });
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
            handleCloseModal();
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Yakin ingin menghapus pengguna ini?')) {
            await toast.promise(deleteUser(id), {
                pending: 'Menghapus...',
                success: 'Pengguna berhasil dihapus!',
                error: (err) => err.response?.data?.message || 'Gagal menghapus pengguna.'
            });
            fetchData();
        }
    };

    return (
        <>
            <PageContainer>
                <PageHeader>
                    <Title>Manajemen Pengguna</Title>
                    <AddButton onClick={() => handleOpenModal()}><FiPlus /> Tambah Pengguna</AddButton>
                </PageHeader>
                <TableContainer>
                    {loading ? (
                        <div style={{ padding: '20px' }}><Skeleton count={5} height={50} /></div>
                    ) : users.length > 0 ? (
                        <TableWrapper>
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>Nama</Th>
                                        <Th>Email</Th>
                                        <Th>Peran</Th>
                                        <Th>Aksi</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <Tr key={user.id}>
                                            <Td>{user.name}</Td>
                                            <Td>{user.email}</Td>
                                            <Td>{user.role_name}</Td>
                                            <Td>
                                                <ActionButton onClick={() => handleOpenModal(user)}><FiEdit size={18} /></ActionButton>
                                                <ActionButton $danger onClick={() => handleDeleteUser(user.id)}><FiTrash2 size={18} /></ActionButton>
                                            </Td>
                                        </Tr>
                                    ))}
                                </tbody>
                            </Table>
                        </TableWrapper>
                    ) : (
                        <EmptyStateContainer>
                            <FiUsers size={48} />
                            <h3 style={{ marginTop: '20px' }}>Belum Ada Pengguna</h3>
                            <p>Klik tombol di atas untuk menambahkan pengguna pertama.</p>
                        </EmptyStateContainer>
                    )}
                </TableContainer>
            </PageContainer>
            <UserFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveUser}
                user={editingUser}
                roles={roles}
                isSubmitting={isSubmitting}
            />
        </>
    );
}

export default UsersPage;
