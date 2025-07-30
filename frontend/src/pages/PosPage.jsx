import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { getProducts, createOrder, getOrderById, validateCoupon } from '../services/api';
import { FiPlus, FiMinus, FiSearch, FiTrash2, FiUser, FiPause, FiGrid, FiTag } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';

// Import Komponen & Context
import PostCheckoutModal from '../components/PostCheckoutModal';
import CheckoutModal from '../components/CheckoutModal';
import CustomerSelectModal from '../components/CustomerSelectModal';
import VariantSelectModal from '../components/VariantSelectModal';
import HeldCartsModal from '../components/HeldCartsModal';
import Receipt from '../components/Receipt';
import StartShiftModal from '../components/StartShiftModal';
import { BusinessContext } from '../context/BusinessContext';
import { ShiftContext } from '../context/ShiftContext';
import { addOfflineOrder } from '../utils/offlineDb'; // IMPORT BARU

// --- Styled Components ---
// FIX: Added PageContainer definition
const PageContainer = styled.div`
    padding: 30px;
    height: 100%;
    display: flex;
    flex-direction: column;
`;
const PageGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 420px;
    gap: 30px;
    width: 100%;
    height: 100vh;
    padding: 30px;
    overflow: hidden;
    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
        height: auto;
        overflow-y: auto;
    }
    @media (max-width: 768px) {
        padding: 15px;
        gap: 20px;
    }
`;
const ProductsPanel = styled.div`
    background-color: var(--bg-surface);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;
const PanelHeader = styled.header`
    padding: 20px 25px;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
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
    background-color: var(--bg-main);
    color: var(--text-primary);
    &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 98, 0, 234), 0.2);
    }
`;
const ProductGrid = styled(motion.div)`
    flex-grow: 1;
    padding: 25px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 22px;
    overflow-y: auto;
`;
const ProductCard = styled(motion.div)`
    background-color: var(--bg-surface);
    border-radius: 12px;
    border: 1px solid var(--border-color);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
    opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
    transition: all 0.2s ease-in-out;
    &:hover:not([disabled]) {
        border-color: var(--primary-color);
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }
`;
const ProductImage = styled.div`
    width: 100%;
    padding-top: 100%;
    background-image: url(${(props) => props.src});
    background-size: cover;
    background-position: center;
`;
const ProductInfo = styled.div`
    padding: 5px 15px 10px;
    text-align: left;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--border-color);
`;
const ProductName = styled.h4`
    margin: 0 0 2px 0;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1.2em;
    max-height: 2.4em;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    white-space: normal;
`;
const ProductPrice = styled.p`
    margin: 0;
    padding-top: 2px;
    color: var(--primary-color);
    font-weight: 600;
    font-size: 1rem;
`;
const CartPanel = styled.aside`
    background-color: var(--bg-surface);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
`;
const CartHeader = styled.div`
    padding: 20px 25px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--border-color);
`;
const PanelTitle = styled.h1`
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
`;
const CartItemsList = styled.ul`
    list-style: none;
    padding: 0 25px;
    margin: 0;
    flex-grow: 1;
    overflow-y: auto;
`;
const CartItem = styled(motion.li)`
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px 0;
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
    &:hover {
        color: var(--red-color);
    }
`;
const CheckoutSection = styled.div`
    padding: 20px 25px;
    border-top: 1px solid var(--border-color);
    background-color: var(--bg-surface);
    margin-top: auto;
    flex-shrink: 0;
`;
const TotalRow = styled.div`
    display: flex;
    justify-content: space-between;
    font-weight: 500;
    margin-bottom: 10px;
    & span:last-child {
        font-weight: 600;
        font-size: 1.1rem;
    }
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
const CustomerInfo = styled.div`
    padding: 20px 25px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--text-secondary);
    flex-shrink: 0;
`;
const CustomerButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: 1px solid var(--border-color);
    padding: 8px 15px;
    border-radius: 8px;
    cursor: pointer;
    color: var(--text-primary);
    &:hover {
        background-color: var(--bg-main);
    }
`;
const RemoveCustomerLink = styled.button`
    margin-left: 10px;
    background: none;
    border: none;
    color: var(--red-color);
    cursor: pointer;
    text-decoration: underline;
`;
const CartActions = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 20px;
`;
const ActionButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid var(--border-color);
    background-color: var(--bg-surface);
    color: var(--text-primary);
    position: relative;
    &:hover {
        background-color: var(--bg-main);
    }
`;
const Badge = styled.span`
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: var(--red-color);
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
`;
const SkeletonCard = () => (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
        <Skeleton height={136} />
        <div style={{ padding: '15px' }}>
            <Skeleton height={20} style={{ marginBottom: '8px' }} count={2} />
            <Skeleton height={24} width="60%" style={{ marginTop: '8px' }} />
        </div>
    </div>
);
const PromoInput = styled.input`
    flex-grow: 1;
    padding: 10px 15px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--bg-main);
    color: var(--text-primary);
`;
const PromoSection = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
`;


function PosPage() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [lastOrderId, setLastOrderId] = useState(null);
    const [isPostCheckoutOpen, setIsPostCheckoutOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [selectedProductForVariant, setSelectedProductForVariant] = useState(null);
    const [isHeldCartsModalOpen, setIsHeldCartsModalOpen] = useState(false);
    const { settings } = useContext(BusinessContext);
    const { activeShift, isLoadingShift, refreshShiftStatus } = useContext(ShiftContext);
    const [heldCarts, setHeldCarts] = useState(() => {
        const saved = localStorage.getItem('heldCarts');
        return saved ? JSON.parse(saved) : [];
    });
    const [couponCode, setCouponCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);

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
            console.error('Fetch receipt error:', error);
        }
    }, []);
    
    useEffect(() => {
        if (orderToPrint) {
            const timer = setTimeout(() => {
                if (receiptRef.current) { handlePrint(); } 
                else { toast.error("Gagal mencetak: Komponen struk tidak siap."); }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [orderToPrint, handlePrint]);
    
    useEffect(() => { localStorage.setItem('heldCarts', JSON.stringify(heldCarts)); }, [heldCarts]);

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
        const fullProduct = products.find((p) => p.id === product.id);
        if (!fullProduct) { toast.error('Produk tidak ditemukan.'); return; }
        const cartItemId = `${product.id}-${variant.id}`;
        const existingItem = cart.find((item) => item.cartItemId === cartItemId);
        const totalProductStock = fullProduct.stock;
        const totalOfThisProductInCart = cart.filter(item => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0);
        if (totalOfThisProductInCart >= totalProductStock) { toast.warn(`Stok total untuk ${product.name} tidak mencukupi!`); return; }
        if (existingItem) {
            setCart(cart.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item)));
        } else {
            const newItem = { cartItemId, productId: product.id, variantId: variant.id, name: `${product.name} (${variant.name})`, price: variant.price, image_url: product.image_url, quantity: 1 };
            setCart(prevCart => [...prevCart, newItem]);
        }
    }, [cart, products]);

    const handleProductClick = useCallback((product) => {
        if (product.stock <= 0) { toast.warn(`Stok total untuk ${product.name} habis.`); return; }
        if (product.variants && product.variants.length > 1) { setSelectedProductForVariant(product); setIsVariantModalOpen(true); }
        else if (product.variants && product.variants.length === 1) { const soleVariant = product.variants[0]; addToCart(product, soleVariant); }
        else { toast.warn('Produk ini tidak memiliki varian yang tersedia.'); }
    }, [addToCart]);
    
    const handleSelectVariant = (product, variant) => {
        if (!product || !variant) { toast.error('Gagal memilih varian.'); return; }
        addToCart(product, variant);
        setIsVariantModalOpen(false);
    };

    const processBarcode = useCallback(async (scannedBarcode) => {
        try {
            const res = await getProducts(scannedBarcode);
            const foundProducts = res.data;
            if (foundProducts.length === 0) { toast.error(`Produk dengan barcode "${scannedBarcode}" tidak ditemukan.`); return; }
            const product = foundProducts[0];
            const variant = product.variants.find(v => v.barcode === scannedBarcode);
            if (product.stock <= 0) { toast.warn(`Stok untuk produk ${product.name} habis.`); return; }
            if (variant) {
                addToCart(product, variant);
                toast.success(`${product.name} (${variant.name}) ditambahkan.`);
            } else { handleProductClick(product); }
        } catch (error) {
            toast.error("Gagal memproses barcode.");
            console.error("Barcode processing error:", error);
        }
    }, [addToCart, handleProductClick]);

    useEffect(() => {
        let barcode = '';
        let lastKeyTime = Date.now();
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (Date.now() - lastKeyTime > 100) barcode = '';
            if (e.key === 'Enter') {
                if (barcode.length > 3) { e.preventDefault(); processBarcode(barcode); }
                barcode = '';
                return;
            }
            if (e.key.length === 1) barcode += e.key;
            lastKeyTime = Date.now();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [processBarcode]);

    const increaseQuantity = (cartItemId) => {
        const itemInCart = cart.find((item) => item.cartItemId === cartItemId);
        if (!itemInCart) return;
        const fullProduct = products.find((p) => p.id === itemInCart.productId);
        if (!fullProduct) { toast.error('Produk tidak ditemukan.'); return; }
        const totalOfThisProductInCart = cart.filter(item => item.productId === itemInCart.productId).reduce((sum, item) => sum + item.quantity, 0);
        if (totalOfThisProductInCart >= fullProduct.stock) { toast.warn(`Stok total untuk ${fullProduct.name} tidak mencukupi!`); return; }
        setCart(cart.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item)));
    };
    const decreaseQuantity = (cartItemId) => {
        const existingItem = cart.find((item) => item.cartItemId === cartItemId);
        if (existingItem && existingItem.quantity > 1) {
            setCart(cart.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity: item.quantity - 1 } : item)));
        } else { removeFromCart(cartItemId); }
    };
    const removeFromCart = (cartItemId) => { setCart(cart.filter((item) => item.cartItemId !== cartItemId)); };
    
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return toast.warn("Masukkan kode promo.");
        try {
            const res = await validateCoupon(couponCode);
            setAppliedDiscount(res.data);
            toast.success(`Promo "${res.data.name}" berhasil diterapkan!`);
        } catch (error) {
            setAppliedDiscount(null);
            toast.error(error.response?.data?.message || "Gagal menerapkan promo.");
        }
    };
    
    const removeDiscount = () => { setAppliedDiscount(null); setCouponCode(''); toast.info("Promo dibatalkan."); };
    
    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    
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
        if (cart.length === 0) { toast.warn('Keranjang kosong, tidak bisa checkout.'); return; }
        const orderData = {
            items: cart.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
            customer_id: selectedCustomer ? selectedCustomer.id : null,
            payment_method: checkoutData.paymentMethod,
            amount_paid: checkoutData.amountPaid,
            subtotal_amount: cartTotal,
            tax_amount: checkoutData.taxAmount,
            total_amount: checkoutData.finalTotal,
            promotion_id: appliedDiscount ? appliedDiscount.id : null,
            discount_amount: discountAmount,
            createdAt: new Date().toISOString() // Tambahkan timestamp untuk data offline
        };

        // Cek status koneksi
        if (!navigator.onLine) {
            try {
                await addOfflineOrder(orderData);
                toast.success("Koneksi terputus. Transaksi disimpan secara lokal dan akan disinkronkan nanti.");
                // Reset state setelah berhasil disimpan lokal
                setIsCheckoutModalOpen(false);
                setCart([]);
                setSelectedCustomer(null);
                setAppliedDiscount(null);
                setCouponCode('');
            } catch (error) {
                toast.error("Gagal menyimpan transaksi offline.");
            }
            return;
        }

        // Jika online, lanjutkan seperti biasa
        try {
            const res = await toast.promise(createOrder(orderData), {
                pending: 'Memproses transaksi...',
                success: 'Transaksi berhasil!',
                error: (err) => `Gagal checkout: ${err.response?.data?.message || 'Server error'}`,
            });
            setLastOrderId(res.data.orderId);
            setIsPostCheckoutOpen(true);
            setIsCheckoutModalOpen(false);
            setAppliedDiscount(null);
            setCouponCode('');
        } catch (err) {
            console.error('Checkout error:', err);
        }
    };

    const handleClosePostCheckoutModal = () => { setIsPostCheckoutOpen(false); setCart([]); setSelectedCustomer(null); setAppliedDiscount(null); setCouponCode(''); };
    const handleSelectCustomer = (customer) => { setSelectedCustomer(customer); setIsCustomerModalOpen(false); };
    const handleHoldCart = () => { if (cart.length === 0) { toast.warn('Keranjang kosong, tidak bisa ditahan.'); return; } const newHeldCart = { id: new Date().toISOString(), items: cart, customer: selectedCustomer }; setHeldCarts((prev) => [...prev, newHeldCart]); setCart([]); setSelectedCustomer(null); toast.info('Keranjang berhasil ditahan.'); };
    const handleResumeCart = (cartId) => { const cartToResume = heldCarts.find((c) => c.id === cartId); if (cartToResume) { setCart(cartToResume.items); setSelectedCustomer(cartToResume.customer); setHeldCarts(heldCarts.filter((c) => c.id !== cartId)); setIsHeldCartsModalOpen(false); toast.success('Keranjang berhasil dilanjutkan.'); } };
    const handleDeleteHeldCart = (cartId) => { setHeldCarts(heldCarts.filter((c) => c.id !== cartId)); toast.warn('Keranjang yang ditahan telah dihapus.'); };

    const filteredProducts = products.filter((p) => {
        const term = searchTerm.toLowerCase();
        if (!term) return true;
        const nameMatch = p.name.toLowerCase().includes(term);
        const barcodeMatch = p.variants.some(v => v.barcode && v.barcode.toLowerCase().includes(term));
        return nameMatch || barcodeMatch;
    });

    if (isLoadingShift) { return <PageContainer><Skeleton height="80vh" /></PageContainer>; }
    if (!activeShift) { return <StartShiftModal onShiftStarted={refreshShiftStatus} />; }

    return (
        <>
            <PageGrid>
                <ProductsPanel>
                    <PanelHeader>
                        <SearchContainer>
                            <SearchIcon size={18} />
                            <SearchInput
                                placeholder="Cari nama produk atau barcode..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </SearchContainer>
                    </PanelHeader>
                    {loading ? (
                        <ProductGrid>
                            {Array.from({ length: 12 }).map((_, index) => (
                                <SkeletonCard key={index} />
                            ))}
                        </ProductGrid>
                    ) : (
                        <ProductGrid>
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} $disabled={product.stock <= 0} onClick={() => handleProductClick(product)}>
                                    <ProductImage src={product.image_url || `https://placehold.co/200`} />
                                    <ProductInfo>
                                        <ProductName>{product.name}</ProductName>
                                        <ProductPrice>
                                            {product.variants && product.variants.length > 0
                                                ? `Mulai Rp ${new Intl.NumberFormat('id-ID').format(Math.min(...product.variants.map((v) => v.price)))}`
                                                : 'Tidak tersedia'}
                                        </ProductPrice>
                                    </ProductInfo>
                                </ProductCard>
                            ))}
                        </ProductGrid>
                    )}
                </ProductsPanel>
                <CartPanel>
                    <CartHeader>
                        <PanelTitle>Pesanan</PanelTitle>
                    </CartHeader>
                    <CustomerInfo>
                        {selectedCustomer ? (
                            <div>
                                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{selectedCustomer.name}</span>
                                <RemoveCustomerLink onClick={() => setSelectedCustomer(null)}>Hapus</RemoveCustomerLink>
                            </div>
                        ) : (
                            <span>Pelanggan Umum</span>
                        )}
                        <CustomerButton onClick={() => setIsCustomerModalOpen(true)}>
                            <FiUser size={16} /> {selectedCustomer ? 'Ganti' : 'Pilih'}
                        </CustomerButton>
                    </CustomerInfo>
                    <CartItemsList>
                        <AnimatePresence>
                            {cart.length === 0 && (
                                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                                    Keranjang Anda kosong.
                                </p>
                            )}
                            {cart.map((item) => (
                                <CartItem key={item.cartItemId} layout>
                                    <CartItemImage src={item.image_url || 'https://placehold.co/100'} />
                                    <CartItemDetails>
                                        <CartItemName>{item.name}</CartItemName>
                                        <CartItemPrice>Rp {new Intl.NumberFormat('id-ID').format(item.price)}</CartItemPrice>
                                    </CartItemDetails>
                                    <CartItemControls>
                                        <ControlButton onClick={() => decreaseQuantity(item.cartItemId)}>
                                            <FiMinus size={16} />
                                        </ControlButton>
                                        <QuantityDisplay>{item.quantity}</QuantityDisplay>
                                        <ControlButton onClick={() => increaseQuantity(item.cartItemId)}>
                                            <FiPlus size={16} />
                                        </ControlButton>
                                    </CartItemControls>
                                    <RemoveItemButton onClick={() => removeFromCart(item.cartItemId)}>
                                        <FiTrash2 size={18} />
                                    </RemoveItemButton>
                                </CartItem>
                            ))}
                        </AnimatePresence>
                    </CartItemsList>
                    <CheckoutSection>
                        <CartActions>
                            <ActionButton onClick={handleHoldCart}>
                                <FiPause /> Tahan
                            </ActionButton>
                            <ActionButton onClick={() => setIsHeldCartsModalOpen(true)}>
                                <FiGrid /> Lihat Keranjang {heldCarts.length > 0 && <Badge>{heldCarts.length}</Badge>}
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
                                <ActionButton onClick={removeDiscount}>
                                    <FiTrash2/> Batal
                                </ActionButton>
                            ) : (
                                <ActionButton onClick={handleApplyCoupon}>
                                    <FiTag/> Terapkan
                                </ActionButton>
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
                                <CheckoutButton onClick={() => setIsCheckoutModalOpen(true)}>
                                    Bayar Sekarang
                                </CheckoutButton>
                            </>
                        )}
                    </CheckoutSection>
                </CartPanel>
            </PageGrid>

            <CheckoutModal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                cartTotal={finalTotal}
                onConfirmCheckout={handleCheckout}
                paymentMethods={settings.payment_methods}
                taxRate={settings.tax_rate}
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
            
            <div style={{ display: 'none' }}>
                <Receipt ref={receiptRef} order={orderToPrint} />
            </div>
        </>
    );
}

export default PosPage;
