import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { getProductProfitabilityReport } from '../services/api';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FiArrowLeft, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';

// --- Styled Components ---
const PageContainer = styled.div` padding: 30px; height: 100%; display: flex; flex-direction: column; `;
const PageHeader = styled.header` margin-bottom: 20px; `;
const Title = styled.h1` font-size: 1.8rem; display: flex; align-items: center; gap: 12px; `;
const BackLink = styled(Link)` display: inline-flex; align-items: center; gap: 8px; color: var(--text-secondary); text-decoration: none; margin-bottom: 20px; font-weight: 500; &:hover { color: var(--text-primary); } `;
const FilterContainer = styled.div` display: flex; gap: 15px; align-items: center; margin-bottom: 25px; flex-wrap: wrap; background-color: var(--bg-surface); padding: 20px; border-radius: 12px; border: 1px solid var(--border-color);`;
const TableContainer = styled.div` background-color: var(--bg-surface); border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; flex-grow: 1; display: flex; flex-direction: column; `;
const TableWrapper = styled.div` overflow-x: auto; flex-grow: 1; `;
const Table = styled.table` width: 100%; border-collapse: collapse; `;
const Th = styled.th` text-align: left; padding: 15px 20px; background-color: var(--bg-main); border-bottom: 1px solid var(--border-color); font-weight: 600; color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase; white-space: nowrap; `;
const Td = styled.td` padding: 15px 20px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); vertical-align: middle; `;
const Tr = styled.tr` &:last-child > td { border-bottom: none; } `;
const DatePickerWrapper = styled.div` .react-datepicker-wrapper input { padding: 10px 15px; border-radius: 8px; border: 1px solid var(--border-color); background-color: var(--bg-main); color: var(--text-primary); font-weight: 500; width: 130px; cursor: pointer; text-align: center; }`;
const ProfitText = styled.span` font-weight: 700; color: ${props => props.isNegative ? 'var(--red-color)' : 'var(--green-color)'}; `;

const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);

function ProductProfitabilityReport() {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
        endDate: new Date(),
    });

    const fetchReportData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getProductProfitabilityReport(filters);
            setReportData(res.data);
        } catch (error) {
            toast.error("Gagal memuat laporan profitabilitas produk.");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    const handleDateChange = (name, date) => {
        setFilters(prev => ({ ...prev, [name]: date }));
    };

    return (
        <PageContainer>
            <PageHeader>
                <BackLink to="/reports"><FiArrowLeft /> Kembali ke Pusat Laporan</BackLink>
                <Title><FiTrendingUp /> Laporan Profitabilitas Produk</Title>
            </PageHeader>
            <FilterContainer>
                <FiCalendar size={20} style={{color: 'var(--text-secondary)'}}/>
                <span>Filter Tanggal:</span>
                <DatePickerWrapper>
                    <DatePicker selected={filters.startDate} onChange={(date) => handleDateChange('startDate', date)} dateFormat="dd/MM/yyyy" maxDate={filters.endDate} />
                </DatePickerWrapper>
                <span>sampai</span>
                <DatePickerWrapper>
                    <DatePicker selected={filters.endDate} onChange={(date) => handleDateChange('endDate', date)} dateFormat="dd/MM/yyyy" minDate={filters.startDate} />
                </DatePickerWrapper>
            </FilterContainer>

            <TableContainer>
                <TableWrapper>
                    <Table>
                        <thead>
                            <Tr>
                                <Th>Produk</Th>
                                <Th style={{textAlign: 'center'}}>Terjual</Th>
                                <Th style={{textAlign: 'right'}}>Pendapatan</Th>
                                <Th style={{textAlign: 'right'}}>Modal</Th>
                                <Th style={{textAlign: 'right'}}>Laba Kotor</Th>
                                <Th style={{textAlign: 'center'}}>Marjin (%)</Th>
                            </Tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <Tr key={index}>
                                        {[...Array(6)].map((_, i) => <Td key={i}><Skeleton /></Td>)}
                                    </Tr>
                                ))
                            ) : reportData.length > 0 ? (
                                reportData.map(item => (
                                    <Tr key={item.id}>
                                        <Td>{item.name}</Td>
                                        <Td style={{textAlign: 'center'}}>{item.total_quantity_sold} unit</Td>
                                        <Td style={{textAlign: 'right'}}>{formatCurrency(item.total_revenue)}</Td>
                                        <Td style={{textAlign: 'right'}}>{formatCurrency(item.total_cost)}</Td>
                                        <Td style={{textAlign: 'right'}}>
                                            <ProfitText isNegative={item.total_profit < 0}>{formatCurrency(item.total_profit)}</ProfitText>
                                        </Td>
                                        <Td style={{textAlign: 'center'}}>{item.profit_margin_percentage}%</Td>
                                    </Tr>
                                ))
                            ) : (
                                <Tr>
                                    <Td colSpan="6" style={{textAlign: 'center', padding: '50px 0'}}>
                                        Tidak ada data penjualan pada rentang tanggal ini.
                                    </Td>
                                </Tr>
                            )}
                        </tbody>
                    </Table>
                </TableWrapper>
            </TableContainer>
        </PageContainer>
    );
}

export default ProductProfitabilityReport;