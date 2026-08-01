"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const generative_ai_1 = require("@google/generative-ai");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
router.post('/', auth_1.verifyToken, async (req, res) => {
    try {
        const { message } = req.body;
        const businessId = req.user?.business_id;
        if (!message) {
            return res.status(400).json({ error: "Missing 'message' in request body." });
        }
        if (!businessId) {
            return res.status(401).json({ error: "Unauthorized: missing business ID." });
        }
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "AI service is not properly configured." });
        }
        // Fetch context from Django's collections
        const db = mongoose_1.default.connection.db;
        if (!db) {
            throw new Error("Database connection not established");
        }
        // Fetch inventory
        const inventory = await db.collection('inventory_item').find({ business_id: businessId }).toArray();
        // Fetch recent sales orders
        const sales = await db.collection('sales_order').find({ business_id: businessId }).sort({ _id: -1 }).limit(10).toArray();
        const context = `
Business Inventory:
${JSON.stringify(inventory.map(i => ({ name: i.item_name, quantity: i.quantity, unit: i.unit })), null, 2)}

Recent Sales Orders:
${JSON.stringify(sales.map(s => ({ status: s.status, total: s.total_amount })), null, 2)}
`;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `You are a helpful business assistant. Use the following context about the business's current state to answer the user's question.

Context:
${context}

User's Question: "${message}"

Answer clearly and concisely.`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        return res.json({ response: responseText });
    }
    catch (error) {
        console.error("Error in chat assistant:", error);
        return res.status(500).json({ error: "Internal server error during chat processing." });
    }
});
exports.default = router;
