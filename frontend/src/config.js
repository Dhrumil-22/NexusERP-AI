/**
 * Application Configuration
 * 
 * Uses Vite environment variables with fallback to local development URLs.
 * In production (Vercel), you must set:
 * VITE_API_BASE_URL=https://nexuserp-ai.onrender.com
 * VITE_EXPRESS_API_URL=https://nexuserp-ai-express.onrender.com
 */

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
export const EXPRESS_API = import.meta.env.VITE_EXPRESS_API_URL || "http://127.0.0.1:3001";
