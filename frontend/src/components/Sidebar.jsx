// frontend/src/components/Sidebar.jsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiShoppingCart, FiPackage, FiLogOut, FiList, FiSettings, FiZap, FiPower, FiClock, FiFileText } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { useShift } from '../context/ShiftContext';
import CloseShiftModal from './CloseShiftModal';
import { toast } from 'react-toastify';

const SidebarContainer = styled.div`
  width: 250px;
  background-color: var(--bg-surface);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 20px; /* Sedikit dikurangi padding atas/bawah */
  height: 100vh;
  box-sizing: border-box;
  /* Gunakan gap untuk jarak antar anak langsung (Logo, NavList, ActionButtonsContainer) */
  gap: 30px; /* Jarak utama antar blok */
`;

const Logo = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
  text-align: center;
  margin: 0; /* Hapus margin default */
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  /* Gunakan gap untuk jarak antar item menu */
  gap: 6px; /* Jarak antar item menu */
  flex-grow: 1;
  /* Scroll jika konten terlalu panjang */
  overflow-y: auto;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 15px;
  color: var(--text-secondary);
  text-decoration: none;
  padding: 12px 15px; /* Sedikit dikurangi padding horizontal */
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  /* Hilangkan margin-bottom karena sudah pakai gap */

  &:hover {
    background-color: var(--bg-main);
    color: var(--primary-color);
  }

  &.active {
    background-color: var(--primary-color);
    color: white;
  }
`;

// Container baru untuk tombol-tombol aksi di bawah
const ActionButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  /* Gunakan gap untuk jarak antar tombol dalam container ini */
  gap: 12px; /* Jarak antar tombol Tutup Shift dan Logout */
  /* Margin top untuk memberi jeda dari NavList */
  margin-top: 20px; /* JEDA UTAMA DARI MENU UTAMA */
`;

// Styled component untuk tombol Tutup Shift
const CloseShiftButton = styled.button`
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  background-color: var(--red-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 15px; /* Sesuaikan padding */
  font-weight: 600;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(229, 62, 62, 0.3);
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  /* Hilangkan margin-top karena sudah pakai gap di container */

  &:hover {
    background-color: #CC2222;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(229, 62, 62, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
    transform: none; /* Hilangkan efek hover saat disabled */
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 12px 15px; /* Sesuaikan padding */
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  /* Hilangkan margin-top karena sudah pakai gap di container */

  &:hover {
    background-color: var(--bg-main);
    color: var(--red-color);
  }
`;

function Sidebar() {
  const [userRole, setUserRole] = useState(null);
  const { activeShift, refreshShiftStatus } = useShift();
  const [isCloseShiftModalOpen, setCloseShiftModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    if (activeShift) {
      toast.warn("Anda harus menutup shift terlebih dahulu sebelum logout.");
      return;
    }
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <>
      <SidebarContainer>
        <Logo>Smart POS</Logo>
        <NavList>
          <li><NavItem to="/pos"><FiShoppingCart size={20} /> Kasir</NavItem></li>

          {userRole === 'admin' && (
            <>
              <li><NavItem to="/dashboard"><FiGrid size={20} /> Dashboard</NavItem></li>
              <li><NavItem to="/products"><FiPackage size={20} /> Produk</NavItem></li>
              <li><NavItem to="/history"><FiList size={20} /> Riwayat</NavItem></li>
              <li><NavItem to="/reports"><FiFileText size={20} /> Laporan</NavItem></li>
              <li><NavItem to="/shift-history"><FiClock size={20} /> Riwayat Shift</NavItem></li>
              <li><NavItem to="/quick-actions"><FiZap size={20} /> Aksi Cepat</NavItem></li>
              <li><NavItem to="/settings"><FiSettings size={20} /> Setelan</NavItem></li>
            </>
          )}
        </NavList>

        {/* Container untuk tombol-tombol aksi */}
        <ActionButtonsContainer>
          {activeShift && (
            <CloseShiftButton onClick={() => setCloseShiftModalOpen(true)}>
              <FiPower size={20} /> Tutup Shift
            </CloseShiftButton>
          )}
          <LogoutButton onClick={handleLogout}><FiLogOut size={20} /> Logout</LogoutButton>
        </ActionButtonsContainer>
      </SidebarContainer>

      {isCloseShiftModalOpen && activeShift && (
        <CloseShiftModal
          shiftId={activeShift.id}
          onClose={() => setCloseShiftModalOpen(false)}
          onShiftClosed={() => {
            setCloseShiftModalOpen(false);
            refreshShiftStatus();
          }}
        />
      )}
    </>
  );
}

export default Sidebar;
