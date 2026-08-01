import express from 'express';
import request from 'supertest';
import aiRouter from '../routes/ai';
import { ModuleManifest } from '../models/ModuleManifest';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: jest.fn().mockResolvedValue({
                    response: {
                        text: () => JSON.stringify({
                            industry: 'cafe',
                            modules: ['auth', 'inventory', 'magical_ai_module'], // Includes an unregistered module
                            widgets: ['stock_levels'],
                            categories: {}
                        })
                    }
                })
            })
        })),
        SchemaType: {
            OBJECT: 'OBJECT',
            STRING: 'STRING',
            ARRAY: 'ARRAY'
        }
    };
});

jest.mock('../models/ModuleManifest', () => {
    return {
        ModuleManifest: {
            find: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue([
                        { module_id: 'auth' },
                        { module_id: 'inventory' }
                        // Note: 'magical_ai_module' is NOT here, simulating it being unregistered
                    ])
                })
            })
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

app.use('/api/ai', aiRouter);

describe('POST /api/ai/configure', () => {
    beforeAll(() => {
        process.env.GEMINI_API_KEY = 'test_key';
    });

    it('should validate AI response and filter out unregistered modules', async () => {
        const response = await request(app)
            .post('/api/ai/configure')
            .send({ description: 'A small cafe' })
            .set('Authorization', 'Bearer fake_token'); // Auth is mocked out anyway

        expect(response.status).toBe(200);
        
        // The mock Gemini returned ['auth', 'inventory', 'magical_ai_module']
        // The mock Mongoose found only ['auth', 'inventory']
        // The router should return only the validated ones.
        expect(response.body.modules).toEqual(['auth', 'inventory']);
        expect(response.body.industry).toBe('cafe');
        expect(response.body.widgets).toEqual(['stock_levels']);
    });

    it('should return 400 if description is missing', async () => {
        const response = await request(app)
            .post('/api/ai/configure')
            .send({});

        expect(response.status).toBe(400);
    });
});
