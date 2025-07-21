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

// WADAH BARU UNTUK KONTEN UTAMA
const ContentWrapper = styled.div`
  flex: 1;
  height: 100vh;
  overflow-y: auto; /* Scroll hanya akan ada di sini */
  padding: 30px;
`;

function Layout() {
  return (
    <AppContainer>
      <Sidebar />
      <ContentWrapper>
        <Outlet /> {/* Halaman (misal: PosPage) akan dirender di dalam wadah ini */}
      </ContentWrapper>
    </AppContainer>
  );
}

export default Layout;