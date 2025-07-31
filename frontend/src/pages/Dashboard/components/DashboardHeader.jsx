import React from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes, css } from 'styled-components'; // Import keyframes dan css
import { FiRefreshCw, FiPrinter, FiPlayCircle, FiPauseCircle } from 'react-icons/fi';

const HeaderContainer = styled.div`
    grid-column: 1 / -1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background-color: var(--bg-surface);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    flex-wrap: wrap;
    gap: 15px;
`;

const InfoGroup = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-grow: 1;
    min-width: 180px;
`;

const Greeting = styled.h2`
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.2;
`;

const TimeDisplay = styled.div`
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-secondary);
    margin-top: 4px;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
`;

const Button = styled.button`
    padding: 10px 20px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s, transform 0.2s, box-shadow 0.2s; /* Tambah box-shadow */
    position: relative; /* Penting untuk pseudo-element */
    overflow: hidden; /* Penting untuk efek riak */

    &:hover {
        background-color: var(--primary-hover);
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
    }

    &:active {
        transform: translateY(0);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        background-color: var(--primary-dark); /* Warna sedikit lebih gelap saat diklik */
    }

    &:disabled {
        background-color: var(--disabled-color);
        cursor: not-allowed;
        transform: none;
        opacity: 0.7;
        box-shadow: none;
    }
`;

const ShiftButton = styled(Button)`
    background-color: ${props => props.$activeShift ? 'var(--red-color)' : 'var(--green-color)'};
    &:hover {
        background-color: ${props => props.$activeShift ? 'var(--red-hover)' : 'var(--green-hover)'};
    }
    &:active {
        background-color: ${props => props.$activeShift ? 'var(--red-dark)' : 'var(--green-dark)'};
    }
`;

// --- Animasi Putaran yang lebih Dinamis ---
const rotateDynamic = keyframes`
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
`;

// --- Animasi "Pop" saat Refresh Dimulai (satu kali) ---
const initialPop = keyframes`
    0% {
        transform: scale(0.8);
        opacity: 0;
    }
    70% {
        transform: scale(1.1);
        opacity: 1;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
`;

// Gaya untuk Ikon Refresh yang bisa berputar
const RotatingRefreshIcon = styled(FiRefreshCw)`
    display: block; /* Pastikan ukuran ikon dihormati */
    width: 20px; /* Ukuran konsisten */
    height: 20px;
    
    // Transisi halus untuk perubahan warna saat isRefreshing berubah
    transition: color 0.3s ease-in-out, transform 0.1s;
    color: var(--text-secondary); /* Warna default ikon */

    ${props => props.$isRefreshing && css`
        // Animasi utama saat isRefreshing aktif
        animation: 
            ${rotateDynamic} 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite, /* Rotasi dengan ease-in-out */
            ${initialPop} 0.3s ease-out forwards; /* Efek pop awal satu kali */
        color: var(--primary-color); /* Warna ikon saat refreshing */
    `}
`;

const getGreeting = (hour) => {
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 18) return 'Selamat Siang';
    return 'Selamat Malam';
};

const DashboardHeader = ({ currentTime, onRefresh, onPrint, onManualPrint, activeShift, onStartShift, onCloseShift, userName, isRefreshing }) => {
    const currentHour = currentTime.getHours();
    const greeting = getGreeting(currentHour);

    return (
        <HeaderContainer>
            <InfoGroup>
                <Greeting>{greeting}, {userName}!</Greeting>
                <TimeDisplay>
                    {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    {' | '}
                    {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </TimeDisplay>
            </InfoGroup>
            <ButtonGroup>
                <ShiftButton
                    $activeShift={activeShift}
                    onClick={activeShift ? onCloseShift : onStartShift}
                    disabled={isRefreshing}
                >
                    {activeShift ? <FiPauseCircle /> : <FiPlayCircle />}
                    {activeShift ? 'Tutup Shift' : 'Mulai Shift'}
                </ShiftButton>
                
                {/* Tombol Refresh dengan Ikon Berputar dan Teks yang berubah */}
                <Button onClick={onRefresh} disabled={isRefreshing} aria-live="polite">
                    <RotatingRefreshIcon size={20} $isRefreshing={isRefreshing} />
                    {isRefreshing ? 'Memuat Data...' : 'Refresh Data'}
                </Button>

                <Button onClick={onPrint} disabled={isRefreshing}>
                    <FiPrinter /> Siapkan Laporan
                </Button>
                <Button onClick={onManualPrint} disabled={isRefreshing}>
                    <FiPrinter /> Cetak Laporan
                </Button>
            </ButtonGroup>
        </HeaderContainer>
    );
};

export default DashboardHeader;

DashboardHeader.propTypes = {
    currentTime: PropTypes.instanceOf(Date).isRequired,
    onRefresh: PropTypes.func.isRequired,
    onPrint: PropTypes.func.isRequired,
    onManualPrint: PropTypes.func.isRequired,
    activeShift: PropTypes.object,
    onStartShift: PropTypes.func.isRequired,
    onCloseShift: PropTypes.func.isRequired,
    userName: PropTypes.string.isRequired,
    isRefreshing: PropTypes.bool.isRequired,
};