// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\UsersPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getUsers, deleteUser, getRoles, createUserByAdmin, updateUser } from '../services/api';
import { toast } from 'react-toastify';
import { FiUserPlus, FiEdit, FiTrash2, FiUsers } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ConfirmationModal from '../components/ConfirmationModal';
import UserFormModal from '../components/UserFormModal';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';

// --- Styled Components ---
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
// Menghapus scrollbar dengan menghapus overflow-x: auto
const TableWrapper = styled.div`
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

const tableRowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05 },
    }),
};
// --- End Styled Components ---

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
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
        const promise = editingUser
            ? updateUser(editingUser.id, userData)
            : createUserByAdmin(userData);
        try {
            await toast.promise(promise, {
                pending: 'Menyimpan data pengguna...',
                success: 'Pengguna berhasil disimpan!',
                error: (err) => err.response?.data?.message || 'Gagal menyimpan data.'
            });
            fetchUsersAndRoles();
            handleCloseModal();
        } catch (error) {
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
        
        // Buat promise di sini untuk dikelola oleh toast
        const deletePromise = deleteUser(userToDelete.id);

        try {
            // Gunakan toast.promise untuk menampilkan notifikasi
            await toast.promise(deletePromise, {
                pending: 'Menghapus pengguna...',
                success: 'Pengguna berhasil dihapus!',
                error: {
                    render({ data }) {
                        // Menampilkan pesan spesifik dari backend
                        return data.response?.data?.message || 'Gagal menghapus pengguna.';
                    }
                }
            });

            // Hanya memuat ulang data jika penghapusan berhasil
            fetchUsersAndRoles();
        } catch (error) {
            // Log error, tapi tidak perlu toast.error lagi karena sudah ditangani
            console.error("Delete user error:", error);
        } finally {
            // Tutup modal dan reset state terlepas dari berhasil atau tidaknya operasi
            setIsConfirmOpen(false);
            setUserToDelete(null);
        }
    };

    const renderTableContent = () => {
        if (loading) {
            return <div style={{ padding: '20px' }}><Skeleton count={5} height={50} /></div>;
        }

        if (users.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Tidak ada pengguna yang terdaftar.</p>
                </div>
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
                <PageHeader>
                    <Title><FiUsers /> Manajemen Pengguna</Title>
                    <AddButton onClick={() => handleOpenModal()}>
                        <FiUserPlus size={18} /> Tambah Pengguna
                    </AddButton>
                </PageHeader>
                <TableContainer>
                    {renderTableContent()}
                </TableContainer>
            </PageWrapper>
            
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Konfirmasi Penghapusan"
                message={`Apakah Anda yakin ingin menghapus pengguna "${userToDelete?.name}"?`}
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