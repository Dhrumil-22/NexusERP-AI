"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const notifications_1 = __importDefault(require("../routes/notifications"));
const Notification_1 = require("../models/Notification");
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
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Dummy verifyToken middleware for tests (instead of real JWT verification)
jest.mock('../middleware/auth', () => ({
    verifyToken: (req, res, next) => {
        req.user = { business_id: 'test_biz' };
        next();
    }
}));
app.use('/api/notifications', notifications_1.default);
describe('Notifications API', () => {
    it('GET /api/notifications should return notifications for the business', async () => {
        const response = await (0, supertest_1.default)(app)
            .get('/api/notifications')
            .set('Authorization', 'Bearer fake_token'); // Auth is mocked out
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].order_id).toBe('123');
        expect(Notification_1.Notification.find).toHaveBeenCalledWith({ business_id: 'test_biz' });
    });
});
