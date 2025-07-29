// frontend/src/pages/Dashboard/DashboardPage.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useReactToPrint } from 'react-to-print';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';

import {
    getStats, 
    getDailySales, 
    getProductSalesPerformance,
    getTopProducts, 
    getCashierPerformance, 
    getRecentSuppliers,
    getNotifications, 
    getInsights, 
    getRevenueTarget,
    getStockInfo, 
    getStaleProducts, 
    getExpiredProducts,
    getTopCustomers // Ensure this is imported now
} from '../../services/api';

import DashboardHeader from './components/DashboardHeader';
import StatCardGrid from './components/StatCardGrid';
import SalesChart from './components/SalesChart';
import InfoTabs from './components/InfoTabs';
import DailyReport from '../../components/DailyReport';
import NotificationsPanel from './components/NotificationsPanel';
import TopProductsChart from './components/TopProductsChart';
import TargetChart from '../../components/TargetChart';

import { FiCalendar, FiFastForward } from 'react-icons/fi';

// Import ShiftContext and Shift Modals
import { useShift } from '../../context/ShiftContext'; // Assuming this path
import StartShiftModal from '../../components/StartShiftModal'; // Assuming this path
import CloseShiftModal from '../../components/CloseShiftModal'; // Assuming this path

const DashboardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px;
    width: 100%;
    padding: 24px;
    @media (max-width: 1600px) { grid-template-columns: repeat(8, 1fr); }
    @media (max-width: 1200px) { grid-template-columns: repeat(6, 1fr); }
    @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const FilterContainer = styled.div`
    grid-column: 1 / -1;
    background-color: var(--bg-surface);
    padding: 20px 25px;
    border-radius: 16px;
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const DatePickerWrapper = styled.div`
    .react-datepicker-wrapper input {
        padding: 10px 15px;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        background-color: var(--bg-main);
        color: var(--text-primary);
        font-weight: 500;
        width: 130px;
        cursor: pointer;
        text-align: center;
    }
`;

const QuickAccessCard = styled.div`
    grid-column: 1 / -1;
    background: var(--bg-surface);
    padding: 28px;
    border-radius: 24px;
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: center;
    align-items: center;
`;

const QuickAccessButton = styled.button`
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 15px 30px;
    font-weight: 600;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover { 
        background-color: var(--primary-hover); 
        transform: translateY(-3px);
        box-shadow: 0 8px 15px rgba(0,0,0,0.1);
    }
`;

function DashboardPage() {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [userName, setUserName] = useState('Pengguna');
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        notifications: [],
        insights: [],
        productSalesPerformance: [],
        stats: {},
        stockInfo: [], 
        staleProducts: [],
        expiredProducts: [],
        topCustomers: [],
        cashierPerformance: [],
        recentSuppliers: [],
        dailySales: [],
        revenueTarget: 0 
    });
    const [dailyReportData, setDailyReportData] = useState(null);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d;
    });
    const [endDate, setEndDate] = useState(new Date());
    const reportRef = useRef(null);

    // --- Shift Management State and Handlers ---
    const { activeShift, refreshShiftStatus } = useShift();
    const [startShiftModalOpen, setStartShiftModalOpen] = useState(false);
    const [closeShiftModalOpen, setCloseShiftModalOpen] = useState(false);

    const handleStartShift = () => {
        setStartShiftModalOpen(true);
    };

    const handleCloseShift = () => {
        setCloseShiftModalOpen(true);
    };
    // --- End Shift Management ---

    const handlePrint = useReactToPrint({
        content: () => reportRef.current,
        documentTitle: `Laporan-Harian-${new Date().toISOString().slice(0, 10)}`,
        onAfterPrint: () => setDailyReportData(null),
    });

    const handlePrepareDailyReport = async () => {
        try {
            const [statsRes, topProductsRes] = await Promise.all([
                getStats(startDate, endDate),
                getTopProducts(startDate, endDate)
            ]);
            const transformedData = {
                reportDate: endDate.toISOString(),
                totalRevenue: statsRes.data.totalRevenue || 0,
                totalProfit: statsRes.data.totalProfit || 0,
                totalTransactions: statsRes.data.totalTransactions || 0,
                totalSoldUnits: statsRes.data.totalSoldUnits || 0,
                newCustomers: statsRes.data.newCustomers || 0,
                topProducts: topProductsRes.data || [],
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            };
            setDailyReportData(transformedData);
            toast.success("Laporan lengkap siap, silakan klik 'Cetak Laporan'.", {
                position: "bottom-left"
            });
        } catch (err) {
            console.error('Error preparing daily report:', err);
            toast.error("Gagal memuat data laporan harian yang lengkap.");
        }
    };

    const handleManualPrint = () => {
        if (!dailyReportData) {
            toast.error("Silakan siapkan laporan terlebih dahulu.");
            return;
        }
        if (reportRef.current) {
            handlePrint();
        } else {
            toast.error("Gagal mencetak: Komponen laporan tidak ditemukan.");
        }
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const decoded = jwtDecode(token);
                setUserName(decoded.name || 'Kasir');
            }

            const [
                statsRes, dailySalesRes, stockInfoRes, staleProductsRes, 
                expiredProductsRes, topCustomersRes, cashierPerformanceRes, recentSuppliersRes, 
                notificationsRes, insightsRes, productSalesPerformanceRes, revenueTargetRes
            ] = await Promise.all([
                getStats(startDate, endDate), 
                getDailySales(startDate, endDate),
                getStockInfo(), 
                getStaleProducts(30), 
                getExpiredProducts(30),
                getTopCustomers(startDate, endDate), // This line
                getCashierPerformance(startDate, endDate), // This line
                getRecentSuppliers(5), // This line
                getNotifications(startDate, endDate), // This line
                getInsights(startDate, endDate), // This line
                getProductSalesPerformance(startDate, endDate), // This line
                getRevenueTarget() // This line
            ]);

            setDashboardData({
                stats: { ...statsRes.data, monthly_revenue_target: revenueTargetRes.data.monthly_revenue_target },
                dailySales: dailySalesRes.data, 
                stockInfo: stockInfoRes.data, 
                staleProducts: staleProductsRes.data, 
                expiredProducts: expiredProductsRes.data, 
                topCustomers: topCustomersRes.data,
                cashierPerformance: cashierPerformanceRes.data, 
                recentSuppliers: recentSuppliersRes.data,
                notifications: notificationsRes.data, 
                insights: insightsRes.data,
                productSalesPerformance: productSalesPerformanceRes.data
            });
        } catch (err) {
            toast.error("Gagal memuat sebagian data dashboard.");
            console.error("Dashboard data fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRefresh = () => fetchData();

    return (
        <DashboardGrid>
            <DashboardHeader
                currentTime={currentTime}
                onRefresh={handleRefresh}
                onPrint={handlePrepareDailyReport}
                onManualPrint={handleManualPrint}
                // Pass shift-related props to DashboardHeader
                activeShift={activeShift}
                onStartShift={handleStartShift}
                onCloseShift={handleCloseShift}
            />
            <FilterContainer>
                <FiCalendar size={20} style={{color: 'var(--text-secondary)'}}/>
                <span>Tampilkan Data Dari:</span>
                <DatePickerWrapper>
                    <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} dateFormat="dd/MM/yyyy" maxDate={endDate} />
                </DatePickerWrapper>
                <span>sampai</span>
                <DatePickerWrapper>
                    <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} dateFormat="dd/MM/yyyy" minDate={startDate} />
                </DatePickerWrapper>
            </FilterContainer>

            <StatCardGrid loading={loading} stats={dashboardData.stats} userName={userName} />
            <NotificationsPanel loading={loading} notifications={dashboardData.notifications || []} insights={dashboardData.insights || []} />
            <TargetChart loading={loading} stats={dashboardData.stats} />
            <SalesChart loading={loading} data={dashboardData.dailySales} />
            <TopProductsChart loading={loading} data={dashboardData.productSalesPerformance} />
            <InfoTabs loading={loading} data={dashboardData} />
            
            <QuickAccessCard>
                <QuickAccessButton onClick={() => navigate('/quick-actions')}>
                    <FiFastForward size={22} />
                    Lihat Semua Aksi & Manajemen
                </QuickAccessButton>
            </QuickAccessCard>

            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <DailyReport ref={reportRef} data={dailyReportData} />
            </div>

            {/* Shift Modals */}
            {startShiftModalOpen && (
                <StartShiftModal
                    isOpen={startShiftModalOpen}
                    onClose={() => setStartShiftModalOpen(false)}
                    onSuccess={refreshShiftStatus} // Call refreshShiftStatus after successful shift start
                />
            )}
            {closeShiftModalOpen && (
                <CloseShiftModal
                    isOpen={closeShiftModalOpen}
                    onClose={() => setCloseShiftModalOpen(false)}
                    onSuccess={refreshShiftStatus} // Call refreshShiftStatus after successful shift close
                />
            )}
        </DashboardGrid>
    );
}

export default DashboardPage;
