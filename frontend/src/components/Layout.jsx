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
  height: 100vh; /* 1. Batasi tingginya seukuran layar */
  overflow-y: auto; /* 2. Jika konten lebih panjang, tampilkan scrollbar */
`;

function Layout() {
  return (
    <AppContainer>
      <Sidebar />
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </AppContainer>
  );
}

export default Layout;