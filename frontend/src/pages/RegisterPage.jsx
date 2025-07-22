import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { createUser } from '../services/api';
import { toast } from 'react-toastify';
import { FiUserPlus } from 'react-icons/fi';

const PageContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-main); /* Latar belakang utama hitam pekat */
`;

const BrandingPanel = styled.div`
  flex: 1.2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 60px;
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
`;

const BrandingSubtitle = styled.p`
  font-size: 1.2rem;
  font-weight: 300;
  color: var(--text-secondary);
`;

const FormPanel = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  padding: 20px 0;
`;

const FormBox = styled.div`
  width: 100%;
  max-width: 550px; /* Lebarkan sedikit untuk 2 kolom */
  padding: 40px;
  background-color: var(--bg-surface);
  border-radius: 16px;
  border: 1px solid var(--border-color);
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

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
`;

const InputGroup = styled.div`
  grid-column: ${props => props.fullWidth ? '1 / -1' : 'auto'};
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

const Select = styled.select`
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
  grid-column: 1 / -1;
`;

const LoginLink = styled.p`
  text-align: center;
  margin-top: 15px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  grid-column: 1 / -1;

  a {
    color: var(--primary-color);
    font-weight: 600;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'kasir' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const promise = createUser(formData);
    toast.promise(promise, {
      pending: 'Mendaftarkan pengguna...',
      success: {
        render(){
          navigate('/login'); 
          return 'Registrasi berhasil! Silakan login.';
        }
      },
      error: {
        render({data}){
          return `Gagal: ${data.response?.data?.message || 'Server error'}`;
        }
      }
    });
  };

  return (
    <PageContainer>
      <BrandingPanel>
        <BrandingContent>
          <BrandingTitle>Buat Akun Baru</BrandingTitle>
          <BrandingSubtitle>Hanya butuh beberapa detik untuk memulai.</BrandingSubtitle>
        </BrandingContent>
      </BrandingPanel>
      <FormPanel>
        <FormBox>
          <Title>Mulai Sekarang</Title>
          <Subtitle>Isi data di bawah untuk membuat akun.</Subtitle>
          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" name="name" type="text" onChange={handleChange} required />
            </InputGroup>
            <InputGroup>
              <Label htmlFor="email">Alamat Email</Label>
              <Input id="email" name="email" type="email" onChange={handleChange} required />
            </InputGroup>
            <InputGroup>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" onChange={handleChange} required />
            </InputGroup>
            <InputGroup>
              <Label htmlFor="role">Peran</Label>
              <Select name="role" value={formData.role} onChange={handleChange}>
                <option value="kasir">Kasir</option>
                <option value="admin">Admin</option>
              </Select>
            </InputGroup>
            <Button type="submit"><FiUserPlus style={{ marginRight: '8px' }}/> Buat Akun</Button>
            <LoginLink>
              Sudah punya akun? <Link to="/login">Login di sini</Link>
            </LoginLink>
          </Form>
        </FormBox>
      </FormPanel>
    </PageContainer>
  );
}

export default RegisterPage;