import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useReactToPrint } from 'react-to-print';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';

import {
    getStats, getDailySales, getProductSalesPerformance, getTopProducts,
    getCashierPerformance, getRecentSuppliers, getNotifications, getInsights,
    getRevenueTarget, getStockInfo, getStaleProducts, getExpiredProducts,
    getTopCustomers, getDailyRevenueProfit
} from '../../services/api';

import DashboardHeader from './components/DashboardHeader';
import StatCardGrid from './components/StatCardGrid';
import SalesChart from './components/SalesChart';
import DailyReport from '../../components/DailyReport';
import NotificationsPanel from './components/NotificationsPanel';
import TopProductsChart from './components/TopProductsChart';
import TargetChart from '../../components/TargetChart';
import ProfitRevenueChart from './components/ProfitRevenueChart';
import TopCustomersList from './components/TopCustomersList';
import StockInfoList from './components/StockInfoList';
import StaleProductsList from './components/StaleProductsList';
import ExpiredProductsList from './components/ExpiredProductsList';
import CashierPerformanceList from './components/CashierPerformanceList';
import RecentSuppliersList from './components/RecentSuppliersList';
import { FiCalendar, FiFastForward } from 'react-icons/fi';
import { useShift } from '../../context/ShiftContext';
import StartShiftModal from '../../components/StartShiftModal';
import CloseShiftModal from '../../components/CloseShiftModal';
import AnimatedPage from '../../components/AnimatedPage';

const DashboardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px;
    width: 100%;
    padding: 24px;
`;

const FilterContainer = styled.div`
    grid-column: 1 / -1;
    background-color: var(--bg-surface);
    padding: 20px 25px;
    border-radius: 16px;
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 15px;
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
const FilterRow = styled.div` display: flex; align-items: center; gap: 15px; flex-wrap: wrap; `;
const CheckboxContainer = styled.div` display: flex; align-items: center; gap: 8px; `;
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
    const [dashboardData, setDashboardData] = useState({ stats: { current: {}, previous: null }, dailyRevenueProfit: [] });
    const [dailyReportData, setDailyReportData] = useState(null);
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 29)));
    const [endDate, setEndDate] = useState(new Date());
    const [isComparing, setIsComparing] = useState(false);
    const [compareStartDate, setCompareStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 59)));
    const [compareEndDate, setCompareEndDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
    const reportRef = useRef(null);
    const { activeShift, refreshShiftStatus } = useShift();
    const [startShiftModalOpen, setStartShiftModalOpen] = useState(false);
    const [closeShiftModalOpen, setCloseShiftModalOpen] = useState(false);

    const handleStartShift = () => setStartShiftModalOpen(true);
    const handleCloseShift = () => setCloseShiftModalOpen(true);
    const handlePrint = useReactToPrint({ content: () => reportRef.current });

    const handlePrepareDailyReport = async () => {
        // ... (fungsi ini tidak berubah)
    };
    const handleManualPrint = () => {
        // ... (fungsi ini tidak berubah)
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (token) setUserName(jwtDecode(token).name || 'Kasir');

            const statsParams = { startDate, endDate };
            if (isComparing) {
                statsParams.compareStartDate = compareStartDate;
                statsParams.compareEndDate = compareEndDate;
            }

            const [
                statsRes, revenueTargetRes, dailySalesRes, stockInfoRes, staleProductsRes,
                expiredProductsRes, topCustomersRes, cashierPerformanceRes, recentSuppliersRes,
                notificationsRes, insightsRes, productSalesPerformanceRes, dailyRevenueProfitRes
            ] = await Promise.all([
                getStats(statsParams.startDate, statsParams.endDate, isComparing ? statsParams.compareStartDate : null, isComparing ? statsParams.compareEndDate : null),
                getRevenueTarget(), getDailySales(startDate, endDate), getStockInfo(),
                getStaleProducts(), getExpiredProducts(), getTopCustomers(startDate, endDate),
                getCashierPerformance(startDate, endDate), getRecentSuppliers(), getNotifications(),
                getInsights(startDate, endDate), getProductSalesPerformance(startDate, endDate),
                getDailyRevenueProfit(startDate, endDate)
            ]);

            const finalStats = {
                current: { ...statsRes.data.current, monthly_revenue_target: revenueTargetRes.data.monthly_revenue_target },
                previous: statsRes.data.previous
            };

            setDashboardData({
                stats: finalStats,
                dailySales: dailySalesRes.data,
                stockInfo: stockInfoRes.data,
                staleProducts: staleProductsRes.data,
                expiredProducts: expiredProductsRes.data,
                topCustomers: topCustomersRes.data,
                cashierPerformance: cashierPerformanceRes.data,
                recentSuppliers: recentSuppliersRes.data,
                notifications: notificationsRes.data,
                insights: insightsRes.data,
                productSalesPerformance: productSalesPerformanceRes.data,
                dailyRevenueProfit: dailyRevenueProfitRes.data,
            });
        } catch (err) {
            toast.error("Gagal memuat sebagian data dashboard.");
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, isComparing, compareStartDate, compareEndDate]);

    useEffect(() => { fetchData(); }, [fetchData]);

    return (
        <AnimatedPage>
            <DashboardGrid>
                <DashboardHeader
                    currentTime={currentTime} onRefresh={fetchData} onPrint={handlePrepareDailyReport}
                    onManualPrint={handleManualPrint} activeShift={activeShift} onStartShift={handleStartShift}
                    onCloseShift={handleCloseShift} userName={userName}
                />
                <FilterContainer>
                    <FilterRow>
                        <FiCalendar size={20} />
                        <span>Tampilkan Data Dari:</span>
                        <DatePickerWrapper><DatePicker selected={startDate} onChange={setStartDate} dateFormat="dd/MM/yyyy" maxDate={endDate} /></DatePickerWrapper>
                        <span>sampai</span>
                        <DatePickerWrapper><DatePicker selected={endDate} onChange={setEndDate} dateFormat="dd/MM/yyyy" minDate={startDate} /></DatePickerWrapper>
                    </FilterRow>
                    <FilterRow>
                        <CheckboxContainer>
                            <input type="checkbox" id="compare-checkbox" checked={isComparing} onChange={(e) => setIsComparing(e.target.checked)} />
                            <label htmlFor="compare-checkbox">Bandingkan dengan Periode Lain</label>
                        </CheckboxContainer>
                        {isComparing && (
                            <>
                                <DatePickerWrapper><DatePicker selected={compareStartDate} onChange={setCompareStartDate} dateFormat="dd/MM/yyyy" maxDate={compareEndDate} /></DatePickerWrapper>
                                <span>sampai</span>
                                <DatePickerWrapper><DatePicker selected={compareEndDate} onChange={setCompareEndDate} dateFormat="dd/MM/yyyy" minDate={compareStartDate} /></DatePickerWrapper>
                            </>
                        )}
                    </FilterRow>
                </FilterContainer>
                
                <StatCardGrid loading={loading} stats={dashboardData.stats.current} previousStats={dashboardData.stats.previous} userName={userName} />
                <NotificationsPanel loading={loading} notifications={dashboardData.notifications} insights={dashboardData.insights} />
                <TargetChart loading={loading} stats={dashboardData.stats.current} />
                <SalesChart loading={loading} data={dashboardData.dailySales} />
                <ProfitRevenueChart loading={loading} data={dashboardData.dailyRevenueProfit} />
                <TopProductsChart loading={loading} data={dashboardData.productSalesPerformance} />
                <TopCustomersList loading={loading} topCustomers={dashboardData.topCustomers} />
                <StockInfoList loading={loading} stockInfo={dashboardData.stockInfo} />
                <StaleProductsList loading={loading} staleProducts={dashboardData.staleProducts} />
                <ExpiredProductsList loading={loading} expiredProducts={dashboardData.expiredProducts} />
                <CashierPerformanceList loading={loading} cashierPerformance={dashboardData.cashierPerformance} />
                <RecentSuppliersList loading={loading} recentSuppliers={dashboardData.recentSuppliers} />

                <QuickAccessCard>
                    <QuickAccessButton onClick={() => navigate('/quick-actions')}>
                        <FiFastForward size={22} />
                        Lihat Semua Aksi & Manajemen
                    </QuickAccessButton>
                </QuickAccessCard>

                <div style={{ display: 'none' }}><DailyReport ref={reportRef} data={dailyReportData} /></div>
                
                {startShiftModalOpen && <StartShiftModal onShiftStarted={() => { setStartShiftModalOpen(false); refreshShiftStatus(); }} />}
                {closeShiftModalOpen && activeShift && <CloseShiftModal shiftId={activeShift.id} onClose={() => setCloseShiftModalOpen(false)} onShiftClosed={() => { setCloseShiftModalOpen(false); refreshShiftStatus(); }} />}
            </DashboardGrid>
        </AnimatedPage>
    );
}

export default DashboardPage;