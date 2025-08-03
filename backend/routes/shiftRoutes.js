// C:\Users\Ibnu\Project\smart-pos\backend\routes\shiftRoutes.js

const express = require('express');
const db = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logUtils');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Rute untuk memulai shift (Kas Awal Otomatis)
router.post('/start', protect, async (req, res) => {
    const { id: userId, business_id: businessId } = req.user;
    const { starting_cash_override } = req.body || {};
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [[existingShift]] = await connection.query('SELECT id FROM cashier_shifts WHERE user_id = ? AND status = "open"', [userId]);
        if (existingShift) {
            await connection.rollback();
            return res.status(400).json({ message: 'Anda sudah memiliki shift yang aktif.' });
        }
        let starting_cash;
        if (starting_cash_override !== undefined && starting_cash_override !== null) {
            starting_cash = parseFloat(starting_cash_override);
        } else {
            const [[business]] = await connection.query('SELECT default_starting_cash FROM businesses WHERE id = ?', [businessId]);
            starting_cash = business?.default_starting_cash || 0;
        }
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

// Rute untuk menutup shift dengan perbaikan final
router.post('/close/:id', protect, async (req, res) => {
    const { id: shiftId } = req.params;
    const { id: userId, business_id: businessId } = req.user;
    
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [[shift]] = await connection.query('SELECT * FROM cashier_shifts WHERE id = ? AND user_id = ? AND status = "open" FOR UPDATE', [shiftId, userId]);
        if (!shift) throw new Error('Shift aktif tidak ditemukan untuk ditutup.');
        
        const salesQuery = `
            SELECT
                COALESCE(SUM(CASE WHEN payment_method = 'Tunai' THEN total_amount ELSE 0 END), 0) as cash_sales,
                COALESCE(SUM(CASE WHEN payment_method = 'Kartu' THEN total_amount ELSE 0 END), 0) as card_sales,
                COALESCE(SUM(CASE WHEN payment_method = 'QRIS' THEN total_amount ELSE 0 END), 0) as qris_sales,
                COALESCE(SUM(CASE WHEN payment_method NOT IN ('Tunai', 'Kartu', 'QRIS') THEN total_amount ELSE 0 END), 0) as other_sales
            FROM orders 
            WHERE user_id = ? AND business_id = ? AND created_at BETWEEN ? AND NOW()
        `;
        const [[salesData]] = await connection.query(salesQuery, [userId, businessId, shift.start_time]);

        const cash_sales = parseFloat(salesData.cash_sales);
        const card_sales = parseFloat(salesData.card_sales);
        const qris_sales = parseFloat(salesData.qris_sales);
        const other_sales = parseFloat(salesData.other_sales);

        const total_sales = cash_sales + card_sales + qris_sales + other_sales;
        
        const expected_cash = parseFloat(shift.starting_cash) + total_sales;
        const physicalEndingCash = expected_cash;
        const difference = 0;

        const updateQuery = `
            UPDATE cashier_shifts SET 
            end_time = NOW(), ending_cash = ?, cash_sales = ?, card_sales = ?, 
            qris_sales = ?, other_sales = ?, total_sales = ?, expected_cash = ?, 
            difference = ?, status = "closed" 
            WHERE id = ?
        `;
        await connection.query(updateQuery, [
            physicalEndingCash,
            cash_sales, card_sales, qris_sales, other_sales,
            total_sales, expected_cash, difference, shiftId
        ]);
        
        const nextStartingCash = physicalEndingCash;
        await connection.query('UPDATE businesses SET default_starting_cash = ? WHERE id = ?', [nextStartingCash, businessId]);

        await connection.commit();
        await logActivity(businessId, userId, 'CLOSE_SHIFT', `Shift ID ${shiftId} ditutup secara otomatis.`);
        res.json({ message: 'Shift berhasil ditutup.' });

    } catch (error) {
        await connection.rollback();
        console.error("Error closing shift:", error);
        res.status(500).json({ message: error.message || "Gagal menutup shift." });
    } finally {
        connection.release();
    }
});

// ... Sisa rute (current, history, dll.) tetap sama seperti sebelumnya ...
router.get('/current', protect, async (req, res) => { const { id: userId } = req.user; try { const [[currentShift]] = await db.query('SELECT * FROM cashier_shifts WHERE user_id = ? AND status = "open"', [userId]); res.json({ active: !!currentShift, shift: currentShift || null }); } catch (error) { console.error("Error checking current shift:", error); res.status(500).json({ message: "Gagal memeriksa shift." }); } });
router.get('/history', protect, isAdmin, async (req, res) => { const businessId = req.user.business_id; try { const query = `SELECT s.*, u.name as user_name FROM cashier_shifts s JOIN users u ON s.user_id = u.id WHERE s.business_id = ? AND s.status = 'closed' ORDER BY s.end_time DESC`; const [history] = await db.query(query, [businessId]); res.json(history); } catch (error) { console.error("Error fetching shift history:", error); res.status(500).json({ message: "Gagal mengambil riwayat shift." }); } });
router.delete('/clear-history', protect, isAdmin, async (req, res) => { const { business_id: businessId, id: userId } = req.user; const connection = await db.getConnection(); try { await connection.beginTransaction(); const [result] = await connection.query('DELETE FROM cashier_shifts WHERE business_id = ? AND status = "closed"',[businessId]); await connection.commit(); await logActivity(businessId, userId, 'CLEAR_SHIFT_HISTORY', `Cleared ${result.affectedRows} closed shifts.`); res.status(200).json({ message: 'Semua riwayat shift telah berhasil dihapus.' }); } catch (error) { await connection.rollback(); console.error("Error clearing shift history:", error); await logActivity(businessId, userId, 'CLEAR_SHIFT_HISTORY_FAILED', `Error: ${error.message}`); res.status(500).json({ message: 'Gagal menghapus riwayat shift.', error: error.message }); } finally { if (connection) connection.release(); } });
router.get('/export', protect, isAdmin, async (req, res) => { const businessId = req.user.business_id; try { const query = `SELECT s.*, u.name as user_name FROM cashier_shifts s JOIN users u ON s.user_id = u.id WHERE s.business_id = ? AND s.status = 'closed' ORDER BY s.end_time DESC`; const [shifts] = await db.query(query, [businessId]); if (shifts.length === 0) { return res.status(404).json({ message: "Tidak ada riwayat shift untuk diekspor." }); } const exportsDir = path.join(__dirname, '..', 'exports'); if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir, { recursive: true }); const filePath = path.join(exportsDir, `shift-history-${Date.now()}.csv`); const csvWriter = createCsvWriter({ path: filePath, header: [{id: 'id', title: 'SHIFT_ID'},{id: 'user_name', title: 'KASIR'},{id: 'start_time', title: 'WAKTU_MULAI'},{id: 'end_time', title: 'WAKTU_SELESAI'},{id: 'starting_cash', title: 'KAS_AWAL'},{id: 'ending_cash', title: 'KAS_AKHIR_FISIK'},{id: 'expected_cash', title: 'KAS_AKHIR_SISTEM'},{id: 'difference', title: 'SELISIH'},{id: 'total_sales', title: 'TOTAL_PENJUALAN'},{id: 'cash_sales', title: 'PENJUALAN_TUNAI'},{id: 'card_sales', title: 'PENJUALAN_KARTU'},{id: 'qris_sales', title: 'PENJUALAN_QRIS'},] }); await csvWriter.writeRecords(shifts); res.download(filePath, (err) => { if (err) console.error("Error sending file:", err); fs.unlink(filePath, (unlinkErr) => { if (unlinkErr) console.error("Error deleting temp file:", unlinkErr); }); }); } catch (error) { console.error("Error exporting shift history:", error); res.status(500).json({ message: "Gagal mengekspor data." }); } });


module.exports = router;