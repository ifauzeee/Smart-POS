import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPrinter } from 'react-icons/fi';
import Receipt from './Receipt';

// --- Styled Components (tidak berubah) ---
const ModalBackdrop = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
`;
const ModalContainer = styled(motion.div)`
  background-color: var(--bg-surface); border-radius: 16px;
  width: 100%; max-width: 450px; overflow: hidden;
`;
const ModalHeader = styled.div`
  padding: 20px 25px; border-bottom: 1px solid var(--border-color);
  display: flex; justify-content: space-between; align-items: center;
`;
const ModalTitle = styled.h3` font-size: 1.2rem; font-weight: 600; `;
const CloseButton = styled.button` background: none; border: none; color: var(--text-secondary); cursor: pointer; &:hover { color: var(--text-primary); } `;
const ModalBody = styled.div` padding: 25px; max-height: 60vh; overflow-y: auto; `;
const DetailGrid = styled.div` display: grid; grid-template-columns: 1fr 2fr; gap: 10px 20px; margin-bottom: 25px; font-size: 0.9rem; `;
const DetailLabel = styled.span` font-weight: 500; color: var(--text-secondary); `;
const DetailValue = styled.span` font-weight: 500; color: var(--text-primary); `;
const ItemsTable = styled.table` width: 100%; border-collapse: collapse; margin-top: 10px; th, td { text-align: left; padding: 8px 0; border-bottom: 1px solid var(--border-color); } th { color: var(--text-secondary); font-size: 0.8rem; }`;
const ModalFooter = styled.div` padding: 20px 25px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; `;
const PrintButton = styled.button`
  background-color: var(--primary-color); color: white; border: none;
  border-radius: 8px; padding: 10px 20px; font-weight: 600;
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  &:hover { background-color: var(--primary-hover); }
`;
// --- End of Styled Components ---

function OrderDetailModal({ isOpen, onClose, order }) {
  const receiptRef = useRef(null); // Ref untuk menunjuk ke komponen Receipt

  const handlePrint = () => {
    const receiptNode = receiptRef.current;
    if (!receiptNode) return;

    // Salin semua tag <style> dari dokumen utama
    const styles = Array.from(document.head.querySelectorAll('style'))
      .map(style => style.innerHTML)
      .join('');

    const printWindow = window.open('', '_blank', 'width=320,height=500');
    printWindow.document.write(`
      <html>
        <head>
          <title>Struk Pesanan #${order.id}</title>
          <style>${styles}</style>
        </head>
        <body>
          ${receiptNode.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    // Beri jeda agar gambar (jika ada) sempat termuat
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
  };

  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const modalVariants = { hidden: { scale: 0.9, opacity: 0 }, visible: { scale: 1, opacity: 1 } };

  return (
    <AnimatePresence>
      {isOpen && order && (
        <>
          <div style={{ display: 'none' }}>
            <Receipt order={order} ref={receiptRef} />
          </div>
          
          <ModalBackdrop initial="hidden" animate="visible" exit="hidden" variants={backdropVariants} onClick={onClose}>
            <ModalContainer variants={modalVariants} onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Detail Pesanan</ModalTitle>
                <CloseButton onClick={onClose}><FiX size={24} /></CloseButton>
              </ModalHeader>
              <ModalBody>
                  <DetailGrid>
                    <DetailLabel>ID Pesanan:</DetailLabel>
                    <DetailValue>#{order.id}</DetailValue>
                    <DetailLabel>Tanggal:</DetailLabel>
                    <DetailValue>{new Date(order.created_at).toLocaleString('id-ID')}</DetailValue>
                    <DetailLabel>Kasir:</DetailLabel>
                    <DetailValue>{order.cashier_name}</DetailValue>
                    <DetailLabel>Total:</DetailLabel>
                    <DetailValue>Rp {new Intl.NumberFormat('id-ID').format(order.total_amount)}</DetailValue>
                  </DetailGrid>
                  <h4>Item Dibeli:</h4>
                  <ItemsTable>
                    <thead>
                      <tr>
                        <th>Produk</th>
                        <th>Jumlah</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product_name}</td>
                          <td>{item.quantity}</td>
                          <td>Rp {new Intl.NumberFormat('id-ID').format(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </ItemsTable>
              </ModalBody>
              <ModalFooter>
                  <PrintButton onClick={handlePrint}>
                      <FiPrinter /> Cetak Struk
                  </PrintButton>
              </ModalFooter>
            </ModalContainer>
          </ModalBackdrop>
        </>
      )}
    </AnimatePresence>
  );
}

export default OrderDetailModal;