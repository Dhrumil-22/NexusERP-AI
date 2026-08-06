import { Router } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { ModuleManifest } from '../models/ModuleManifest';

const router = Router();
const ai = new GoogleGenAI({}); // Assumes GEMINI_API_KEY is in process.env

router.post('/configure', async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'description is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert ERP configuration assistant. Based on this business description, recommend a setup: ${description}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            industry: { type: Type.STRING },
            modules: { type: Type.ARRAY, items: { type: Type.STRING } },
            widgets: { type: Type.ARRAY, items: { type: Type.STRING } },
            categories: { type: Type.OBJECT }
          },
          required: ["industry", "modules", "widgets", "categories"]
        }
      }
    });

    const aiOutputText = response.text;
    if (!aiOutputText) {
      return res.status(500).json({ error: 'AI returned empty response' });
    }
    
    const aiConfig = JSON.parse(aiOutputText);

    // Validate module_id against Django's registry
    const registeredModules = await ModuleManifest.find({}, 'module_id');
    const validModuleIds = registeredModules.map(m => m.module_id);

    const validatedModules: string[] = [];
    for (const mod of aiConfig.modules) {
      if (validModuleIds.includes(mod)) {
        validatedModules.push(mod);
      } else {
        console.warn(`[AI Validation] Dropped unregistered module: ${mod}`);
      }
    }

    aiConfig.modules = validatedModules;

    res.json(aiConfig);

  } catch (error: any) {
    console.error('AI configure error:', error);
    res.status(500).json({ error: error.message });
  }
});
router.post('/growth-consultant', async (req, res) => {
  try {
    const { message, enabled_modules } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const registeredModules = await ModuleManifest.find({}, 'module_id name description');
    const availableModulesStr = registeredModules
      .map(m => `${m.module_id}: ${m.name}`)
      .join(', ');

    const prompt = `You are a NexusERP Growth Consultant AI.
A business owner has sent this support ticket requesting help with their business growth or asking for new features:
"${message}"

They currently have these modules enabled: ${enabled_modules ? enabled_modules.join(', ') : 'none'}
Our ERP platform offers these modules: ${availableModulesStr}

Write a short, friendly response (max 3 sentences) suggesting which specific modules they should activate to help their growth.
Recommend specific module_ids if they fit.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ suggestion: response.text });
  } catch (error: any) {
    console.error('AI growth consultant error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
