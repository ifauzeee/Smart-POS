// C:\Users\Ibnu\Project\smart-pos\frontend\src\components\RedeemRewardModal.jsx

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiGift, FiLoader } from 'react-icons/fi';
import { getRewards, redeemRewardForCustomer } from '../services/api';
import { toast } from 'react-toastify';
import Skeleton from 'react-loading-skeleton';
import ConfirmationModal from './ConfirmationModal'; // Impor modal konfirmasi

// --- Styled Components ---
const ModalBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  backdrop-filter: blur(5px);
`;

const ModalContainer = styled(motion.div)`
  background-color: var(--bg-surface);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
`;

const ModalHeader = styled.div`
  padding: 20px 25px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;

const ModalTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  &:hover {
    color: var(--text-primary);
  }
`;

const ModalBody = styled.div`
  padding: 25px;
  overflow-y: auto;
  flex-grow: 1;
`;

const RewardList = styled(motion.ul)`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RewardItemContainer = styled(motion.li)`
  padding: 15px 20px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  opacity: ${(props) => (props.$disabled ? 0.6 : 1)};
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: ${(props) => (props.$disabled ? 'var(--border-color)' : 'var(--primary-color)')};
    transform: ${(props) => (props.$disabled ? 'none' : 'translateY(-2px)')};
    box-shadow: ${(props) => (props.$disabled ? 'none' : '0 4px 12px rgba(0,0,0,0.08)')};
  }
`;

const RewardInfo = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  z-index: 2;
`;

const PointsCost = styled.div`
  font-weight: 700;
  color: var(--primary-color);
  background-color: var(--bg-main);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  z-index: 2;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: var(--text-secondary);
  padding: 40px 20px;
  min-height: 200px;
`;

// Komponen untuk item hadiah
const RewardItem = ({ reward, customerPoints, onRedeem }) => {
  const isDisabled = customerPoints < reward.points_cost;
  return (
    <RewardItemContainer
      $disabled={isDisabled}
      onClick={() => !isDisabled && onRedeem(reward)}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
    >
      <RewardInfo>{reward.name}</RewardInfo>
      <PointsCost>{reward.points_cost.toLocaleString('id-ID')} Poin</PointsCost>
    </RewardItemContainer>
  );
};

RewardItem.propTypes = {
  reward: PropTypes.object.isRequired,
  customerPoints: PropTypes.number.isRequired,
  onRedeem: PropTypes.func.isRequired,
};


function RedeemRewardModal({ isOpen, onClose, customer, onRedemptionSuccess }) {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  const fetchRewards = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const res = await getRewards();
      setRewards(res.data);
    } catch (error) {
      toast.error("Gagal memuat daftar hadiah.");
    } finally {
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const handleSelectReward = (reward) => {
    setSelectedReward(reward);
    setIsConfirmOpen(true);
  };

  const confirmRedemption = async () => {
    if (!selectedReward) return;

    try {
      await toast.promise(
        redeemRewardForCustomer(customer.id, selectedReward.id),
        {
          pending: 'Memproses penukaran...',
          success: 'Hadiah berhasil ditukarkan!',
          error: (err) => err.response?.data?.message || 'Gagal menukarkan hadiah.'
        }
      );
      onRedemptionSuccess(); // Refresh data di halaman detail
    } catch (error) {
      console.error(error);
    } finally {
      setIsConfirmOpen(false);
      setSelectedReward(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <ModalBackdrop initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContainer initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
              <ModalHeader>
                <ModalTitle>Tukarkan Poin - {customer.name}</ModalTitle>
                <CloseButton onClick={onClose}><FiX size={24} /></CloseButton>
              </ModalHeader>
              <ModalBody>
                {loading ? (
                  <RewardList>
                    {[...Array(3)].map((_, i) => <Skeleton key={i} height={60} borderRadius={12} />)}
                  </RewardList>
                ) : rewards.length > 0 ? (
                  <RewardList>
                    {rewards.map(reward => (
                      <RewardItem
                        key={reward.id}
                        reward={reward}
                        customerPoints={customer.points}
                        onRedeem={handleSelectReward}
                      />
                    ))}
                  </RewardList>
                ) : (
                  <EmptyStateContainer>
                      <FiGift size={48} style={{ marginBottom: '20px' }} />
                      <h3>Belum Ada Hadiah</h3>
                      <p>Saat ini belum ada katalog hadiah yang tersedia.</p>
                  </EmptyStateContainer>
                )}
              </ModalBody>
            </ModalContainer>
          </ModalBackdrop>
        )}
      </AnimatePresence>
      
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmRedemption}
        title="Konfirmasi Penukaran"
        message={`Yakin ingin menukarkan ${selectedReward?.points_cost.toLocaleString('id-ID')} poin untuk "${selectedReward?.name}"?`}
      />
    </>
  );
}

RedeemRewardModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  customer: PropTypes.object.isRequired,
  onRedemptionSuccess: PropTypes.func.isRequired,
};

export default RedeemRewardModal;