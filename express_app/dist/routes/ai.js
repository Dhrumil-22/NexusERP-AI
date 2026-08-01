"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const generative_ai_1 = require("@google/generative-ai");
const ModuleManifest_1 = require("../models/ModuleManifest");
const router = (0, express_1.Router)();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const aiSchema = {
    type: generative_ai_1.SchemaType.OBJECT,
    properties: {
        industry: {
            type: generative_ai_1.SchemaType.STRING,
            description: "The primary industry of the business, e.g., 'cafe' or 'retail'",
        },
        modules: {
            type: generative_ai_1.SchemaType.ARRAY,
            items: {
                type: generative_ai_1.SchemaType.STRING,
            },
            description: "A list of required module IDs. Allowed IDs: auth, business_setup, module_registry, permissions, inventory, customers, suppliers, sales_orders, purchase_orders, invoicing_finance, employees, attendance, reports_analytics",
        },
        widgets: {
            type: generative_ai_1.SchemaType.ARRAY,
            items: {
                type: generative_ai_1.SchemaType.STRING,
            },
            description: "A list of recommended dashboard widget IDs",
        },
        categories: {
            type: generative_ai_1.SchemaType.OBJECT,
            description: "Business specific categories, e.g., { 'menu': ['coffee', 'tea'] }",
            properties: {}
        },
    },
    required: ["industry", "modules", "widgets", "categories"],
};
router.post('/configure', auth_1.verifyToken, async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ error: "Missing 'description' in request body." });
        }
        if (!process.env.GEMINI_API_KEY) {
            console.error("Missing GEMINI_API_KEY environment variable.");
            return res.status(500).json({ error: "AI service is not properly configured." });
        }
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: aiSchema,
            }
        });
        const prompt = `You are an AI configuring a business management OS based on user description.
        Analyze the following business description and return a JSON configuration.
        Description: "${description}"`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        let aiConfig;
        try {
            aiConfig = JSON.parse(responseText);
        }
        catch (e) {
            console.error("Failed to parse Gemini response:", responseText);
            return res.status(500).json({ error: "Invalid response from AI model." });
        }
        // Validate modules against Django's registry collection
        const requestedModules = aiConfig.modules || [];
        const registeredModules = await ModuleManifest_1.ModuleManifest.find({
            module_id: { $in: requestedModules }
        }).select('module_id').lean();
        const registeredIds = new Set(registeredModules.map(m => m.module_id));
        const validatedModules = requestedModules.filter((moduleId) => {
            if (!registeredIds.has(moduleId)) {
                console.warn(`[AI Validation] Dropping unregistered module: ${moduleId}`);
                return false;
            }
            return true;
        });
        // Always ensure 'auth' is included as it is mandatory for all businesses
        if (!validatedModules.includes('auth')) {
            validatedModules.unshift('auth');
        }
        aiConfig.modules = validatedModules;
        return res.json(aiConfig);
    }
    catch (error) {
        console.error("Error in AI configure endpoint:", error);
        return res.status(500).json({ error: "Internal server error during AI processing." });
    }
});
exports.default = router;
