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
    getTopCustomers,
    getDailyRevenueProfit // <-- Import new function
} from '../../services/api';

import DashboardHeader from './components/DashboardHeader';
import StatCardGrid from './components/StatCardGrid';
import SalesChart from './components/SalesChart';
import InfoTabs from './components/InfoTabs';
import DailyReport from '../../components/DailyReport';
import NotificationsPanel from './components/NotificationsPanel';
import TopProductsChart from './components/TopProductsChart';
import TargetChart from '../../components/TargetChart';
import ProfitRevenueChart from './components/ProfitRevenueChart'; // <-- Import new component

import { FiCalendar, FiFastForward } from 'react-icons/fi';

import { useShift } from '../../context/ShiftContext';
import StartShiftModal from '../../components/StartShiftModal';
import CloseShiftModal from '../../components/CloseShiftModal';

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
    flex-direction: column; 
    gap: 15px; /* Increased gap between filter rows */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const FilterRow = styled.div`
    display: flex;
    align-items: center;
    gap: 12px; /* Adjusted gap for better spacing within a row */
    flex-wrap: wrap; 

    /* Style for the text labels like "Tampilkan Data Dari:" and "sampai" */
    span {
        color: var(--text-secondary);
        font-weight: 500;
        white-space: nowrap; /* Prevent text from wrapping */
    }

    /* Ensure icon is aligned */
    .fi-calendar {
        color: var(--text-secondary);
        margin-right: 3px; /* Small margin to separate from text */
    }
`;

const DatePickerWrapper = styled.div`
    .react-datepicker-wrapper {
        display: flex; /* Make the wrapper a flex container to center input */
        align-items: center;
    }
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
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
        &:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 98, 0, 234), 0.2);
        }
    }
`;

const CheckboxContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    font-weight: 500;
    input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: var(--primary-color); 
        cursor: pointer;
    }
    label {
        cursor: pointer; /* Make label clickable for checkbox */
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
        stats: { current: {}, previous: null },
        stockInfo: [], 
        staleProducts: [],
        expiredProducts: [],
        topCustomers: [],
        cashierPerformance: [],
        recentSuppliers: [],
        dailySales: [],
        dailyRevenueProfit: [], // <-- New state for daily revenue vs profit
    });
    const [dailyReportData, setDailyReportData] = useState(null);
    
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 29); 
        return d;
    });
    const [endDate, setEndDate] = useState(new Date());

    const [isComparing, setIsComparing] = useState(false);
    const [compareStartDate, setCompareStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 59); 
        return d;
    });
    const [compareEndDate, setCompareEndDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30); 
        return d;
    });

    const reportRef = useRef(null);

    const { activeShift, refreshShiftStatus } = useShift();
    const [startShiftModalOpen, setStartShiftModalOpen] = useState(false);
    const [closeShiftModalOpen, setCloseShiftModalOpen] = useState(false);

    const handleStartShift = () => setStartShiftModalOpen(true);
    const handleCloseShift = () => setCloseShiftModalOpen(true);

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
                totalRevenue: statsRes.data.current.totalRevenue || 0, 
                totalProfit: statsRes.data.current.totalProfit || 0,   
                totalTransactions: statsRes.data.current.totalTransactions || 0, 
                totalSoldUnits: statsRes.data.current.totalSoldUnits || 0,     
                newCustomers: statsRes.data.current.newCustomers || 0,         
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

            let statsCall;
            if (isComparing) {
                statsCall = getStats(startDate, endDate, compareStartDate, compareEndDate);
            } else {
                statsCall = getStats(startDate, endDate);
            }

            const [
                statsRes, revenueTargetRes, dailySalesRes, stockInfoRes, staleProductsRes, 
                expiredProductsRes, topCustomersRes, cashierPerformanceRes, recentSuppliersRes, 
                notificationsRes, insightsRes, productSalesPerformanceRes, dailyRevenueProfitRes // <-- Fetch new data
            ] = await Promise.all([
                statsCall, 
                getRevenueTarget(), 
                getDailySales(startDate, endDate),
                getStockInfo(), 
                getStaleProducts(30), 
                getExpiredProducts(30),
                getTopCustomers(startDate, endDate),
                getCashierPerformance(startDate, endDate), 
                getRecentSuppliers(5),
                getNotifications(), 
                getInsights(startDate, endDate),
                getProductSalesPerformance(startDate, endDate),
                getDailyRevenueProfit(startDate, endDate) // <-- Call the new API function
            ]);
            
            const finalStats = {
                current: {
                    ...statsRes.data.current,
                    monthly_revenue_target: revenueTargetRes.data.monthly_revenue_target
                },
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
                dailyRevenueProfit: dailyRevenueProfitRes.data, // <-- Save the new data
            });
        } catch (err) {
            toast.error("Gagal memuat sebagian data dashboard.");
            console.error("Dashboard data fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, isComparing, compareStartDate, compareEndDate]); 

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (isComparing) {
            const diffTime = endDate.getTime() - startDate.getTime();
            const newCompareEndDate = new Date(startDate.getTime() - (24 * 60 * 60 * 1000)); 
            const newCompareStartDate = new Date(newCompareEndDate.getTime() - diffTime);
            setCompareStartDate(newCompareStartDate);
            setCompareEndDate(newCompareEndDate);
        }
    }, [startDate, endDate, isComparing]);


    const handleRefresh = () => fetchData();

    return (
        <DashboardGrid>
            <DashboardHeader
                currentTime={currentTime}
                onRefresh={handleRefresh}
                onPrint={handlePrepareDailyReport}
                onManualPrint={handleManualPrint}
                activeShift={activeShift}
                onStartShift={handleStartShift}
                onCloseShift={handleCloseShift}
            />
            <FilterContainer>
                <FilterRow>
                    <FiCalendar size={20} className="fi-calendar" />
                    <span>Tampilkan Data Dari:</span>
                    <DatePickerWrapper>
                        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} dateFormat="dd/MM/yyyy" maxDate={endDate} />
                    </DatePickerWrapper>
                    <span>sampai</span>
                    <DatePickerWrapper>
                        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} dateFormat="dd/MM/yyyy" minDate={startDate} />
                    </DatePickerWrapper>
                </FilterRow>
                <FilterRow>
                    <CheckboxContainer>
                        <input type="checkbox" id="compare-checkbox" checked={isComparing} onChange={(e) => setIsComparing(e.target.checked)} />
                        <label htmlFor="compare-checkbox">Bandingkan dengan Periode Lain</label>
                    </CheckboxContainer>
                    {isComparing && (
                        <>
                            <DatePickerWrapper>
                                <DatePicker selected={compareStartDate} onChange={(date) => setCompareStartDate(date)} dateFormat="dd/MM/yyyy" maxDate={compareEndDate} />
                            </DatePickerWrapper>
                            <span>sampai</span>
                            <DatePickerWrapper>
                                <DatePicker selected={compareEndDate} onChange={(date) => setCompareEndDate(date)} dateFormat="dd/MM/yyyy" minDate={compareStartDate} />
                            </DatePickerWrapper>
                        </>
                    )}
                </FilterRow>
            </FilterContainer>

            <StatCardGrid 
                loading={loading} 
                stats={dashboardData.stats.current} 
                previousStats={dashboardData.stats.previous} 
                userName={userName} 
            />
            <NotificationsPanel loading={loading} notifications={dashboardData.notifications || []} insights={dashboardData.insights || []} />
            
            <TargetChart loading={loading} stats={dashboardData.stats.current} /> 
            
            <SalesChart loading={loading} data={dashboardData.dailySales} />
            
            {/* NEW CHART DISPLAYED HERE */}
            <ProfitRevenueChart loading={loading} data={dashboardData.dailyRevenueProfit} />

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
            
            {startShiftModalOpen && (
                <StartShiftModal onShiftStarted={() => {
                    setStartShiftModalOpen(false);
                    refreshShiftStatus();
                }} />
            )}
            {closeShiftModalOpen && activeShift && (
                <CloseShiftModal
                    shiftId={activeShift.id}
                    onClose={() => setCloseShiftModalOpen(false)}
                    onShiftClosed={() => {
                        setCloseShiftModalOpen(false);
                        refreshShiftStatus();
                    }}
                />
            )}
        </DashboardGrid>
    );
}

export default DashboardPage;
