// backend/routes/reportRoutes.js

const express = require('express');
const db = require('../config/db');
const PDFDocument = require('pdfkit');
const { protect } = require('../middleware/authMiddleware');
const { getValidDateRange } = require('../utils/dateUtils');

const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Akses ditolak." });
    }
    next();
};

// Helper function untuk format Rupiah
const formatCurrency = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number || 0);
};

// Endpoint utama untuk generate laporan penjualan PDF
router.get('/sales-summary', protect, isAdmin, async (req, res) => {
    try {
        const { startDate, endDate, userId, customerId } = req.query;
        const businessId = req.user.business_id;
        const { startDate: validStartDate, endDate: validEndDate } = getValidDateRange(startDate, endDate);

        let params = [businessId, validStartDate, validEndDate];
        let whereClauses = [];

        if (userId && userId !== 'all') {
            whereClauses.push('o.user_id = ?');
            params.push(userId);
        }
        if (customerId && customerId !== 'all') {
            whereClauses.push('o.customer_id = ?');
            params.push(customerId);
        }

        const whereString = whereClauses.length > 0 ? `AND ${whereClauses.join(' AND ')}` : '';

        const query = `
            SELECT 
                o.id, o.created_at, o.total_amount, o.discount_amount,
                (SELECT SUM(oi.price * oi.quantity) - SUM(oi.cost_price * oi.quantity) FROM order_items oi WHERE oi.order_id = o.id) as profit,
                u.name as cashier_name,
                c.name as customer_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN customers c ON o.customer_id = c.id
            WHERE o.business_id = ? AND o.created_at BETWEEN ? AND ? ${whereString}
            ORDER BY o.created_at ASC
        `;
        
        const [transactions] = await db.query(query, params);

        let totalRevenue = 0;
        let totalProfit = 0;
        let totalDiscount = 0;
        transactions.forEach(t => {
            totalRevenue += parseFloat(t.total_amount);
            totalProfit += parseFloat(t.profit) || 0;
            totalDiscount += parseFloat(t.discount_amount) || 0;
        });

        // --- PDF Generation ---
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        
        const filename = `Laporan-Penjualan-${Date.now()}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('Laporan Penjualan', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Periode: ${new Date(validStartDate).toLocaleDateString('id-ID')} - ${new Date(validEndDate).toLocaleDateString('id-ID')}`);
        doc.moveDown();

        // Summary
        doc.fontSize(14).text('Ringkasan', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Total Pendapatan: ${formatCurrency(totalRevenue)}`);
        doc.fontSize(10).text(`Total Laba Kotor: ${formatCurrency(totalProfit)}`);
        doc.fontSize(10).text(`Total Transaksi: ${transactions.length}`);
        doc.fontSize(10).text(`Total Diskon Diberikan: ${formatCurrency(totalDiscount)}`);
        doc.moveDown();
        
        // Table Header
        doc.fontSize(14).text('Detail Transaksi', { underline: true });
        doc.moveDown(0.5);
        
        const tableTop = doc.y;
        const itemX = 50;
        const dateX = 100;
        const cashierX = 220;
        const customerX = 320;
        const totalX = 450;

        doc.fontSize(10)
            .text('ID', itemX, tableTop)
            .text('Tanggal', dateX, tableTop)
            .text('Kasir', cashierX, tableTop)
            .text('Pelanggan', customerX, tableTop)
            .text('Total', totalX, tableTop, { width: 90, align: 'right' });
        
        doc.moveTo(itemX - 5, doc.y + 5).lineTo(totalX + 95, doc.y + 5).stroke();
        doc.moveDown();

        // Table Rows
        transactions.forEach(t => {
            const rowY = doc.y;
            doc.fontSize(9)
               .text(t.id, itemX, rowY)
               .text(new Date(t.created_at).toLocaleDateString('id-ID'), dateX, rowY)
               .text(t.cashier_name, cashierX, rowY, {width: 90, ellipsis: true})
               .text(t.customer_name || 'Umum', customerX, rowY, {width: 90, ellipsis: true})
               .text(formatCurrency(t.total_amount), totalX, rowY, { width: 90, align: 'right' });
            doc.moveDown(1.5);
        });

        doc.end();

    } catch (error) {
        console.error("Error generating PDF report:", error);
        res.status(500).json({ message: "Gagal membuat laporan." });
    }
});

module.exports = router;