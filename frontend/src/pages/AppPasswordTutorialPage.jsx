import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const PageContainer = styled.div`
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 30px;
`;

const TutorialCard = styled.div`
  background-color: var(--bg-surface);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  padding: 30px;
`;

const Step = styled.div`
  margin-bottom: 25px;
  padding-bottom: 25px;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const StepTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
`;

const StepText = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
`;

const StyledLink = styled.a`
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  margin-bottom: 20px;
  font-weight: 500;
  &:hover { color: var(--text-primary); }
`;

function AppPasswordTutorialPage() {
  return (
    <PageContainer>
        <BackLink to="/settings"><FiArrowLeft /> Kembali ke Setelan</BackLink>
        <Title>Cara Mendapatkan Sandi Aplikasi Google</Title>
        <TutorialCard>
            <Step>
                <StepTitle>1. Aktifkan Verifikasi 2 Langkah</StepTitle>
                <StepText>
                    Sandi Aplikasi hanya tersedia untuk akun yang sudah mengaktifkan Verifikasi 2 Langkah. Jika belum, aktifkan terlebih dahulu di halaman keamanan akun Google Anda.
                </StepText>
            </Step>
            <Step>
                <StepTitle>2. Buka Halaman Sandi Aplikasi</StepTitle>
                <StepText>
                    Login ke Akun Google Anda, lalu kunjungi langsung halaman Sandi Aplikasi melalui link ini: <StyledLink href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer">myaccount.google.com/apppasswords</StyledLink>
                </StepText>
            </Step>
            <Step>
                <StepTitle>3. Buat Sandi Aplikasi Baru</StepTitle>
                <StepText>
                    Di halaman tersebut, klik pada kolom "Pilih aplikasi" dan pilih "Lainnya (Nama kustom...)". Beri nama, misalnya "SmartPOS App", lalu klik "BUAT".
                </StepText>
            </Step>
            <Step>
                <StepTitle>4. Salin dan Gunakan Sandi</StepTitle>
                <StepText>
                    Google akan menampilkan sebuah kotak kuning berisi <strong>16 karakter sandi</strong>. Salin 16 karakter ini (tanpa spasi) dan tempelkan ke kolom "Sandi Aplikasi" di halaman Setelan SmartPOS Anda.
                </StepText>
            </Step>
        </TutorialCard>
    </PageContainer>
  );
}

export default AppPasswordTutorialPage;