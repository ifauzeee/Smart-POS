import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getProducts, createOrder } from '../services/api';
import { FiPlus, FiMinus, FiSearch, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast } from 'react-toastify';

const PageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 30px;
  width: 100%;
  height: 100%;
  padding: 30px;
`;

const ProductsPanel = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PanelHeader = styled.header`
  margin-bottom: 25px;
`;

const SearchInputContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 450px;
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  color: var(--text-placeholder);
`;

const SearchInput = styled.input`
  padding: 14px 20px 14px 50px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 1rem;
  width: 100%;
  background-color: var(--bg-surface);
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  transition: box-shadow 0.2s;
  &::placeholder { color: var(--text-placeholder); }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--primary-color);
  }
`;

const ProductGrid = styled(motion.div)`
  flex-grow: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 30px;
  overflow-y: auto;
  padding-right: 15px;
`;

const ProductCard = styled(motion.div)`
  background-color: var(--bg-surface);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  opacity: ${props => props.disabled ? 0.5 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.3);
  }
`;

const ProductImage = styled.div`
  width: 100%;
  padding-top: 100%;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
`;

const ProductInfo = styled.div`
  padding: 20px;
  text-align: center;
`;

const ProductName = styled.h4`
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const ProductPrice = styled.p`
  margin: 0;
  color: var(--primary-color);
  font-weight: 600;
  font-size: 1.2rem;
`;

const CartContainer = styled.aside`
  background-color: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  padding: 25px;
`;

const CartHeader = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 20px 0;
`;

const CartItemsList = styled.ul`
  list-style: none;
  padding: 0;
  flex-grow: 1;
  overflow-y: auto;
`;

const CartItem = styled(motion.li)`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const CartItemImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 15px;
`;

const CartItemDetails = styled.div`
  flex-grow: 1;
`;

const CartItemName = styled.span`
  display: block;
  font-weight: 500;
`;

const CartItemPrice = styled.small`
  color: var(--text-secondary);
`;

const CartItemControls = styled.div`
  display: flex;
  align-items: center;
`;

const ControlButton = styled.button`
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  &:hover {
    background-color: var(--primary-color);
    color: white;
  }
`;

const QuantityDisplay = styled.span`
  padding: 0 12px;
  font-weight: 600;
  font-size: 1rem;
`;

const RemoveItemButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  margin-left: 10px;
  &:hover { color: var(--red-color); }
`;

const CheckoutSection = styled.div`
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 20px;
`;

const CheckoutButton = styled(motion.button)`
  width: 100%;
  padding: 18px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
`;

const SkeletonCard = () => (
    <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '16px', overflow: 'hidden' }}>
        <Skeleton height={220} />
        <div style={{ padding: '20px' }}>
            <Skeleton height={24} style={{ marginBottom: '8px' }} />
            <Skeleton height={28} width="50%" />
        </div>
    </div>
);

function PosPage() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await getProducts();
            setProducts(res.data);
        } catch (error) {
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
    
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    const handleCheckout = () => {
        if (cart.length === 0) return toast.warn('Keranjang masih kosong!');
        const orderData = { items: cart.map(item => ({ productId: item.id, quantity: item.quantity })) };
        
        const promise = createOrder(orderData);
        toast.promise(promise, {
            pending: 'Memproses transaksi...',
            success: {
                render({data}){
                    setCart([]);
                    fetchProducts();
                    return `Transaksi berhasil! Order ID: ${data.data.orderId}`;
                }
            },
            error: {
                render({data}){
                    return `Gagal checkout: ${data.response?.data?.message || 'Server error'}`;
                }
            }
        });
    };
    
    const cardAnimationVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
    const cartItemAnimationVariants = { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 } };

    return (
        <PageGrid>
            <ProductsPanel>
                <PanelHeader>
                    <SearchInputContainer>
                        <SearchIcon size={20}/>
                        <SearchInput
                            type="text"
                            placeholder="Cari produk..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </SearchInputContainer>
                </PanelHeader>
                {loading ? (
                    <ProductGrid>
                        {Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)}
                    </ProductGrid>
                ) : (
                    <ProductGrid>
                        <AnimatePresence>
                            {filteredProducts.map((product, index) => (
                                <motion.div key={product.id} variants={cardAnimationVariants} initial="initial" animate="animate" transition={{ duration: 0.3, delay: index * 0.05 }} layout>
                                    <ProductCard 
                                        onClick={() => addToCart(product)} 
                                        disabled={product.stock === 0}
                                        whileHover={{ scale: 1.03 }}
                                    >
                                        <ProductImage src={product.image_url || `https://placehold.co/300/121212/F5F6F7?text=${product.name.charAt(0)}`} />
                                        <ProductInfo>
                                            <ProductName>{product.name}</ProductName>
                                            <ProductPrice>Rp {new Intl.NumberFormat('id-ID').format(product.price)}</ProductPrice>
                                        </ProductInfo>
                                    </ProductCard>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </ProductGrid>
                )}
            </ProductsPanel>
            <CartContainer>
                <CartHeader>Pesanan</CartHeader>
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
                                    <ControlButton onClick={(e) => { e.stopPropagation(); decreaseQuantity(item.id); }}><FiMinus /></ControlButton>
                                    <QuantityDisplay>{item.quantity}</QuantityDisplay>
                                    <ControlButton onClick={(e) => { e.stopPropagation(); increaseQuantity(item.id); }}><FiPlus /></ControlButton>
                                </CartItemControls>
                                <RemoveItemButton onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}><FiTrash2 size={18} /></RemoveItemButton>
                                
                            </CartItem>
                        )) : <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Keranjang Anda kosong.</p>}
                    </AnimatePresence>
                </CartItemsList>
                {cart.length > 0 && (
                    <CheckoutSection>
                        <TotalRow>
                            <span>Total</span>
                            <span>Rp {new Intl.NumberFormat('id-ID').format(cartTotal)}</span>
                        </TotalRow>
                        <CheckoutButton onClick={handleCheckout} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            Proses Pembayaran
                        </CheckoutButton>
                    </CheckoutSection>
                )}
            </CartContainer>
        </PageGrid>
    );
}

export default PosPage;