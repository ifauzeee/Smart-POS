const express = require('express');
const db = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logUtils');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');
const router = express.Router();

router.post('/start', protect, async (req, res) => {
    const { id: userId, business_id: businessId } = req.user;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [[existingShift]] = await connection.query('SELECT id FROM cashier_shifts WHERE user_id = ? AND status = "open"', [userId]);
        if (existingShift) {
            await connection.rollback();
            return res.status(400).json({ message: 'Anda sudah memiliki shift yang aktif.' });
        }

        // Ambil kas awal OTOMATIS dari pengaturan bisnis
        const [[business]] = await connection.query('SELECT default_starting_cash FROM businesses WHERE id = ?', [businessId]);
        const starting_cash = business?.default_starting_cash || 0;

        const [result] = await connection.query(
            'INSERT INTO cashier_shifts (business_id, user_id, start_time, starting_cash, status) VALUES (?, ?, NOW(), ?, "open")',
            [businessId, userId, starting_cash]
        );
        
        await connection.commit();
        await logActivity(businessId, userId, 'START_SHIFT_AUTO', `Shift dimulai dengan kas awal otomatis Rp ${starting_cash}`);
        res.status(201).json({ message: 'Shift berhasil dimulai!', shiftId: result.insertId });

    } catch (error) {
        await connection.rollback();
        console.error("Error starting shift:", error);
        res.status(500).json({ message: "Gagal memulai shift." });
    } finally {
        connection.release();
    }
});

router.get('/current', protect, async (req, res) => {
    const { id: userId } = req.user;
    try {
        const [[currentShift]] = await db.query('SELECT * FROM cashier_shifts WHERE user_id = ? AND status = "open"', [userId]);
        res.json({ active: !!currentShift, shift: currentShift || null });
    } catch (error) {
        console.error("Error checking current shift:", error);
        res.status(500).json({ message: "Gagal memeriksa shift." });
    }
});

router.post('/close/:id', protect, async (req, res) => {
    const { id: shiftId } = req.params;
    const { id: userId, business_id: businessId } = req.user;
    
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [[shift]] = await connection.query(
            'SELECT * FROM cashier_shifts WHERE id = ? AND user_id = ? AND status = "open" FOR UPDATE',
            [shiftId, userId]
        );

        if (!shift) throw new Error('Shift aktif tidak ditemukan untuk ditutup.');
        
        const salesQuery = `
            SELECT payment_method, SUM(total_amount) as total
            FROM orders
            WHERE user_id = ? AND business_id = ? AND created_at BETWEEN ? AND NOW()
            GROUP BY payment_method
        `;
        
        const [salesData] = await connection.query(salesQuery, [userId, businessId, shift.start_time]);

        let cash_sales = 0, card_sales = 0, qris_sales = 0, other_sales = 0;
        salesData.forEach(sale => {
            if (sale.payment_method) {
                const paymentMethod = sale.payment_method.toLowerCase();
                if (paymentMethod === 'tunai') cash_sales = parseFloat(sale.total);
                else if (paymentMethod === 'kartu') card_sales = parseFloat(sale.total);
                else if (paymentMethod === 'qris') qris_sales = parseFloat(sale.total);
                else other_sales += parseFloat(sale.total);
            }
        });

        const total_sales = cash_sales + card_sales + qris_sales + other_sales;
        const expected_cash = parseFloat(shift.starting_cash) + cash_sales;
        const ending_cash = expected_cash;

        const updateQuery = `
            UPDATE cashier_shifts SET 
            end_time = NOW(), ending_cash = ?, cash_sales = ?, card_sales = ?, 
            qris_sales = ?, other_sales = ?, total_sales = ?, expected_cash = ?, 
            difference = 0, status = "closed" 
            WHERE id = ?
        `;
        await connection.query(updateQuery, [
            ending_cash, cash_sales, card_sales, qris_sales, other_sales,
            total_sales, expected_cash, shiftId
        ]);
        
        await connection.query('UPDATE businesses SET cash_in_drawer = ? WHERE id = ?', [ending_cash, businessId]);

        await connection.commit();
        await logActivity(businessId, userId, 'CLOSE_SHIFT_AUTO', `Shift ID ${shiftId} ditutup.`);
        res.json({ message: 'Shift berhasil ditutup.' });

    } catch (error) {
        await connection.rollback();
        console.error("Error closing shift:", error);
        res.status(500).json({ message: error.message || "Gagal menutup shift." });
    } finally {
        connection.release();
    }
});

router.get('/history', protect, isAdmin, async (req, res) => {
    const businessId = req.user.business_id;
    try {
        const query = `
            SELECT s.*, u.name as user_name 
            FROM cashier_shifts s
            JOIN users u ON s.user_id = u.id
            WHERE s.business_id = ? AND s.status = 'closed'
            ORDER BY s.end_time DESC
        `;
        const [history] = await db.query(query, [businessId]);
        res.json(history);
    } catch (error) {
        console.error("Error fetching shift history:", error);
        res.status(500).json({ message: "Gagal mengambil riwayat shift." });
    }
});

router.get('/export', protect, isAdmin, async (req, res) => {
    const businessId = req.user.business_id;
    try {
        const query = `SELECT s.*, u.name as user_name FROM cashier_shifts s JOIN users u ON s.user_id = u.id WHERE s.business_id = ? AND s.status = 'closed' ORDER BY s.end_time DESC`;
        const [shifts] = await db.query(query, [businessId]);
        if (shifts.length === 0) return res.status(404).json({ message: "Tidak ada riwayat untuk diekspor." });
        
        const filePath = path.join(__dirname, '..', 'exports', `shift-history-${Date.now()}.csv`);
        const csvWriter = createCsvWriter({
            path: filePath,
            header: [
                {id: 'id', title: 'SHIFT_ID'}, {id: 'user_name', title: 'KASIR'},
                {id: 'start_time', title: 'WAKTU_MULAI'}, {id: 'end_time', title: 'WAKTU_SELESAI'},
                {id: 'starting_cash', title: 'KAS_AWAL'}, {id: 'total_sales', title: 'TOTAL_PENJUALAN'},
                {id: 'cash_sales', title: 'PENJUALAN_TUNAI'}, {id: 'card_sales', title: 'PENJUALAN_KARTU'},
                {id: 'qris_sales', title: 'PENJUALAN_QRIS'}, {id: 'ending_cash', title: 'KAS_AKHIR_SISTEM'},
            ]
        });
        await csvWriter.writeRecords(shifts);
        res.download(filePath, (err) => {
            if (!err) fs.unlinkSync(filePath);
        });
    } catch (error) {
        console.error("Error exporting shift history:", error);
        res.status(500).json({ message: "Gagal mengekspor data." });
    }
});

router.delete('/clear-history', protect, isAdmin, async (req, res) => {
    const { business_id: businessId, id: userId } = req.user;
    try {
        const [result] = await db.query('DELETE FROM cashier_shifts WHERE business_id = ? AND status = "closed"', [businessId]);
        await logActivity(businessId, userId, 'CLEAR_SHIFT_HISTORY', `Menghapus ${result.affectedRows} data riwayat shift.`);
        res.status(200).json({ message: `Berhasil menghapus ${result.affectedRows} riwayat shift.` });
    } catch (error) {
        console.error("Error clearing shift history:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.delete('/:id', protect, isAdmin, async (req, res) => {
    const shiftId = req.params.id;
    const { business_id: businessId, id: userId } = req.user;
    try {
        const [result] = await db.query('DELETE FROM cashier_shifts WHERE id = ? AND business_id = ?', [shiftId, businessId]);
        if (result.affectedRows === 0) {
            await logActivity(businessId, userId, 'DELETE_SHIFT_FAILED', `Attempted to delete non-existent or unauthorized shift ID ${shiftId}.`);
            return res.status(404).json({ message: 'Shift tidak ditemukan atau Anda tidak punya akses.' });
        }
        await logActivity(businessId, userId, 'DELETE_SHIFT', `Deleted shift ID: ${shiftId}.`);
        res.status(200).json({ message: 'Shift berhasil dihapus.' });
    } catch (error) {
        console.error("Error deleting shift:", error);
        await logActivity(businessId, userId, 'DELETE_SHIFT_FAILED', `Failed to delete shift ID ${shiftId}. Error: ${error.message}`);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;