import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getUsers, deleteUser, getRoles, createUserByAdmin, updateUser } from '../services/api';
import { toast } from 'react-toastify';
import { FiUserPlus, FiEdit, FiTrash2, FiUsers } from 'react-icons/fi';
import ConfirmationModal from '../components/ConfirmationModal';
import UserFormModal from '../components/UserFormModal';
import { motion } from 'framer-motion';
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
`;

const Title = styled.h1`
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    gap: 12px;
`;

const AddButton = styled.button`
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    &:hover {
        background-color: var(--primary-hover);
    }
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
    flex-grow: 1;
    overflow-y: auto;
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
    position: sticky;
    top: 0;
`;

const Td = styled.td`
    padding: 15px 20px;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-primary);
    vertical-align: middle;
`;

const Tr = styled(motion.tr)`
    &:last-child > td {
        border-bottom: none;
    }
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    margin: 0 5px;
    &:hover {
        color: ${props => props.$danger ? 'var(--red-color)' : 'var(--primary-color)'};
    }
`;

const EmptyStateContainer = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: var(--text-secondary);
    padding: 20px;
`;

const EmptyStateTitle = styled.h3`
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 20px;
    margin-bottom: 10px;
`;

// Animation variants for table rows
const tableRowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05 },
    }),
};

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchUsersAndRoles = useCallback(async () => {
        setLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([getUsers(), getRoles()]);
            setUsers(usersRes.data);
            setRoles(rolesRes.data);
        } catch (error) {
            toast.error("Gagal memuat data pengguna atau peran.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsersAndRoles();
    }, [fetchUsersAndRoles]);

    const handleOpenModal = (user = null) => {
        setEditingUser(user);
        setIsFormModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsFormModalOpen(false);
        setEditingUser(null);
    };

    const handleSaveUser = async (userData) => {
        setIsSubmitting(true);
        const isEditing = Boolean(editingUser);
        const promise = isEditing
            ? updateUser(editingUser.id, userData)
            : createUserByAdmin(userData);
        try {
            await toast.promise(promise, {
                pending: isEditing ? 'Menyimpan perubahan...' : 'Menambahkan pengguna...',
                success: 'Pengguna berhasil disimpan!',
                error: (err) => err.response?.data?.message || 'Gagal menyimpan data.'
            });
            fetchUsersAndRoles();
            handleCloseModal();
        } catch (error) {
            // Toast will show the error, console.error is for debugging
            console.error("Save user failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDeleteConfirmation = (user) => {
        setUserToDelete(user);
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        const deletePromise = deleteUser(userToDelete.id);
        try {
            await toast.promise(deletePromise, {
                pending: 'Menonaktifkan pengguna...',
                success: 'Pengguna berhasil dinonaktifkan!',
                error: (err) => err.response?.data?.message || 'Gagal menonaktifkan pengguna.'
            });
            fetchUsersAndRoles();
        } catch (error) {
            console.error("Deactivate user error:", error);
        } finally {
            setIsConfirmOpen(false);
            setUserToDelete(null);
        }
    };

    const renderTableContent = () => {
        if (!loading && users.length === 0) {
            return (
                <EmptyStateContainer>
                    <FiUsers size={48} />
                    <EmptyStateTitle>Tidak Ada Pengguna</EmptyStateTitle>
                    <p>Klik tombol "Tambah Pengguna" untuk menambahkan yang pertama.</p>
                </EmptyStateContainer>
            );
        }

        return (
            <TableWrapper>
                <Table>
                    <thead>
                        <tr>
                            <Th>Nama</Th>
                            <Th>Email</Th>
                            <Th>Peran</Th>
                            <Th style={{ textAlign: 'center' }}>Aksi</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, i) => (
                            <Tr key={user.id} custom={i} initial="hidden" animate="visible" variants={tableRowVariants}>
                                <Td>{user.name}</Td>
                                <Td>{user.email}</Td>
                                <Td>{user.role_name}</Td>
                                <Td style={{ textAlign: 'center' }}>
                                    <ActionButton onClick={() => handleOpenModal(user)}>
                                        <FiEdit size={18} />
                                    </ActionButton>
                                    <ActionButton $danger onClick={() => openDeleteConfirmation(user)}>
                                        <FiTrash2 size={18} />
                                    </ActionButton>
                                </Td>
                            </Tr>
                        ))}
                    </tbody>
                </Table>
            </TableWrapper>
        );
    };

    return (
        <>
            <PageWrapper loading={loading}>
                <PageContainer>
                    <PageHeader>
                        <Title><FiUsers /> Manajemen Pengguna</Title>
                        <AddButton onClick={() => handleOpenModal()}>
                            <FiUserPlus size={18} /> Tambah Pengguna
                        </AddButton>
                    </PageHeader>
                    <TableContainer>
                        {renderTableContent()}
                    </TableContainer>
                </PageContainer>
            </PageWrapper>
            
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Konfirmasi Penonaktifan"
                message={`Apakah Anda yakin ingin menonaktifkan pengguna "${userToDelete?.name}"?`}
            />

            <UserFormModal
                isOpen={isFormModalOpen}
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