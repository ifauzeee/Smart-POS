// frontend/src/components/CheckoutModal.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDollarSign, FiCreditCard, FiSmartphone, FiBox } from 'react-icons/fi';

const formatCurrency = (value) => {
  if (!value || isNaN(value)) return '0';
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
};

const parseCurrency = (value) => {
  const cleaned = String(value).replace(/[^0-9]/g, '');
  return cleaned ? parseFloat(cleaned) : '';
};

const ModalBackdrop = styled(motion.div)`
  position: fixed;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled(motion.div)`
  background: var(--bg-surface);
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const ModalBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: 500;
  color: var(--text-secondary);
`;

const PaymentMethodContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const PaymentButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border: 1px solid ${(props) => (props.$active ? 'var(--primary-color)' : 'var(--border-color)')};
  background: ${(props) => (props.$active ? 'var(--primary-color)' : 'var(--bg-main)')};
  color: ${(props) => (props.$active ? 'white' : 'var(--text-primary)')};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  &:hover {
    background: ${(props) => (props.$active ? 'var(--primary-color)' : 'var(--bg-surface)')};
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-main);
  color: var(--text-primary);
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 98, 0, 234), 0.2);
  }
`;

const ModalFooter = styled.div`
  padding: 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  background: ${(props) => (props.$primary ? 'var(--primary-color)' : 'var(--bg-main)')};
  color: ${(props) => (props.$primary ? 'white' : 'var(--text-primary)')};
  &:hover {
    background: ${(props) => (props.$primary ? 'var(--primary-hover)' : 'var(--bg-surface)')};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const paymentIconMap = {
  tunai: <FiDollarSign size={20} />,
  kartu: <FiCreditCard size={20} />,
  qris: <FiSmartphone size={20} />,
};

const getPaymentIcon = (methodName) => {
  const key = methodName.toLowerCase();
  return paymentIconMap[key] || <FiBox size={20} />;
};

function CheckoutModal({ isOpen, onClose, cartTotal, onConfirmCheckout, paymentMethods = [], taxRate = 0 }) {
  const [amountPaid, setAmountPaid] = useState('');
  const [change, setChange] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');

  const taxAmount = cartTotal * taxRate;
  const finalTotal = cartTotal + taxAmount;

  useEffect(() => {
    if (isOpen) {
      setAmountPaid('');
      setChange(0);
      setPaymentMethod(paymentMethods[0] || 'Tunai');
    }
  }, [isOpen, paymentMethods]);

  useEffect(() => {
    const paid = parseFloat(amountPaid) || 0;
    if (paymentMethod === 'Tunai') {
      setChange(paid >= finalTotal ? paid - finalTotal : 0);
    } else {
      setChange(0);
      setAmountPaid(finalTotal); // Otomatis isi jika bukan tunai
    }
  }, [amountPaid, finalTotal, paymentMethod]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirmCheckout({
      paymentMethod,
      amountPaid: parseFloat(amountPaid) || finalTotal,
      subtotal: cartTotal,
      taxAmount,
      finalTotal,
    });
    onClose();
  };

  const isConfirmDisabled = cartTotal <= 0 || (paymentMethod === 'Tunai' && (parseFloat(amountPaid) || 0) < finalTotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalBackdrop initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <ModalContainer initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}>
            <ModalHeader>
              <ModalTitle>Pembayaran</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <InfoRow>
                <span>Subtotal:</span>
                <span>Rp {formatCurrency(cartTotal)}</span>
              </InfoRow>
              {taxRate > 0 && (
                <InfoRow>
                    <span>Pajak ({(taxRate * 100).toFixed(1)}%):</span>
                    <span>Rp {formatCurrency(taxAmount)}</span>
                </InfoRow>
              )}
              <InfoRow style={{fontSize: '1.2rem', color: 'var(--text-primary)', borderTop: '1px solid var(--border-color)', paddingTop: '15px'}}>
                <strong>Total Akhir:</strong>
                <strong>Rp {formatCurrency(finalTotal)}</strong>
              </InfoRow>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Metode Pembayaran
                </label>
                <PaymentMethodContainer>
                  {paymentMethods.length === 0 ? (
                    <PaymentButton $active={paymentMethod === 'Tunai'} onClick={() => setPaymentMethod('Tunai')}>
                      {getPaymentIcon('Tunai')} Tunai
                    </PaymentButton>
                  ) : (
                    paymentMethods.map((method) => (
                      <PaymentButton
                        key={method}
                        $active={paymentMethod === method}
                        onClick={() => setPaymentMethod(method)}
                        aria-label={`Pilih metode pembayaran ${method}`}
                      >
                        {getPaymentIcon(method)} {method}
                      </PaymentButton>
                    ))
                  )}
                </PaymentMethodContainer>
              </div>
              {paymentMethod === 'Tunai' && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      Uang Dibayar (Rp)
                    </label>
                    <Input
                      type="text"
                      value={formatCurrency(amountPaid)}
                      onChange={(e) => setAmountPaid(parseCurrency(e.target.value))}
                      placeholder="0"
                      autoFocus
                    />
                  </div>
                  <InfoRow>
                    <span>Kembalian:</span>
                    <span>Rp {formatCurrency(change)}</span>
                  </InfoRow>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={onClose}>Batal</Button>
              <Button $primary onClick={handleConfirm} disabled={isConfirmDisabled}>
                Konfirmasi & Proses
              </Button>
            </ModalFooter>
          </ModalContainer>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
}

CheckoutModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  cartTotal: PropTypes.number.isRequired,
  onConfirmCheckout: PropTypes.func.isRequired,
  paymentMethods: PropTypes.arrayOf(PropTypes.string).isRequired,
  taxRate: PropTypes.number,
};

export default CheckoutModal;