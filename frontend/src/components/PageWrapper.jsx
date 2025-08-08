// frontend/src/components/PageWrapper.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';

const PageContainer = styled.div`
  padding: 30px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const pageTransition = {
  duration: 0.2,
  ease: "easeInOut",
};

// FIXED: Removed the loading prop and conditional rendering.
// The component's only responsibility is now page transition animations.
const PageWrapper = ({ children, loading }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="page-content-wrapper"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}
      >
        {loading ? <Skeleton height="100%" /> : <PageContainer>{children}</PageContainer>}
      </motion.div>
    </AnimatePresence>
  );
};

PageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  loading: PropTypes.bool,
};

export default PageWrapper;