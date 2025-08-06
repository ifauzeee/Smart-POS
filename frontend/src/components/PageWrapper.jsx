import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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

const PageWrapper = ({ loading, children }) => {
    if (loading) {
        return (
            <PageContainer>
                <Skeleton height="40px" style={{ marginBottom: '30px', flexShrink: 0 }} />
                <Skeleton height="calc(100vh - 150px)" />
            </PageContainer>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="page-content-wrapper"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
                style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
            >
                <PageContainer>
                    {children}
                </PageContainer>
            </motion.div>
        </AnimatePresence>
    );
};

export default PageWrapper;