import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getProducts, createOrder } from '../services/api';
import { FiPlus, FiMinus, FiSearch, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast } from 'react-toastify';
import PostCheckoutModal from '../components/PostCheckoutModal';
import CheckoutModal from '../components/CheckoutModal';

// --- Styled Components ---
const PageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 30px;
  width: 100%;
  height: 100%;
  padding: 30px;
`;

const ProductsPanel = styled.div`
  background-color: var(--bg-surface);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(29,33,41,0.05);
`;

const PanelHeader = styled.header`
  padding: 20px 25px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
`;

const PanelTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 450px;
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  top: 50%;
  left: 15px;
  transform: translateY(-50%);
  color: var(--text-placeholder);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 20px 12px 45px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  background-color: var(--bg-main);
  color: var(--text-primary);
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ProductGrid = styled(motion.div)`
  flex-grow: 1;
  padding: 25px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 25px;
  overflow-y: auto;
`;

const ProductCard = styled(motion.div)`
  background-color: var(--bg-surface);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  opacity: ${props => props.disabled ? 0.6 : 1};
  &:hover {
    box-shadow: 0 8px 24px rgba(29,33,41,0.1);
    transform: translateY(-2px);
  }
`;

const ProductImage = styled.div`
  width: 100%;
  padding-top: 100%;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  border-bottom: 1px solid var(--border-color);
`;

const ProductInfo = styled.div`
  padding: 15px;
  text-align: left;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const ProductName = styled.h4`
  margin: 0 0 5px 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  height: 2.4em;
  line-height: 1.2em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ProductPrice = styled.p`
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1rem;
  margin-top: auto;
`;

const AddToCartButton = styled(motion.button)`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  &:disabled {
    background-color: #BDBDBD;
    cursor: not-allowed;
  }
`;

const CartPanel = styled.aside`
  background-color: var(--bg-surface);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(29,33,41,0.05);
`;

const CartItemsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  overflow-y: auto;
`;

const CartItem = styled(motion.li)`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-color);
`;

const CartItemImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
`;

const CartItemDetails = styled.div`
  flex-grow: 1;
`;

const CartItemName = styled.span`
  display: block;
  font-weight: 500;
  font-size: 0.9rem;
`;

const CartItemPrice = styled.small`
  color: var(--text-secondary);
`;

const CartItemControls = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 4px;
`;

const ControlButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { color: var(--primary-color); }
`;

const QuantityDisplay = styled.span`
  padding: 0 8px;
  font-weight: 500;
  font-size: 0.9rem;
`;

const RemoveItemButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  &:hover { color: var(--red-color); }
`;

const CheckoutSection = styled.div`
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
  margin-top: auto;
  background-color: var(--bg-surface);
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 20px;
  & span:last-child { font-weight: 600; font-size: 1.1rem; }
`;

const CheckoutButton = styled(motion.button)`
  width: 100%;
  padding: 15px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
`;

const SkeletonCard = () => (
  <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px' }}>
    <Skeleton height={180} />
    <div style={{ padding: '15px', backgroundColor: 'var(--bg-surface)', borderRadius: '0 0 8px 8px' }}>
      <Skeleton height={20} style={{ marginBottom: '8px' }} />
      <Skeleton height={24} width="50%" />
    </div>
  </div>
);

// --- Component ---
function PosPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastOrderId, setLastOrderId] = useState(null);
  const [isPostCheckoutOpen, setIsPostCheckoutOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      setProducts(res.data);
    } catch {
      toast.error("Gagal memuat data produk.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = (productToAdd) => {
    if (productToAdd.stock <= 0) return toast.warn('Stok produk habis!');
    const existingItem = cart.find((item) => item.id === productToAdd.id);
    if (existingItem) {
      if (existingItem.quantity >= productToAdd.stock) return toast.warn('Stok tidak mencukupi!');
      increaseQuantity(productToAdd.id);
    } else {
      setCart([...cart, { ...productToAdd, quantity: 1 }]);
      toast.success(`${productToAdd.name} ditambahkan`);
    }
  };

  const increaseQuantity = (productId) => {
    const itemInCart = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    if (itemInCart && product && itemInCart.quantity >= product.stock) {
      toast.warn('Stok tidak mencukupi!');
      return;
    }
    setCart(cart.map(item => item.id === productId ? { ...item, quantity: item.quantity + 1 } : item));
  };

  const decreaseQuantity = (productId) => {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem.quantity === 1) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return toast.warn('Keranjang masih kosong!');
    const orderData = { items: cart.map(item => ({ productId: item.id, quantity: item.quantity })) };
    
    const promise = createOrder(orderData);
    toast.promise(promise, {
      pending: 'Memproses transaksi...',
      success: {
        render({data}){
          const newOrderId = data.data.orderId;
          setLastOrderId(newOrderId);
          setIsPostCheckoutOpen(true);
          return `Transaksi berhasil!`;
        }
      },
      error: { render({data}){ return `Gagal checkout: ${data.response?.data?.message || 'Server error'}`; } }
    });
  };

  const handleClosePostCheckoutModal = () => {
    setIsPostCheckoutOpen(false);
    setCart([]);
    fetchProducts();
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const cardAnimationVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
  const cartItemAnimationVariants = { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 } };

  return (
    <>
      <PageGrid>
        <ProductsPanel>
          <PanelHeader>
            <SearchContainer>
              <SearchIcon size={18} />
              <SearchInput
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>
          </PanelHeader>
          {loading ? (
            <ProductGrid>
              {Array.from({ length: 12 }).map((_, index) => <SkeletonCard key={index} />)}
            </ProductGrid>
          ) : (
            <ProductGrid>
              {filteredProducts.map((product, index) => (
                <motion.div key={product.id} variants={cardAnimationVariants} initial="initial" animate="animate" transition={{ duration: 0.3, delay: index * 0.05 }}>
                  <ProductCard disabled={product.stock === 0}>
                    <ProductImage src={product.image_url || `https://placehold.co/200/F7F8FC/1D2129?text=${product.name.charAt(0)}`} />
                    <AddToCartButton
                      disabled={product.stock === 0}
                      onClick={() => addToCart(product)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiPlus size={20} />
                    </AddToCartButton>
                    <ProductInfo>
                      <ProductName>{product.name}</ProductName>
                      <ProductPrice>Rp {new Intl.NumberFormat('id-ID').format(product.price)}</ProductPrice>
                    </ProductInfo>
                  </ProductCard>
                </motion.div>
              ))}
            </ProductGrid>
          )}
        </ProductsPanel>

        <CartPanel>
          <PanelHeader>
            <PanelTitle>Pesanan</PanelTitle>
          </PanelHeader>
          <CartItemsList>
            <AnimatePresence>
              {cart.length > 0 ? cart.map(item => (
                <CartItem key={item.id} variants={cartItemAnimationVariants} initial="initial" animate="animate" exit="exit" layout>
                  <CartItemImage src={item.image_url || 'https://placehold.co/100'} />
                  <CartItemDetails>
                    <CartItemName>{item.name}</CartItemName>
                    <CartItemPrice>Rp {new Intl.NumberFormat('id-ID').format(item.price)}</CartItemPrice>
                  </CartItemDetails>
                  <CartItemControls>
                    <ControlButton onClick={() => decreaseQuantity(item.id)}><FiMinus size={16} /></ControlButton>
                    <QuantityDisplay>{item.quantity}</QuantityDisplay>
                    <ControlButton onClick={() => increaseQuantity(item.id)}><FiPlus size={16} /></ControlButton>
                  </CartItemControls>
                  <RemoveItemButton onClick={() => removeFromCart(item.id)}><FiTrash2 size={18} /></RemoveItemButton>
                </CartItem>
              )) : <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>Keranjang Anda kosong.</p>}
            </AnimatePresence>
          </CartItemsList>

          {cart.length > 0 && (
            <CheckoutSection>
              <TotalRow>
                <span>Total</span>
                <span>Rp {new Intl.NumberFormat('id-ID').format(cartTotal)}</span>
              </TotalRow>
              <CheckoutButton onClick={() => setIsCheckoutModalOpen(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Bayar Sekarang</CheckoutButton>
            </CheckoutSection>
          )}
        </CartPanel>
      </PageGrid>

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartTotal={cartTotal}
        onConfirmCheckout={handleCheckout}
      />

      <PostCheckoutModal
        isOpen={isPostCheckoutOpen}
        onClose={handleClosePostCheckoutModal}
        orderId={lastOrderId}
      />
    </>
  );
}

export default PosPage;