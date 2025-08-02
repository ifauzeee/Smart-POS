import React from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-main);
`;

const ContentWrapper = styled.main`
  flex: 1;
  /* Ini adalah kunci utama: wrapper ini yang menangani scroll */
  overflow-y: auto;
`;

function Layout() {
  return (
    <AppContainer>
      <Sidebar />
      <ContentWrapper>
        {/* Outlet akan merender halaman (misal: ProductsPage) di sini */}
        <Outlet />
      </ContentWrapper>
    </AppContainer>
  );
}

export default Layout;