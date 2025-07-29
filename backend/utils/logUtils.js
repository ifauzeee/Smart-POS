// backend/utils/logUtils.js
const db = require('../config/db');

async function logActivity(businessId, userId, action, details) {
    try {
        const detailString = typeof details === 'object' ? JSON.stringify(details) : String(details);
        const query = 'INSERT INTO activity_logs (business_id, user_id, action, details) VALUES (?, ?, ?, ?)';
        await db.execute(query, [businessId, userId, action, detailString]);
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
}

module.exports = { logActivity };