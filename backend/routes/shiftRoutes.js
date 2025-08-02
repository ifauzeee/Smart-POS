// C:\Users\Ibnu\Project\smart-pos\backend\routes\shiftRoutes.js

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
    // --- PERBAIKAN DIMULAI ---
    // Terima kas awal opsional dari frontend
    const { starting_cash_override } = req.body;
    // --- PERBAIKAN SELESAI ---
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [[existingShift]] = await connection.query('SELECT id FROM cashier_shifts WHERE user_id = ? AND status = "open"', [userId]);
        if (existingShift) {
            await connection.rollback();
            return res.status(400).json({ message: 'Anda sudah memiliki shift yang aktif.' });
        }

        // --- PERBAIKAN DIMULAI ---
        // Gunakan nilai override jika ada, jika tidak, ambil dari default pengaturan bisnis
        let starting_cash;
        if (starting_cash_override !== undefined && starting_cash_override !== null) {
            starting_cash = parseFloat(starting_cash_override);
        } else {
            const [[business]] = await connection.query('SELECT default_starting_cash FROM businesses WHERE id = ?', [businessId]);
            starting_cash = business?.default_starting_cash || 0;
        }
        // --- PERBAIKAN SELESAI ---

        const [result] = await connection.query(
            'INSERT INTO cashier_shifts (business_id, user_id, start_time, starting_cash, status) VALUES (?, ?, NOW(), ?, "open")',
            [businessId, userId, starting_cash]
        );
        
        await connection.commit();
        await logActivity(businessId, userId, 'START_SHIFT', `Shift dimulai dengan kas awal Rp ${starting_cash}`);
        res.status(201).json({ message: 'Shift berhasil dimulai!', shiftId: result.insertId });

    } catch (error) {
        await connection.rollback();
        console.error("Error starting shift:", error);
        res.status(500).json({ message: "Gagal memulai shift." });
    } finally {
        connection.release();
    }
});

router.post('/close/:id', protect, async (req, res) => {
    const { id: shiftId } = req.params;
    const { id: userId, business_id: businessId } = req.user;
    // --- PERBAIKAN DIMULAI ---
    // Terima jumlah kas akhir fisik dari frontend
    const { ending_cash } = req.body;
    if (ending_cash === undefined || ending_cash === null || isNaN(parseFloat(ending_cash))) {
        return res.status(400).json({ message: 'Jumlah kas akhir (fisik) harus diisi dengan angka yang valid.' });
    }
    const physicalEndingCash = parseFloat(ending_cash);
    // --- PERBAIKAN SELESAI ---
    
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [[shift]] = await connection.query('SELECT * FROM cashier_shifts WHERE id = ? AND user_id = ? AND status = "open" FOR UPDATE', [shiftId, userId]);
        if (!shift) throw new Error('Shift aktif tidak ditemukan untuk ditutup.');
        
        const salesQuery = `SELECT payment_method, SUM(total_amount) as total FROM orders WHERE user_id = ? AND business_id = ? AND created_at BETWEEN ? AND NOW() GROUP BY payment_method`;
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
        
        // --- PERBAIKAN DIMULAI ---
        // Hitung selisih antara kas fisik dan kas sistem
        const difference = physicalEndingCash - expected_cash;
        // --- PERBAIKAN SELESAI ---

        const updateQuery = `
            UPDATE cashier_shifts SET 
            end_time = NOW(), ending_cash = ?, cash_sales = ?, card_sales = ?, 
            qris_sales = ?, other_sales = ?, total_sales = ?, expected_cash = ?, 
            difference = ?, status = "closed" 
            WHERE id = ?
        `;
        await connection.query(updateQuery, [
            physicalEndingCash, // Gunakan kas fisik dari input
            cash_sales, card_sales, qris_sales, other_sales,
            total_sales, expected_cash, difference, shiftId
        ]);
        
        await connection.query('UPDATE businesses SET cash_in_drawer = ? WHERE id = ?', [physicalEndingCash, businessId]);

        await connection.commit();
        await logActivity(businessId, userId, 'CLOSE_SHIFT', `Shift ID ${shiftId} ditutup. Selisih: ${difference}`);
        res.json({ message: 'Shift berhasil ditutup.' });

    } catch (error) {
        await connection.rollback();
        console.error("Error closing shift:", error);
        res.status(500).json({ message: error.message || "Gagal menutup shift." });
    } finally {
        connection.release();
    }
});


// Rute lainnya (getCurrent, history, export, dll.) tidak berubah
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
router.get('/history', protect, isAdmin, async (req, res) => {
    const businessId = req.user.business_id;
    try {
        const query = `SELECT s.*, u.name as user_name FROM cashier_shifts s JOIN users u ON s.user_id = u.id WHERE s.business_id = ? AND s.status = 'closed' ORDER BY s.end_time DESC`;
        const [history] = await db.query(query, [businessId]);
        res.json(history);
    } catch (error) {
        console.error("Error fetching shift history:", error);
        res.status(500).json({ message: "Gagal mengambil riwayat shift." });
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
// Rute export dan clear-history juga tidak berubah
module.exports = router;