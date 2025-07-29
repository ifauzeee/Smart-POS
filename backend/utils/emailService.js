// backend/utils/emailService.js

const nodemailer = require('nodemailer');
const db = require('../config/db');
const { decrypt } = require('./encryption');

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number);
};

async function sendReceiptEmail(recipientEmail, order, businessInfo) {
    const [[emailSettings]] = await db.query(
        'SELECT sender_email, app_password, sender_name FROM email_settings WHERE business_id = ?',
        [businessInfo.id]
    );

    if (!emailSettings || !emailSettings.sender_email || !emailSettings.app_password) {
        throw new Error('Konfigurasi email pengirim belum lengkap di pengaturan.');
    }

    const decryptedAppPassword = decrypt(emailSettings.app_password);

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: emailSettings.sender_email,
            pass: decryptedAppPassword,
        },
    });

    const orderDate = new Date(order.created_at).toLocaleString('id-ID', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const senderDisplayName = emailSettings.sender_name || businessInfo.business_name || "Smart POS";

    let itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">${item.product_name}${item.variant_name ? ` (${item.variant_name})` : ''}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatRupiah(item.price)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatRupiah(item.quantity * item.price)}</td>
        </tr>
    `).join('');

    const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        ${businessInfo.receipt_logo_url ? `<div style="text-align: center; margin-bottom: 20px;"><img src="${businessInfo.receipt_logo_url}" alt="Business Logo" style="max-width: 150px; height: auto;"></div>` : ''}
        <h2 style="text-align: center; color: #333;">Struk Pembelian ${businessInfo.business_name || ''}</h2>
        <p><strong>Tanggal:</strong> ${orderDate}</p>
        <p><strong>Nomor Pesanan:</strong> #${order.id}</p>
        <p><strong>Kasir:</strong> ${order.cashier_name}</p>
        ${order.customer_name ? `<p><strong>Pelanggan:</strong> ${order.customer_name}</p>` : ''}
        <p><strong>Metode Pembayaran:</strong> ${order.payment_method}</p>

        <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Detail Pesanan:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;">Item</th>
                    <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">Qty</th>
                    <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">Harga Satuan</th>
                    <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">Subtotal</th>
                </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
                <tr><td colspan="3" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td><td style="padding: 10px; text-align: right; font-weight: bold;">${formatRupiah(order.subtotal_amount)}</td></tr>
                ${order.tax_amount > 0 ? `<tr><td colspan="3" style="padding: 10px; text-align: right;"><strong>Pajak:</strong></td><td style="padding: 10px; text-align: right; font-weight: bold;">${formatRupiah(order.tax_amount)}</td></tr>` : ''}
                <tr><td colspan="3" style="padding: 10px; text-align: right; font-weight: bold; border-top: 1px solid #ddd;">Total Akhir:</td><td style="padding: 10px; text-align: right; font-weight: bold; border-top: 1px solid #ddd;">${formatRupiah(order.total_amount)}</td></tr>
                <tr><td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Dibayar:</td><td style="padding: 10px; text-align: right; font-weight: bold;">${formatRupiah(order.amount_paid)}</td></tr>
                ${order.payment_method === 'Tunai' && (order.amount_paid - order.total_amount) > 0 ? `<tr><td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Kembalian:</td><td style="padding: 10px; text-align: right; font-weight: bold;">${formatRupiah(order.amount_paid - order.total_amount)}</td></tr>` : ''}
            </tfoot>
        </table>
        <p style="text-align: center; color: #555;">${businessInfo.receipt_footer_text || 'Terima kasih atas pembelian Anda!'}</p>
    </div>
    `;

    await transporter.sendMail({
        from: `"${senderDisplayName}" <${emailSettings.sender_email}>`,
        to: recipientEmail,
        subject: `Struk Pembelian #${order.id}`,
        html: emailHtml,
    });
}

module.exports = { sendReceiptEmail };