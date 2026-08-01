"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const ioredis_1 = __importDefault(require("ioredis"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./middleware/auth");
const ai_1 = __importDefault(require("./routes/ai"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const chat_1 = __importDefault(require("./routes/chat"));
const ocr_1 = __importDefault(require("./routes/ocr"));
const forecasting_1 = __importDefault(require("./routes/forecasting"));
const Notification_1 = require("./models/Notification");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/forged_db';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
// Connect to MongoDB
mongoose_1.default.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB (Express)'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
// Set up Socket.io with JWT authentication
io.use(auth_1.verifySocketToken);
io.on('connection', (socket) => {
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
// Set up Redis subscriber
const redisSubscriber = new ioredis_1.default(REDIS_URL);
redisSubscriber.on('connect', () => {
    console.log('✅ Connected to Redis subscriber (Express)');
});
redisSubscriber.subscribe('order_status_changed', (err, count) => {
    if (err) {
        console.error('❌ Failed to subscribe to order_status_changed:', err);
    }
    else {
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
                    const newNotification = await Notification_1.Notification.create({
                        business_id,
                        order_id,
                        status,
                        message: `Order ${order_id} is now ${status}.`
                    });
                    io.to(business_id).emit('notification', newNotification);
                }
            }
        }
        catch (err) {
            console.error('❌ Error processing Redis message:', err);
        }
    }
});
// AI Router
app.use('/api/ai', ai_1.default);
// Chat Assistant Router
app.use('/api/chat', chat_1.default);
// OCR Service Router
app.use('/api/ocr', ocr_1.default);
// Forecasting Router
app.use('/api/forecasting', forecasting_1.default);
// Notifications Router
app.use('/api/notifications', notifications_1.default);
// Basic health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'express_app' });
});
// Dummy protected endpoint to verify JWT middleware
app.get('/api/protected', auth_1.verifyToken, (req, res) => {
    res.json({ message: 'You have access to this protected route', user: req.user });
});
httpServer.listen(PORT, () => {
    console.log(`🚀 Express server running on port ${PORT}`);
});
