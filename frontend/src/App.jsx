// frontend/src/App.jsx

import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

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
import ProductProfitabilityReport from './pages/ProductProfitabilityReport'; // <-- IMPORT BARU

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';

const GlobalStyle = createGlobalStyle`
    body {
        --bg-main: #F7F8FC;
        --bg-surface: #FFFFFF;
        --bg-secondary: #FFFFFF;
        --border-color: #EAEBF0;
        --text-primary: #1D2129;
        --text-secondary: #65676B;
        --text-placeholder: #8A8D91;
    }

    body[data-theme='dark'] {
        --bg-main: #000000;
        --bg-surface: #121212;
        --bg-secondary: #1E1E1E;
        --border-color: #2D2D2D;
        --text-primary: #F5F6F7;
        --text-secondary: #A0AEC0;
        --text-placeholder: #718096;
    }

    :root {
        --primary-color: #9D4EDD;
        --primary-hover: #B583E6;
        --red-color: #E53E3E;
        --green-color: #198754;
    }
    
    * { 
        box-sizing: border-box; margin: 0; padding: 0; 
    }

    body {
        font-family: 'Poppins', sans-serif;
        background-color: var(--bg-main);
        color: var(--text-primary);
        transition: background-color 0.2s, color 0.2s;
        overflow: hidden;
    }
`;

function AppContent() {
    const { theme } = useContext(ThemeContext);
    return (
        <SkeletonTheme
            baseColor={theme === 'dark' ? '#121212' : '#EAEBF0'}
            highlightColor={theme === 'dark' ? '#2D2D2D' : '#ffffff'}
        >
            <GlobalStyle />
            <ToastContainer position="top-right" autoClose={3000} theme={theme} />
            <BrowserRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                }}
            >
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                    <Route path="/tutorial/app-password" element={<AppPasswordTutorialPage />} />
                    <Route
                        path="/"
                        element={localStorage.getItem('token') ? <Navigate to="/pos" /> : <Navigate to="/login" />}
                    />
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
                                <Route path="/reports/product-profitability" element={<ProductProfitabilityReport />} /> {/* <-- ROUTE BARU */}
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