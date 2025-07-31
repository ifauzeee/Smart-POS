import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FaBoxOpen } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';

// Placeholder for EmptyStateContainer
const EmptyStateContainer = ({ message, icon }) => (
  <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
    {icon}
    <p>{message}</p>
  </div>
);

const StaleProductContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StaleProductItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8f8f8;
  }
`;

const ProductName = styled.div`
  font-weight: 500;
`;

const ProductStock = styled.div`
  color: var(--secondary-color);
`;

const ProductLastSold = styled.div`
  color: var(--gray-color);
`;

const StaleProductsList = ({ loading, staleProducts }) => {
  if (loading) {
    return (
      <StaleProductContainer>
        <Skeleton count={5} height={30} />
      </StaleProductContainer>
    );
  }

  if (!staleProducts || staleProducts.length === 0) {
    return (
      <StaleProductContainer>
        <EmptyStateContainer message="Tidak ada produk yang tidak laku" icon={<FaBoxOpen size={40} />} />
      </StaleProductContainer>
    );
  }

  return (
    <StaleProductContainer>
      {staleProducts.map((p, idx) => (
        <StaleProductItem key={idx}>
          <ProductName>{p.name}</ProductName>
          <ProductStock>Stok: {p.stock}</ProductStock>
          <ProductLastSold>
            Terakhir Terjual: {p.lastSoldDate ? new Date(p.lastSoldDate).toLocaleDateString('id-ID') : 'Belum Terjual'}
          </ProductLastSold>
        </StaleProductItem>
      ))}
    </StaleProductContainer>
  );
};

StaleProductsList.propTypes = {
  loading: PropTypes.bool,
  staleProducts: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      stock: PropTypes.number.isRequired,
      lastSoldDate: PropTypes.string,
    })
  ),
};

StaleProductsList.defaultProps = {
  loading: false,
  staleProducts: [],
};

export default StaleProductsList;