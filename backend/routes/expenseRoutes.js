// backend/routes/expenses.js
const express = require('express');
const db = require('../config/db'); // Assuming this connects to your database
const { protect } = require('../middleware/authMiddleware'); // Your authentication middleware
const { logActivity } = require('../utils/logUtils'); // Your activity logging utility
const router = express.Router();

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Akses ditolak. Memerlukan peran admin." });
    }
    next();
};

// GET all expenses
// Route: GET /api/expenses
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const [expenses] = await db.query(
            `SELECT e.id, e.description, e.amount, e.created_at, u.name as user_name
             FROM expenses e
             JOIN users u ON e.created_by = u.id
             WHERE e.business_id = ? ORDER BY e.created_at DESC`,
            [businessId]
        );
        res.json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// POST new expense
// Route: POST /api/expenses
router.post('/', protect, isAdmin, async (req, res) => {
    const { description, amount } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    // Basic validation
    if (!description || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'Deskripsi dan jumlah pengeluaran yang valid harus diisi.' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO expenses (business_id, created_by, description, amount) VALUES (?, ?, ?, ?)',
            [businessId, userId, description, parseFloat(amount)] // Ensure amount is stored as a float/decimal
        );
        const expenseId = result.insertId;
        await logActivity(businessId, userId, 'CREATE_EXPENSE', `Created expense: ${description} for Rp ${amount} (ID: ${expenseId}).`);
        res.status(201).json({ message: 'Pengeluaran berhasil dicatat!', id: expenseId });
    } catch (error) {
        console.error("Error creating expense:", error);
        await logActivity(businessId, userId, 'CREATE_EXPENSE_FAILED', `Failed to create expense. Error: ${error.message}`);
        res.status(500).json({ message: "Server Error" });
    }
});

// PUT (Update) an expense by ID
// Route: PUT /api/expenses/:id
router.put('/:id', protect, isAdmin, async (req, res) => {
    const { id } = req.params; // Get expense ID from URL parameters
    const { description, amount } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id; // User who is performing the update

    // Validation
    if (!description || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'Deskripsi dan jumlah pengeluaran yang valid harus diisi.' });
    }

    try {
        // Verify expense belongs to the current business_id for security
        const [existingExpense] = await db.query('SELECT * FROM expenses WHERE id = ? AND business_id = ?', [id, businessId]);
        if (existingExpense.length === 0) {
            return res.status(404).json({ message: 'Pengeluaran tidak ditemukan atau Anda tidak memiliki izin untuk mengeditnya.' });
        }

        const [result] = await db.query(
            'UPDATE expenses SET description = ?, amount = ? WHERE id = ? AND business_id = ?',
            [description, parseFloat(amount), id, businessId]
        );

        if (result.affectedRows === 0) {
            return res.status(200).json({ message: 'Pengeluaran ditemukan tetapi tidak ada perubahan yang dibuat.' });
        }

        await logActivity(businessId, userId, 'UPDATE_EXPENSE', `Updated expense: ${description} (ID: ${id}).`);
        res.status(200).json({ message: 'Pengeluaran berhasil diperbarui!' });
    } catch (error) {
        console.error("Error updating expense:", error);
        await logActivity(businessId, userId, 'UPDATE_EXPENSE_FAILED', `Failed to update expense (ID: ${id}). Error: ${error.message}`);
        res.status(500).json({ message: "Server Error" });
    }
});

// DELETE an expense by ID
// Route: DELETE /api/expenses/:id
router.delete('/:id', protect, isAdmin, async (req, res) => {
    const { id } = req.params; // Get expense ID from URL parameters
    const businessId = req.user.business_id;
    const userId = req.user.id; // User who is performing the deletion

    try {
        // Verify expense belongs to the current business_id for security
        const [existingExpense] = await db.query('SELECT * FROM expenses WHERE id = ? AND business_id = ?', [id, businessId]);
        if (existingExpense.length === 0) {
            return res.status(404).json({ message: 'Pengeluaran tidak ditemukan atau Anda tidak memiliki izin untuk menghapusnya.' });
        }

        const [result] = await db.query(
            'DELETE FROM expenses WHERE id = ? AND business_id = ?',
            [id, businessId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pengeluaran tidak ditemukan.' });
        }

        await logActivity(businessId, userId, 'DELETE_EXPENSE', `Deleted expense (ID: ${id}).`);
        res.status(200).json({ message: 'Pengeluaran berhasil dihapus!' });
    } catch (error) {
        console.error("Error deleting expense:", error);
        await logActivity(businessId, userId, 'DELETE_EXPENSE_FAILED', `Failed to delete expense (ID: ${id}). Error: ${error.message}`);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;