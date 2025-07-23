import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../services/api';
import SupplierFormModal from '../components/SupplierFormModal';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';

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
`;

const Td = styled.td`
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
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

function SupplierPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await getSuppliers();
      setSuppliers(res.data);
    } catch {
      toast.error("Gagal memuat data pemasok.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleOpenModal = (supplier = null) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleSaveSupplier = async (supplierData) => {
    const promise = editingSupplier
      ? updateSupplier(editingSupplier.id, supplierData)
      : createSupplier(supplierData);

    toast.promise(promise, {
      pending: 'Menyimpan data...',
      success: 'Data berhasil disimpan!',
      error: 'Gagal menyimpan data.'
    });

    try {
      await promise;
      fetchSuppliers();
      handleCloseModal();
    } catch (error) {
      console.error("Save supplier failed:", error);
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (window.confirm('Yakin ingin menghapus pemasok ini?')) {
      const promise = deleteSupplier(id);
      toast.promise(promise, {
        pending: 'Menghapus data...',
        success: 'Pemasok berhasil dihapus!',
        error: 'Gagal menghapus data.'
      });
      try {
        await promise;
        fetchSuppliers();
      } catch (error) {
        console.error("Delete supplier failed:", error);
      }
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <Title>Manajemen Pemasok</Title>
        <AddButton onClick={() => handleOpenModal()}>
          <FiPlus /> Tambah Pemasok
        </AddButton>
      </PageHeader>
      <TableContainer>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>Nama Pemasok</Th>
                <Th>Narahubung</Th>
                <Th>Telepon</Th>
                <Th>Email</Th>
                <Th>Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <Tr key={index}>
                    {[...Array(5)].map((_, i) => <Td key={i}><Skeleton /></Td>)}
                  </Tr>
                ))
              ) : (
                suppliers.map(supplier => (
                  <Tr key={supplier.id}>
                    <Td>{supplier.name}</Td>
                    <Td>{supplier.contact_person}</Td>
                    <Td>{supplier.phone}</Td>
                    <Td>{supplier.email}</Td>
                    <Td>
                      <ActionButton onClick={() => handleOpenModal(supplier)}><FiEdit size={18} /></ActionButton>
                      <ActionButton $danger onClick={() => handleDeleteSupplier(supplier.id)}><FiTrash2 size={18} /></ActionButton>
                    </Td>
                  </Tr>
                ))
              )}
            </tbody>
          </Table>
        </TableWrapper>
      </TableContainer>

      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSupplier}
        supplier={editingSupplier}
      />
    </PageContainer>
  );
}

export default SupplierPage;
