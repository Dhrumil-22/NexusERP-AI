# NexusERP-AI Tech Stack & Architecture

## 1. Frontend (What the User Sees)
- **React & Vite**: Builds a fast and interactive user interface.
- **Tailwind CSS**: Used for beautiful and modern styling.
- **Animations**: Uses Framer Motion, GSAP, and Three.js (for 3D graphics).
- **React Router & React Query**: Manages page navigation and data fetching.

## 2. Core Backend (The Main Brain)
- **Python & Django**: Handles the heavy lifting for all core business logic (like HR, Inventory, Billing, and Sales).
- **SQLite Database**: Stores all the structured business data.
- **Modular Design**: Separated into multiple apps (e.g., `attendance`, `inventory`, `kitchen_kot`) to keep features organized.

## 3. AI & Real-Time Service (The Fast Helper)
- **Node.js & Express**: A fast, separate server written in TypeScript.
- **Google Generative AI**: Powers the smart AI features in the app.
- **Socket.io**: Handles real-time features like instant notifications and live kitchen orders.
- **Redis & MongoDB**: Used for fast caching and storing unstructured data like chat logs.

## How It Works Together (Practical Examples)

### Example 1: Standard ERP Flow (React + Django + SQLite)
**Scenario:** Adding a new Employee to the HR system.
1. **Frontend (React):** The HR manager fills out an "Add Employee" form in the browser.
2. **Action:** The form data is sent via an API request to the backend.
3. **Backend (Django):** The `employees` or `employee_hr` Django app receives the request and validates the data (e.g., checking if the email is already in use).
4. **Database (SQLite):** Django saves the new employee's structured details permanently into the `db.sqlite3` relational database.

### Example 2: Real-Time Updates (React + Express + Socket.io)
**Scenario:** A waiter submits an order to the kitchen (Kitchen Order Ticket - KOT).
1. **Frontend (React):** The waiter taps "Send to Kitchen" on their tablet.
2. **Action:** React sends this order to the **Express Service** instantly.
3. **Backend (Express):** Express processes the order and uses **Socket.io** to broadcast a real-time event ("new_kot_order").
4. **Display:** The kitchen display screen (also running React) receives the event instantly and updates the screen without needing to refresh the page.

### Example 3: AI Feature (React + Express + Google AI + MongoDB)
**Scenario:** AI-Powered Business Onboarding (The "Nexus AI Architect").
1. **Frontend (React):** During setup, the user types a description of their business (e.g., "We are a boutique hotel...").
2. **Action:** React sends this text to the **Express Service** (`/api/ai/configure`).
3. **AI Processing (Express + Google AI):** Express uses the `@google/generative-ai` library to analyze the description and intelligently decide which ERP modules (like Inventory, HR, Bookings) the business needs.
4. **Result:** The AI sends back the custom software architecture configuration, and the user's dashboard is dynamically built!


### Example 4: MongoDB
In your project, MongoDB (via Mongoose) acts as the specialized database for your fast Express microservice. Based on your code, it serves two critical purposes:

1. **Powering AI Chat Context (The "Brain"):** When a user asks the AI a question (in `express_app/src/routes/chat.ts`), Express connects directly to MongoDB to instantly pull live business data (like `inventory_items` and `recent sales_orders`). It feeds this raw data into Google Generative AI so the AI can provide accurate, context-aware answers about the business's current state.

2. **Managing Real-Time Data (Speed & Independence):** It acts as the dedicated storage for things that happen incredibly fast or frequently. For example, your `Notification` model is stored entirely in MongoDB. By keeping real-time notifications and AI configurations (like `ModuleManifest`) in MongoDB rather than SQLite, your Express server can read/write instantly without slowing down your main Django backend!