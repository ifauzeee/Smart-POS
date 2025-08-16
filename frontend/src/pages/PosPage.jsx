// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\PosPage.jsx

import React, { useState, useEffect, useContext, useRef, useCallback, useReducer } from 'react';
import styled from 'styled-components';
import { getProducts, createOrder, getOrderById, validateCoupon } from '../services/api';
import { FiPlus, FiMinus, FiSearch, FiTrash2, FiUser, FiPause, FiGrid, FiTag, FiShoppingCart } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import PostCheckoutModal from '../components/PostCheckoutModal';
import CheckoutModal from '../components/CheckoutModal';
import CustomerSelectModal from '../components/CustomerSelectModal';
import VariantSelectModal from '../components/VariantSelectModal';
import HeldCartsModal from '../components/HeldCartsModal';
import Receipt from '../components/Receipt';
import StartShiftModal from '../components/StartShiftModal';
import { BusinessContext } from '../context/BusinessContext';
import { ShiftContext } from '../context/ShiftContext';
import PageWrapper from '../components/PageWrapper';
import { jwtDecode } from 'jwt-decode';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { addOfflineOrder } from '../utils/offlineDb';

// --- Styled Components (dengan perbaikan pada ProductCard dan ProductInfo) ---
const PageGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 420px;
    gap: 30px;
    width: 100%;
    height: 100%;
    padding: 30px;
    overflow: hidden;
    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
        height: auto;
        padding: 0;
        padding-bottom: 100px;
        gap: 0;
        overflow-y: auto;
    }
`;

const ProductsPanel = styled(motion.div)`
    background-color: var(--bg-surface);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    @media (max-width: 1024px) {
        background-color: transparent;
        border: none;
        border-radius: 0;
        padding: 0 15px;
        overflow: visible;
        box-shadow: none;
    }
`;

const PanelHeader = styled.header`
    padding: 20px 25px;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
    
    @media (max-width: 1024px) {
        padding: 15px 0;
        border-bottom: none;
    }
`;

const SearchContainer = styled.div` position: relative; width: 100%; max-width: 450px; `;
const SearchIcon = styled(FiSearch)` position: absolute; top: 50%; left: 15px; transform: translateY(-50%); color: var(--text-placeholder); `;
const SearchInput = styled.input` width: 100%; padding: 12px 20px 12px 45px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 1rem; background-color: var(--bg-main); color: var(--text-primary); &:focus { outline: none; border-color: var(--primary-color); } `;

const ProductGrid = styled(motion.div)`
    flex-grow: 1;
    padding: 25px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 25px;
    overflow-y: auto;

    @media (max-width: 1024px) {
        padding: 0;
        grid-template-columns: 1fr;
        gap: 12px;
    }
`;

// --- PERBAIKAN UI/UX DIMULAI DI SINI ---
const ProductCard = styled(motion.div)`
    border-radius: 12px;
    border: 1px solid var(--border-color);
    overflow: hidden;
    position: relative;
    cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
    opacity: ${(props) => (props.$disabled ? 0.9 : 1)};
    transition: all 0.2s ease-in-out;
    aspect-ratio: 1 / 1;
    background-image: url(${(props) => props.src});
    background-size: cover;
    background-position: center;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    &:hover:not([disabled]) {
        transform: translateY(-5px) scale(1.03);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
`;

const ProductInfo = styled.div`
    padding: 20px 15px 15px 15px;
    text-align: left;
    width: 100%;
    color: #FFFFFF; // Teks putih untuk kontras
    // Gradien untuk memastikan teks mudah dibaca di atas gambar apapun
    background: linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent);
`;
// --- AKHIR PERBAIKAN UI/UX ---

const ProductName = styled.h4`
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ProductPrice = styled.p`
    margin: 4px 0 0 0;
    font-weight: 500;
    font-size: 0.85rem;
`;

const CartPanel = styled(motion.aside)`
    background-color: var(--bg-surface);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
    @media (max-width: 1024px) {
        display: none;
    }
`;

const MobileCartButton = styled(motion.div)`
    display: none;
    @media (max-width: 1024px) {
        display: flex;
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 500px;
        background-color: var(--primary-color);
        color: white;
        padding: 15px 20px;
        border-radius: 16px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        justify-content: space-between;
        align-items: center;
        z-index: 99;
        cursor: pointer;
    }
`;

const MobileCartInfo = styled.div` display: flex; align-items: center; gap: 12px; `;
const MobileCartText = styled.div` font-weight: 600; `;
const MobileCartTotal = styled.div` font-size: 1.2rem; font-weight: 700; `;
const CartHeader = styled.div` padding: 20px 25px; flex-shrink: 0; border-bottom: 1px solid var(--border-color); `;
const PanelTitle = styled.h1` font-size: 1.5rem; font-weight: 600; color: var(--text-primary); `;
const CartItemsList = styled.ul` list-style: none; padding: 0 25px; margin: 0; flex-grow: 1; overflow-y: auto; `;
const CartItem = styled(motion.li)` display: flex; align-items: center; gap: 15px; padding: 15px 0; border-bottom: 1px solid var(--border-color); `;
const CartItemDetails = styled.div` flex-grow: 1; `;
const CartItemName = styled.span` display: block; font-weight: 500; font-size: 0.9rem; `;
const CartItemPrice = styled.small` color: var(--text-secondary); `;
const CartItemControls = styled.div` display: flex; align-items: center; background-color: var(--bg-main); border: 1px solid var(--border-color); border-radius: 8px; padding: 4px; `;
const ControlButton = styled.button` width: 24px; height: 24px; border: none; background: none; color: var(--text-primary); cursor: pointer; `;
const QuantityDisplay = styled.span` padding: 0 8px; font-weight: 500; font-size: 0.9rem; `;
const RemoveItemButton = styled.button` background: none; border: none; color: var(--text-secondary); cursor: pointer; &:hover { color: var(--red-color); } `;
const CheckoutSection = styled.div` padding: 20px 25px; border-top: 1px solid var(--border-color); background-color: var(--bg-surface); margin-top: auto; flex-shrink: 0; `;
const TotalRow = styled.div` display: flex; justify-content: space-between; font-weight: 500; margin-bottom: 10px; & span:last-child { font-weight: 600; font-size: 1.1rem; } `;
const CheckoutButton = styled(motion.button)` width: 100%; padding: 15px; background-color: var(--primary-color); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; `;
const CustomerInfo = styled.div` padding: 20px 25px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; color: var(--text-secondary); flex-shrink: 0; `;
const CustomerButton = styled.button` display: flex; align-items: center; gap: 8px; background: none; border: 1px solid var(--border-color); padding: 8px 15px; border-radius: 8px; cursor: pointer; color: var(--text-primary); &:hover { background-color: var(--bg-main); } `;
const RemoveCustomerLink = styled.button` margin-left: 10px; background: none; border: none; color: var(--red-color); cursor: pointer; text-decoration: underline; `;
const CartActions = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; `;
const ActionButton = styled.button` display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer; border: 1px solid var(--border-color); background-color: var(--bg-surface); color: var(--text-primary); position: relative; &:hover { background-color: var(--bg-main); } `;
const Badge = styled.span` position: absolute; top: -5px; right: -5px; background-color: var(--red-color); color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; `;
const SkeletonCard = () => ( <div style={{ border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', aspectRatio: '1 / 1' }}> <Skeleton height="100%" /> </div> );
const PromoInput = styled.input` flex-grow: 1; padding: 10px 15px; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--bg-main); color: var(--text-primary); `;
const PromoSection = styled.div` display: flex; gap: 10px; margin-bottom: 20px; `;

const formatCurrency = (val) => `Rp ${new Intl.NumberFormat('id-ID').format(val || 0)}`;

const getPriceDisplay = (variants) => {
    if (!variants || variants.length === 0) return 'N/A';
    const prices = variants.map(v => parseFloat(v.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    if (minPrice === maxPrice) {
        return formatCurrency(minPrice);
    }
    return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
};
// --- useReducer setup ---
const cartInitialState = {
    items: [],
    selectedCustomer: null,
    appliedDiscount: null,
};

function cartReducer(state, action) {
    switch (action.type) {
        case 'ADD_ITEM': {
            const { product, variant } = action.payload;
            const cartItemId = `${product.id}-${variant.id}`;
            const existingItemIndex = state.items.findIndex(item => item.cartItemId === cartItemId);
            
            if (existingItemIndex > -1) {
                const newItems = [...state.items];
                newItems[existingItemIndex].quantity += 1;
                return { ...state, items: newItems };
            } else {
                const newItem = {
                    cartItemId,
                    productId: product.id,
                    variantId: variant.id,
                    name: `${product.name} (${variant.name})`,
                    price: variant.price,
                    image_url: product.image_url,
                    quantity: 1,
                };
                return { ...state, items: [...state.items, newItem] };
            }
        }
        case 'UPDATE_QUANTITY': {
            const { cartItemId, change } = action.payload;
            const itemIndex = state.items.findIndex(item => item.cartItemId === cartItemId);
            if (itemIndex < 0) return state;

            const newItems = [...state.items];
            newItems[itemIndex].quantity += change;

            if (newItems[itemIndex].quantity <= 0) {
                return { ...state, items: newItems.filter(item => item.cartItemId !== cartItemId) };
            }

            return { ...state, items: newItems };
        }
        case 'REMOVE_ITEM': {
            const { cartItemId } = action.payload;
            return { ...state, items: state.items.filter(item => item.cartItemId !== cartItemId) };
        }
        case 'SET_CUSTOMER':
            return { ...state, selectedCustomer: action.payload };
        case 'SET_DISCOUNT':
            return { ...state, appliedDiscount: action.payload };
        // --- PERBAIKAN: Menambahkan case untuk RESTORE_ITEMS ---
        case 'RESTORE_ITEMS':
            return { ...state, items: action.payload };
        // --- AKHIR PERBAIKAN ---
        case 'CLEAR_CART':
            return cartInitialState;
        default:
            return state;
    }
}

function PosPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [lastOrderId, setLastOrderId] = useState(null);
    const [isPostCheckoutOpen, setIsPostCheckoutOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [selectedProductForVariant, setSelectedProductForVariant] = useState(null);
    const [isHeldCartsModalOpen, setIsHeldCartsModalOpen] = useState(false);
    const { settings } = useContext(BusinessContext);
    const { activeShift, isLoadingShift, refreshShiftStatus } = useContext(ShiftContext);
    const [heldCarts, setHeldCarts] = useState(() => { const saved = localStorage.getItem('heldCarts'); return saved ? JSON.parse(saved) : []; });
    const [couponCode, setCouponCode] = useState('');
    const [userRole, setUserRole] = useState(null);

    const [cartState, dispatch] = useReducer(cartReducer, cartInitialState);
    const { items: cart, selectedCustomer, appliedDiscount } = cartState;
    const isOnline = useOnlineStatus();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserRole(decoded.role?.toLowerCase());
            } catch (e) {
                console.error("Token tidak valid");
                setUserRole('');
            }
        } else {
            setUserRole('');
        }
    }, []);

    const [orderToPrint, setOrderToPrint] = useState(null);
    const receiptRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => receiptRef.current,
        documentTitle: `Struk-Pesanan-${orderToPrint?.id || ''}`,
        onAfterPrint: () => setOrderToPrint(null),
    });

    const handlePrintReceipt = useCallback(async (orderId) => {
        try {
            const res = await getOrderById(orderId);
            setOrderToPrint(res.data);
        } catch (error) {
            toast.error("Gagal memuat data struk untuk dicetak.");
        }
    }, []);

    useEffect(() => {
        if (orderToPrint) {
            const timer = setTimeout(() => {
                if (receiptRef.current) {
                    handlePrint();
                } else {
                    toast.error("Gagal mencetak: Komponen struk tidak siap.");
                }
            }, 500); // Penundaan untuk memastikan state terupdate dan komponen siap
            return () => clearTimeout(timer);
        }
    }, [orderToPrint, handlePrint]);

    useEffect(() => {
        localStorage.setItem('heldCarts', JSON.stringify(heldCarts));
    }, [heldCarts]);

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            try {
                const productsRes = await getProducts();
                setProducts(productsRes.data);
            } catch (error) {
                toast.error("Gagal memuat data produk.");
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
    }, []);

    const addToCart = useCallback((product, variant) => {
        dispatch({ type: 'ADD_ITEM', payload: { product, variant } });
    }, []);

    const handleProductClick = useCallback((product) => {
        if (!product.variants || product.variants.length === 0) {
            toast.warn('Produk ini tidak memiliki varian yang tersedia.');
            return;
        }
        if (product.variants.length === 1) {
            addToCart(product, product.variants[0]);
        } else {
            setSelectedProductForVariant(product);
            setIsVariantModalOpen(true);
        }
    }, [addToCart]);

    const handleSelectVariant = (product, variant) => {
        if (!product || !variant) {
            toast.error('Gagal memilih varian.');
            return;
        }
        addToCart(product, variant);
        setIsVariantModalOpen(false);
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return toast.warn("Masukkan kode promo.");
        try {
            const res = await validateCoupon(couponCode);
            dispatch({ type: 'SET_DISCOUNT', payload: res.data });
            toast.success(`Promo "${res.data.name}" berhasil diterapkan!`);
        } catch (error) {
            dispatch({ type: 'SET_DISCOUNT', payload: null });
            toast.error(error.response?.data?.message || "Gagal menerapkan promo.");
        }
    };

    const removeDiscount = () => {
        dispatch({ type: 'SET_DISCOUNT', payload: null });
        setCouponCode('');
        toast.info("Promo dibatalkan.");
    };

    const cartTotal = cart.reduce((total, item) => {
        const itemTotal = (parseFloat(item.price) * 100 * item.quantity) / 100;
        return total + itemTotal;
    }, 0);

    let discountAmount = 0;
    if (appliedDiscount) {
        if (appliedDiscount.type === 'percentage') {
            discountAmount = cartTotal * (parseFloat(appliedDiscount.value) / 100);
        } else {
            discountAmount = parseFloat(appliedDiscount.value);
        }
    }
    const finalTotal = cartTotal - discountAmount;

    const handleCheckout = async (checkoutData) => {
        if (cart.length === 0) return;
        const originalSubtotal = cart.reduce((total, item) => {
            const itemTotal = (parseFloat(item.price) * 100 * item.quantity) / 100;
            return total + itemTotal;
        }, 0);

        const orderData = {
            items: cart.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
            customer_id: selectedCustomer ? selectedCustomer.id : null,
            payment_method: checkoutData.paymentMethod,
            amount_paid: checkoutData.amountPaid,
            subtotal_amount: originalSubtotal,
            tax_amount: checkoutData.taxAmount,
            total_amount: checkoutData.finalTotal,
            promotion_id: appliedDiscount ? appliedDiscount.id : null,
            discount_amount: discountAmount,
            shift_id: activeShift?.id || null, // Tambahkan shift_id ke order data
        };

        if (isOnline) {
            // --- LOGIKA SAAT ONLINE ---
            try {
                const res = await toast.promise(createOrder(orderData), {
                    pending: 'Memproses transaksi...',
                    success: 'Transaksi berhasil!',
                    error: (err) => `Gagal checkout: ${err.response?.data?.message || 'Server error'}`,
                });
                setLastOrderId(res.data.orderId);
                setIsPostCheckoutOpen(true);
                setIsCheckoutModalOpen(false);
                dispatch({ type: 'CLEAR_CART' });
                setCouponCode('');
            } catch (err) {
                console.error('Checkout error:', err);
                toast.error(err.response?.data?.message || 'Gagal checkout: Server error');
            }
        } else {
            // --- LOGIKA BARU SAAT OFFLINE ---
            try {
                const offlineOrderData = {
                    ...orderData,
                    createdAt: new Date().toISOString(),
                    syncStatus: 'pending' // Tambahkan status sinkronisasi
                };
                await addOfflineOrder(offlineOrderData);
                toast.warn('Koneksi terputus. Transaksi disimpan lokal dan akan disinkronkan nanti.', { autoClose: 5000 });
                dispatch({ type: 'CLEAR_CART' });
                setIsCheckoutModalOpen(false);
            } catch (error) {
                console.error('Offline checkout error:', error);
                toast.error('Gagal menyimpan transaksi offline.');
            }
        }
    };

    const handleClosePostCheckoutModal = () => {
        setIsPostCheckoutOpen(false);
        dispatch({ type: 'CLEAR_CART' });
    };

    const handleSelectCustomer = (customer) => {
        dispatch({ type: 'SET_CUSTOMER', payload: customer });
        setIsCustomerModalOpen(false);
    };

    const handleHoldCart = () => {
        if (cart.length === 0) return;
        const newHeldCart = { id: new Date().toISOString(), items: cart, customer: selectedCustomer, discount: appliedDiscount };
        setHeldCarts((prev) => [...prev, newHeldCart]);
        dispatch({ type: 'CLEAR_CART' });
        setCouponCode('');
        toast.info('Keranjang berhasil ditahan.');
    };

    const handleResumeCart = (cartId) => {
        const cartToResume = heldCarts.find((c) => c.id === cartId);
        if (cartToResume) {
            dispatch({ type: 'SET_CUSTOMER', payload: cartToResume.customer });
            dispatch({ type: 'SET_DISCOUNT', payload: cartToResume.discount });
            // --- PERBAIKAN: Gunakan dispatch untuk memulihkan item ---
            dispatch({ type: 'RESTORE_ITEMS', payload: cartToResume.items });
            
            setHeldCarts(heldCarts.filter((c) => c.id !== cartId));
            setIsHeldCartsModalOpen(false);
            toast.success('Keranjang berhasil dilanjutkan.');
        }
    };

    const handleDeleteHeldCart = (cartId) => {
        setHeldCarts(heldCarts.filter((c) => c.id !== cartId));
        toast.warn('Keranjang yang ditahan telah dihapus.');
    };

    const filteredProducts = products.filter((p) => {
        const term = searchTerm.toLowerCase();
        if (!term) return true;
        const nameMatch = p.name.toLowerCase().includes(term);
        const barcodeMatch = p.variants.some(v => v.barcode && v.barcode.toLowerCase().includes(term));
        return nameMatch || barcodeMatch;
    });

    const productsContent = (
        <ProductsPanel>
            <PanelHeader>
                <SearchContainer>
                    <SearchIcon size={18} />
                    <SearchInput placeholder="Cari nama atau barcode..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </SearchContainer>
            </PanelHeader>
            <ProductGrid>
                {loading ? (
                    Array.from({ length: 12 }).map((_, index) => (
                        <SkeletonCard key={index} />
                    ))
                ) : (
                    filteredProducts.map((product) => (
                        <ProductCard 
                            key={product.id} 
                            $disabled={product.stock <= 0} 
                            onClick={() => product.stock > 0 && handleProductClick(product)} 
                            whileHover={product.stock > 0 ? { scale: 1.03 } : {}} 
                            src={product.image_url || `https://placehold.co/200`}
                        >
                            <ProductInfo>
                                <ProductName>{product.name}</ProductName>
                                <ProductPrice>{getPriceDisplay(product.variants)}</ProductPrice>
                            </ProductInfo>
                        </ProductCard>
                    ))
                )}
            </ProductGrid>
        </ProductsPanel>
    );

    const cartContent = (
        <CartPanel>
            <CartHeader>
                <PanelTitle>Pesanan</PanelTitle>
            </CartHeader>
            <CustomerInfo>
                {selectedCustomer ? (
                    <div>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{selectedCustomer.name}</span>
                        <RemoveCustomerLink onClick={() => dispatch({ type: 'SET_CUSTOMER', payload: null })}>Hapus</RemoveCustomerLink>
                    </div>
                ) : (
                    <span>Pelanggan Umum</span>
                )}
                <CustomerButton onClick={() => setIsCustomerModalOpen(true)}>
                    <FiUser size={16} />
                    {selectedCustomer ? 'Ganti' : 'Pilih'}
                </CustomerButton>
            </CustomerInfo>
            <CartItemsList>
                <AnimatePresence>
                    {cart.length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>Keranjang Anda kosong.</p>
                    )}
                    {cart.map((item) => (
                        <CartItem key={item.cartItemId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <CartItemDetails>
                                <CartItemName>{item.name}</CartItemName>
                                <CartItemPrice>Rp {new Intl.NumberFormat('id-ID').format(item.price)}</CartItemPrice>
                            </CartItemDetails>
                            <CartItemControls>
                                <ControlButton onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { cartItemId: item.cartItemId, change: -1 } })}>
                                    <FiMinus size={16} />
                                </ControlButton>
                                <QuantityDisplay>{item.quantity}</QuantityDisplay>
                                <ControlButton onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { cartItemId: item.cartItemId, change: 1 } })}>
                                    <FiPlus size={16} />
                                </ControlButton>
                            </CartItemControls>
                            <RemoveItemButton onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: { cartItemId: item.cartItemId } })}>
                                <FiTrash2 size={18} />
                            </RemoveItemButton>
                        </CartItem>
                    ))}
                </AnimatePresence>
            </CartItemsList>
            <CheckoutSection>
                <CartActions>
                    <ActionButton onClick={handleHoldCart}><FiPause /> Tahan</ActionButton>
                    <ActionButton onClick={() => setIsHeldCartsModalOpen(true)}>
                        <FiGrid /> Lihat Keranjang
                        {heldCarts.length > 0 && <Badge>{heldCarts.length}</Badge>}
                    </ActionButton>
                </CartActions>
                <PromoSection>
                    <PromoInput
                        placeholder="Kode Promo"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={!!appliedDiscount}
                    />
                    {appliedDiscount ? (
                        <ActionButton onClick={removeDiscount}><FiTrash2/> Batal</ActionButton>
                    ) : (
                        <ActionButton onClick={handleApplyCoupon}><FiTag/> Terapkan</ActionButton>
                    )}
                </PromoSection>
                {cart.length > 0 && (
                    <>
                        <TotalRow>
                            <span>Subtotal</span>
                            <span>Rp {new Intl.NumberFormat('id-ID').format(cartTotal)}</span>
                        </TotalRow>
                        {appliedDiscount && (
                            <TotalRow style={{color: 'var(--green-color)'}}>
                                <span>Diskon ({appliedDiscount.name})</span>
                                <span>- Rp {new Intl.NumberFormat('id-ID').format(discountAmount)}</span>
                            </TotalRow>
                        )}
                        <TotalRow>
                            <span>Total Akhir</span>
                            <span>Rp {new Intl.NumberFormat('id-ID').format(finalTotal)}</span>
                        </TotalRow>
                        <CheckoutButton onClick={() => setIsCheckoutModalOpen(true)}>Bayar Sekarang</CheckoutButton>
                    </>
                )}
            </CheckoutSection>
        </CartPanel>
    );
    
    if (isLoadingShift || userRole === null) {
        return (
            <PageWrapper loading={true}>
                <PageGrid>
                    <ProductsPanel>
                        <PanelHeader>
                            <SearchContainer>
                                <SearchIcon size={18} />
                                <SearchInput placeholder="Cari nama produk atau barcode..." />
                            </SearchContainer>
                        </PanelHeader>
                        <ProductGrid>
                            {Array.from({ length: 12 }).map((_, index) => (
                                <SkeletonCard key={index} />
                            ))}
                        </ProductGrid>
                    </ProductsPanel>
                    <CartPanel>
                        <Skeleton height="100%" />
                    </CartPanel>
                </PageGrid>
            </PageWrapper>
        );
    }
    
    if (userRole === 'kasir' && !activeShift) {
        return <StartShiftModal onShiftStarted={refreshShiftStatus} />;
    }

    return (
        <>
            <PageWrapper loading={loading}>
                <PageGrid>
                    {productsContent}
                    {cartContent}
                </PageGrid>
            </PageWrapper>

            <AnimatePresence>
                {cart.length > 0 && (
                    <MobileCartButton
                        onClick={() => setIsCheckoutModalOpen(true)}
                        initial={{ y: 150 }} animate={{ y: 0 }} exit={{ y: 150 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                    >
                        <MobileCartInfo>
                            <FiShoppingCart size={24} />
                            <MobileCartText>{cart.reduce((acc, item) => acc + item.quantity, 0)} Item</MobileCartText>
                        </MobileCartInfo>
                        <MobileCartTotal>Rp {new Intl.NumberFormat('id-ID').format(finalTotal)}</MobileCartTotal>
                    </MobileCartButton>
                )}
            </AnimatePresence>

            <CheckoutModal 
                isOpen={isCheckoutModalOpen} 
                onClose={() => setIsCheckoutModalOpen(false)} 
                cart={cart}
                cartTotal={finalTotal} 
                onConfirmCheckout={handleCheckout} 
                paymentMethods={settings.payment_methods} 
                taxRate={settings.tax_rate}
                selectedCustomer={selectedCustomer}
                coupon={appliedDiscount}
                onRemoveDiscount={removeDiscount}
            />
            <PostCheckoutModal 
                isOpen={isPostCheckoutOpen} 
                onClose={handleClosePostCheckoutModal} 
                orderId={lastOrderId} 
                onPrint={handlePrintReceipt} 
            />
            <CustomerSelectModal 
                isOpen={isCustomerModalOpen} 
                onClose={() => setIsCustomerModalOpen(false)} 
                onSelectCustomer={handleSelectCustomer} 
            />
            <VariantSelectModal 
                isOpen={isVariantModalOpen} 
                onClose={() => setIsVariantModalOpen(false)} 
                product={selectedProductForVariant} 
                onSelectVariant={handleSelectVariant} 
            />
            <HeldCartsModal 
                isOpen={isHeldCartsModalOpen} 
                onClose={() => setIsHeldCartsModalOpen(false)} 
                heldCarts={heldCarts} 
                onResume={handleResumeCart} 
                onDelete={handleDeleteHeldCart} 
            />
            
            <div style={{ display: 'none' }}><Receipt ref={receiptRef} order={orderToPrint} /></div>
        </>
    );
}

export default PosPage;