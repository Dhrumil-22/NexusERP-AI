# NexusERP-AI 🚀🧠

An intelligent, AI-powered Enterprise Resource Planning (ERP) system that dynamically builds its own architecture. Designed with a decoupled microservices approach for maximum speed, strict business logic, and real-time operations.

## ✨ The "Nexus AI Architect"
Traditional ERPs are slow, rigid, and take months to configure. NexusERP-AI solves the onboarding bottleneck using Google Generative AI.
During setup, a business owner simply types a natural language description (e.g., "We are a boutique hotel with a small restaurant"). Our dedicated **Node.js/Express microservice** analyzes the prompt and instantly configures the exact modules the business needs (Inventory, HR, Kitchen Orders, etc.), dynamically building their dashboard on the fly without bogging down the main backend!

## 🏗️ Architecture & Tech Stack

NexusERP-AI uses a modern Client-Server, microservices architecture divided into three main components:

### 1. Frontend (The User Experience)
Built for speed and modern aesthetics, moving away from the "2005 spreadsheet" look.
- **React & Vite**: Fast and interactive user interface.
- **Tailwind CSS**: Beautiful, modern styling.
- **Animations**: Framer Motion, GSAP, and Three.js (for 3D graphics) to provide a premium feel.
- **React Router & React Query**: Manages page navigation and data fetching via Axios.

### 2. Core Backend (The Main Engine)
Handles strict business logic (finance, structured HR data, sales) requiring ACID compliance and complex relational queries.
- **Python & Django**: Heavy lifting and core business rules.
- **Django REST Framework (DRF)**: Exposes the database cleanly to the frontend via REST APIs.
- **SQLite / PostgreSQL**: Relational databases for permanent, structured business data.

### 3. AI & Real-Time Microservice (Speed & Independence)
A fast, separate server written in TypeScript specifically to handle high-load tasks without slowing down the Django monolith.
- **Node.js & Express**: High-speed, event-driven backend.
- **Google Generative AI**: Powers the smart AI configuration and context-aware chat.
- **Socket.io**: Handles real-time events instantly (e.g., live Kitchen Order Tickets without page refreshes).
- **MongoDB & Redis**: Fast NoSQL storage for unstructured data (AI context logs) and caching.

## 🚀 How to Run Locally

### Prerequisites
- Python 3.x
- Node.js (v16+)
- MongoDB (running locally or Atlas)

### 1. Start the Core Backend (Django)
```bash
cd forged
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
*The Django server will start on `http://127.0.0.1:8000`*

### 2. Start the AI Microservice (Express)
```bash
cd express_app
npm install
npm run dev
```
*The Express server will start on `http://127.0.0.1:3001`*

### 3. Start the Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
*The React app will start on `http://localhost:5173`*

*(You can also use the included `start_servers.bat` script to launch everything at once on Windows!)*

## 🌍 Deployment

To deploy NexusERP-AI for production, the architecture should be hosted as follows:
- **Frontend**: Deployed on Vercel.
- **Core Backend (Django)**: Deployed on Render.com using Gunicorn and Neon PostgreSQL.
- **Microservice (Express)**: Deployed on Render.com connected to MongoDB Atlas and Upstash Redis.

See `deployment_guide.md` for a complete step-by-step guide on how to deploy this project for free.

---
*Built with ❤️ to revolutionize how businesses interact with their software.*
