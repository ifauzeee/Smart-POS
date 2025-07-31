const express = require('express');
const db = require('../config/db');
const PDFDocument = require('pdfkit');
const { protect, isAdmin } = require('../middleware/authMiddleware'); // Updated: Import isAdmin
const { getValidDateRange } = require('../utils/dateUtils');

const router = express.Router();

// The local isAdmin function has been removed from here.
// It should now be defined and exported from '../middleware/authMiddleware.js'.

/**
 * Helper function to format numbers as Indonesian Rupiah.
 * @param {number} number - The number to format.
 * @returns {string} The formatted currency string.
 */
const formatCurrency = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0 // Keep as 0 for whole Rupiah amounts
    }).format(number || 0);
};

/**
 * @route GET /api/reports/sales-summary
 * @desc Generate a PDF sales summary report based on date range, cashier, and customer.
 * @access Private (Admin only)
 * @queryparam {string} [startDate] - Start date for the report (YYYY-MM-DD). Defaults to current month start.
 * @queryparam {string} [endDate] - End date for the report (YYYY-MM-DD). Defaults to current month end.
 * @queryparam {string} [userId] - Optional: Filter by specific cashier ID ('all' for all cashiers).
 * @queryparam {string} [customerId] - Optional: Filter by specific customer ID ('all' for all customers).
 */
router.get('/sales-summary', protect, isAdmin, async (req, res) => {
    try {
        const { startDate, endDate, userId, customerId } = req.query;
        const businessId = req.user.business_id;
        const { startDate: validStartDate, endDate: validEndDate } = getValidDateRange(startDate, endDate);

        let params = [businessId, validStartDate, validEndDate];
        let whereClauses = [];

        // Add filters if provided
        if (userId && userId !== 'all') {
            whereClauses.push('o.user_id = ?');
            params.push(userId);
        }
        if (customerId && customerId !== 'all') {
            whereClauses.push('o.customer_id = ?');
            params.push(customerId);
        }

        const whereString = whereClauses.length > 0 ? `AND ${whereClauses.join(' AND ')}` : '';

        // Query to fetch sales transactions with profit, cashier name, and customer name
        const query = `
            SELECT
                o.id, o.created_at, o.total_amount, o.discount_amount,
                (SELECT COALESCE(SUM(oi.price * oi.quantity) - SUM(oi.cost_price * oi.quantity), 0) FROM order_items oi WHERE oi.order_id = o.id) as profit,
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

        const filename = `Laporan-Penjualan-${new Date().toISOString().slice(0, 10)}.pdf`; // More descriptive filename
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('Laporan Penjualan', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Periode: ${new Date(validStartDate).toLocaleDateString('id-ID')} - ${new Date(validEndDate).toLocaleDateString('id-ID')}`);
        doc.moveDown();

        // Summary Section
        doc.fontSize(14).text('Ringkasan', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Total Pendapatan: ${formatCurrency(totalRevenue)}`);
        doc.fontSize(10).text(`Total Laba Kotor: ${formatCurrency(totalProfit)}`);
        doc.fontSize(10).text(`Total Transaksi: ${transactions.length}`);
        doc.fontSize(10).text(`Total Diskon Diberikan: ${formatCurrency(totalDiscount)}`);
        doc.moveDown();

        // Transaction Details Table Header
        doc.fontSize(14).text('Detail Transaksi', { underline: true });
        doc.moveDown(0.5);

        const tableTop = doc.y;
        const idX = 50;
        const dateX = 100;
        const cashierX = 200;
        const customerX = 300;
        const totalX = 450; // Aligned right

        doc.fontSize(10)
            .text('ID', idX, tableTop)
            .text('Tanggal', dateX, tableTop)
            .text('Kasir', cashierX, tableTop, { width: 90 })
            .text('Pelanggan', customerX, tableTop, { width: 90 })
            .text('Total', totalX, tableTop, { width: 90, align: 'right' });

        doc.moveTo(idX - 5, doc.y + 5).lineTo(totalX + 95, doc.y + 5).stroke(); // Line under header
        doc.moveDown();

        // Transaction Details Table Rows
        let currentY = doc.y;
        transactions.forEach(t => {
            // Check if there's enough space for the next row, if not, add a new page
            if (currentY + 20 > doc.page.height - doc.page.margins.bottom) {
                doc.addPage();
                currentY = doc.y; // Reset currentY for the new page
                // Re-add table header on new page for continuity
                doc.fontSize(10)
                    .text('ID', idX, currentY)
                    .text('Tanggal', dateX, currentY)
                    .text('Kasir', cashierX, currentY, { width: 90 })
                    .text('Pelanggan', customerX, currentY, { width: 90 })
                    .text('Total', totalX, currentY, { width: 90, align: 'right' });
                doc.moveTo(idX - 5, doc.y + 5).lineTo(totalX + 95, doc.y + 5).stroke();
                doc.moveDown();
                currentY = doc.y;
            }

            doc.fontSize(9)
                .text(t.id, idX, currentY)
                .text(new Date(t.created_at).toLocaleDateString('id-ID'), dateX, currentY)
                .text(t.cashier_name, cashierX, currentY, { width: 90, ellipsis: true })
                .text(t.customer_name || 'Umum', customerX, currentY, { width: 90, ellipsis: true })
                .text(formatCurrency(t.total_amount), totalX, currentY, { width: 90, align: 'right' });
            currentY += 15; // Move down for the next row
            doc.y = currentY; // Update doc.y to reflect current position
        });

        doc.end();

    } catch (error) {
        console.error("Error generating PDF report:", error);
        res.status(500).json({ message: "Gagal membuat laporan.", error: error.message });
    }
});

module.exports = router;