// backend/routes/expenses.js
const express = require('express');
const db = require('../config/db'); // Assuming this connects to your database
const { protect, isAdmin } = require('../middleware/authMiddleware'); // Updated: Import isAdmin
const { logActivity } = require('../utils/logUtils'); // Your activity logging utility
const { body, validationResult } = require('express-validator'); // Import validator

const router = express.Router();

// The local isAdmin function has been removed from here.
// It should now be defined and exported from '../middleware/authMiddleware.js'.

// --- Validation Rules ---

// Define validation rules for Expense creation and update
const expenseValidationRules = [
    body('description')
        .trim()
        .notEmpty().withMessage('Deskripsi pengeluaran tidak boleh kosong.')
        .isLength({ min: 3 }).withMessage('Deskripsi pengeluaran minimal 3 karakter.')
        .isLength({ max: 255 }).withMessage('Deskripsi pengeluaran maksimal 255 karakter.'),
    body('amount')
        .notEmpty().withMessage('Jumlah pengeluaran tidak boleh kosong.')
        .isFloat({ gt: 0 }).withMessage('Jumlah pengeluaran harus angka positif yang valid.')
];

// --- Expense Endpoints ---

/**
 * @route GET /api/expenses
 * @desc Get all expenses for the business
 * @access Private (Admin only)
 */
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

/**
 * @route POST /api/expenses
 * @desc Create a new expense
 * @access Private (Admin only)
 */
router.post('/', protect, isAdmin, expenseValidationRules, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { description, amount } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    try {
        const [result] = await db.query(
            'INSERT INTO expenses (business_id, created_by, description, amount) VALUES (?, ?, ?, ?)',
            [businessId, userId, description, parseFloat(amount)]
        );
        const expenseId = result.insertId;
        await logActivity(businessId, userId, 'CREATE_EXPENSE', `Created expense: ${description} for Rp ${amount} (ID: ${expenseId}).`);
        res.status(201).json({ message: 'Pengeluaran berhasil dicatat!', id: expenseId });
    } catch (error) {
        console.error("Error creating expense:", error);
        await logActivity(businessId, userId, 'CREATE_EXPENSE_FAILED', `Failed to create expense. Error: ${error.message}`);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

/**
 * @route PUT /api/expenses/:id
 * @desc Update an existing expense by ID
 * @access Private (Admin only)
 */
router.put('/:id', protect, isAdmin, expenseValidationRules, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { description, amount } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id; // User who is performing the update

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
            // This might happen if the data sent is identical to existing data
            return res.status(200).json({ message: 'Pengeluaran ditemukan tetapi tidak ada perubahan yang dibuat.' });
        }

        await logActivity(businessId, userId, 'UPDATE_EXPENSE', `Updated expense: ${description} (ID: ${id}).`);
        res.status(200).json({ message: 'Pengeluaran berhasil diperbarui!' });
    } catch (error) {
        console.error("Error updating expense:", error);
        await logActivity(businessId, userId, 'UPDATE_EXPENSE_FAILED', `Failed to update expense (ID: ${id}). Error: ${error.message}`);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

/**
 * @route DELETE /api/expenses/:id
 * @desc Delete an expense by ID
 * @access Private (Admin only)
 */
router.delete('/:id', protect, isAdmin, async (req, res) => {
    const { id } = req.params;
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
            // This case might be hit if the expense somehow disappeared between the initial SELECT and DELETE
            throw new Error('Failed to delete expense, possibly concurrency issue or not found during final delete.');
        }

        await logActivity(businessId, userId, 'DELETE_EXPENSE', `Deleted expense (ID: ${id}).`);
        res.status(200).json({ message: 'Pengeluaran berhasil dihapus!' });
    } catch (error) {
        console.error("Error deleting expense:", error);
        await logActivity(businessId, userId, 'DELETE_EXPENSE_FAILED', `Failed to delete expense (ID: ${id}). Error: ${error.message}`);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

module.exports = router;