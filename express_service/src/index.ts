import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { authenticateJWT, authenticateSocket } from './middleware/auth';
import { setupRedis } from './redis';
import aiRoutes from './routes/ai';
import notificationRoutes from './routes/notifications';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());

// Apply Socket.IO JWT authentication middleware
io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  // Join the room for this specific business
  const businessId = (socket as any).user?.business_id;
  if (businessId) {
    const roomName = `business_${businessId}`;
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined room ${roomName}`);
  }

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Setup Redis after io is created
setupRedis(io);

app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Example of a protected Express route
app.get('/api/health', authenticateJWT, (req, res) => {
  res.json({ status: 'ok', message: 'Express skeleton is running.' });
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/forged_db';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(`Connected to MongoDB at ${MONGODB_URI}`);
    httpServer.listen(PORT, () => {
      console.log(`Express Service listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
