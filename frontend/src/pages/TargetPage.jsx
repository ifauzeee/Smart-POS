// frontend/src/pages/TargetPage.jsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getRevenueTarget, saveRevenueTarget } from '../services/api';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiTarget, FiDollarSign, FiCalendar, FiSun } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';

// --- Styled Components (Tidak Ada Perubahan) ---
const PageContainer = styled.div`
    padding: 30px;
    max-width: 900px;
    margin: 0 auto;
`;

const PageHeader = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
`;

const Title = styled.h1`
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    gap: 12px;
`;

const BackButton = styled.button`
    background-color: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    &:hover { background-color: var(--bg-main); }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const SettingsCard = styled.div`
    background-color: var(--bg-surface);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    padding: 25px;
`;

const CardTitle = styled.h3`
    font-size: 1.2rem;
    font-weight: 600;
    padding-bottom: 15px;
    margin: 0 0 25px 0;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 10px;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const InputGroup = styled.div``;

const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-secondary);
`;

const Input = styled.input`
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    background-color: var(--bg-main);
    color: var(--text-primary);
    &:focus { outline: none; border-color: var(--primary-color); }
`;

const Button = styled.button`
    padding: 12px 20px;
    border-radius: 8px;
    border: none;
    background-color: var(--primary-color);
    color: white;
    font-weight: 600;
    cursor: pointer;
    align-self: flex-end;
    &:hover { opacity: 0.9; }
`;

const CalculationResult = styled.div`
    background-color: var(--bg-main);
    border-radius: 8px;
    padding: 15px;
    margin-top: 15px;
    p {
        margin: 0 0 8px 0;
        color: var(--text-secondary);
        strong {
            color: var(--text-primary);
        }
    }
`;

// --- FUNGSI HELPER UNTUK FORMAT ANGKA ---
const formatToCurrency = (value) => {
    if (!value) return '';
    const number = Number(String(value).replace(/[^0-9]/g, ''));
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('id-ID').format(number);
};

const parseFromCurrency = (value) => {
    if (!value) return '';
    return String(value).replace(/[^0-9]/g, '');
};


function TargetPage() {
    const navigate = useNavigate();
    const [monthlyTarget, setMonthlyTarget] = useState('');
    const [calculatorTarget, setCalculatorTarget] = useState('');
    const [loading, setLoading] = useState(true);
    const [calculation, setCalculation] = useState(null);

    useEffect(() => {
        const fetchTarget = async () => {
            try {
                const res = await getRevenueTarget();
                const targetValue = res.data.monthly_revenue_target || '';
                setMonthlyTarget(targetValue);
                setCalculatorTarget(targetValue);
            } catch (error) {
                toast.error("Gagal memuat target pendapatan.");
            } finally {
                setLoading(false);
            }
        };
        fetchTarget();
    }, []);

    const handleTargetSave = async (e) => {
        e.preventDefault();
        const targetValue = parseFloat(monthlyTarget);
        if (isNaN(targetValue) || targetValue < 0) {
            toast.error("Mohon masukkan angka yang valid.");
            return;
        }
        try {
            await toast.promise(saveRevenueTarget({ target: targetValue }), {
                pending: 'Menyimpan target...',
                success: 'Target pendapatan berhasil disimpan!',
                error: 'Gagal menyimpan target.'
            });
        } catch (error) {
            console.error("Error saving target:", error);
        }
    };
    
    useEffect(() => {
        const target = parseFloat(calculatorTarget);
        if (!isNaN(target) && target > 0) {
            const daysInMonth = 30; // Asumsi rata-rata 30 hari
            const weeksInMonth = 4; // Asumsi 4 minggu
            setCalculation({
                daily: target / daysInMonth,
                // ✅ PERBAIKAN: Target mingguan dibagi 4, bukan dikali 7 dari harian
                weekly: target / weeksInMonth,
            });
        } else {
            setCalculation(null);
        }
    }, [calculatorTarget]);
    
    const formatDisplayCurrency = (value) => `Rp ${formatToCurrency(value)}`;
    const formatCalculatedCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);

    return (
        <PageContainer>
            <PageHeader>
                <Title><FiTarget /> Pengaturan Target</Title>
                <BackButton onClick={() => navigate('/dashboard')}>
                    <FiArrowLeft size={18} />
                    Kembali ke Dashboard
                </BackButton>
            </PageHeader>
            
            {loading ? <Skeleton height={300} /> : (
                <Grid>
                    <SettingsCard>
                        <CardTitle><FiCalendar /> Target Pendapatan Bulanan</CardTitle>
                        <Form onSubmit={handleTargetSave}>
                            <InputGroup>
                                <Label htmlFor="monthlyTarget">Masukkan Target (Rp)</Label>
                                <Input
                                    id="monthlyTarget"
                                    type="text"
                                    value={formatDisplayCurrency(monthlyTarget)}
                                    onChange={(e) => setMonthlyTarget(parseFromCurrency(e.target.value))}
                                    placeholder="Contoh: 50.000.000"
                                />
                                <small style={{ color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>
                                    Target ini akan digunakan untuk melacak progres di dasbor.
                                </small>
                            </InputGroup>
                            <Button type="submit">Simpan Target</Button>
                        </Form>
                    </SettingsCard>
                    
                    <SettingsCard>
                        <CardTitle><FiDollarSign /> Kalkulator Target</CardTitle>
                        <InputGroup>
                            <Label htmlFor="calculatorTarget">Jika Saya Ingin Pendapatan (Rp)</Label>
                            <Input
                                id="calculatorTarget"
                                type="text"
                                value={formatDisplayCurrency(calculatorTarget)}
                                onChange={(e) => setCalculatorTarget(parseFromCurrency(e.target.value))}
                                placeholder="Masukkan target bulanan..."
                            />
                        </InputGroup>

                        {calculation && (
                            <CalculationResult>
                                <p>Maka, Anda perlu mendapatkan:</p>
                                <p><FiSun /> Target Harian: <strong>{formatCalculatedCurrency(calculation.daily)}</strong></p>
                                <p><FiCalendar /> Target Mingguan: <strong>{formatCalculatedCurrency(calculation.weekly)}</strong></p>
                            </CalculationResult>
                        )}
                    </SettingsCard>
                </Grid>
            )}
        </PageContainer>
    );
}

export default TargetPage;