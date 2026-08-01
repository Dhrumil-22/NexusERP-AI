import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';

const router = Router();

router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const businessId = req.user.business_id;

        if (!businessId) {
            return res.status(400).json({ error: "Missing business_id in JWT." });
        }

        const notifications = await Notification.find({ business_id: businessId })
            .sort({ createdAt: -1 })
            .limit(100);

        return res.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

export default router;
