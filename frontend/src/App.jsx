import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import LoginPage from './pages/LoginPage';
import PosPage from './pages/PosPage';
import ProductsPage from './pages/ProductsPage';
import HistoryPage from './pages/HistoryPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { SkeletonTheme } from 'react-loading-skeleton';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  
  :root {
    --bg-main: #000000;
    --bg-surface: #121212;
    --bg-secondary: #1E1E1E;
    --border-color: #2D2D2D;
    
    --primary-color: #9D4EDD;
    --primary-hover: #B583E6;

    --text-primary: #F5F6F7;
    --text-secondary: #A0AEC0;
    --text-placeholder: #718096;
    --red-color: #E53E3E;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', sans-serif;
    background-color: var(--bg-main);
    color: var(--text-primary);
    overflow: hidden;
  }
`;

function App() {
  return (
    <SkeletonTheme baseColor="var(--bg-surface)" highlightColor="#2D2D2D">
      <GlobalStyle />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        theme="dark"
      />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<PosPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </SkeletonTheme>
  );
}

export default App;