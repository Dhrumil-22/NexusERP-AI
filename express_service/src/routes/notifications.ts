import { Router } from 'express';
import { Notification } from '../models/Notification';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, async (req: AuthRequest, res: any) => {
  try {
    const businessId = req.user?.business_id;
    if (!businessId) {
      return res.status(400).json({ error: 'business_id missing from token' });
    }

    const notifications = await Notification.find({ business_id: businessId })
      .sort({ created_at: -1 })
      .limit(50); // Get latest 50

    res.json(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
