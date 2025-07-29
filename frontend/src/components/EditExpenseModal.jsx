import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiSave, FiX } from 'react-icons/fi';

// Helper Functions
const cleanAndParseInput = (value) => {
    if (typeof value !== 'string') {
        value = String(value);
    }
    let cleanedValue = value.trim();
    cleanedValue = cleanedValue.replace(/Rp\s?/g, ''); // Remove "Rp" prefix
    cleanedValue = cleanedValue.replace(/\s/g, ''); // Remove spaces
    cleanedValue = cleanedValue.replace(/\./g, ''); // Remove thousand separators
    cleanedValue = cleanedValue.replace(/,/g, '.'); // Convert comma to decimal point
    return isNaN(parseFloat(cleanedValue)) ? '' : cleanedValue; // Return empty string if invalid
};

const formatCurrency = (value) => {
    if (!value || isNaN(parseFloat(value))) return '';
    const numberToFormat = parseFloat(value);
    return `Rp ${new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(numberToFormat)}`;
};

// Styled Components
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: var(--bg-surface);
    border-radius: 16px;
    padding: 20px;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
    font-size: 1.5rem;
    color: var(--text-primary);
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    &:hover {
        color: var(--primary-color);
    }
`;

const Form = styled.form`
    display: grid;
    gap: 15px;
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
`;

const Label = styled.label`
    margin-bottom: 8px;
    font-weight: 500;
    font-size: 0.9rem;
    color: var(--text-secondary);
`;

const Input = styled.input`
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-main);
    color: var(--text-primary);
    font-size: 1rem;
`;

const Button = styled.button`
    padding: 12px 20px;
    border-radius: 8px;
    border: none;
    background-color: var(--primary-color);
    color: white;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
    &:hover {
        opacity: 0.9;
    }
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

function EditExpenseModal({ isOpen, onClose, expense, onSave, isSubmitting }) {
    const [formData, setFormData] = useState({ description: '', amount: '' });

    useEffect(() => {
        if (expense) {
            setFormData({
                description: expense.description || '',
                amount: String(expense.amount) || ''
            });
        } else {
            setFormData({ description: '', amount: '' });
        }
    }, [expense]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'amount') {
            setFormData(prev => ({
                ...prev,
                [name]: cleanAndParseInput(value)
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const amountToSave = parseFloat(formData.amount);
        if (isNaN(amountToSave) || amountToSave <= 0) {
            alert("Please enter a valid positive amount.");
            return;
        }
        onSave({ ...formData, amount: amountToSave });
    };

    if (!isOpen) return null;

    return (
       <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Edit Expense</ModalTitle>
                    <CloseButton onClick={onClose}><FiX /></CloseButton>
                </ModalHeader>
                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Label>Expense Description</Label>
                        <Input
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </InputGroup>
                    <InputGroup>
                        <Label>Amount (Rp)</Label>
                        <Input
                            name="amount"
                            type="text"
                            value={formatCurrency(formData.amount)}
                            onChange={handleChange}
                            required
                        />
                    </InputGroup>
                    <Button type="submit" disabled={isSubmitting}>
                        <FiSave /> {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Form>
            </ModalContent>
        </ModalOverlay>
    );
}

export default EditExpenseModal;