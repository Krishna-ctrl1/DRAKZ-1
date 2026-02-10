const AdminLog = require('../models/adminLog.model');

// Helper to log actions
const logAdminAction = async ({ adminId, adminName, action, targetId, targetName, targetType, details, req }) => {
    try {
        const ip = req ? (req.headers['x-forwarded-for'] || req.connection.remoteAddress) : 'UNKNOWN';
        await AdminLog.create({
            adminId,
            adminName,
            action,
            targetId,
            targetName,
            targetType,
            details,
            ipAddress: ip
        });
    } catch (err) {
        console.error("Failed to log admin action:", err);
    }
};

module.exports = { logAdminAction };
