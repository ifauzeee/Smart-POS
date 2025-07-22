import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const ModalBackdrop = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
`;

const ModalContainer = styled(motion.div)`
  background-color: var(--bg-surface); border-radius: 16px;
  width: 100%; max-width: 450px; overflow: hidden;
  border: 1px solid var(--border-color);
`;

const ModalHeader = styled.div`
  padding: 20px 25px; border-bottom: 1px solid var(--border-color);
`;

const ModalTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
`;

const ModalBody = styled.div`
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  
  span:first-child {
    color: var(--text-secondary);
    font-weight: 500;
  }
  
  span:last-child {
    font-weight: 600;
    font-size: 1.3rem;
  }
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
  padding: 14px 18px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1.5rem; /* Ukuran font lebih besar untuk input uang */
  font-weight: 600;
  text-align: right;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ModalFooter = styled.div`
  padding: 20px 25px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 15px;
`;

const Button = styled.button`
  padding: 12px 25px;
  border-radius: 8px;
  border: 1px solid ${props => props.primary ? 'var(--primary-color)' : 'var(--border-color)'};
  font-weight: 600;
  cursor: pointer;
  background-color: ${props => props.primary ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.primary ? 'white' : 'var(--text-primary)'};
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function CheckoutModal({ isOpen, onClose, cartTotal, onConfirmCheckout }) {
    const [amountPaid, setAmountPaid] = useState('');
    const [change, setChange] = useState(0);

    useEffect(() => {
        if (isOpen) {
            // Reset state saat modal dibuka
            setAmountPaid('');
            setChange(0);
        }
    }, [isOpen]);

    useEffect(() => {
        const paid = parseFloat(amountPaid) || 0;
        if (paid >= cartTotal) {
            setChange(paid - cartTotal);
        } else {
            setChange(0);
        }
    }, [amountPaid, cartTotal]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        // Panggil fungsi checkout dari PosPage
        onConfirmCheckout();
        // Tutup modal ini. Modal berikutnya (PostCheckoutModal) akan dibuka oleh PosPage
        onClose();
    };
    
    return (
        <AnimatePresence>
            <ModalBackdrop>
                <ModalContainer>
                    <ModalHeader><ModalTitle>Pembayaran</ModalTitle></ModalHeader>
                    <ModalBody>
                        <InfoRow>
                            <span>Total Belanja:</span>
                            <span>Rp {new Intl.NumberFormat('id-ID').format(cartTotal)}</span>
                        </InfoRow>
                        <InputGroup>
                            <Label htmlFor="amountPaid">Uang Dibayar (Rp)</Label>
                            <Input 
                                id="amountPaid"
                                type="number"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                                placeholder="0"
                                autoFocus
                            />
                        </InputGroup>
                        <InfoRow>
                            <span>Kembalian:</span>
                            <span>Rp {new Intl.NumberFormat('id-ID').format(change)}</span>
                        </InfoRow>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose}>Batal</Button>
                        <Button 
                            primary 
                            onClick={handleConfirm}
                            disabled={parseFloat(amountPaid) < cartTotal}
                        >
                            Konfirmasi & Proses
                        </Button>
                    </ModalFooter>
                </ModalContainer>
            </ModalBackdrop>
        </AnimatePresence>
    );
}

export default CheckoutModal;