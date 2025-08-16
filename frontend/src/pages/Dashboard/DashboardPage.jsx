// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\Dashboard\DashboardPage.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useReactToPrint } from 'react-to-print';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import "react-datepicker/dist/react-datepicker.css";
import {
    getStats, getDailyRevenueProfit, getTopProducts,
    getCashierPerformance, getNotifications, getInsights,
    getRevenueTarget, getStockInfo, getStaleProducts, getExpiredProducts,
    getTopCustomers
} from '../../services/api';
import { motion } from 'framer-motion';
import PageWrapper from '../../components/PageWrapper';
import DashboardHeader from './components/DashboardHeader';
import StatCardGrid from './components/StatCardGrid';
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
import { useShift } from '../../context/ShiftContext';
import StartShiftModal from '../../components/StartShiftModal';
import CloseShiftModal from '../../components/CloseShiftModal';

const DashboardGrid = styled(motion.div)`
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px;
    width: 100%;
`;

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100
        }
    }
};

function DashboardPage() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [userName, setUserName] = useState('Pengguna');
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        stats: { current: {}, previous: null },
        dailyRevenueProfit: [],
        topCustomers: [],
        stockInfo: [],
        staleProducts: [],
        expiredProducts: [],
        cashierPerformance: [],
        notifications: [],
        insights: [],
        topProducts: [],
    });
    const [revenueTarget, setRevenueTarget] = useState(0);
    const [dailyReportData, setDailyReportData] = useState(null);
    const reportRef = useRef();
    const { activeShift, refreshShiftStatus } = useShift();
    const [isStartShiftModalOpen, setStartShiftModalOpen] = useState(false);
    const [isCloseShiftModalOpen, setCloseShiftModalOpen] = useState(false);
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 29)));
    const [endDate, setEndDate] = useState(new Date());

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [
                    statsData, revenueTargetData, dailyRevenueProfitData, topCustomersData, stockInfoData,
                    staleProductsData, expiredProductsData, cashierPerformanceData,
                    notificationsData, insightsData, topProductsData
                ] = await Promise.all([
                    getStats(startDate, endDate),
                    getRevenueTarget(),
                    getDailyRevenueProfit(startDate, endDate),
                    getTopCustomers(startDate, endDate),
                    getStockInfo(),
                    getStaleProducts(),
                    getExpiredProducts(),
                    getCashierPerformance(startDate, endDate),
                    getNotifications(),
                    getInsights(startDate, endDate),
                    getTopProducts(startDate, endDate),
                ]);
                setDashboardData({
                    stats: statsData.data,
                    dailyRevenueProfit: dailyRevenueProfitData.data,
                    topCustomers: topCustomersData.data,
                    stockInfo: stockInfoData.data,
                    staleProducts: staleProductsData.data,
                    expiredProducts: expiredProductsData.data,
                    cashierPerformance: cashierPerformanceData.data,
                    notifications: notificationsData.data,
                    insights: insightsData.data,
                    topProducts: topProductsData.data,
                });
                setRevenueTarget(revenueTargetData.data.monthly_revenue_target);
            } catch (error) {
                toast.error("Gagal memuat data dashboard.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [startDate, endDate]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        const token = localStorage.getItem('token');
        if (token) setUserName(jwtDecode(token).name || 'Kasir');
        return () => clearInterval(timer);
    }, []);

    const handlePrepareDailyReport = useCallback(() => {
        const reportPayload = {
            startDate,
            endDate,
            ...dashboardData.stats.current,
            topProducts: dashboardData.topProducts,
        };
        setDailyReportData(reportPayload);
        toast.info("Laporan harian siap, klik 'Cetak Laporan' untuk mencetak.");
    }, [startDate, endDate, dashboardData]);

    const handleManualPrint = useReactToPrint({ 
        content: () => reportRef.current,
        documentTitle: `Laporan-Harian-${new Date().toISOString().slice(0, 10)}`
    });
    
    useEffect(() => {
        if (dailyReportData) {
            handleManualPrint();
        }
    }, [dailyReportData, handleManualPrint]);


    return (
        <>
            <PageWrapper loading={loading}>
                <DashboardGrid
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                >
                    <motion.div variants={itemVariants} style={{ gridColumn: '1 / -1' }}>
                        <DashboardHeader
                            currentTime={currentTime}
                            onRefresh={() => {
                                setStartDate(new Date(startDate));
                                setEndDate(new Date(endDate));
                            }}
                            onPrint={handlePrepareDailyReport}
                            onManualPrint={handleManualPrint}
                            activeShift={activeShift}
                            onStartShift={() => setStartShiftModalOpen(true)}
                            onCloseShift={() => setCloseShiftModalOpen(true)}
                            userName={userName}
                            isRefreshing={loading}
                        />
                    </motion.div>
                    
                    <motion.div variants={itemVariants} style={{ gridColumn: '1 / -1' }}>
                        <StatCardGrid
                            loading={loading}
                            stats={dashboardData.stats.current}
                            previousStats={dashboardData.stats.previous}
                            userName={userName}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} style={{ gridColumn: '1 / -1' }}>
                        <TargetChart
                            loading={loading}
                            stats={{ ...dashboardData.stats.current, monthly_revenue_target: revenueTarget }}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} style={{ gridColumn: '1 / -1' }}>
                        <ProfitRevenueChart
                            loading={loading}
                            data={dashboardData.dailyRevenueProfit}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} style={{ gridColumn: '1 / -1' }}>
                        <TopProductsChart
                            loading={loading}
                            data={dashboardData.topProducts}
                        />
                    </motion.div>
                    
                    <motion.div variants={itemVariants} style={{ gridColumn: '1 / -1' }}>
                        <NotificationsPanel
                            loading={loading}
                            notifications={dashboardData.notifications}
                            insights={dashboardData.insights}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} style={{ gridColumn: '1 / -1' }}>
                        <TopCustomersList
                            loading={loading}
                            topCustomers={dashboardData.topCustomers}
                        />
                    </motion.div>
                    
                    <motion.div variants={itemVariants} style={{ gridColumn: '1 / -1' }}>
                        <CashierPerformanceList
                            loading={loading}
                            cashierPerformance={dashboardData.cashierPerformance}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} style={{ gridColumn: '1 / -1' }}>
                        <StockInfoList
                            loading={loading}
                            stockInfo={dashboardData.stockInfo}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} style={{ gridColumn: '1 / -1' }}>
                        <StaleProductsList
                            loading={loading}
                            staleProducts={dashboardData.staleProducts}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} style={{ gridColumn: '1 / -1' }}>
                        <ExpiredProductsList
                            loading={loading}
                            expiredProducts={dashboardData.expiredProducts}
                        />
                    </motion.div>
                </DashboardGrid>
            </PageWrapper>
            
            {isStartShiftModalOpen && <StartShiftModal onShiftStarted={() => { refreshShiftStatus(); setStartShiftModalOpen(false); }} />}
            {isCloseShiftModalOpen && activeShift && <CloseShiftModal shiftId={activeShift.id} onShiftClosed={() => { refreshShiftStatus(); setCloseShiftModalOpen(false); }} onClose={() => setCloseShiftModalOpen(false)} />}
            <div style={{ display: 'none' }}><DailyReport ref={reportRef} data={dailyReportData} /></div>
        </>
    );
}

export default DashboardPage;