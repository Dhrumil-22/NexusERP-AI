"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const generative_ai_1 = require("@google/generative-ai");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const ocrSchema = {
    type: generative_ai_1.SchemaType.OBJECT,
    properties: {
        vendor: { type: generative_ai_1.SchemaType.STRING, description: "Name of the vendor/store" },
        date: { type: generative_ai_1.SchemaType.STRING, description: "Date of the receipt/invoice" },
        items: {
            type: generative_ai_1.SchemaType.ARRAY,
            items: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    name: { type: generative_ai_1.SchemaType.STRING },
                    quantity: { type: generative_ai_1.SchemaType.NUMBER },
                    price: { type: generative_ai_1.SchemaType.NUMBER }
                },
                required: ["name", "price"]
            }
        },
        tax: { type: generative_ai_1.SchemaType.NUMBER },
        total: { type: generative_ai_1.SchemaType.NUMBER }
    },
    required: ["vendor", "items", "total"]
};
router.post('/', auth_1.verifyToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Missing 'image' file in request." });
        }
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "AI service is not properly configured." });
        }
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: ocrSchema,
            }
        });
        const imageParts = [
            {
                inlineData: {
                    data: req.file.buffer.toString("base64"),
                    mimeType: req.file.mimetype
                }
            }
        ];
        const prompt = "Extract the structured data (line items, prices, total, tax, vendor name, and date) from this receipt or invoice.";
        const result = await model.generateContent([prompt, ...imageParts]);
        const responseText = result.response.text();
        let parsedData;
        try {
            parsedData = JSON.parse(responseText);
        }
        catch (e) {
            return res.status(500).json({ error: "Invalid response from AI model." });
        }
        return res.json(parsedData);
    }
    catch (error) {
        console.error("Error in OCR service:", error);
        return res.status(500).json({ error: "Internal server error during OCR processing." });
    }
});
exports.default = router;
