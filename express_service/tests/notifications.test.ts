import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { setupRedis } from '../src/redis';
import { Notification } from '../src/models/Notification';
import notificationRoutes from '../src/routes/notifications';
import Redis from 'ioredis';

jest.mock('ioredis', () => {
  const mRedis = {
    on: jest.fn(),
    subscribe: jest.fn((channel, cb) => cb(null, 1)),
  };
  return jest.fn(() => mRedis);
});

jest.mock('../src/models/Notification', () => {
  const mNotification = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue(true),
    toJSON: jest.fn().mockReturnValue(data)
  }));
  (mNotification as any).find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      limit: jest.fn().mockResolvedValue([
        { message: 'Mock Notification' }
      ])
    })
  });
  return { Notification: mNotification };
});

const app = express();
app.use(express.json());
app.use('/api/notifications', notificationRoutes);

describe('Live Order Board & Notifications', () => {
  let mockIo: any;
  let redisSubscriber: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockIo = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
    redisSubscriber = setupRedis(mockIo);
  });

  it('should broadcast event and create notification on ready status', async () => {
    // Get the 'message' event handler registered on the redis instance
    const onMessageHandler = (Redis as any)().on.mock.calls.find((call: any) => call[0] === 'message')[1];

    const payload = {
      business_id: 'biz_123',
      order_id: 'ord_999',
      status: 'ready'
    };

    await onMessageHandler('order_status_changed', JSON.stringify(payload));

    // 1. Assert raw event broadcasted
    expect(mockIo.to).toHaveBeenCalledWith('business_biz_123');
    expect(mockIo.emit).toHaveBeenCalledWith('order_status_changed', payload);

    // 2. Assert Notification was saved
    expect(Notification).toHaveBeenCalledTimes(1);
    expect(Notification).toHaveBeenCalledWith(expect.objectContaining({
      business_id: 'biz_123',
      order_id: 'ord_999',
      status: 'ready',
    }));

    // 3. Assert specific notification event broadcasted
    expect(mockIo.emit).toHaveBeenCalledWith('notification', expect.objectContaining({
      business_id: 'biz_123'
    }));
  });

  it('should return notifications from API', async () => {
    const JWT_SECRET = process.env.JWT_SECRET || 'django-insecure-i(%1f)syc6(%yy#)5%d02!4huxa#%6bfwoku10vy-v8#z-@+1t';
    const token = jwt.sign({ business_id: 'biz_123' }, JWT_SECRET);

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body[0].message).toBe('Mock Notification');
  });
});
