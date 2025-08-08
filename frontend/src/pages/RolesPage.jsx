import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getRoles, getRoleById, createRole, updateRole, deleteRole, getPermissions } from '../services/api';
import RoleFormModal from '../components/RoleFormModal';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiShield } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PageContainer = styled.div` padding: 30px; height: 100%; display: flex; flex-direction: column; `;
const PageHeader = styled.header` display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-shrink: 0; `;
const Title = styled.h1` font-size: 1.8rem; `;
const AddButton = styled.button` background-color: var(--primary-color); color: white; border: none; border-radius: 8px; padding: 12px 20px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; &:hover { background-color: var(--primary-hover); } `;
const TableContainer = styled.div` background-color: var(--bg-surface); border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; flex-grow: 1; display: flex; flex-direction: column; `;
const TableWrapper = styled.div` overflow-x: auto; flex-grow: 1; `;
const Table = styled.table` width: 100%; border-collapse: collapse; `;
const Th = styled.th` text-align: left; padding: 15px 20px; background-color: var(--bg-main); border-bottom: 1px solid var(--border-color); font-weight: 600; color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase; `;
const Td = styled.td` padding: 15px 20px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); vertical-align: middle; `;
const Tr = styled.tr` &:last-child > td { border-bottom: none; } `;
const ActionButton = styled.button` background: none; border: none; cursor: pointer; color: var(--text-secondary); margin-right: 15px; &:hover { color: ${props => props.$danger ? 'var(--red-color)' : 'var(--primary-color)'}; } `;
const EmptyStateContainer = styled.div` flex-grow: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: var(--text-secondary); `;

function RolesPage() {
    const [roles, setRoles] = useState([]);
    const [permissionsList, setPermissionsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [rolesRes, permsRes] = await Promise.all([getRoles(), getPermissions()]);
            setRoles(rolesRes.data);
            setPermissionsList(permsRes.data);
        } catch (error) {
            toast.error("Gagal memuat data peran atau izin.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenModal = async (role = null) => {
        if (role) {
            // Jika mengedit, fetch detailnya untuk mendapatkan izin yang terhubung
            const res = await getRoleById(role.id);
            setEditingRole(res.data);
        } else {
            setEditingRole(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRole(null);
    };

    const handleSaveRole = async (roleData) => {
        setIsSubmitting(true);
        const promise = editingRole ? updateRole(editingRole.id, roleData) : createRole(roleData);
        try {
            await toast.promise(promise, {
                pending: 'Menyimpan peran...',
                success: 'Peran berhasil disimpan!',
                error: (err) => err.response?.data?.message || 'Gagal menyimpan peran.'
            });
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
            handleCloseModal();
        }
    };

    const handleDeleteRole = async (id) => {
        if (window.confirm('Yakin ingin menghapus peran ini?')) {
            try {
                await toast.promise(deleteRole(id), {
                    pending: 'Menghapus peran...',
                    success: 'Peran berhasil dihapus!',
                    error: (err) => err.response?.data?.message || 'Gagal menghapus peran.'
                });
                fetchData();
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <>
            <PageContainer>
                <PageHeader>
                    <Title>Manajemen Peran & Izin</Title>
                    <AddButton onClick={() => handleOpenModal()}><FiPlus /> Tambah Peran</AddButton>
                </PageHeader>
                <TableContainer>
                    {loading ? (
                        <div style={{ padding: '20px' }}><Skeleton count={5} height={50} /></div>
                    ) : roles.length > 0 ? (
                        <TableWrapper>
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>Nama Peran</Th>
                                        <Th>Deskripsi</Th>
                                        <Th>Aksi</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.map(role => (
                                        <Tr key={role.id}>
                                            <Td>{role.name}</Td>
                                            <Td>{role.description}</Td>
                                            <Td>
                                                <ActionButton onClick={() => handleOpenModal(role)}><FiEdit size={18} /></ActionButton>
                                                <ActionButton $danger onClick={() => handleDeleteRole(role.id)}><FiTrash2 size={18} /></ActionButton>
                                            </Td>
                                        </Tr>
                                    ))}
                                </tbody>
                            </Table>
                        </TableWrapper>
                    ) : (
                        <EmptyStateContainer>
                            <FiShield size={48} />
                            <h3 style={{ marginTop: '20px' }}>Belum Ada Peran</h3>
                            <p>Klik tombol di atas untuk membuat peran pertama Anda.</p>
                        </EmptyStateContainer>
                    )}
                </TableContainer>
            </PageContainer>
            <RoleFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveRole}
                role={editingRole}
                permissionsList={permissionsList}
                isSubmitting={isSubmitting}
            />
        </>
    );
}

export default RolesPage;