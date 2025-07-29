// frontend/src/components/PostCheckoutModal.jsx

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiCheckCircle, FiPrinter } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { sendReceipt } from '../services/api';

const ModalBackdrop = styled(motion.div)` position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px); `;
const ModalContainer = styled(motion.div)` background-color: var(--bg-surface); border-radius: 16px; border: 1px solid var(--border-color); width: 100%; max-width: 450px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); text-align: center; padding: 30px; display: flex; flex-direction: column; align-items: center; `;
const SuccessIcon = styled.div` width: 70px; height: 70px; border-radius: 50%; background-color: rgba(32, 201, 151, 0.1); color: #20C997; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; `;
const ModalTitle = styled.h3` font-size: 1.5rem; font-weight: 600; margin-bottom: 10px; color: var(--text-primary); `;
const ModalSubtitle = styled.p` color: var(--text-secondary); margin-bottom: 25px; font-size: 0.95rem; `;
const Form = styled.form` display: flex; flex-direction: column; gap: 15px; width: 100%; `;
const Input = styled.input` width: 100%; padding: 12px 18px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 1rem; background-color: var(--bg-main); color: var(--text-primary); text-align: center; &::placeholder { color: var(--text-placeholder); } &:focus { outline: none; border-color: var(--primary-color); } `;
const Button = styled.button` padding: 12px 25px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease-in-out; background-color: ${props => props.$primary ? 'var(--primary-color)' : 'var(--bg-surface)'}; color: ${props => props.$primary ? 'white' : 'var(--text-primary)'}; border: 1px solid ${props => props.$primary ? 'var(--primary-color)' : 'var(--border-color)'}; &:hover { ${props => props.$primary ? `background-color: var(--primary-hover);` : `background-color: var(--bg-main); border-color: var(--primary-color);`} } &:disabled { opacity: 0.5; cursor: not-allowed; } `;
const ButtonGroup = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px; width: 100%; `;
const FullWidthButton = styled(Button)` grid-column: 1 / -1; `;

function PostCheckoutModal({ isOpen, onClose, orderId, onPrint }) {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendReceipt = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.warn("Silakan masukkan alamat email.");
      return;
    }
    setIsSending(true);
    try {
      await sendReceipt(orderId, email);
      toast.success('Struk berhasil dikirim!');
      setEmail('');
    } catch (error) {
      toast.error(`Gagal mengirim struk: ${error.response?.data?.message || 'Server error'}`);
    } finally {
      setIsSending(false);
    }
  };

  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 }};
  const modalVariants = { hidden: { y: "-50px", opacity: 0 }, visible: { y: "0", opacity: 1 }, exit: { y: "50px", opacity: 0 }};

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalBackdrop initial="hidden" animate="visible" exit="exit" onClick={onClose}>
          <ModalContainer variants={modalVariants} onClick={(e) => e.stopPropagation()}>
            <SuccessIcon><FiCheckCircle size={32} /></SuccessIcon>
            <ModalTitle>Transaksi Berhasil!</ModalTitle>
            <ModalSubtitle>Pesanan #{orderId} telah berhasil diproses.</ModalSubtitle>
            
            <Form onSubmit={handleSendReceipt}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Kirim struk ke email (opsional)"
              />
              <ButtonGroup>
                <Button type="button" onClick={() => onPrint(orderId)}>
                  <FiPrinter /> Cetak
                </Button>
                <Button type="submit" $primary disabled={!email || isSending}>
                  <FiSend /> {isSending ? 'Mengirim...' : 'Kirim'}
                </Button>
                <FullWidthButton type="button" onClick={onClose}>
                  Selesai (Transaksi Baru)
                </FullWidthButton>
              </ButtonGroup>
            </Form>
          </ModalContainer>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
}

export default PostCheckoutModal;