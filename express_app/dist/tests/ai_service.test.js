"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const ai_1 = __importDefault(require("../routes/ai"));
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
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Dummy verifyToken middleware for tests (instead of real JWT verification)
jest.mock('../middleware/auth', () => ({
    verifyToken: (req, res, next) => {
        req.user = { business_id: 'test_biz' };
        next();
    }
}));
app.use('/api/ai', ai_1.default);
describe('POST /api/ai/configure', () => {
    beforeAll(() => {
        process.env.GEMINI_API_KEY = 'test_key';
    });
    it('should validate AI response and filter out unregistered modules', async () => {
        const response = await (0, supertest_1.default)(app)
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
        const response = await (0, supertest_1.default)(app)
            .post('/api/ai/configure')
            .send({});
        expect(response.status).toBe(400);
    });
});
