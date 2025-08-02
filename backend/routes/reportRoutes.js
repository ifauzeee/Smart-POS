const express = require('express');
const db = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { getValidDateRange } = require('../utils/dateUtils');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

const router = express.Router();

// --- MENGGANTI FUNGSI PDF DENGAN CSV YANG LEBIH STABIL ---
router.get('/sales-summary', protect, isAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const businessId = req.user.business_id;
        const { startDate: validStartDate, endDate: validEndDate } = getValidDateRange(startDate, endDate);

        const query = `
            SELECT o.id, o.created_at, o.total_amount, o.payment_method, u.name as cashier_name, c.name as customer_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN customers c ON o.customer_id = c.id
            WHERE o.business_id = ? AND o.created_at BETWEEN ? AND ?
            ORDER BY o.created_at ASC
        `;
        const [transactions] = await db.query(query, [businessId, validStartDate, validEndDate]);

        if (transactions.length === 0) {
            return res.status(404).json({ message: "Tidak ada data untuk dilaporkan pada rentang tanggal ini." });
        }

        const exportsDir = path.join(__dirname, '..', 'exports');
        if (!fs.existsSync(exportsDir)) {
            fs.mkdirSync(exportsDir, { recursive: true });
        }

        const filePath = path.join(exportsDir, `laporan-penjualan-${Date.now()}.csv`);
        const csvWriter = createCsvWriter({
            path: filePath,
            header: [
                { id: 'id', title: 'ID Transaksi' },
                { id: 'created_at', title: 'Tanggal' },
                { id: 'cashier_name', title: 'Kasir' },
                { id: 'customer_name', title: 'Pelanggan' },
                { id: 'payment_method', title: 'Metode Bayar' },
                { id: 'total_amount', title: 'Total Pendapatan' },
            ]
        });

        const records = transactions.map(t => ({
            ...t,
            customer_name: t.customer_name || 'Umum',
            created_at: new Date(t.created_at).toLocaleString('id-ID'),
        }));

        await csvWriter.writeRecords(records);

        res.download(filePath, (err) => {
            if (err) console.error("Error sending file:", err);
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error("Error deleting temp file:", unlinkErr);
            });
        });

    } catch (error) {
        console.error("Error generating sales summary CSV:", error);
        res.status(500).json({ message: "Gagal membuat laporan.", error: error.message });
    }
});

module.exports = router;