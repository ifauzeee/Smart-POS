// frontend/src/pages/PromotionFormPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { getPromotionById, createPromotion, updatePromotion } from '../services/api';
import { toast } from 'react-toastify';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // Import skeleton styles

// Helper Functions for Currency Formatting (consistent with other forms)
const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const number = parseFloat(value);
    if (isNaN(number)) return String(value);
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(number);
};
const parseCurrency = (value) => {
    if (typeof value !== 'string') return value;
    const cleanValue = value.replace(/Rp\s?|\./g, '').replace(/,/g, '.');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? value : parsed;
};

// --- Styled Components (diadaptasi dari ProductFormPage, dengan penyesuaian layout) ---
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

const Form = styled.form`
    background-color: var(--bg-surface);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    padding: 25px;
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* Dua kolom */
    gap: 20px;

    @media (max-width: 768px) { /* Untuk layar lebih kecil, jadi satu kolom */
        grid-template-columns: 1fr;
    }
`;

const InputGroup = styled.div`
    /* Properti untuk membuat input group mengisi full width atau hanya 1 kolom */
    grid-column: ${props => props.$fullWidth ? '1 / -1' : 'auto'};
`;

const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    font-size: 0.9rem;
    color: var(--text-secondary);
`;

const Input = styled.input`
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--bg-main);
    color: var(--text-primary);
    font-size: 1rem;
    /* Styling untuk datetime-local */
    &[type="datetime-local"] {
        /* Optional: adjust height if needed */
    }
`;

const Select = styled.select`
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--bg-main);
    color: var(--text-primary);
    font-size: 1rem;
    appearance: none; /* Remove default arrow */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center; background-size: 20px;
    &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 98, 0, 234), 0.2);
    }
`;

const CheckboxContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px; /* Adjust margin to align with other inputs */

    input[type="checkbox"] {
        appearance: none;
        width: 20px;
        height: 20px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background-color: var(--bg-main);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

        &:checked {
            background-color: var(--primary-color);
            border-color: var(--primary-color);
        }
        &:checked::before {
            content: '✔'; /* Checkmark character */
            font-size: 14px;
            color: white;
            display: block;
        }
    }
    label {
        margin-bottom: 0;
        cursor: pointer;
        color: var(--text-primary);
        font-weight: 500;
    }
`;

const FormFooter = styled.div`
    padding-top: 25px;
    margin-top: 25px;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
`;

const SaveButton = styled.button`
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 25px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    &:hover { opacity: 0.9; }
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

function PromotionFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'percentage',
        value: '',
        code: '',
        start_date: '',
        end_date: '',
        is_active: true,
    });
    const [loading, setLoading] = useState(isEditing);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPromotionData = useCallback(async () => {
        if (!isEditing) return;
        try {
            const res = await getPromotionById(id);
            const promo = res.data;
            setFormData({
                name: promo.name,
                description: promo.description || '',
                type: promo.type,
                value: promo.value,
                code: promo.code || '',
                // Format tanggal ke YYYY-MM-DDTHH:mm untuk input datetime-local
                start_date: promo.start_date ? new Date(promo.start_date).toISOString().slice(0, 16) : '',
                end_date: promo.end_date ? new Date(promo.end_date).toISOString().slice(0, 16) : '',
                is_active: promo.is_active,
            });
        } catch (error) {
            toast.error("Gagal memuat data promosi.");
            navigate('/promotions');
        } finally {
            setLoading(false);
        }
    }, [id, isEditing, navigate]);

    useEffect(() => {
        fetchPromotionData();
    }, [fetchPromotionData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        // Handle numeric value parsing for 'value' input
        if (name === 'value') {
            setFormData(prev => ({ ...prev, [name]: parseCurrency(value) }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Convert value back to float for API
        const dataToSave = {
            ...formData,
            value: parseFloat(formData.value),
            // Ensure dates are sent as proper SQL DATETIME strings or null
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
        };

        const promise = isEditing
            ? updatePromotion(id, dataToSave)
            : createPromotion(dataToSave);

        try {
            await toast.promise(promise, {
                pending: 'Menyimpan promosi...',
                success: 'Promosi berhasil disimpan!',
                error: (err) => err.response?.data?.message || 'Gagal menyimpan promosi.'
            });
            navigate('/promotions');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <PageContainer><Skeleton height={400} /></PageContainer>;
    }

    return (
        <PageContainer>
            <BackLink to="/promotions"><FiArrowLeft /> Kembali ke Daftar Promosi</BackLink>
            <PageHeader>
                <Title>{isEditing ? 'Edit Promosi' : 'Tambah Promosi Baru'}</Title>
            </PageHeader>
            <Form onSubmit={handleSubmit}>
                <FormGrid>
                    <InputGroup $fullWidth> {/* Full width */}
                        <Label>Nama Promosi</Label>
                        <Input name="name" value={formData.name} onChange={handleChange} required autoFocus />
                    </InputGroup>
                    <InputGroup $fullWidth> {/* Full width */}
                        <Label>Deskripsi (Opsional)</Label>
                        <Input as="textarea" rows="3" name="description" value={formData.description} onChange={handleChange} />
                    </InputGroup>

                    <InputGroup> {/* Side-by-side */}
                        <Label>Tipe Diskon</Label>
                        <Select name="type" value={formData.type} onChange={handleChange} required>
                            <option value="percentage">Persentase (%)</option>
                            <option value="fixed_amount">Potongan Tetap (Rp)</option>
                        </Select>
                    </InputGroup>
                    <InputGroup> {/* Side-by-side */}
                        <Label>Nilai</Label>
                        <Input
                            name="value"
                            type="number" // Change to number type for validation, but handle formatting in display
                            value={formData.value}
                            onChange={handleChange}
                            required
                            placeholder={formData.type === 'percentage' ? 'Contoh: 10 (untuk 10%)' : 'Contoh: 5000'}
                            min={formData.type === 'percentage' ? "0" : "0"}
                            max={formData.type === 'percentage' ? "100" : undefined}
                        />
                    </InputGroup>

                    <InputGroup> {/* Side-by-side */}
                        <Label>Kode Kupon (Opsional)</Label>
                        <Input name="code" value={formData.code} onChange={handleChange} placeholder="Contoh: RAMADANHEMAT" />
                    </InputGroup>
                    <InputGroup style={{ alignSelf: 'flex-end', paddingBottom: '8px' }}> {/* Align checkbox to bottom */}
                        <Label>Status</Label>
                        <CheckboxContainer>
                            <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange} />
                            <label htmlFor="is_active">Aktifkan Promosi</label>
                        </CheckboxContainer>
                    </InputGroup>
                    
                    <InputGroup> {/* Side-by-side */}
                        <Label>Tanggal Mulai (Opsional)</Label>
                        <Input name="start_date" type="datetime-local" value={formData.start_date} onChange={handleChange} />
                    </InputGroup>
                    <InputGroup> {/* Side-by-side */}
                        <Label>Tanggal Berakhir (Opsional)</Label>
                        <Input name="end_date" type="datetime-local" value={formData.end_date} onChange={handleChange} />
                    </InputGroup>
                </FormGrid>
                <FormFooter>
                    <SaveButton type="submit" disabled={isSubmitting}>
                        <FiSave /> {isSubmitting ? 'Menyimpan...' : 'Simpan Promosi'}
                    </SaveButton>
                </FormFooter>
            </Form>
        </PageContainer>
    );
}
export default PromotionFormPage;