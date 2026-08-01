import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const businessId = req.user?.business_id;

        if (!businessId) {
            return res.status(401).json({ error: "Unauthorized: missing business ID." });
        }
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "AI service is not properly configured." });
        }

        // Fetch context from Django's collections
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Database connection not established");
        }

        // Fetch recent sales orders (last 30 days ideally, but for this MVP, just take last 50 orders)
        const sales = await db.collection('sales_order')
            .find({ business_id: businessId })
            .sort({ _id: -1 })
            .limit(50)
            .toArray();

        // Calculate simple aggregates
        let totalRevenue = 0;
        let orderCount = sales.length;
        
        sales.forEach(order => {
            totalRevenue += parseFloat(order.total_amount || 0);
        });

        const context = `
Recent Sales Data (up to last 50 orders):
Total Revenue: $${totalRevenue.toFixed(2)}
Total Orders: ${orderCount}

Raw Orders Sample:
${JSON.stringify(sales.slice(0, 10).map(s => ({ status: s.status, total: s.total_amount })), null, 2)}
`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `You are a business forecasting AI. Based on the provided sales data, generate a short, actionable business insight (2-3 sentences) predicting future demand or recommending an action. Keep it professional.

Data Context:
${context}
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return res.json({ insight: responseText, aggregates: { totalRevenue, orderCount } });
    } catch (error) {
        console.error("Error in forecasting service:", error);
        return res.status(500).json({ error: "Internal server error during forecasting processing." });
    }
});

export default router;
