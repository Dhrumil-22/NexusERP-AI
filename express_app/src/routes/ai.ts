import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { GoogleGenerativeAI, SchemaType, Schema } from '@google/generative-ai';
import { ModuleManifest } from '../models/ModuleManifest';

const router = Router();


const aiSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        industry: {
            type: SchemaType.STRING,
            description: "The primary industry of the business, e.g., 'cafe' or 'retail'",
        },
        modules: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.STRING,
            },
            description: "A list of required module IDs. Allowed IDs: attendance, auth, barcode_catalog, booking_scheduler, business_setup, customers, employee_hr, inventory, invoicing_finance, kitchen_kot, module_registry, notifications, permissions, projects, purchase_supplier, reports_analytics, sales_orders, service_packages, table_order_mgmt",
        },
        widgets: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.STRING,
            },
            description: "A list of recommended dashboard widget IDs",
        },
        categories: {
            type: SchemaType.OBJECT,
            description: "Business specific categories, e.g., { 'menu': ['coffee', 'tea'] }",
            properties: {}
        },
    },
    required: ["industry", "modules", "widgets", "categories"],
};

router.post('/configure', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const { description } = req.body;
        
        if (!description) {
            return res.status(400).json({ error: "Missing 'description' in request body." });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("Missing GEMINI_API_KEY environment variable.");
            return res.status(500).json({ error: "AI service is not properly configured." });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        const prompt = `You are an AI configuring a business management OS based on user description.
        Analyze the following business description and return a JSON configuration.
        Description: "${description}"`;

        let result;
        try {
            const model25 = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: aiSchema,
                }
            });
            result = await model25.generateContent(prompt);
        } catch (e: any) {
            console.warn("gemini-2.5-flash failed, falling back to gemini-1.5-flash:", e.message);
            const model15 = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: aiSchema,
                }
            });
            result = await model15.generateContent(prompt);
        }

        const responseText = result.response.text();
        
        let aiConfig;
        try {
            aiConfig = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse Gemini response:", responseText);
            return res.status(500).json({ error: "Invalid response from AI model." });
        }

        const requestedModules = aiConfig.modules || [];
        const validatedModules = [...requestedModules];

        // Always ensure core modules are included as they are mandatory for all businesses
        if (!validatedModules.includes('auth')) {
            validatedModules.unshift('auth');
        }
        if (!validatedModules.includes('employee_hr')) {
            validatedModules.push('employee_hr');
        }

        aiConfig.modules = validatedModules;

        return res.json(aiConfig);
    } catch (error) {
        console.error("Error in AI configure endpoint:", error);
        return res.status(500).json({ error: "Internal server error during AI processing." });
    }
});

export default router;
