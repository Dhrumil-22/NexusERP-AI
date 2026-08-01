import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import cors from 'cors';
import { verifyToken, verifySocketToken, AuthRequest } from './middleware/auth';
import aiRouter from './routes/ai';
import notificationsRouter from './routes/notifications';
import chatRouter from './routes/chat';
import ocrRouter from './routes/ocr';
import forecastingRouter from './routes/forecasting';
import { Notification } from './models/Notification';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

const argsPort = process.argv[2];
const PORT = argsPort ? parseInt(argsPort) : (process.env.PORT || 3000);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/forged_db';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB (Express)'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Set up Socket.io with JWT authentication
io.use(verifySocketToken);

io.on('connection', (socket: any) => {
    const businessId = socket.user?.business_id;
    console.log(`🔌 Client connected: ${socket.id} (User: ${socket.user?.user_id}, Business: ${businessId})`);
    
    if (businessId) {
        socket.join(businessId);
        console.log(`🔌 Client ${socket.id} joined room: ${businessId}`);
    }

    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});

// Set up Redis subscriber with resilience for local dev without Redis
const USE_REDIS = process.env.USE_REDIS === 'true';

if (USE_REDIS) {
    const redisSubscriber = new Redis(REDIS_URL, {
        retryStrategy(times) {
            if (times > 3) {
                console.warn('⚠️  Redis connection failed after 3 attempts. Disabling Redis retries.');
                return null; // Stop retrying
            }
            return Math.min(times * 1000, 3000);
        },
        maxRetriesPerRequest: null,
        enableOfflineQueue: false
    });

    redisSubscriber.on('connect', () => {
        console.log('✅ Connected to Redis subscriber (Express)');
    });

    redisSubscriber.on('error', (err) => {
        console.error('⚠️  Redis Subscriber Error:', err.message);
    });

    redisSubscriber.subscribe('order_status_changed', (err, count) => {
        if (err) {
            console.error('❌ Failed to subscribe to order_status_changed:', err);
        } else {
            console.log(`✅ Subscribed to ${count} channel(s). Listening for order_status_changed events...`);
        }
    });

    redisSubscriber.on('message', async (channel, message) => {
        if (channel === 'order_status_changed') {
            console.log(`📦 [REDIS EVENT] Received order_status_changed: ${message}`);
            
            try {
                const payload = JSON.parse(message);
                const { business_id, order_id, status } = payload;
                
                if (business_id) {
                    // 1. Broadcast the generic order status change to the live board
                    io.to(business_id).emit('order_status_changed', payload);
                    
                    // 2. If status is ready or paid, create a Notification and emit it
                    if (status === 'ready' || status === 'paid') {
                        const newNotification = await Notification.create({
                            business_id,
                            order_id,
                            status,
                            message: `Order ${order_id} is now ${status}.`
                        });
                        
                        io.to(business_id).emit('notification', newNotification);
                    }
                }
            } catch (err) {
                console.error('❌ Error processing Redis message:', err);
            }
        }
    });
} else {
    console.log('⚠️  Redis subscriber disabled for local dev. Set USE_REDIS=true in .env to enable.');
}


// AI Router
app.use('/api/ai', aiRouter);

// Chat Assistant Router
app.use('/api/chat', chatRouter);

// OCR Service Router
app.use('/api/ocr', ocrRouter);

// Forecasting Router
app.use('/api/forecasting', forecastingRouter);

// Notifications Router
app.use('/api/notifications', notificationsRouter);

// Basic health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'express_app' });
});

// Dummy protected endpoint to verify JWT middleware
app.get('/api/protected', verifyToken, (req: AuthRequest, res) => {
    res.json({ message: 'You have access to this protected route', user: req.user });
});

httpServer.listen(PORT, () => {
    console.log(`🚀 Express server running on port ${PORT}`);
});
