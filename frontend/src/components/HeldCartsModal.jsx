import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronsRight, FiTrash2 } from 'react-icons/fi';

const ModalBackdrop = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
`;
const ModalContainer = styled(motion.div)`
  background-color: var(--bg-surface); border-radius: 16px;
  width: 100%; max-width: 500px; overflow: hidden;
  border: 1px solid var(--border-color);
`;
const ModalHeader = styled.div`
  padding: 20px 25px; border-bottom: 1px solid var(--border-color);
  display: flex; justify-content: space-between; align-items: center;
`;
const ModalTitle = styled.h3` font-size: 1.2rem; font-weight: 600; margin: 0;`;
const CloseButton = styled.button` background: none; border: none; cursor: pointer; color: var(--text-secondary); `;
const ModalBody = styled.div`
    padding: 25px;
    max-height: 60vh;
    overflow-y: auto;
`;
const CartList = styled.ul`
    list-style: none; padding: 0; margin: 0;
`;
const CartItem = styled.li`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 10px;
    background-color: var(--bg-main);
    border: 1px solid var(--border-color);
`;
const CartInfo = styled.div`
    font-weight: 500;
    & small {
        display: block;
        color: var(--text-secondary);
        font-weight: 400;
    }
`;
const ActionButton = styled.button`
    background: ${props => props.$resume ? 'var(--primary-color)' : 'none'};
    color: ${props => props.$resume ? 'white' : 'var(--text-secondary)'};
    border: ${props => props.$resume ? 'none' : '1px solid var(--border-color)'};
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    margin-left: 10px;
    &:hover {
        opacity: 0.8;
    }
`;

function HeldCartsModal({ isOpen, onClose, heldCarts, onResume, onDelete }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
               <ModalBackdrop>
                    <ModalContainer>
                        <ModalHeader>
                             <ModalTitle>Keranjang Ditahan</ModalTitle>
                            <CloseButton onClick={onClose}><FiX size={24} /></CloseButton>
                        </ModalHeader>
                        <ModalBody>
                             <CartList>
                                {heldCarts.length > 0 ? heldCarts.map(cart => (
                                    <CartItem key={cart.id}>
                                         <CartInfo>
                                            {cart.customer ? cart.customer.name : `Keranjang #${cart.id.slice(-4)}`}
                                             <small>{cart.items.length} item</small>
                                        </CartInfo>
                                        <div>
                                             <ActionButton onClick={() => onDelete(cart.id)}><FiTrash2/></ActionButton>
                                            <ActionButton $resume onClick={() => onResume(cart.id)}><FiChevronsRight/> Lanjutkan</ActionButton>
                                        </div>
                                   </CartItem>
                                )) : <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Tidak ada keranjang yang ditahan.</p>}
                            </CartList>
                         </ModalBody>
                    </ModalContainer>
                </ModalBackdrop>
            )}
        </AnimatePresence>
    );
}

export default HeldCartsModal;

HeldCartsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  heldCarts: PropTypes.array.isRequired,
  onResume: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};