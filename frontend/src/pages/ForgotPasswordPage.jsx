// frontend/src/pages/ForgotPasswordPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { forgotPassword } from '../services/api';
import { toast } from 'react-toastify';
import { FiMail } from 'react-icons/fi';

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
const Button = styled.button` width: 100%; padding: 15px; background-color: var(--primary-color); color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; &:hover { background-color: var(--primary-hover); } `;
const BackLink = styled(Link)` display: block; text-align: center; margin-top: 25px; color: var(--text-secondary); font-size: 0.9rem; text-decoration: none; &:hover { text-decoration: underline; } `;


function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await forgotPassword({ email });
      toast.success(response.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan.');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
        <BrandingPanel>
            <BrandingContent>
                <BrandingTitle>Lupa Password?</BrandingTitle>
                <BrandingSubtitle>Jangan khawatir, kami akan membantu Anda mendapatkan kembali akses ke akun Anda.</BrandingSubtitle>
            </BrandingContent>
        </BrandingPanel>
        <FormPanel>
            <FormBox>
                <Title>Atur Ulang Password</Title>
                <Subtitle>Masukkan email Anda untuk menerima link pemulihan.</Subtitle>
                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Label htmlFor="email">Alamat Email</Label>
                        <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        autoFocus 
                        />
                    </InputGroup>
                    <Button type="submit" disabled={isSubmitting}>
                        <FiMail style={{ marginRight: '8px' }}/> 
                        {isSubmitting ? 'Mengirim...' : 'Kirim Link Reset'}
                    </Button>
                    <BackLink to="/login">Kembali ke Halaman Login</BackLink>
                </Form>
            </FormBox>
        </FormPanel>
    </PageContainer>
  );
}

export default ForgotPasswordPage;