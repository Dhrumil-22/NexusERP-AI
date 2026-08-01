import express from 'express';
import request from 'supertest';
import notificationsRouter from '../routes/notifications';
import { Notification } from '../models/Notification';

jest.mock('../models/Notification', () => {
    return {
        Notification: {
            find: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([
                { business_id: 'test_biz', order_id: '123', status: 'ready', message: 'Order 123 is now ready.' }
            ]),
            create: jest.fn().mockResolvedValue({ business_id: 'test_biz', order_id: '456', status: 'paid' })
        }
    };
});

const app = express();
app.use(express.json());

// Dummy verifyToken middleware for tests (instead of real JWT verification)
jest.mock('../middleware/auth', () => ({
    verifyToken: (req: any, res: any, next: any) => {
        req.user = { business_id: 'test_biz' };
        next();
    }
}));

app.use('/api/notifications', notificationsRouter);

describe('Notifications API', () => {
    it('GET /api/notifications should return notifications for the business', async () => {
        const response = await request(app)
            .get('/api/notifications')
            .set('Authorization', 'Bearer fake_token'); // Auth is mocked out

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].order_id).toBe('123');
        expect(Notification.find).toHaveBeenCalledWith({ business_id: 'test_biz' });
    });
});
