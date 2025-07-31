import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { BusinessContext } from '../context/BusinessContext';

const Receipt = React.forwardRef(({ order }, ref) => {
    // Gunakan BusinessContext untuk mendapatkan data pengaturan
    const { settings } = useContext(BusinessContext);

    if (!order) {
        return <div ref={ref} style={{ display: 'none' }}></div>;
    }

    const formatCurrency = (num) => new Intl.NumberFormat('id-ID').format(num || 0);

    return (
        <div ref={ref} style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: '12px', color: '#000', width: '300px', padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                {/* Tampilkan logo jika URL-nya ada di pengaturan */}
                {settings.receipt_logo_url && (
                    <img 
                        src={settings.receipt_logo_url} 
                        alt="Logo Toko" 
                        style={{ maxWidth: '100px', maxHeight: '50px', marginBottom: '10px' }} 
                    />
                )}
                {/* Gunakan data dinamis dari 'settings' */}
                <h2 style={{ margin: 0, fontSize: '16px' }}>{settings.business_name || 'Toko Anda'}</h2>
                <p style={{ margin: '2px 0' }}>{settings.address || 'Alamat Toko Anda'}</p>
                <p style={{ margin: '2px 0' }}>Telp: {settings.phone_number || 'Nomor Telepon Anda'}</p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>No: #{order.id}</span>
                <span>{new Date(order.created_at).toLocaleString('id-ID', {day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'})}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Kasir: {order.cashier_name}</span>
                <span>Pelanggan: {order.customer_name || '-'}</span>
            </div>
            
            <hr style={{ border: 0, borderTop: '1px dashed #ccc', margin: '10px 0' }} />
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left', padding: '5px 0', borderBottom: '1px dashed #ccc' }}>Item</th>
                        <th style={{ textAlign: 'center', padding: '5px 0', borderBottom: '1px dashed #ccc' }}>Qty</th>
                        <th style={{ textAlign: 'right', padding: '5px 0', borderBottom: '1px dashed #ccc' }}>Harga</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((item, index) => (
                        <tr key={index}>
                            <td style={{ padding: '5px 0' }}>{item.product_name}{item.variant_name ? ` (${item.variant_name})` : ''}</td>
                            <td style={{ textAlign: 'center', padding: '5px 0' }}>{item.quantity}</td>
                            <td style={{ textAlign: 'right', padding: '5px 0' }}>{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <hr style={{ border: 0, borderTop: '1px dashed #ccc', margin: '10px 0' }} />
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr>
                        <td>Subtotal</td>
                        <td style={{ textAlign: 'right' }} colSpan="2">Rp {formatCurrency(order.subtotal_amount)}</td>
                    </tr>
                    {order.tax_amount > 0 && (
                         <tr>
                            <td>Pajak</td>
                            <td style={{ textAlign: 'right' }} colSpan="2">Rp {formatCurrency(order.tax_amount)}</td>
                        </tr>
                    )}
                    <tr>
                        <td><strong>Total</strong></td>
                        <td style={{ textAlign: 'right' }} colSpan="2"><strong>Rp {formatCurrency(order.total_amount)}</strong></td>
                    </tr>
                    <tr>
                        <td>Dibayar</td>
                        <td style={{ textAlign: 'right' }} colSpan="2">Rp {formatCurrency(order.amount_paid)}</td>
                    </tr>
                    {order.payment_method === 'Tunai' && (order.amount_paid - order.total_amount) >= 0 && (
                        <tr>
                            <td>Kembalian</td>
                            <td style={{ textAlign: 'right' }} colSpan="2">Rp {formatCurrency(order.amount_paid - order.total_amount)}</td>
                        </tr>
                    )}
                </tbody>
            </table>
            
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                {/* Gunakan teks footer dinamis dari 'settings' */}
                <p>{settings.receipt_footer_text || 'Terima Kasih!'}</p>
            </div>
        </div>
    );
});

Receipt.displayName = 'Receipt';

Receipt.propTypes = {
  order: PropTypes.object,
};

export default Receipt;