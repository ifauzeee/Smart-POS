// frontend/src/components/PageWrapper.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import PropTypes from 'prop-types';

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

/**
 * PageWrapper now focuses solely on providing consistent page transition animations.
 * The loading state is handled by parent components.
 */
const PageWrapper = ({ children }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="page-content-wrapper" // A consistent key can be used here
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}
      >
        <PageContainer>{children}</PageContainer>
      </motion.div>
    </AnimatePresence>
  );
};

PageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PageWrapper;