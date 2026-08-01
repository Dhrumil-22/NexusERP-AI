import request from 'supertest';
import express from 'express';
import { ModuleManifest } from '../src/models/ModuleManifest';

// Mock the dependencies BEFORE importing the route
jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: jest.fn().mockResolvedValue({
          text: JSON.stringify({
            industry: "cafe",
            modules: ["inventory", "sales_orders", "hallucinated_magic_module"],
            widgets: ["stock_levels"],
            categories: { menu: ["coffee"] }
          })
        })
      }
    })),
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      ARRAY: 'ARRAY'
    }
  };
});

jest.mock('../src/models/ModuleManifest', () => {
  return {
    ModuleManifest: {
      find: jest.fn()
    }
  };
});

import aiRoutes from '../src/routes/ai';

const app = express();
app.use(express.json());
app.use('/api/ai', aiRoutes);

describe('AI Configure Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate and filter out unregistered modules', async () => {
    // Mock Mongoose Registry
    (ModuleManifest.find as jest.Mock).mockResolvedValue([
      { module_id: 'inventory' },
      { module_id: 'sales_orders' }
    ]);

    const res = await request(app)
      .post('/api/ai/configure')
      .send({ description: 'I run a small cafe' });

    expect(res.status).toBe(200);
    // It should include valid ones and explicitly drop hallucinated ones
    expect(res.body.modules).toEqual(['inventory', 'sales_orders']);
    expect(res.body.industry).toBe('cafe');
  });

  it('should return 400 if description is missing', async () => {
    const res = await request(app)
      .post('/api/ai/configure')
      .send({});
    expect(res.status).toBe(400);
  });
});
