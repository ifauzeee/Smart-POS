// frontend/src/pages/QuickActionsPage.jsx

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import QuickActionGrids from './Dashboard/components/QuickActionGrids';
import { FiArrowLeft } from 'react-icons/fi';

const PageContainer = styled.div`
    padding: 30px;
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const PageHeader = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-shrink: 0;
`;

const Title = styled.h1`
    font-size: 1.8rem;
`;

const BackButton = styled.button`
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    &:hover {
        background-color: var(--primary-hover);
    }
`;

function QuickActionsPage() {
    const navigate = useNavigate();
    return (
        <PageContainer>
            <PageHeader>
                <Title>Aksi Cepat & Manajemen</Title>
                <BackButton onClick={() => navigate('/dashboard')}>
                    <FiArrowLeft size={18} />
                    Kembali ke Dashboard
                </BackButton>
            </PageHeader>
            <QuickActionGrids />
        </PageContainer>
    );
}

export default QuickActionsPage;