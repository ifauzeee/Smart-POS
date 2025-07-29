import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const ModalBackdrop = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled(motion.div)`
  background: var(--bg-surface);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
`;

const ModalHeader = styled.div`
  padding: 20px 25px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(120deg, var(--bg-surface), var(--bg-main));
`;
const ModalTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
  &:hover {
    transform: rotate(90deg);
    color: var(--text-primary);
  }
`;

const VariantGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  padding: 25px;
`;

const VariantButton = styled(motion.button)`
  padding: 15px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-surface);
  cursor: pointer;
  text-align: center;
  position: relative;
  overflow: hidden;
  color: var(--text-primary);

  &:hover:not(:disabled) {
    border-color: var(--primary-color);
    color: var(--primary-color);
    box-shadow: 0 0 15px rgba(157, 78, 221, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: var(--bg-main);
    color: var(--text-secondary);
  }
`;

const VariantName = styled.div`font-weight: 600;`;
const VariantPrice = styled.div`font-size: 0.9rem; margin-top: 5px;`;
const VariantStock = styled.div`font-size: 0.8rem; color: var(--text-secondary); margin-top: 8px;`;

const OutOfStockBadge = styled.div`
    position: absolute;
    top: 5px;
    right: 5px;
    background-color: var(--red-color);
    color: white;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
`;

function VariantSelectModal({ isOpen, onClose, product, onSelectVariant }) {
    const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    const modalVariants = {
        hidden: { scale: 0.95, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 30 }
        }
    };

    if (!isOpen || !product) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <ModalBackdrop
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    <ModalContainer
                        variants={modalVariants}
                        onClick={e => e.stopPropagation()}
                    >
                        <ModalHeader>
                            <ModalTitle>Pilih Varian: {product.name}</ModalTitle>
                            <CloseButton onClick={onClose}><FiX size={24} /></CloseButton>
                        </ModalHeader>
                        <VariantGrid>
                            {product.variants.map((variant, index) => (
                                <VariantButton 
                                    key={variant.id} 
                                    onClick={() => onSelectVariant(product, variant)}
                                    disabled={product.stock <= 0} // Logic updated to use product's total stock
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {product.stock <= 0 && <OutOfStockBadge>Habis</OutOfStockBadge>}
                                    <VariantName>{variant.name}</VariantName>
                                    <VariantPrice>Rp {new Intl.NumberFormat('id-ID').format(variant.price)}</VariantPrice>
                                </VariantButton>
                            ))}
                        </VariantGrid>
                    </ModalContainer>
                </ModalBackdrop>
            )}
        </AnimatePresence>
    );
}

export default VariantSelectModal;

VariantSelectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.object,
  onSelectVariant: PropTypes.func.isRequired,
};