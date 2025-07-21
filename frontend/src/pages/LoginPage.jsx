import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { loginUser } from '../services/api';
import { toast } from 'react-toastify';

const PageContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-main);
`;

const FormPanel = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BrandingPanel = styled.div`
  flex: 1.2;
  background: linear-gradient(135deg, #121212, #000000);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 40px;
`;

const Logo = styled.h1`
  font-size: 4rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 15px;
`;

const Slogan = styled.p`
  font-size: 1.2rem;
  color: var(--text-secondary);
  max-width: 350px;
`;

const LoginBox = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 40px;
`;

const Title = styled.h2`
  font-size: 2.5rem;
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
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-surface);
  color: var(--text-primary);
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(157, 78, 221, 0.3);
  }
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
  transition: background-color 0.2s;
  &:hover { background-color: var(--primary-hover); }
`;

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await loginUser(email, password);
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan.');
    }
  };

  return (
    <PageContainer>
      <BrandingPanel>
        <Logo>SmartPOS</Logo>
        <Slogan>The next generation point of sale. Fast, intuitive, and intelligent.</Slogan>
      </BrandingPanel>
      <FormPanel>
        <LoginBox>
          <Title>Welcome Back</Title>
          <Subtitle>Login to continue to your dashboard.</Subtitle>
          <Form onSubmit={handleLogin}>
            <InputGroup>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </InputGroup>
            <InputGroup>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </InputGroup>
            <Button type="submit">Login</Button>
          </Form>
        </LoginBox>
      </FormPanel>
    </PageContainer>
  );
}

export default LoginPage;