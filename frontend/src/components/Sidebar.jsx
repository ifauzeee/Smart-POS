// frontend/src/components/Sidebar.jsx

import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiShoppingCart, FiPackage, FiLogOut, FiList, FiUsers, FiSettings, FiZap, FiPower } from 'react-icons/fi'; // Hapus FiFileText, FiClock, FiTag, FiUserCheck
import { jwtDecode } from 'jwt-decode';
import { useShift } from '../context/ShiftContext';
import CloseShiftModal from './CloseShiftModal';
import { toast } from 'react-toastify';

const SidebarContainer = styled.div`
  width: 250px;
  background-color: var(--bg-surface); border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 25px 20px;
`;
const Logo = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 50px;
`;
const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
`;
const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 15px;
  color: var(--text-secondary);
  text-decoration: none;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 8px;
  font-weight: 500;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: var(--bg-main);
    color: var(--primary-color);
  }

  &.active {
    background-color: var(--primary-color);
    color: white;
  }
`;
// Styled component untuk tombol Tutup Shift
const CloseShiftButton = styled.button`
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  background-color: var(--red-color); /* Warna merah untuk aksi tutup */
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 600; /* Lebih tebal */
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  margin-top: 25px; /* Jarak dari item di atasnya */
  box-shadow: 0 4px 10px rgba(229, 62, 62, 0.3); /* Sedikit bayangan */
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    background-color: #CC2222; /* Merah yang sedikit lebih gelap saat hover */
    transform: translateY(-2px); /* Efek angkat sedikit */
    box-shadow: 0 6px 12px rgba(229, 62, 62, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
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
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  margin-top: 10px; /* Jarak dari tombol Tutup Shift */

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
    if(activeShift) {
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
              <li><NavItem to="/quick-actions"><FiZap size={20} /> Aksi Cepat</NavItem></li> 
              <li><NavItem to="/settings"><FiSettings size={20} /> Setelan</NavItem></li>
            </>
          )}
        </NavList>
       
        {activeShift && (
            <CloseShiftButton onClick={() => setCloseShiftModalOpen(true)}> {/* NEW: Menggunakan CloseShiftButton */}
                <FiPower size={20} /> Tutup Shift
            </CloseShiftButton>
        )}
        <LogoutButton onClick={handleLogout}><FiLogOut size={20} /> Logout</LogoutButton>
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