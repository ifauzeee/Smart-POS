// C:\Users\Ibnu\Project\smart-pos\frontend\src\components\HeldCartsModal.jsx

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiX, FiTrash2, FiShoppingCart, FiUser } from 'react-icons/fi';

const ModalBackdrop = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7); display: flex;
  justify-content: center; align-items: center; z-index: 1001;
`;
const ModalContainer = styled(motion.div)`
  background-color: var(--bg-surface); border-radius: 16px;
  width: 100%; max-width: 500px; padding: 30px;
  display: flex; flex-direction: column; height: 70vh;
`;
const ModalHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; `;
const ModalTitle = styled.h2` font-size: 1.5rem; margin: 0; color: var(--text-primary);`;
const CloseButton = styled.button` background: none; border: none; cursor: pointer; color: var(--text-secondary); `;
const CartList = styled.ul` list-style: none; padding: 0; margin: 0; overflow-y: auto; flex-grow: 1; `;
const CartItem = styled.li`
  padding: 15px; border-bottom: 1px solid var(--border-color);
  display: flex; justify-content: space-between; align-items: center;
  cursor: pointer; transition: background-color 0.2s ease-in-out;
  &:hover { background-color: var(--bg-main); }
  &:last-child { border-bottom: none; }
`;
const CartInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;
const CustomerName = styled.p`
  margin: 0; font-weight: 600; color: var(--text-primary);
  display: flex; align-items: center; gap: 8px;
`;
const CartDetails = styled.small`
  color: var(--text-secondary);
`;
const ActionGroup = styled.div` display: flex; align-items: center; `;
const DeleteButton = styled.button` 
  background: none; border: none; color: var(--text-secondary); cursor: pointer; 
  margin-left: 15px; padding: 5px; border-radius: 50%;
  &:hover { color: var(--red-color); background-color: var(--red-color-transparent); }
`;
const EmptyState = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; color: var(--text-secondary); text-align: center;
`;

function HeldCartsModal({ isOpen, onClose, heldCarts, onResume, onDelete }) {
    if (!isOpen) return null;

    return (
        <ModalBackdrop initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ModalContainer initial={{ y: -50 }} animate={{ y: 0 }}>
                <ModalHeader>
                    <ModalTitle>Keranjang Ditahan</ModalTitle>
                    <CloseButton onClick={onClose}><FiX size={24} /></CloseButton>
                </ModalHeader>
                <CartList>
                    {heldCarts.length === 0 ? (
                        <EmptyState>
                            <FiShoppingCart size={48} style={{marginBottom: '20px'}} />
                            <p>Tidak ada keranjang yang ditahan.</p>
                        </EmptyState>
                    ) : (
                        heldCarts.map(cart => (
                            <CartItem key={cart.id}>
                                <div onClick={() => onResume(cart.id)} style={{flexGrow: 1}}>
                                    <CartInfo>
                                        <CustomerName>
                                            <FiUser size={14} />
                                            {cart.customer ? cart.customer.name : 'Pelanggan Umum'}
                                        </CustomerName>
                                        <CartDetails>
                                            {cart.items.length} item - Ditahan pukul {new Date(cart.id).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </CartDetails>
                                    </CartInfo>
                                </div>
                                <ActionGroup>
                                    <DeleteButton onClick={(e) => { e.stopPropagation(); onDelete(cart.id); }}><FiTrash2/></DeleteButton>
                                </ActionGroup>
                            </CartItem>
                        ))
                    )}
                </CartList>
            </ModalContainer>
        </ModalBackdrop>
    );
}

HeldCartsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    heldCarts: PropTypes.array.isRequired,
    onResume: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default HeldCartsModal;