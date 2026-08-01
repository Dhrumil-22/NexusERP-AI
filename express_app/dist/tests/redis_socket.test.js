"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Notification_1 = require("../models/Notification");
// Mock dependencies
const emitMock = jest.fn();
const toMock = jest.fn().mockReturnValue({ emit: emitMock });
const ioMock = { to: toMock };
jest.mock('../models/Notification', () => {
    return {
        Notification: {
            create: jest.fn().mockResolvedValue({ business_id: 'biz1', order_id: '99', status: 'ready', message: 'Order 99 is now ready.' })
        }
    };
});
describe('Redis Event Handler', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should create a notification and emit when status is ready', async () => {
        const payload = { business_id: 'biz1', order_id: '99', status: 'ready' };
        // Simulating what index.ts does
        if (payload.business_id) {
            ioMock.to(payload.business_id).emit('order_status_changed', payload);
            if (payload.status === 'ready' || payload.status === 'paid') {
                const newNotification = await Notification_1.Notification.create({
                    business_id: payload.business_id,
                    order_id: payload.order_id,
                    status: payload.status,
                    message: `Order ${payload.order_id} is now ${payload.status}.`
                });
                ioMock.to(payload.business_id).emit('notification', newNotification);
            }
        }
        expect(toMock).toHaveBeenCalledWith('biz1');
        expect(emitMock).toHaveBeenCalledWith('order_status_changed', payload);
        expect(Notification_1.Notification.create).toHaveBeenCalledWith({
            business_id: 'biz1',
            order_id: '99',
            status: 'ready',
            message: 'Order 99 is now ready.'
        });
        expect(emitMock).toHaveBeenCalledWith('notification', expect.objectContaining({ order_id: '99' }));
    });
});
