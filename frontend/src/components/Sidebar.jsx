import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiShoppingCart, FiPackage, FiLogOut, FiList, FiUsers, FiSettings, FiTag, FiTruck } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { ThemeContext } from '../context/ThemeContext';

// --- Styled Components ---
const SidebarContainer = styled.div`
  width: 250px;
  background-color: var(--bg-surface);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 25px 20px;
  transition: background-color 0.2s, border-color 0.2s;
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
  margin-top: auto;

  &:hover {
    background-color: var(--bg-main);
    color: var(--red-color);
  }
`;

function Sidebar() {
  const [userRole, setUserRole] = useState(null);
  const { theme } = useContext(ThemeContext);

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
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <SidebarContainer>
      <Logo>Toko 27</Logo>
      <NavList>
        <li><NavItem to="/"><FiShoppingCart size={20} /> Kasir</NavItem></li>
        
        {userRole === 'admin' && (
          <>
            <li><NavItem to="/dashboard"><FiGrid size={20} /> Dashboard</NavItem></li>
            <li><NavItem to="/products"><FiPackage size={20} /> Produk</NavItem></li>
            <li><NavItem to="/history"><FiList size={20} /> Riwayat</NavItem></li>
            <li><NavItem to="/users"><FiUsers size={20} /> Pengguna</NavItem></li>
            <li><NavItem to="/categories"><FiTag size={20} /> Kategori</NavItem></li>
            <li><NavItem to="/settings"><FiSettings size={20} /> Setelan</NavItem></li>
            <li><NavItem to="/suppliers"><FiTruck size={20} /> Pemasok</NavItem></li>
          </>
        )}
      </NavList>
      <LogoutButton onClick={handleLogout}><FiLogOut size={20} /> Logout</LogoutButton>
    </SidebarContainer>
  );
}

export default Sidebar;