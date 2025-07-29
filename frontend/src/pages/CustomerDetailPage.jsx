// frontend/src/pages/CustomerDetailPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import { getCustomerById, getCustomerHistory, redeemCustomerPoints } from '../services/api';
import { toast } from 'react-toastify';
import Skeleton from 'react-loading-skeleton';
import { FiArrowLeft, FiUser, FiAward, FiShoppingBag, FiGift } from 'react-icons/fi';

// --- Styled Components ---
const PageContainer = styled.div` padding: 30px; max-width: 1000px; margin: 0 auto; `;
const BackLink = styled(Link)` display: inline-flex; align-items: center; gap: 8px; color: var(--text-secondary); text-decoration: none; margin-bottom: 20px; font-weight: 500; &:hover { color: var(--text-primary); } `;
const Grid = styled.div` display: grid; grid-template-columns: 300px 1fr; gap: 30px; align-items: flex-start; @media (max-width: 768px) { grid-template-columns: 1fr; }`;
const InfoCard = styled.div` background-color: var(--bg-surface); border-radius: 16px; border: 1px solid var(--border-color); padding: 25px; `;
const CardTitle = styled.h3` font-size: 1.2rem; font-weight: 600; padding-bottom: 15px; margin: 0 0 20px 0; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 10px; `;
const InfoText = styled.p` color: var(--text-secondary); margin: 0 0 10px 0; strong { color: var(--text-primary); }`;
const PointsDisplay = styled.div` text-align: center; margin: 20px 0; p { margin: 0; color: var(--text-secondary); } h2 { font-size: 2.5rem; color: var(--primary-color); margin: 5px 0 0 0; }`;
const Form = styled.form` display: flex; flex-direction: column; gap: 10px; `;
const Input = styled.input` width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--bg-main); color: var(--text-primary); `;
const Button = styled.button` padding: 10px 20px; border-radius: 8px; border: none; background-color: var(--primary-color); color: white; font-weight: 600; cursor: pointer; &:disabled { opacity: 0.5; } `;
const HistoryTableContainer = styled(InfoCard)` padding: 0; overflow: hidden; `;
const Table = styled.table` width: 100%; border-collapse: collapse; `;
const Th = styled.th` text-align: left; padding: 15px 20px; background-color: var(--bg-main); border-bottom: 1px solid var(--border-color); font-weight: 600; color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase; `;
const Td = styled.td` padding: 15px 20px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); vertical-align: middle; `;
const Tr = styled.tr` &:last-child > td { border-bottom: none; } `;

function CustomerDetailPage() {
    const { id } = useParams();
    const [customer, setCustomer] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [redeemAmount, setRedeemAmount] = useState('');
    const [redeemDesc, setRedeemDesc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [customerRes, historyRes] = await Promise.all([
                getCustomerById(id),
                getCustomerHistory(id)
            ]);
            setCustomer(customerRes.data);
            setHistory(historyRes.data);
        } catch (error) {
            toast.error("Gagal memuat data pelanggan.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRedeem = async (e) => {
        e.preventDefault();
        const pointsToRedeem = parseInt(redeemAmount, 10);
        if (isNaN(pointsToRedeem) || pointsToRedeem <= 0) {
            return toast.warn("Masukkan jumlah poin yang valid.");
        }
        if (!redeemDesc) {
            return toast.warn("Masukkan deskripsi/alasan penukaran.");
        }

        setIsSubmitting(true);
        try {
            await toast.promise(
                redeemCustomerPoints(id, { pointsToRedeem, description: redeemDesc }),
                {
                    pending: "Memproses penukaran...",
                    success: "Poin berhasil ditukarkan!",
                    error: (err) => err.response?.data?.message || "Gagal menukarkan poin."
                }
            );
            setRedeemAmount('');
            setRedeemDesc('');
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <PageContainer><Skeleton count={5} height={40} /></PageContainer>;
    }

    if (!customer) {
        return <PageContainer>Pelanggan tidak ditemukan.</PageContainer>;
    }

    return (
        <PageContainer>
            <BackLink to="/customers"><FiArrowLeft /> Kembali ke Daftar Pelanggan</BackLink>
            <Grid>
                <InfoCard>
                    <CardTitle><FiUser /> Detail Pelanggan</CardTitle>
                    <InfoText><strong>Nama:</strong> {customer.name}</InfoText>
                    <InfoText><strong>Telepon:</strong> {customer.phone || '-'}</InfoText>
                    <InfoText><strong>Email:</strong> {customer.email || '-'}</InfoText>
                    <InfoText><strong>Alamat:</strong> {customer.address || '-'}</InfoText>
                   
                    <CardTitle style={{marginTop: '30px'}}><FiAward /> Poin Loyalitas</CardTitle>
                    <PointsDisplay>
                        <p>Total Poin Saat Ini</p>
                        <h2>{customer.points}</h2>
                    </PointsDisplay>
                    
                    <Form onSubmit={handleRedeem}>
                        <Input type="number" value={redeemAmount} onChange={(e) => setRedeemAmount(e.target.value)} placeholder="Jumlah poin" required />
                        <Input value={redeemDesc} onChange={(e) => setRedeemDesc(e.target.value)} placeholder="Deskripsi (cth: Tukar Merchandise)" required />
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : 'Tukarkan Poin'}</Button>
                    </Form>
                </InfoCard>

                <HistoryTableContainer>
                    <CardTitle style={{padding: '25px', margin: 0}}><FiShoppingBag /> Riwayat Transaksi</CardTitle>
                    <div style={{overflowY: 'auto'}}>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Tanggal</Th>
                                    <Th>Total Belanja</Th>
                                    <Th>Poin Didapat</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length > 0 ? history.map(order => (
                                    <Tr key={order.id}>
                                        <Td>{new Date(order.created_at).toLocaleString('id-ID')}</Td>
                                        <Td>Rp {new Intl.NumberFormat('id-ID').format(order.total_amount)}</Td>
                                        <Td style={{color: 'var(--green-color)'}}>+{order.points_earned}</Td>
                                    </Tr>
                                )) : (
                                    <Tr><Td colSpan="3" style={{textAlign: 'center', padding: '50px 0'}}>Belum ada riwayat transaksi.</Td></Tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </HistoryTableContainer>
            </Grid>
        </PageContainer>
    );
}

export default CustomerDetailPage;