// frontend/src/pages/ReportsPage.jsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getSalesReportPdf, getUsers, getCustomers } from '../services/api';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FiFileText, FiDownload } from 'react-icons/fi';

// --- Styled Components ---
const PageContainer = styled.div` padding: 30px; max-width: 800px; margin: 0 auto; `;
const PageHeader = styled.header` margin-bottom: 30px; `;
const Title = styled.h1` font-size: 1.8rem; display: flex; align-items: center; gap: 12px; `;
const FilterCard = styled.div` background-color: var(--bg-surface); border-radius: 16px; border: 1px solid var(--border-color); padding: 25px; `;
const Grid = styled.div` display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; @media (max-width: 768px) { grid-template-columns: 1fr; } `;
const InputGroup = styled.div` display: flex; flex-direction: column; gap: 8px; `;
const Label = styled.label` font-weight: 500; font-size: 0.9rem; color: var(--text-secondary); `;
const Select = styled.select` width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--bg-main); color: var(--text-primary); font-size: 1rem; `;
const DatePickerWrapper = styled.div` .react-datepicker-wrapper input { width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--bg-main); color: var(--text-primary); font-size: 1rem; }`;
const ButtonContainer = styled.div` margin-top: 25px; padding-top: 25px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; `;
const GenerateButton = styled.button` background-color: var(--primary-color); color: white; border: none; border-radius: 8px; padding: 12px 25px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; &:hover { opacity: 0.9; } &:disabled { opacity: 0.5; cursor: not-allowed; } `;

function ReportsPage() {
    const [users, setUsers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
        endDate: new Date(),
        userId: 'all',
        customerId: 'all',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, customersRes] = await Promise.all([getUsers(), getCustomers()]);
                setUsers(usersRes.data);
                setCustomers(customersRes.data);
            } catch (error) {
                toast.error("Gagal memuat data filter.");
            }
        };
        fetchData();
    }, []);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDateChange = (name, date) => {
        setFilters(prev => ({ ...prev, [name]: date }));
    };

    const handleGenerateReport = async () => {
        setIsLoading(true);
        try {
            const response = await getSalesReportPdf(filters);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const fileName = `laporan-penjualan-${new Date().toISOString().slice(0, 10)}.pdf`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Laporan PDF berhasil dibuat!");
        } catch (error) {
            console.error("Report generation error:", error);
            toast.error(error.response?.data?.message || "Gagal membuat laporan.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <Title><FiFileText /> Buat Laporan</Title>
            </PageHeader>
            <FilterCard>
                <Grid>
                    <InputGroup>
                        <Label>Dari Tanggal</Label>
                        <DatePickerWrapper>
                            <DatePicker
                                selected={filters.startDate}
                                onChange={(date) => handleDateChange('startDate', date)}
                                dateFormat="dd/MM/yyyy"
                                maxDate={filters.endDate}
                            />
                        </DatePickerWrapper>
                    </InputGroup>
                    <InputGroup>
                        <Label>Sampai Tanggal</Label>
                        <DatePickerWrapper>
                            <DatePicker
                                selected={filters.endDate}
                                onChange={(date) => handleDateChange('endDate', date)}
                                dateFormat="dd/MM/yyyy"
                                minDate={filters.startDate}
                            />
                        </DatePickerWrapper>
                    </InputGroup>
                    <InputGroup>
                        <Label>Filter Berdasarkan Kasir</Label>
                        <Select name="userId" value={filters.userId} onChange={handleFilterChange}>
                            <option value="all">Semua Kasir</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </Select>
                    </InputGroup>
                    <InputGroup>
                        <Label>Filter Berdasarkan Pelanggan</Label>
                        <Select name="customerId" value={filters.customerId} onChange={handleFilterChange}>
                            <option value="all">Semua Pelanggan</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>{customer.name}</option>
                            ))}
                        </Select>
                    </InputGroup>
                </Grid>
                <ButtonContainer>
                    <GenerateButton onClick={handleGenerateReport} disabled={isLoading}>
                        <FiDownload />
                        {isLoading ? 'Membuat Laporan...' : 'Buat & Unduh PDF'}
                    </GenerateButton>
                </ButtonContainer>
            </FilterCard>
        </PageContainer>
    );
}

export default ReportsPage;