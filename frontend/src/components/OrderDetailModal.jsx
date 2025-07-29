import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPrinter } from 'react-icons/fi';

const ModalBackdrop = styled(motion.div)`
    position: fixed; top: 0; left: 0; width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6); display: flex;
    justify-content: center; align-items: center; z-index: 1000;
`;

const ModalContainer = styled(motion.div)`
    background-color: var(--bg-surface); border-radius: 16px;
    width: 100%; max-width: 600px; overflow: hidden;
    border: 1px solid var(--border-color);
`;

const ModalHeader = styled.div`
    padding: 20px 25px; border-bottom: 1px solid var(--border-color);
    display: flex; justify-content: space-between; align-items: center;
`;

const ModalTitle = styled.h3`
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
`;

const CloseButton = styled.button`
    background: none; border: none; color: var(--text-secondary);
    cursor: pointer; &:hover { color: var(--text-primary); }
`;

const ModalBody = styled.div`
    padding: 25px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-height: 70vh;
    overflow-y: auto;
`;

const InfoRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1rem;
    span:first-child {
        color: var(--text-secondary);
        font-weight: 500;
    }
    span:last-child {
        font-weight: 600;
        color: var(--text-primary);
    }
`;

const ItemsTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    th, td {
        text-align: left;
        padding: 10px 0; border-bottom: 1px dashed var(--border-color);
        color: var(--text-primary);
    }
    th {
        font-size: 0.9rem;
        color: var(--text-secondary);
        font-weight: 600;
        text-transform: uppercase;
        padding-bottom: 15px;
    }
    td:last-child {
        text-align: right;
        font-weight: 500;
    }
`;

const Total = styled.div`
    font-size: 1.3rem;
    font-weight: 700;
    text-align: right;
    margin-top: 20px;
    color: var(--primary-color);
`;

const Button = styled.button`
    padding: 12px 25px;
    border-radius: 8px;
    border: 1px solid ${props => props.$primary ? 'var(--primary-color)' : 'var(--border-color)'};
    font-weight: 600;
    cursor: pointer;
    background-color: ${props => props.$primary ? 'var(--primary-color)' : 'transparent'};
    color: ${props => props.$primary ? 'white' : 'var(--text-primary)'};
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const ModalFooter = styled.div`
    padding: 20px 25px;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 15px;
`;

function OrderDetailModal({ isOpen, onClose, order, onPrint }) { 
    if (!isOpen || !order) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <ModalBackdrop
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <ModalContainer
                        initial={{ y: "-50px", opacity: 0 }}
                        animate={{ y: "0", opacity: 1 }}
                        exit={{ y: "50px", opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ModalHeader>
                            <ModalTitle>Detail Pesanan #{order.id}</ModalTitle>
                            <CloseButton onClick={onClose}><FiX size={24} /></CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <InfoRow>
                                <span>Tanggal:</span>
                                <span>{new Date(order.created_at).toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </InfoRow>
                            <InfoRow>
                                <span>Kasir:</span>
                                <span>{order.cashier_name}</span>
                            </InfoRow>
                            {order.customer_name && (
                                <InfoRow>
                                    <span>Pelanggan:</span>
                                    <span>{order.customer_name}</span>
                                </InfoRow>
                             )}
                            <InfoRow>
                                <span>Metode Pembayaran:</span>
                                <span>{order.payment_method}</span>
                            </InfoRow>
                            <InfoRow>
                                <span>Uang Dibayar:</span>
                                <span>Rp {new Intl.NumberFormat('id-ID').format(order.amount_paid)}</span>
                            </InfoRow>
                            {order.payment_method === 'Tunai' && (order.amount_paid - order.total_amount) > 0 && (
                                <InfoRow>
                                    <span>Kembalian:</span>
                                    <span>Rp {new Intl.NumberFormat('id-ID').format(order.amount_paid - order.total_amount)}</span>
                                </InfoRow>
                            )}

                            <ItemsTable>
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th style={{ textAlign: 'center' }}>Qty</th>
                                        <th style={{ textAlign: 'right' }}>Harga Satuan</th>
                                        <th style={{ textAlign: 'right' }}>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.product_name}{item.variant_name ? ` (${item.variant_name})` : ''}</td>
                                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                            <td style={{ textAlign: 'right' }}>Rp {new Intl.NumberFormat('id-ID').format(item.price)}</td>
                                            <td style={{ textAlign: 'right' }}>Rp {new Intl.NumberFormat('id-ID').format(item.quantity * item.price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </ItemsTable>
                            
                            <Total>Total: Rp {new Intl.NumberFormat('id-ID').format(order.total_amount)}</Total>
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={onClose}>Tutup</Button>
                            <Button $primary onClick={() => onPrint(order.id)}>
                                <FiPrinter style={{ marginRight: '8px' }} />
                                Cetak Struk
                            </Button>
                        </ModalFooter>
                    </ModalContainer>
                </ModalBackdrop>
            )}
        </AnimatePresence>
    );
}

export default OrderDetailModal;

OrderDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.object,
  onPrint: PropTypes.func.isRequired,
};