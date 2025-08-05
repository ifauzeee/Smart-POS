import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    FiGrid, FiShoppingCart, FiPackage, FiLogOut, FiList,
    FiSettings, FiZap, FiPower, FiClock, FiFileText
} from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { useShift } from '../context/ShiftContext';
import { BusinessContext } from '../context/BusinessContext';
import CloseShiftModal from './CloseShiftModal';
import { toast } from 'react-toastify';

const SidebarContainer = styled.div`
    width: 250px;
    background-color: var(--bg-surface);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    padding: 25px 15px;
    height: 100vh;
    box-sizing: border-box;

    @media (max-width: 1024px) {
        width: 100%;
        height: auto;
        padding: 8px;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        border-right: none;
        border-top: 1px solid var(--border-color);
        position: fixed;
        bottom: 0;
        left: 0;
        z-index: 100;
    }
`;

const Logo = styled.h1`
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--primary-color);
    text-align: center;
    margin-bottom: 30px;

    @media (max-width: 1024px) {
        display: none;
    }
`;

const NavList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-grow: 1;
    overflow-y: auto;

    @media (max-width: 1024px) {
        flex-direction: row;
        flex-grow: 1;
        overflow-y: visible;
        gap: 0;
        justify-content: space-evenly;
    }
`;

const NavItem = styled(NavLink)`
    display: flex;
    align-items: center;
    gap: 15px;
    color: var(--text-secondary);
    text-decoration: none;
    padding: 12px 20px;
    border-radius: 10px;
    font-weight: 500;
    position: relative;
    overflow: hidden;
    transition: all 0.2s ease-in-out;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        height: 0;
        width: 4px;
        background-color: var(--primary-color);
        transition: height 0.2s ease-in-out;
    }

    &:hover {
        background-color: var(--bg-main);
        color: var(--text-primary);
    }

    &.active {
        background-color: var(--bg-main);
        color: var(--text-primary);
        font-weight: 600;

        &::before {
            height: 60%;
        }
    }

    @media (max-width: 1024px) {
        flex-direction: column;
        padding: 8px;
        font-size: 0.7rem;
        gap: 4px;

        &::before {
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 3px;
            transition: width 0.2s ease-in-out;
        }

        &.active::before {
            width: 50%;
            height: 3px;
        }
    }
`;

const ActionButtonsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: auto;

    @media (max-width: 1024px) {
        flex-direction: row;
        margin-top: 0;
        flex-grow: 0;
        gap: 8px;
    }
`;

const CloseShiftButton = styled.button`
    display: flex;
    align-items: center;
    gap: 15px;
    width: 100%;
    background-color: var(--red-color);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 15px;
    font-weight: 600;
    font-size: 1rem;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(229, 62, 62, 0.3);
    transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        background-color: #CC2222;
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(229, 62, 62, 0.4);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        box-shadow: none;
        transform: none;
    }

    @media (max-width: 1024px) {
        flex-direction: column;
        padding: 8px;
        font-size: 0.7rem;
        gap: 4px;
        width: auto;
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
    padding: 12px 15px;
    border-radius: 8px;
    font-weight: 500;
    font-size: 1rem;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
        background-color: var(--bg-main);
        color: var(--red-color);
    }

    @media (max-width: 1024px) {
        flex-direction: column;
        padding: 8px;
        font-size: 0.7rem;
        gap: 4px;
        width: auto;
    }
`;

function Sidebar() {
    const { activeShift, refreshShiftStatus } = useShift();
    const { settings } = useContext(BusinessContext);
    const [isCloseShiftModalOpen, setCloseShiftModalOpen] = useState(false);
    const navigate = useNavigate();
    const [localUserRole, setLocalUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setLocalUserRole(decoded.role?.toLowerCase());
            } catch (error) {
                console.error('Invalid token:', error);
            }
        }
    }, []);

    const handleLogout = () => {
        if (localUserRole === 'kasir' && activeShift) {
            toast.warn('Anda harus menutup shift terlebih dahulu sebelum logout.');
            return;
        }
        localStorage.removeItem('token');
        refreshShiftStatus();
        navigate('/login');
    };

    const handleShiftClosed = () => {
        setCloseShiftModalOpen(false);
        toast.success('Shift berhasil ditutup. Anda akan segera logout.');
        localStorage.removeItem('token');
        refreshShiftStatus();
        navigate('/login', { replace: true });
    };

    const businessName = settings?.business_name || 'Smart POS';

    return (
        <>
            <SidebarContainer>
                <Logo>{businessName}</Logo>
                <NavList>
                    <li>
                        <NavItem to="/pos">
                            <FiShoppingCart size={20} /> Kasir
                        </NavItem>
                    </li>
                    {localUserRole && localUserRole.toLowerCase() === 'admin' && (
                        <>
                            <li>
                                <NavItem to="/dashboard">
                                    <FiGrid size={20} /> Dashboard
                                </NavItem>
                            </li>
                            <li>
                                <NavItem to="/products">
                                    <FiPackage size={20} /> Produk
                                </NavItem>
                            </li>
                            <li>
                                <NavItem to="/history">
                                    <FiList size={20} /> Riwayat
                                </NavItem>
                            </li>
                            <li>
                                <NavItem to="/reports">
                                    <FiFileText size={20} /> Laporan
                                </NavItem>
                            </li>
                            <li>
                                <NavItem to="/shift-history">
                                    <FiClock size={20} /> Riwayat Shift
                                </NavItem>
                            </li>
                            <li>
                                <NavItem to="/quick-actions">
                                    <FiZap size={20} /> Aksi Cepat
                                </NavItem>
                            </li>
                            <li>
                                <NavItem to="/settings">
                                    <FiSettings size={20} /> Setelan
                                </NavItem>
                            </li>
                        </>
                    )}
                </NavList>

                <ActionButtonsContainer>
                    {localUserRole === 'kasir' && activeShift && (
                        <CloseShiftButton onClick={() => setCloseShiftModalOpen(true)}>
                            <FiPower size={20} /> Tutup Shift
                        </CloseShiftButton>
                    )}
                    <LogoutButton onClick={handleLogout}>
                        <FiLogOut size={20} /> Logout
                    </LogoutButton>
                </ActionButtonsContainer>
            </SidebarContainer>

            {isCloseShiftModalOpen && activeShift && (
                <CloseShiftModal
                    shiftId={activeShift.id}
                    onClose={() => setCloseShiftModalOpen(false)}
                    onShiftClosed={handleShiftClosed}
                />
            )}
        </>
    );
}

export default Sidebar;