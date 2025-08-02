import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import 'react-loading-skeleton/dist/skeleton.css';


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

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';

// --- Global Styles for UI/UX Improvements ---
const GlobalStyle = createGlobalStyle`
    /* Modern Font & New Color Variables */
    :root {
        --font-sans: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        
        /* Primary Colors */
        --primary-color: #8E44AD; /* A slightly deeper purple */
        --primary-hover: #9B59B6;
        --primary-dark: #7D3C98;

        /* Accent Colors */
        --red-color: #E74C3C;
        --green-color: #2ECC71;
        --orange-color: #F39C12;
        --blue-color: #3498DB;

        /* Status Badge Colors (for better readability) */
        --orange-text: #D35400; --orange-bg: #FDEBD0;
        --green-text: #21618C; --green-bg: #D4E6F1;
        --red-text: #922B21; --red-bg: #FDEDEC;
        --grey-text: #566573; --grey-bg: #EAEDED;
    }

    body {
        /* Light Theme */
        --bg-main: #F4F7FC; /* A softer off-white */
        --bg-surface: #FFFFFF; /* Clean white for cards */
        --border-color: #EAECEF; /* A softer border */
        --text-primary: #2C3E50; /* A dark blue for main text */
        --text-secondary: #808B96; /* A grey for secondary text */
        --text-placeholder: #ABB2B9;
    }

    body[data-theme='dark'] {
        /* Dark Theme */
        --bg-main: #171A21; /* A bluish-black */
        --bg-surface: #232834; /* Dark grey for cards */
        --border-color: #3A4151; /* A more contrasting border */
        --text-primary: #FDFEFE; /* Clean white */
        --text-secondary: #A6ACAF; /* Light grey */
        --text-placeholder: #797D7F;
    }

    * {
        box-sizing: border-box; 
        margin: 0; 
        padding: 0;
    }

    html, body, #root {
        height: 100%;
    }

    body {
        font-family: var(--font-sans);
        background-color: var(--bg-main);
        color: var(--text-primary);
        transition: background-color 0.3s ease, color 0.3s ease;
        /*
        The overflow: hidden; rule might prevent scrolling on pages that need it.
        Consider moving this to a specific component or a more targeted selector if needed.
        overflow: hidden; 
        */
    }

    /* Smooth Transitions for All Interactive Elements */
    button, a, input, select, textarea {
        transition: all 0.2s ease-in-out;
    }
`;
// --- End of Global Styles ---

function AppContent() {
    const { theme } = useContext(ThemeContext);
    
    // The SkeletonTheme base and highlight colors are updated to match the new dark theme colors.
    return (
        <SkeletonTheme baseColor={theme === 'dark' ? '#232834' : '#EAECEF'} highlightColor={theme === 'dark' ? '#3A4151' : '#ffffff'}>
            <GlobalStyle />
            <ToastContainer position="top-right" autoClose={3000} theme={theme} />
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                    <Route path="/tutorial/app-password" element={<AppPasswordTutorialPage />} />
                    
                    {/* The root path redirects to /pos if a token exists, otherwise to /login */}
                    <Route path="/" element={localStorage.getItem('token') ? <Navigate to="/pos" /> : <Navigate to="/login" />} />
                    
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/pos" element={<PosPage />} />
                            
                            {/* Admin-only routes */}
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
                            </Route>
                        </Route>
                    </Route>
                    
                    {/* Catch-all route for any undefined paths */}
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