<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,8A2BE2,50,4169E1,100,00FFFF&height=200&section=header&text=NexusERP-AI&fontSize=60&fontColor=FFFFFF&animation=twinkling&fontAlignY=35&desc=The%20Next-Generation%20Enterprise%20System&descAlignY=55&descAlign=50" alt="NexusERP-AI Header Animation" />

<!-- Typing SVG Animation -->

<a href="https://github.com/Dhrumil-22/NexusERP-AI">
    <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=20&pause=1000&color=00FFFF&center=true&vCenter=true&width=600&lines=An+AI-Powered+ERP+System;Dynamically+builds+its+own+architecture;Decoupled+Microservices;Lightning+Fast.+Strict+Logic.+Real-Time." alt="Typing SVG" />
</a>

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge\&logo=react\&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge\&logo=vite\&logoColor=FFD62E)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge\&logo=tailwind-css\&logoColor=white)](https://tailwindcss.com/)
[![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge\&logo=django\&logoColor=white)](https://www.djangoproject.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge\&logo=node.js\&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge\&logo=mongodb\&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge\&logo=redis\&logoColor=white)](https://redis.io/)

[View Deployment Guide](#-deployment) • [Report Bug](https://github.com/Dhrumil-22/anti_nexuserp/issues) • [Request Feature](https://github.com/Dhrumil-22/anti_nexuserp/issues)

<br/>

<!-- ADD YOUR DEMO GIF HERE -->

> **💡 Tip:** Replace this block with a screen recording GIF of your app!
> `<img src="./your-demo.gif" width="800" alt="App Demo"/>`

</div>

---

## ✨ The "Nexus AI Architect"

Traditional ERPs are slow, rigid, and take months to configure. **NexusERP-AI solves the onboarding bottleneck using Google Generative AI.**

> During setup, simply type a natural language description (e.g., *"We are a boutique hotel with a small restaurant"*). Our dedicated **Node.js/Express microservice** analyzes the prompt and instantly configures the exact modules the business needs (Inventory, HR, Kitchen Orders, etc.), dynamically building the dashboard on the fly without bogging down the main backend!

---

## 🏗️ Architecture & Tech Stack

NexusERP-AI uses a modern Client-Server, microservices architecture divided into three main components:

### 🎨 1. Frontend (The User Experience)

Built for speed and modern aesthetics, moving away from the "2005 spreadsheet" look.

* **React & Vite**: Fast and interactive user interface.
* **Tailwind CSS**: Beautiful, modern styling.
* **Animations**: Framer Motion, GSAP, and Three.js (for 3D graphics) to provide a premium feel.
* **React Router & React Query**: Manages page navigation and data fetching via Axios.

### ⚙️ 2. Core Backend (The Main Engine)

Handles strict business logic (finance, structured HR data, sales) requiring ACID compliance and complex relational queries.

* **Python & Django**: Heavy lifting and core business rules.
* **Django REST Framework (DRF)**: Exposes the database cleanly to the frontend via REST APIs.
* **SQLite / PostgreSQL**: Relational databases for permanent, structured business data.

### ⚡ 3. AI & Real-Time Microservice (Speed & Independence)

A fast, separate server written in TypeScript specifically to handle high-load tasks without slowing down the Django monolith.

* **Node.js & Express**: High-speed, event-driven backend.
* **Google Generative AI**: Powers the smart AI configuration and context-aware chat.
* **Socket.io**: Handles real-time events instantly (e.g., live Kitchen Order Tickets without page refreshes).
* **MongoDB & Redis**: Fast NoSQL storage for unstructured data (AI context logs) and caching.

---

## 📁 Project Structure

```text
NexusERP-AI/
│
├── 🎨 frontend/                    # React + Vite Application
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Route-level page components
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── services/               # Axios API calls
│   │   └── main.jsx                # App entry point
│   ├── public/
│   ├── index.html
│   └── package.json
│
├── ⚙️ forged/                      # Django Core Backend
│   ├── core/                       # Main Django app
│   │   ├── models.py               # Database models
│   │   ├── views.py                # API views
│   │   ├── serializers.py          # DRF serializers
│   │   └── urls.py                 # Route definitions
│   ├── manage.py
│   └── requirements.txt
│
├── ⚡ express_app/                 # Node.js AI Microservice
│   ├── src/
│   │   ├── routes/                 # Express route handlers
│   │   ├── controllers/            # Business logic
│   │   ├── services/               # AI & Socket.io services
│   │   └── index.ts                # Server entry point
│   └── package.json
│
├── express_service/               # Additional Express Services
│
├── .agents/
│   └── workflows/                 # AI Agent Workflow Configs
│
├── 📄 deployment_guide.md          # Full deployment instructions
├── 📄 TECH_STACK.md               # Detailed tech stack breakdown
├── 📄 ERP_TYPES.md                # ERP module type definitions
├── start_servers.bat              # Windows one-click startup script
└── README.md
```

## 🚀 How to Run Locally

### Prerequisites

* Python 3.x
* Node.js (v16+)
* MongoDB (running locally or Atlas)

### Getting Started

<table>
<tr>
<td><b>1. Start the Core Backend (Django)</b></td>
<td><b>2. Start the AI Microservice (Express)</b></td>
<td><b>3. Start the Frontend (React)</b></td>
</tr>
<tr>
<td>

```bash
cd forged
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

*Server runs on `http://127.0.0.1:8000`*

</td>
<td>

```bash
cd express_app
npm install
npm run dev
```

*Server runs on `http://127.0.0.1:3001`*

</td>
<td>

```bash
cd frontend
npm install
npm run dev
```

*App runs on `http://localhost:5173`*

</td>
</tr>
</table>

💡 **Tip:** *(You can also use the included `start_servers.bat` script to launch everything at once on Windows!)*

---

## 🌍 Deployment

To deploy NexusERP-AI for production, the architecture should be hosted as follows:

* **Frontend**: Deployed on [Vercel](https://vercel.com).
* **Core Backend (Django)**: Deployed on [Render.com](https://render.com) using Gunicorn and Neon PostgreSQL.
* **Microservice (Express)**: Deployed on [Render.com](https://render.com) connected to MongoDB Atlas and Upstash Redis.

📖 See [`deployment_guide.md`](./deployment_guide.md) for a complete step-by-step guide on how to deploy this project for free.

---

<div align="center">
  <i>Built with ❤️ to revolutionize how businesses interact with their software.</i>
</div>
