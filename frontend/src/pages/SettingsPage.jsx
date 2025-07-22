import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../context/ThemeContext';
import { getEmailSettings, saveEmailSettings } from '../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';

const PageContainer = styled.div`
  padding: 30px;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 30px;
`;

const SettingsCard = styled.div`
  background-color: var(--bg-surface);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  padding: 25px;
  max-width: 600px;
`;

// STYLED COMPONENT BARU UNTUK JUDUL KARTU
const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  padding-bottom: 15px;
  margin-bottom: 25px; /* <-- INI YANG MEMBERIKAN JARAK */
  border-bottom: 1px solid var(--border-color);
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SettingLabel = styled.div`
  p {
    font-size: 1rem;
    font-weight: 500;
    margin: 0;
  }
  small {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
`;

const ThemeSwitchLabel = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
`;

const ThemeSwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: var(--primary-color);
  }

  &:checked + span:before {
    transform: translateX(26px);
  }
`;

const ThemeSwitchSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  transition: .4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
`;

const InfoBox = styled.div`
  padding: 20px;
  background-color: var(--bg-main);
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Form = styled.form``;
const InputGroup = styled.div` margin-bottom: 15px; `;
const Label = styled.label` display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-secondary); `;
const Input = styled.input` width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 1rem; `;
const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid ${props => props.primary ? 'var(--primary-color)' : 'var(--border-color)'};
  font-weight: 600;
  cursor: pointer;
  background-color: ${props => props.primary ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.primary ? 'white' : 'var(--text-primary)'};
  &:hover { opacity: 0.9; }
`;

function SettingsPage() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [emailSettings, setEmailSettings] = useState({ email: '', appPassword: '' });
  const [savedEmail, setSavedEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchEmailSettings = async () => {
      try {
        const res = await getEmailSettings();
        if (res.data.email) {
          setSavedEmail(res.data.email);
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Gagal memuat setelan email");
      }
    };
    fetchEmailSettings();
  }, []);

  const handleEmailChange = (e) => {
    setEmailSettings({ ...emailSettings, [e.target.name]: e.target.value });
  };

  const handleEmailSave = async (e) => {
    e.preventDefault();
    try {
      await saveEmailSettings(emailSettings);
      toast.success('Setelan email berhasil disimpan!');
      setSavedEmail(emailSettings.email);
      setEmailSettings({ ...emailSettings, appPassword: '' });
      setIsEditing(false);
    } catch (error) {
      toast.error('Gagal menyimpan setelan.');
    }
  };

  return (
    <PageContainer>
      <Title>Setelan</Title>
      <SettingsCard>
        <SettingRow>
          <SettingLabel>
            <p>Mode Tampilan</p>
            <small>Anda sedang menggunakan mode {theme === 'light' ? 'Terang' : 'Gelap'}</small>
          </SettingLabel>
          <ThemeSwitchLabel>
            <ThemeSwitchInput 
              type="checkbox" 
              onChange={toggleTheme}
              checked={theme === 'dark'}
            />
            <ThemeSwitchSlider />
          </ThemeSwitchLabel>
        </SettingRow>
      </SettingsCard>

      <SettingsCard style={{marginTop: '30px'}}>
        <CardTitle>Konfigurasi Email Pengirim Struk</CardTitle>
        
        {!isEditing && savedEmail ? (
          <div>
            <InfoBox>
              <FiCheckCircle size={24} color="var(--green-color)" />
              <div>
                <p style={{margin: 0, fontWeight: 500}}>Terhubung dengan Akun:</p>
                <p style={{margin: 0, color: 'var(--text-secondary)'}}>{savedEmail}</p>
              </div>
            </InfoBox>
            <Button onClick={() => setIsEditing(true)}>Ubah Setelan</Button>
          </div>
        ) : (
          <Form onSubmit={handleEmailSave}>
            <InputGroup>
                <Label>Email Pengirim (Akun Gmail)</Label>
                <Input type="email" name="email" defaultValue={savedEmail} onChange={handleEmailChange} required/>
            </InputGroup>
            <InputGroup>
                <Label>Sandi Aplikasi (16 Karakter)</Label>
                <Input type="password" name="appPassword" value={emailSettings.appPassword} onChange={handleEmailChange} required placeholder={isEditing ? 'Masukkan sandi baru untuk mengubah' : 'Masukkan 16 karakter sandi'}/>
                <small style={{color: 'var(--text-secondary)', marginTop: '5px', display: 'block'}}>
                    Tidak tahu cara mendapatkannya? <Link to="/tutorial/app-password" style={{color: 'var(--primary-color)'}}>Lihat tutorial</Link>
                </small>
            </InputGroup>
            <div style={{display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '20px'}}>
                {isEditing && savedEmail && <Button type="button" onClick={() => setIsEditing(false)}>Batal</Button>}
                <Button type="submit" primary>Simpan</Button>
            </div>
          </Form>
        )}
      </SettingsCard>
    </PageContainer>
  );
}

export default SettingsPage;