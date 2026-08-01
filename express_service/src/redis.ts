import Redis from 'ioredis';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { Notification } from './models/Notification';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const setupRedis = (io: Server) => {
  const redisSubscriber = new Redis(REDIS_URL);

  redisSubscriber.on('connect', () => {
    console.log(`Connected to Redis subscriber at ${REDIS_URL}`);
    
    redisSubscriber.subscribe('order_status_changed', (err, count) => {
      if (err) {
        console.error('Failed to subscribe: %s', err.message);
      } else {
        console.log(`Subscribed to ${count} channel(s). Listening for order_status_changed...`);
      }
    });
  });

  redisSubscriber.on('message', async (channel, message) => {
    if (channel === 'order_status_changed') {
      try {
        const payload = JSON.parse(message);
        const { business_id, order_id, status } = payload;
        
        if (!business_id) return;
        
        const room = `business_${business_id}`;

        // 1. Broadcast the raw event for live_order_board
        io.to(room).emit('order_status_changed', payload);

        // 2. Persist notification if status is ready or paid
        if (status === 'ready' || status === 'paid') {
          const notificationMsg = `Order ${order_id} is now ${status}`;
          const notif = new Notification({
            business_id,
            order_id,
            status,
            message: notificationMsg,
          });
          await notif.save();

          // 3. Broadcast notification
          io.to(room).emit('notification', notif.toJSON());
        }
      } catch (err) {
        console.error('Error processing redis message:', err);
      }
    }
  });

  return redisSubscriber;
};
