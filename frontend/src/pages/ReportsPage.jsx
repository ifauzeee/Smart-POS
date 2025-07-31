import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiTrendingUp, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';

const PageContainer = styled.div`
    padding: 30px;
    max-width: 900px;
    margin: 0 auto;
`;

const PageHeader = styled.header`
    margin-bottom: 30px;
`;

const Title = styled.h1`
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    gap: 12px;
`;

const ReportGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 25px;
`;

const ReportCard = styled.div`
    background-color: var(--bg-surface);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    padding: 25px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    transition: all 0.2s ease-in-out;

    &:hover {
        transform: translateY(-5px);
        border-color: var(--primary-color);
        box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }
`;

const CardTitle = styled.h3`
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
`;

const CardDescription = styled.p`
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
    flex-grow: 1;
`;

const ActionButton = styled.button`
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    margin-top: auto; /* Mendorong tombol ke bawah */

    &:hover {
        background-color: var(--primary-hover);
    }
`;

function ReportsPage() {
    const navigate = useNavigate();

    return (
        <PageContainer>
            <PageHeader>
                <Title><FiFileText /> Pusat Laporan</Title>
            </PageHeader>
            <ReportGrid>
                <ReportCard>
                    <CardTitle><FiTrendingUp /> Laporan Profitabilitas Produk</CardTitle>
                    <CardDescription>
                        Analisis mendalam tentang produk mana yang paling menguntungkan. Lihat total pendapatan, modal, laba kotor, dan marjin profit untuk setiap item.
                    </CardDescription>
                    <ActionButton onClick={() => navigate('/reports/product-profitability')}>
                        Lihat Laporan
                    </ActionButton>
                </ReportCard>

                <ReportCard>
                    <CardTitle><FiDownload /> Laporan Penjualan (PDF)</CardTitle>
                    <CardDescription>
                        Hasilkan ringkasan penjualan dalam format PDF untuk periode tertentu. Cocok untuk dokumentasi dan arsip. (Fitur ini akan dikembangkan lebih lanjut)
                    </CardDescription>
                    <ActionButton onClick={() => toast.info('Fitur PDF sedang dalam pengembangan.')}>
                        Hasilkan PDF
                    </ActionButton>
                </ReportCard>

                {/* Anda bisa menambahkan kartu laporan lain di sini di masa depan */}

            </ReportGrid>
        </PageContainer>
    );
}

export default ReportsPage;
