// C:\Users\Ibnu\Project\smart-pos\frontend\src\components\ConfirmationModal.jsx

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle } from 'react-icons/fi';

const ModalBackdrop = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7); display: flex;
  justify-content: center; align-items: center; z-index: 1001;
`;
const ModalContainer = styled(motion.div)`
  background-color: var(--bg-surface); border-radius: 16px;
  width: 100%; max-width: 400px; padding: 30px; text-align: center;
`;
const IconWrapper = styled.div` color: var(--red-color); margin-bottom: 20px; `;
const ModalTitle = styled.h2` font-size: 1.5rem; margin-bottom: 15px; color: var(--text-primary); `;
const ModalMessage = styled.p` color: var(--text-secondary); margin-bottom: 30px; line-height: 1.6; `;
const ButtonGroup = styled.div` display: flex; gap: 15px; justify-content: center; `;
const Button = styled.button`
  padding: 10px 25px; border-radius: 8px; border: 1px solid var(--border-color);
  font-weight: 600; cursor: pointer;
  background-color: ${props => props.$danger ? 'var(--red-color)' : 'transparent'};
  color: ${props => props.$danger ? 'white' : 'var(--text-primary)'};
  &:hover { opacity: 0.9; }
`;

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  // =================================================================
  // PERBAIKAN DI SINI: Logika AnimatePresence diperbaiki
  // =================================================================
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={e => e.stopPropagation()}
          >
            <IconWrapper><FiAlertTriangle size={48} /></IconWrapper>
            <ModalTitle>{title}</ModalTitle>
            <ModalMessage>{message}</ModalMessage>
            <ButtonGroup>
              <Button onClick={onClose}>Batal</Button>
              <Button $danger onClick={onConfirm}>Konfirmasi</Button>
            </ButtonGroup>
          </ModalContainer>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
  // =================================================================
  // AKHIR PERBAAIKAN
  // =================================================================
}

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

export default ConfirmationModal;