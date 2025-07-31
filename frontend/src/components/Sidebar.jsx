// frontend/src/components/Sidebar.jsx
import React, { useState, useEffect, useContext } from 'react'; // Tambahkan useContext
import styled from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiShoppingCart, FiPackage, FiLogOut, FiList, FiSettings, FiZap, FiPower, FiClock, FiFileText } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { useShift } from '../context/ShiftContext';
import { BusinessContext } from '../context/BusinessContext'; // Import BusinessContext
import CloseShiftModal from './CloseShiftModal';
import { toast } from 'react-toastify';

const SidebarContainer = styled.div`
    width: 250px;
    background-color: var(--bg-surface);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    padding: 20px;
    height: 100vh;
    box-sizing: border-box;
    gap: 30px;
`;

const Logo = styled.h1`
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--primary-color);
    text-align: center;
    margin: 0;
`;

const NavList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex-grow: 1;
    overflow-y: auto;
`;

const NavItem = styled(NavLink)`
    display: flex;
    align-items: center;
    gap: 15px;
    color: var(--text-secondary);
    text-decoration: none;
    padding: 12px 15px;
    border-radius: 8px;
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

const ActionButtonsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 20px;
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
`;

function Sidebar() {
    const [userRole, setUserRole] = useState(null);
    const { activeShift, refreshShiftStatus } = useShift();
    const { settings } = useContext(BusinessContext); // Gunakan BusinessContext
    const [isCloseShiftModalOpen, setCloseShiftModalOpen] = useState(false);
    const navigate = useNavigate();

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
        navigate('/login');
    };

    const handleShiftClosed = () => {
        setCloseShiftModalOpen(false);
        refreshShiftStatus();
        toast.success("Shift berhasil ditutup. Anda akan logout secara otomatis.");
        
        setTimeout(() => {
            localStorage.removeItem('token');
            navigate('/login');
        }, 2000);
    };

    // Gunakan business_name dari settings, fallback ke 'Smart POS' jika belum ada
    const businessName = settings?.business_name || 'Smart POS';

    return (
        <>
            <SidebarContainer>
                <Logo>{businessName}</Logo> {/* Gunakan businessName di sini */}
                <NavList>
                    <li><NavItem to="/pos"><FiShoppingCart size={20} /> Kasir</NavItem></li>
                    {userRole && userRole.toLowerCase() === 'admin' && (
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
                    onShiftClosed={handleShiftClosed}
                />
            )}
        </>
    );
}

export default Sidebar;