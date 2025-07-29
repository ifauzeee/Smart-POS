// frontend/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { loginUser } from '../services/api';
import { toast } from 'react-toastify';
import { FiLogIn } from 'react-icons/fi';

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

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  margin-bottom: 50px;
  font-size: 1rem;

  @media (max-width: 768px) {
    margin-bottom: 30px;
  }
`;

const Form = styled.form``;

const InputGroup = styled.div`
  margin-bottom: 25px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-secondary);
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 18px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background-color: var(--bg-main);
  color: var(--text-primary);
`;

const Button = styled.button`
  width: 100%;
  padding: 15px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background-color: var(--primary-hover);
  }
`;

// --- TAMBAHKAN STYLED COMPONENT BARU DI SINI ---
const LinksContainer = styled.div`
  text-align: center;
  margin-top: 25px;
  font-size: 0.9rem;
  color: var(--text-secondary);

  a {
    color: var(--primary-color);
    font-weight: 600;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;
// --- AKHIR TAMBAHAN ---

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const userData = { email, password };
      const response = await loginUser(userData);
      localStorage.setItem('token', response.data.token);
      navigate('/pos', { replace: true });
    } catch (err) {
      console.error("Login Error:", err.response || err);
      // NEW: Improved error message for network issues
      toast.error(err.response?.data?.message || 'Terjadi kesalahan jaringan atau server tidak merespons.');
    }
  };

  return (
    <PageContainer>
      <BrandingPanel>
        <BrandingContent>
          <BrandingTitle>SmartPOS</BrandingTitle>
          <BrandingSubtitle>Solusi kasir modern untuk mengembangkan bisnis Anda.</BrandingSubtitle>
        </BrandingContent>
      </BrandingPanel>
      <FormPanel>
        <FormBox>
          <Title>Selamat Datang</Title>
          <Subtitle>Silakan login untuk melanjutkan.</Subtitle>
          <Form onSubmit={handleLogin}>
            <InputGroup>
              <Label htmlFor="email">Alamat Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </InputGroup>
            <InputGroup>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </InputGroup>
            <Button type="submit"><FiLogIn style={{ marginRight: '8px' }}/> Login</Button>
            
            {/* --- GANTI BAGIAN LINK DI SINI --- */}
            <LinksContainer>
              <Link to="/forgot-password">Lupa Password?</Link>
              <span style={{ margin: '0 10px' }}>|</span>
              <span>Belum punya akun? <Link to="/register">Daftar di sini</Link></span>
            </LinksContainer>
          </Form>
        </FormBox>
      </FormPanel>
    </PageContainer>
  );
}

export default LoginPage;