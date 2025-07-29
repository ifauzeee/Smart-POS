// frontend/src/pages/ResetPasswordPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { resetPassword } from '../services/api';
import { toast } from 'react-toastify';
import { FiSave } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';

// --- Styled Components (Sama seperti LoginPage) ---
const PageContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-main);
  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }
`;

const BrandingPanel = styled.div`
  flex: 1.2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 60px;
  @media (max-width: 768px) {
    padding: 30px;
    align-items: center;
    text-align: center;
  }
`;

const BrandingContent = styled.div`
  max-width: 450px;
`;

const BrandingTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 15px;
  color: var(--primary-color);
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const BrandingSubtitle = styled.p`
  font-size: 1.2rem;
  font-weight: 300;
  color: var(--text-secondary);
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const FormPanel = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  padding: 20px 0;
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const FormBox = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background-color: var(--bg-surface);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  @media (max-width: 768px) {
    padding: 30px;
  }
`;

const Title = styled.h2`
  font-size: 2.2rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-primary);
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  margin-bottom: 50px;
  font-size: 1rem;
`;

const Form = styled.form``;
const InputGroup = styled.div` margin-bottom: 25px; `;
const Label = styled.label` display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-secondary); `;
const Input = styled.input` width: 100%; padding: 14px 18px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 1rem; background-color: var(--bg-main); color: var(--text-primary); `;
const Button = styled.button` width: 100%; padding: 15px; background-color: var(--primary-color); color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; &:hover { background-color: var(--primary-hover); } &:disabled { opacity: 0.5; } `;
const ErrorMessage = styled.p` color: var(--red-color); font-weight: 500; `;
const BackLink = styled(Link)` display: block; text-align: center; margin-top: 25px; color: var(--text-secondary); font-size: 0.9rem; text-decoration: none; &:hover { text-decoration: underline; } `;


function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        setError('Link reset password sudah kedaluwarsa. Silakan minta yang baru.');
        setIsValidToken(false);
      } else {
        setIsValidToken(true);
      }
    } catch (err) {
      setError('Token tidak valid atau salah.');
      setIsValidToken(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Password dan konfirmasi password tidak cocok.");
    }
    if (password.length < 6) {
      return toast.error("Password minimal harus 6 karakter.");
    }

    setIsSubmitting(true);
    try {
      const response = await resetPassword(token, { password });
      toast.success(response.data.message);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mereset password.');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
        <BrandingPanel>
            <BrandingContent>
                <BrandingTitle>Buat Password Baru</BrandingTitle>
                <BrandingSubtitle>Keamanan akun Anda adalah prioritas kami. Silakan buat password baru yang kuat.</BrandingSubtitle>
            </BrandingContent>
        </BrandingPanel>
        <FormPanel>
            <FormBox>
                <Title>Reset Password</Title>
                {isValidToken ? (
                <>
                    <Subtitle>Masukkan password baru Anda di bawah ini.</Subtitle>
                    <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Label htmlFor="password">Password Baru</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
                    </InputGroup>
                    <InputGroup>
                        <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </InputGroup>
                    <Button type="submit" disabled={isSubmitting}>
                        <FiSave style={{ marginRight: '8px' }}/> 
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Password Baru'}
                    </Button>
                    </Form>
                </>
                ) : (
                <>
                    <ErrorMessage>{error}</ErrorMessage>
                    <BackLink to="/forgot-password">Minta link baru</BackLink>
                </>
                )}
            </FormBox>
        </FormPanel>
    </PageContainer>
  );
}

export default ResetPasswordPage;