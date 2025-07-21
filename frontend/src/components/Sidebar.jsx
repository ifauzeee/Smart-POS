import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiShoppingCart, FiPackage, FiLogOut, FiList } from 'react-icons/fi';

const SidebarContainer = styled.div`
  width: 250px;
  background-color: var(--bg-surface);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 25px 20px;
`;

const Logo = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 50px;
  letter-spacing: 2px;
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
    background-color: var(--border-color);
    color: var(--text-primary);
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
  font-family: 'Inter', sans-serif;
  cursor: pointer;

  &:hover {
    background-color: var(--border-color);
    color: var(--red-color);
  }
`;

function Sidebar() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <SidebarContainer>
      <Logo>SmartPOS</Logo>
      <NavList>
        <li><NavItem to="/"><FiShoppingCart size={20} /> Kasir</NavItem></li>
        <li><NavItem to="/dashboard"><FiGrid size={20} /> Dashboard</NavItem></li>
        <li><NavItem to="/products"><FiPackage size={20} /> Produk</NavItem></li>
        <li><NavItem to="/history"><FiList size={20} /> Riwayat</NavItem></li>
      </NavList>
      <LogoutButton onClick={handleLogout}><FiLogOut size={20} /> Logout</LogoutButton>
    </SidebarContainer>
  );
}

export default Sidebar;