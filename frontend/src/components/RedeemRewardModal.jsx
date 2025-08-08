// C:\Users\Ibnu\Project\smart-pos\frontend\src\components\RedeemRewardModal.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiGift } from 'react-icons/fi';
import { getRewards, redeemRewardForCustomer } from '../services/api';
import { toast } from 'react-toastify';

const ModalBackdrop = styled(motion.div)` /* ... (salin dari modal lain) */ `;
const ModalContainer = styled(motion.div)` /* ... (salin dari modal lain, buat max-width: 500px) */ `;
const ModalHeader = styled.div` /* ... (salin dari modal lain) */ `;
const ModalTitle = styled.h3` /* ... (salin dari modal lain) */ `;
const CloseButton = styled.button` /* ... (salin dari modal lain) */ `;
const ModalBody = styled.div` padding: 25px; max-height: 60vh; overflow-y: auto; `;
const RewardList = styled.ul` list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; `;
const RewardItem = styled.li`
    padding: 15px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    opacity: ${props => props.disabled ? 0.5 : 1};
    transition: all 0.2s ease;
    &:hover {
        border-color: ${props => props.disabled ? 'var(--border-color)' : 'var(--primary-color)'};
        background-color: ${props => props.disabled ? 'transparent' : 'var(--bg-main)'};
    }
`;
const RewardInfo = styled.div` font-weight: 500; `;
const PointsCost = styled.div` font-weight: 600; color: var(--primary-color); `;

function RedeemRewardModal({ isOpen, onClose, customer, onRedemptionSuccess }) {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            getRewards()
                .then(res => setRewards(res.data))
                .catch(() => toast.error("Gagal memuat daftar hadiah."))
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    const handleRedeem = async (reward) => {
        if (window.confirm(`Yakin ingin menukarkan ${reward.points_cost} poin untuk "${reward.name}"?`)) {
            try {
                await toast.promise(
                    redeemRewardForCustomer(customer.id, reward.id),
                    {
                        pending: 'Memproses penukaran...',
                        success: 'Hadiah berhasil ditukarkan!',
                        error: (err) => err.response?.data?.message || 'Gagal menukarkan hadiah.'
                    }
                );
                onRedemptionSuccess(); // Panggil fungsi untuk merefresh data di halaman detail
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <ModalBackdrop initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ModalContainer initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: 50 }}>
                        <ModalHeader>
                            <ModalTitle>Tukarkan Poin - {customer.name}</ModalTitle>
                            <CloseButton onClick={onClose}><FiX size={24} /></CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            {loading ? <p>Memuat hadiah...</p> : (
                                <RewardList>
                                    {rewards.map(reward => (
                                        <RewardItem
                                            key={reward.id}
                                            disabled={customer.points < reward.points_cost}
                                            onClick={() => customer.points >= reward.points_cost && handleRedeem(reward)}
                                        >
                                            <RewardInfo>{reward.name}</RewardInfo>
                                            <PointsCost>{reward.points_cost.toLocaleString('id-ID')} Poin</PointsCost>
                                        </RewardItem>
                                    ))}
                                </RewardList>
                            )}
                        </ModalBody>
                    </ModalContainer>
                </ModalBackdrop>
            )}
        </AnimatePresence>
    );
}

RedeemRewardModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    customer: PropTypes.object.isRequired,
    onRedemptionSuccess: PropTypes.func.isRequired,
};

export default RedeemRewardModal;