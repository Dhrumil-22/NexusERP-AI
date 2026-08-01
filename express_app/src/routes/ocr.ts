import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { GoogleGenerativeAI, SchemaType, Schema } from '@google/generative-ai';
import multer from 'multer';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const upload = multer({ storage: multer.memoryStorage() });

const ocrSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        vendor: { type: SchemaType.STRING, description: "Name of the vendor/store" },
        date: { type: SchemaType.STRING, description: "Date of the receipt/invoice" },
        items: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    name: { type: SchemaType.STRING },
                    quantity: { type: SchemaType.NUMBER },
                    price: { type: SchemaType.NUMBER }
                },
                required: ["name", "price"]
            }
        },
        tax: { type: SchemaType.NUMBER },
        total: { type: SchemaType.NUMBER }
    },
    required: ["vendor", "items", "total"]
};

router.post('/', verifyToken, upload.single('image'), async (req: AuthRequest, res: Response) => {
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
        } catch (e) {
            return res.status(500).json({ error: "Invalid response from AI model." });
        }

        return res.json(parsedData);
    } catch (error) {
        console.error("Error in OCR service:", error);
        return res.status(500).json({ error: "Internal server error during OCR processing." });
    }
});

export default router;
