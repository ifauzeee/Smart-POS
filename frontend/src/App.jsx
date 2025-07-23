import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import { SkeletonTheme } from 'react-loading-skeleton';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { ThemeProvider, ThemeContext } from './context/ThemeContext';

// Pages
import LoginPage from './pages/LoginPage';
import PosPage from './pages/PosPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import HistoryPage from './pages/HistoryPage';
import UsersPage from './pages/UsersPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';
import CategoryPage from './pages/CategoryPage';
import AppPasswordTutorialPage from './pages/AppPasswordTutorialPage';
import SupplierPage from './pages/SupplierPage'; // <-- Tambahkan ini

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
    box-sizing: border-box;
    margin: 0;
    padding: 0;
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
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<PosPage />} />
              <Route path="/tutorial/app-password" element={<AppPasswordTutorialPage />} />
              <Route element={<AdminRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/suppliers" element={<SupplierPage />} /> {/* <-- Tambahkan Route Supplier */}
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/categories" element={<CategoryPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </SkeletonTheme>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
