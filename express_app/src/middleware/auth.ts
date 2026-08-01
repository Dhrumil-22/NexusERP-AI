import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


export interface AuthRequest extends Request {
    user?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const JWT_SECRET = 'django-insecure-i(%1f)syc6(%yy#)5%d02!4huxa#%6bfwoku10vy-v8#z-@+1t';
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err: any) {
        console.error("JWT Verification failed:", err.message);
        return res.status(403).json({ error: 'Forbidden: Invalid token', detail: err.message });
    }
};

export const verifySocketToken = (socket: any, next: (err?: Error) => void) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    
    if (!token) {
        return next(new Error('Unauthorized: No token provided'));
    }
    
    try {
        const JWT_SECRET = 'django-insecure-i(%1f)syc6(%yy#)5%d02!4huxa#%6bfwoku10vy-v8#z-@+1t';
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.user = decoded;
        next();
    } catch (err) {
        next(new Error('Forbidden: Invalid token'));
    }
};
