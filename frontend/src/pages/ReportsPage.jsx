import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiTrendingUp, FiDownload, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { exportSalesSummaryPDF as exportReport } from '../services/api';
import PageWrapper from '../components/PageWrapper';

const PageHeader = styled.header`
    margin-bottom: 30px;
    flex-shrink: 0;
`;

const Title = styled.h1`
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    gap: 12px;
`;

const ReportGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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
    margin-top: auto;

    &:hover:not(:disabled) {
        background-color: var(--primary-hover);
    }
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const DateFilterContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid var(--border-color);
`;
const DatePickerWrapper = styled.div`
    .react-datepicker-wrapper input {
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid var(--border-color);
        background-color: var(--bg-main);
        color: var(--text-primary);
        font-weight: 500;
        width: 120px;
        text-align: center;
    }
`;

function ReportsPage() {
    const navigate = useNavigate();
    const [reportStartDate, setReportStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 29)));
    const [reportEndDate, setReportEndDate] = useState(new Date());
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        toast.info("Sedang membuat laporan...");
        try {
            const response = await exportReport(reportStartDate, reportEndDate);
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            const contentDisposition = response.headers['content-disposition'];
            let fileName = `laporan-penjualan.csv`;
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
                if (fileNameMatch && fileNameMatch.length === 2) {
                    fileName = fileNameMatch[1];
                }
            }
            
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Laporan berhasil diunduh!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal membuat laporan.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <PageWrapper loading={false}>
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
                    <CardTitle><FiDownload /> Laporan Penjualan (CSV)</CardTitle>
                    <CardDescription>
                        Hasilkan ringkasan penjualan dalam format CSV untuk periode tertentu. Cocok untuk dokumentasi dan arsip.
                    </CardDescription>
                    <DateFilterContainer>
                        <FiCalendar size={18} />
                        <DatePickerWrapper>
                            <DatePicker selected={reportStartDate} onChange={(date) => setReportStartDate(date)} dateFormat="dd/MM/yy" maxDate={reportEndDate} />
                        </DatePickerWrapper>
                        <span>-</span>
                        <DatePickerWrapper>
                            <DatePicker selected={reportEndDate} onChange={(date) => setReportEndDate(date)} dateFormat="dd/MM/yy" minDate={reportStartDate} />
                        </DatePickerWrapper>
                    </DateFilterContainer>
                    <ActionButton onClick={handleGenerateReport} disabled={isGenerating}>
                        {isGenerating ? 'Memproses...' : 'Ekspor Laporan (CSV)'}
                    </ActionButton>
                </ReportCard>
            </ReportGrid>
        </PageWrapper>
    );
}

export default ReportsPage;