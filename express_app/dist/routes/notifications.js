"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Notification_1 = require("../models/Notification");
const router = (0, express_1.Router)();
router.get('/', auth_1.verifyToken, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        if (!businessId) {
            return res.status(400).json({ error: "Missing business_id in JWT." });
        }
        const notifications = await Notification_1.Notification.find({ business_id: businessId })
            .sort({ createdAt: -1 })
            .limit(100);
        return res.json(notifications);
    }
    catch (error) {
        console.error("Error fetching notifications:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});
exports.default = router;
