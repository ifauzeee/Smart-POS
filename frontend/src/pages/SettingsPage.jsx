// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\SettingsPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../context/ThemeContext';
import { BusinessContext } from '../context/BusinessContext';
import { getEmailSettings, saveEmailSettings, saveBusinessSettings } from '../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import { formatRupiah, parseRupiah } from '../utils/formatters';

// --- Styled Components ---
const PageContainer = styled.div`
    padding: 30px;
`;
const Title = styled.h1`
    font-size: 1.8rem;
    margin-bottom: 30px;
`;

// ==========================================================
// ✅ PERBAIKAN: Mengubah layout grid agar menjadi 2 kolom
// ==========================================================
const SettingsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1.2fr; /* Creates two columns */
    gap: 30px;
    align-items: flex-start; /* Aligns cards to the top */

    @media (max-width: 1024px) {
        grid-template-columns: 1fr; /* Reverts to a single column on smaller screens */
    }
`;
// ==========================================================

const Column = styled.div`
    display: flex;
    flex-direction: column;
    gap: 30px;
`;
const SettingsCard = styled.div`
    background-color: var(--bg-surface);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    padding: 25px;
    width: 100%;
`;
const CardTitle = styled.h3`
    font-size: 1.1rem;
    font-weight: 600;
    padding-bottom: 15px;
    margin-bottom: 25px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 10px;
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
    &:focus {
        outline: none;
        border-color: var(--primary-color);
    }
`;
const Button = styled.button`
    padding: 10px 20px;
    border-radius: 8px;
    border: 1px solid ${props => props.$primary ? 'var(--primary-color)' : 'var(--border-color)'};
    font-weight: 600;
    cursor: pointer;
    background-color: ${props => props.$primary ? 'var(--primary-color)' : 'transparent'};
    color: ${props => props.$primary ? 'white' : 'var(--text-primary)'};
    &:hover {
        opacity: 0.9;
    }
`;
const TagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    min-height: 48px;
    align-items: center;
`;
const Tag = styled.div`
    background-color: var(--primary-color);
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
`;
const RemoveTagButton = styled.button`
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
`;
const Select = styled.select`
    width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 1rem;
    background-color: var(--bg-main); color: var(--text-primary); appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center; background-size: 20px;
    &:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 98, 0, 234), 0.2); }
`;

function SettingsPage() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { settings, fetchBusinessSettings } = useContext(BusinessContext);
    const [emailSettings, setEmailSettings] = useState({ email: '', appPassword: '', sender_name: '' });
    const [savedEmail, setSavedEmail] = useState('');
    const [formData, setFormData] = useState({
        business_name: '',
        address: '',
        phone: '',
        payment_methods: [],
        receipt_logo_url: '',
        receipt_footer_text: '',
        receipt_template: 'STANDARD_RECEIPT_TEMPLATE',
        tax_rate: 0.00,
        default_starting_cash: '0'
    });
    const [newPaymentMethod, setNewPaymentMethod] = useState('');
    const [isEditingEmail, setIsEditingEmail] = useState(false);

    useEffect(() => {
        const fetchAllSettings = async () => {
            try {
                const emailRes = await getEmailSettings();
                if (emailRes.data && emailRes.data.sender_email) {
                    setSavedEmail(emailRes.data.sender_email);
                    setEmailSettings(prev => ({ ...prev, email: emailRes.data.sender_email, sender_name: emailRes.data.sender_name || '' }));
                    setIsEditingEmail(false);
                } else {
                    setIsEditingEmail(true);
                }
            } catch (error) {
                toast.error("Gagal memuat beberapa setelan.");
            }
        };
        fetchAllSettings();
    }, []);

    useEffect(() => {
        if (settings) {
            const initialCash = String(Math.floor(parseFloat(settings.default_starting_cash || '0')));

            setFormData({
                business_name: settings.business_name || '',
                address: settings.address || '',
                phone: settings.phone_number || '',
                payment_methods: Array.isArray(settings.payment_methods)
                    ? settings.payment_methods
                    : (settings.payment_methods ? JSON.parse(settings.payment_methods) : []),
                receipt_logo_url: settings.receipt_logo_url || '',
                receipt_footer_text: settings.receipt_footer_text || '',
                receipt_template: settings.receipt_template || 'STANDARD_RECEIPT_TEMPLATE',
                tax_rate: (parseFloat(settings.tax_rate) || 0) * 100,
                default_starting_cash: initialCash
            });
        }
    }, [settings]);

    const handleEmailChange = (e) => setEmailSettings({ ...emailSettings, [e.target.name]: e.target.value });
    const handleBusinessChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEmailSave = async (e) => {
        e.preventDefault();
        await toast.promise(saveEmailSettings(emailSettings), {
            pending: 'Menyimpan...',
            success: 'Setelan email berhasil disimpan!',
            error: (err) => `Gagal menyimpan: ${err.response?.data?.message || err.message}`
        });
        setSavedEmail(emailSettings.email);
        setEmailSettings(prev => ({ ...prev, appPassword: '' }));
        setIsEditingEmail(false);
    };

    const handleBusinessSave = async (e) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            tax_rate: (parseFloat(formData.tax_rate) || 0) / 100,
            default_starting_cash: parseFloat(parseRupiah(formData.default_starting_cash)) || 0
        };
        
        await toast.promise(saveBusinessSettings(dataToSave), {
            pending: 'Menyimpan...',
            success: 'Setelan bisnis berhasil diperbarui!',
            error: (err) => `Gagal menyimpan: ${err.response?.data?.message || err.message}`
        });
        fetchBusinessSettings();
    };

    const addPaymentMethod = () => {
        const trimmedMethod = newPaymentMethod.trim();
        if (trimmedMethod && !formData.payment_methods.some(m => m.toLowerCase() === trimmedMethod.toLowerCase())) {
            setFormData(prev => ({ ...prev, payment_methods: [...prev.payment_methods, trimmedMethod] }));
            setNewPaymentMethod('');
        } else if (trimmedMethod) {
            toast.warn('Metode pembayaran ini sudah ada.');
        }
    };

    const removePaymentMethod = (methodToRemove) => {
        setFormData(prev => ({ ...prev, payment_methods: prev.payment_methods.filter(m => m !== methodToRemove) }));
    };

    return (
        <PageContainer>
            <Title>Setelan</Title>
            <SettingsGrid>
                <Column>
                    <SettingsCard>
                        <CardTitle>Profil Bisnis & Kas</CardTitle>
                        <Form onSubmit={handleBusinessSave}>
                            <InputGroup>
                                <Label>Nama Bisnis</Label>
                                <Input name="business_name" value={formData.business_name} onChange={handleBusinessChange} placeholder="Nama Toko Anda" />
                            </InputGroup>
                            <InputGroup>
                                <Label>Telepon</Label>
                                <Input name="phone" value={formData.phone} onChange={handleBusinessChange} placeholder="No. Telepon Toko" />
                            </InputGroup>
                            <InputGroup>
                                <Label>Alamat</Label>
                                <Input as="textarea" rows="3" name="address" value={formData.address} onChange={handleBusinessChange} placeholder="Alamat lengkap toko" />
                            </InputGroup>
                            
                            <InputGroup>
                                <Label>Kas Awal Default untuk Kasir (Rp)</Label>
                                <Input
                                    name="default_starting_cash"
                                    type="text"
                                    value={formatRupiah(formData.default_starting_cash)}
                                    onChange={(e) => setFormData(prev => ({...prev, default_starting_cash: parseRupiah(e.target.value)}))}
                                />
                            </InputGroup>
                            
                            <InputGroup>
                                <Label>Format Struk</Label>
                                <Select name="receipt_template" value={formData.receipt_template} onChange={handleBusinessChange}>
                                    <option value="STANDARD_RECEIPT_TEMPLATE">Struk Standar</option>
                                    <option value="THERMAL_RECEIPT_TEMPLATE">Struk Thermal</option>
                                </Select>
                            </InputGroup>
                            <InputGroup>
                                <Label>URL Logo Struk</Label>
                                <Input name="receipt_logo_url" value={formData.receipt_logo_url} onChange={handleBusinessChange} />
                            </InputGroup>
                            <InputGroup>
                                <Label>Teks Footer Struk</Label>
                                <Input name="receipt_footer_text" value={formData.receipt_footer_text} onChange={handleBusinessChange} />
                            </InputGroup>
                            <InputGroup>
                                <Label>Tarif Pajak Global (%)</Label>
                                <Input type="number" name="tax_rate" value={formData.tax_rate} onChange={handleBusinessChange} step="0.01" min="0" max="100"/>
                            </InputGroup>
                            <InputGroup><Label>Metode Pembayaran</Label><TagsContainer>{formData.payment_methods.map(method => (<Tag key={method}>{method}<RemoveTagButton type="button" onClick={() => removePaymentMethod(method)}><FiX size={16} /></RemoveTagButton></Tag>))}</TagsContainer><div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}><Input value={newPaymentMethod} onChange={(e) => setNewPaymentMethod(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPaymentMethod(); } }} placeholder="Tambah metode baru"/><Button type="button" onClick={addPaymentMethod}>Tambah</Button></div></InputGroup>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button type="submit" $primary>Simpan Profil</Button>
                            </div>
                        </Form>
                    </SettingsCard>
                </Column>

                <Column>
                    <SettingsCard>
                        <CardTitle>Tampilan</CardTitle>
                        <SettingRow>
                            <SettingLabel>
                                <p>Mode Tampilan</p>
                                <small>Anda sedang menggunakan mode {theme === 'light' ? 'Terang' : 'Gelap'}</small>
                            </SettingLabel>
                            <ThemeSwitchLabel>
                                <ThemeSwitchInput type="checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
                                <ThemeSwitchSlider />
                            </ThemeSwitchLabel>
                        </SettingRow>
                    </SettingsCard>
                    <SettingsCard>
                        <CardTitle>Konfigurasi Email Pengirim Struk</CardTitle>
                        {!isEditingEmail && savedEmail ? (
                            <div>
                                <InfoBox><FiCheckCircle size={24} color="var(--green-color)" /><div><p style={{ margin: 0, fontWeight: 500 }}>Terhubung: {savedEmail}</p></div></InfoBox>
                                <Button onClick={() => setIsEditingEmail(true)}>Ubah Setelan</Button>
                            </div>
                        ) : (
                            <Form onSubmit={handleEmailSave}>
                                <InputGroup><Label>Email Pengirim (Gmail)</Label><Input type="email" name="email" value={emailSettings.email} onChange={handleEmailChange} required/></InputGroup>
                                <InputGroup><Label>Nama Pengirim</Label><Input type="text" name="sender_name" value={emailSettings.sender_name} onChange={handleEmailChange} placeholder="Nama Bisnis Anda"/></InputGroup>
                                <InputGroup><Label>Sandi Aplikasi</Label><Input type="password" name="appPassword" value={emailSettings.appPassword} onChange={handleEmailChange} required placeholder="16 karakter sandi aplikasi"/><small style={{ color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>Tidak tahu? <Link to="/tutorial/app-password" style={{ color: 'var(--primary-color)' }}>Lihat tutorial</Link></small></InputGroup>
                                <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                                    {isEditingEmail && savedEmail && <Button type="button" onClick={() => setIsEditingEmail(false)}>Batal</Button>}
                                    <Button type="submit" $primary>Simpan</Button>
                                </div>
                            </Form>
                        )}
                    </SettingsCard>
                </Column>
            </SettingsGrid>
        </PageContainer>
    );
}

export default SettingsPage;