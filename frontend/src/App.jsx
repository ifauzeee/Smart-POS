// frontend/src/App.jsx

import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import 'react-loading-skeleton/dist/skeleton.css';
import styled from 'styled-components';

// Context
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { BusinessProvider } from './context/BusinessContext';
import { ShiftProvider } from './context/ShiftContext';

// Pages
import LoginPage from './pages/LoginPage';
import PosPage from './pages/PosPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import HistoryPage from './pages/HistoryPage';
import UsersPage from './pages/UsersPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';
import CategoryPage from './pages/CategoryPage';
import AppPasswordTutorialPage from './pages/AppPasswordTutorialPage';
import SupplierPage from './pages/SupplierPage';
import CustomerPage from './pages/CustomerPage';
import ProductFormPage from './pages/ProductFormPage';
import ExpensesPage from './pages/ExpensesPage';
import ReceiveStockPage from './pages/ReceiveStockPage';
import QuickActionsPage from './pages/QuickActionsPage';
import TargetPage from './pages/TargetPage';
import PromotionsPage from './pages/PromotionsPage';
import PromotionFormPage from './pages/PromotionFormPage';
import StockAdjustmentPage from './pages/StockAdjustmentPage';
import ReportsPage from './pages/ReportsPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import ShiftHistoryPage from './pages/ShiftHistoryPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProductProfitabilityReport from './pages/ProductProfitabilityReport';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import PurchaseOrderForm from './pages/PurchaseOrderForm';
import PurchaseOrderDetailPage from './pages/PurchaseOrderDetailPage';
import RawMaterialsPage from './pages/RawMaterialsPage';
import RolesPage from './pages/RolesPage';
import AdminRewardsPage from './pages/AdminRewardsPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';
import SyncManager from './components/SyncManager';

const GlobalStyle = createGlobalStyle`
    :root {
        --font-sans: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        --primary-color: #8E44AD;
        --primary-hover: #9B59B6;
        --primary-dark: #7D3C98;
        --red-color: #E74C3C;
        --green-color: #2ECC71;
        --orange-color: #F39C12;
        --blue-color: #3498DB;
        --orange-text: #D35400; --orange-bg: #FDEBD0;
        --green-text: #21618C; --green-bg: #D4E6F1;
        --red-text: #922B21; --red-bg: #FDEDEC;
        --grey-text: #566573; --grey-bg: #EAEDED;
    }
    body {
        --bg-main: #F4F7FC;
        --bg-surface: #FFFFFF;
        --border-color: #EAECEF;
        --text-primary: #2C3E50;
        --text-secondary: #808B96;
        --text-placeholder: #ABB2B9;
    }
    body[data-theme='dark'] {
        --bg-main: #171A21;
        --bg-surface: #232834;
        --border-color: #3A4151;
        --text-primary: #FDFEFE;
        --text-secondary: #A6ACAF;
        --text-placeholder: #797D7F;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; }
    body {
        font-family: var(--font-sans);
        background-color: var(--bg-main);
        color: var(--text-primary);
        transition: background-color 0.3s ease, color 0.3s ease;
    }
    button, a, input, select, textarea {
        transition: all 0.2s ease-in-out;
    }
`;

const MobileRedirectContainer = styled.div`
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    text-align: center; height: 100vh; width: 100vw; background-color: var(--bg-main);
    color: var(--text-primary); padding: 20px; box-sizing: border-box;
`;
const RedirectTitle = styled.h1` font-size: 1.8rem; font-weight: 700; margin-bottom: 12px; `;
const RedirectMessage = styled.p` font-size: 1rem; color: var(--text-secondary); max-width: 400px; line-height: 1.6; margin-bottom: 30px; `;
const DownloadButton = styled.a`
    display: inline-block; background-color: var(--primary-color); color: white;
    padding: 15px 30px; border-radius: 12px; text-decoration: none;
    font-weight: 600; font-size: 1.1rem; margin: 10px; transition: background-color 0.2s ease;
    &:hover { background-color: var(--primary-hover); }
`;
const ContinueLink = styled.button`
    margin-top: 20px; background: none; border: none; color: var(--primary-color);
    text-decoration: underline; font-size: 0.9rem; cursor: pointer;
`;

function MobileRedirectPage() {
    const navigate = useNavigate();
    return (
        <MobileRedirectContainer>
            <RedirectTitle>Gunakan Aplikasi Smart POS</RedirectTitle>
            <RedirectMessage>
                Mohon maaf, untuk sementara aplikasi POS ini tidak tersedia di perangkat seluler.
                Silakan gunakan peramban web di desktop atau laptop Anda untuk pengalaman terbaik.
            </RedirectMessage>
            <div>
                <DownloadButton href="#">Unduh di App Store</DownloadButton>
                <DownloadButton href="#">Dapatkan di Google Play</DownloadButton>
            </div>
            <ContinueLink onClick={() => navigate(-1)}>Lanjutkan di Web Browser</ContinueLink>
        </MobileRedirectContainer>
    );
}

function MobileRedirectHandler() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isMobile && location.pathname !== '/mobile-redirect') {
            navigate('/mobile-redirect');
        }
    }, [isMobile, location.pathname, navigate]);

    return null;
}

function AppContent() {
    const { theme } = useContext(ThemeContext);
    
    return (
        <SkeletonTheme baseColor={theme === 'dark' ? '#232834' : '#EAECEF'} highlightColor={theme === 'dark' ? '#3A4151' : '#ffffff'}>
            <GlobalStyle />
            <ToastContainer position="top-right" autoClose={3000} theme={theme} />
            <BrowserRouter>
                <MobileRedirectHandler />
                <SyncManager />

                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                    <Route path="/tutorial/app-password" element={<AppPasswordTutorialPage />} />
                    <Route path="/mobile-redirect" element={<MobileRedirectPage />} />
    
                    <Route path="/" element={localStorage.getItem('token') ? <Navigate to="/pos" /> : <Navigate to="/login" />} />
                    
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/pos" element={<PosPage />} />
                            
                            <Route element={<AdminRoute />}>
                                <Route path="/dashboard" element={<DashboardPage />} />
                                <Route path="/products" element={<ProductsPage />} />
                                <Route path="/products/new" element={<ProductFormPage />} />
                                <Route path="/products/edit/:id" element={<ProductFormPage />} />
                                <Route path="/history" element={<HistoryPage />} />
                                <Route path="/reports" element={<ReportsPage />} />
                                <Route path="/reports/product-profitability" element={<ProductProfitabilityReport />} />
                                <Route path="/shift-history" element={<ShiftHistoryPage />} />
                                <Route path="/users" element={<UsersPage />} />
                                <Route path="/customers" element={<CustomerPage />} />
                                <Route path="/customers/:id" element={<CustomerDetailPage />} />
                                <Route path="/suppliers" element={<SupplierPage />} />
                                <Route path="/settings" element={<SettingsPage />} />
                                <Route path="/categories" element={<CategoryPage />} />
                                <Route path="/expenses" element={<ExpensesPage />} />
                                <Route path="/receive-stock" element={<ReceiveStockPage />} />
                                <Route path="/quick-actions" element={<QuickActionsPage />} />
                                <Route path="/targets" element={<TargetPage />} />
                                <Route path="/promotions" element={<PromotionsPage />} />
                                <Route path="/promotions/new" element={<PromotionFormPage />} />
                                <Route path="/promotions/edit/:id" element={<PromotionFormPage />} />
                                <Route path="/stock-adjustment" element={<StockAdjustmentPage />} />
                                <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
                                <Route path="/purchase-orders/new" element={<PurchaseOrderForm />} />
                                <Route path="/purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
                                <Route path="/raw-materials" element={<RawMaterialsPage />} />
                                <Route path="/roles" element={<RolesPage />} />
                                <Route path="/rewards" element={<AdminRewardsPage />} />
                            </Route>
                        </Route>
                    </Route>
                    
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </BrowserRouter>
        </SkeletonTheme>
    );
}

function App() {
    return (
        <ThemeProvider>
            <BusinessProvider>
                <ShiftProvider>
                    <AppContent />
                </ShiftProvider>
            </BusinessProvider>
        </ThemeProvider>
    );
}

export default App;