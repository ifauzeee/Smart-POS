import React from 'react';
import styled from 'styled-components';

// --- Styled Components ---
const ReceiptContainer = styled.div`
  width: 280px; 
  padding: 15px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.4;
  color: #000;
  background-color: #fff;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 15px;
`;

const ShopName = styled.h2`
  font-size: 16px;
  margin: 0;
  font-weight: bold;
`;

const ShopInfo = styled.p`
  margin: 4px 0 0 0;
  font-size: 11px;
`;

const Divider = styled.div`
  border-top: 1px dashed #000;
  margin: 10px 0;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
`;

const ItemsTable = styled.table`
  width: 100%;
  margin: 10px 0;
  
  thead th {
    text-align: left;
    border-bottom: 1px dashed #000;
    padding-bottom: 5px;
    font-weight: bold;
  }
  
  tbody td {
    padding-top: 5px;
    vertical-align: top;
  }
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 15px;
`;
// --- End of Styled Components ---

// PENTING: Menggunakan kembali React.forwardRef
const Receipt = React.forwardRef(({ order }, ref) => {
  if (!order) return null;

  return (
    <ReceiptContainer ref={ref}>
      <Header>
        <ShopName>SmartPOS</ShopName>
        <ShopInfo>Jl. Teknologi No. 1, Cileungsi</ShopInfo>
        <ShopInfo>021-1234-5678</ShopInfo>
      </Header>
      
      <Divider />
      
      <DetailRow>
        <span>No Pesanan:</span>
        <span>#{String(order.id).padStart(6, '0')}</span>
      </DetailRow>
      <DetailRow>
        <span>Tanggal:</span>
        <span>{new Date(order.created_at).toLocaleString('id-ID')}</span>
      </DetailRow>
      <DetailRow>
        <span>Kasir:</span>
        <span>{order.cashier_name}</span>
      </DetailRow>
      
      <Divider />

      <ItemsTable>
        <thead>
          <tr>
            <th>Item</th>
            <th style={{ textAlign: 'center' }}>Qty</th>
            <th style={{ textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index}>
              <td>{item.product_name}</td>
              <td style={{ textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('id-ID').format(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </ItemsTable>

      <Divider />

      <DetailRow>
        <strong>Total</strong>
        <strong>Rp {new Intl.NumberFormat('id-ID').format(order.total_amount)}</strong>
      </DetailRow>
      
      <Footer>
        <p>Terima Kasih Atas Kunjungan Anda!</p>
      </Footer>
    </ReceiptContainer>
  );
});

export default Receipt;