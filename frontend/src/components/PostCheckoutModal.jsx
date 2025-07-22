import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { sendReceipt } from '../services/api';

const ModalBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled(motion.div)`
  background-color: var(--bg-surface);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  width: 100%;
  max-width: 450px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  text-align: center;
  padding: 30px;
`;

const SuccessIcon = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: rgba(32, 201, 151, 0.1);
  color: #20C997;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px auto;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 10px;
`;

const ModalSubtitle = styled.p`
  color: var(--text-secondary);
  margin-bottom: 25px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 18px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background-color: var(--bg-main);
  color: var(--text-primary);
  text-align: center;
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Button = styled.button`
  padding: 12px 25px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: ${props => props.primary ? 'var(--primary-color)' : 'var(--bg-surface)'};
  color: ${props => props.primary ? 'white' : 'var(--text-primary)'};
  border: 1px solid ${props => props.primary ? 'var(--primary-color)' : 'var(--border-color)'};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 10px;
`;

function PostCheckoutModal({ isOpen, onClose, orderId }) {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSendReceipt = async (e) => {
        e.preventDefault();
        setIsSending(true);
        try {
            await sendReceipt(orderId, email);
            toast.success('Struk berhasil dikirim!');
            setEmail('');
            onClose(); // Tutup modal setelah berhasil
        } catch (error) {
            toast.error('Gagal mengirim struk.');
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    const modalVariants = { hidden: { y: "-50px", opacity: 0 }, visible: { y: "0", opacity: 1 } };

    return (
        <AnimatePresence>
            <ModalBackdrop initial="hidden" animate="visible" exit="hidden" variants={backdropVariants}>
                <ModalContainer variants={modalVariants}>
                    <SuccessIcon><FiCheckCircle size={32} /></SuccessIcon>
                    <ModalTitle>Transaksi Berhasil!</ModalTitle>
                    <ModalSubtitle>Pesanan #{orderId} telah berhasil diproses.</ModalSubtitle>
                    <Form onSubmit={handleSendReceipt}>
                        <Input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Kirim struk ke email... (opsional)" 
                        />
                        <ButtonGroup>
                            <Button type="button" onClick={onClose} style={{width: '100%'}}>Selesai</Button>
                            <Button type="submit" primary disabled={!email || isSending} style={{width: '100%'}}>
                                <FiSend /> {isSending ? 'Mengirim...' : 'Kirim'}
                            </Button>
                        </ButtonGroup>
                    </Form>
                </ModalContainer>
            </ModalBackdrop>
        </AnimatePresence>
    );
}

export default PostCheckoutModal;