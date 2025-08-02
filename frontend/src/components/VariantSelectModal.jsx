// C:\Users\Ibnu\Project\smart-pos\frontend\src\components\VariantSelectModal.jsx

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const ModalBackdrop = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7); display: flex;
  justify-content: center; align-items: center; z-index: 1001;
`;
const ModalContainer = styled(motion.div)`
  background-color: var(--bg-surface); border-radius: 16px;
  width: 100%; max-width: 400px; padding: 30px;
`;
const ModalHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; `;
const ModalTitle = styled.h2` font-size: 1.5rem; margin: 0; color: var(--text-primary);`;
const CloseButton = styled.button` background: none; border: none; cursor: pointer; color: var(--text-secondary); `;
const VariantList = styled.div` display: flex; flex-direction: column; gap: 10px; `;
const VariantButton = styled.button`
  width: 100%; text-align: left; padding: 15px; border-radius: 8px;
  border: 1px solid var(--border-color); background: transparent; cursor: pointer;
  display: flex; justify-content: space-between; align-items: center;
  color: var(--text-primary); // PERBAIKAN: Gunakan variabel warna
  &:hover { background-color: var(--bg-main); }
`;
const VariantPrice = styled.span`
  font-weight: 600;
  color: var(--primary-color); // PERBAIKAN: Gunakan variabel warna
`;

function VariantSelectModal({ isOpen, onClose, product, onSelectVariant }) {
    if (!isOpen || !product) return null;

    return (
        <ModalBackdrop initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ModalContainer initial={{ y: -50 }} animate={{ y: 0 }}>
                <ModalHeader>
                    <ModalTitle>Pilih Varian: {product.name}</ModalTitle>
                    <CloseButton onClick={onClose}><FiX size={24} /></CloseButton>
                </ModalHeader>
                <VariantList>
                    {product.variants.map(variant => (
                        <VariantButton key={variant.id} onClick={() => onSelectVariant(product, variant)}>
                            <span>{variant.name}</span>
                            <VariantPrice>Rp {new Intl.NumberFormat('id-ID').format(variant.price)}</VariantPrice>
                        </VariantButton>
                    ))}
                </VariantList>
            </ModalContainer>
        </ModalBackdrop>
    );
}

VariantSelectModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    product: PropTypes.object,
    onSelectVariant: PropTypes.func.isRequired,
};

export default VariantSelectModal;