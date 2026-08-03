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

Here is a clear, simple breakdown of the entire project structure and how everything connects. This should give you exactly what you need to explain the architecture during your exam.

1. In Which Folder What We Used?
The project is divided into two main folders, representing a modern Client-Server Architecture:

forged/ (The Backend Server): This folder contains the backend API.
Technologies used: Python, Django, Django REST Framework (DRF), and MongoDB (using MongoEngine to connect Django to MongoDB).
frontend/ (The Client / User Interface): This folder contains the web interface the user interacts with.
Technologies used: JavaScript, React (library), Vite (build tool), and Tailwind CSS (for styling). It uses axios to make network requests to the backend.
2. Why Do We Use Django REST Framework (DRF)?
Django is a powerful web framework, but by default, it is designed to return HTML web pages. However, in our project, the frontend (React) handles all the HTML/UI.

We use DRF (Django REST Framework) because it sits on top of Django and makes it incredibly easy to build a REST API. Instead of returning HTML, DRF allows Django to return raw data (JSON). DRF handles the heavy lifting of:

Routing: Directing web traffic to the right functions.
Authentication: Securing endpoints using JWT (JSON Web Tokens) so only logged-in users can access data.
Serialization: Automatically translating complex database data into simple JSON.
3. How Is It Working? (The Flow of Data)
Here is the step-by-step lifecycle of how data moves in your app:

Action: A user clicks a button on the React frontend (e.g., viewing an invoice).
Request: The frontend sends an HTTP GET request using axios to a specific backend URL.
Routing: The backend receives the request. The urls.py file looks at the URL and says, "Ah, this request needs to go to the Invoice ViewSet!"
Database Query: The ViewSet (views.py) asks the MongoDB database to fetch the invoice records.
Serialization: The database returns complex Python objects. The ViewSet passes these objects to the Serializer (serializers.py), which converts them into clean JSON.
Response: DRF sends that JSON back over the internet to the React frontend.
Render: React receives the JSON and updates the UI to show the invoices on the screen.
4. Where Are the Endpoints of Our Backend?
All backend endpoints are defined in files named urls.py.

The Master Router: Located at forged/forged/urls.py. This acts like a traffic cop, importing all the other URLs from different modules.
Module Routers: Inside each feature folder, there is another urls.py file. For example:
forged/invoicing_finance/urls.py contains endpoints like /api/billing/invoices/
forged/forged_auth/urls.py contains endpoints like /api/auth/login/ and /api/auth/register/
forged/customers/urls.py contains endpoints like /api/customers/
5. For Which Data Did We Use Serializers?
We use serializers for almost all data that travels between the backend and the frontend! A serializer's job is to translate complex database models into JSON (for outgoing data) and validate incoming JSON to save it to the database (for incoming data).

Here are specific examples of data that uses serializers in our project:

Authentication Data: UserSerializer converts user profile info (name, business name, email) into JSON when a user logs in.
Billing Data: InvoiceSerializer converts invoice records (totals, status, due dates) into JSON for the finance dashboard.
Inventory Data: ProductSerializer converts products (names, stock levels, prices) into JSON so the frontend can display the inventory tables.
Order Data: OrderSerializer converts restaurant table orders into JSON.
Summary to remember for the exam: "Our project is a decoupled application. We use React for the frontend UI, which communicates via Axios to a Django REST Framework backend. DRF is used to expose our MongoDB database as a REST API. We define endpoints in urls.py, handle business logic in views.py, and use serializers to translate our database models into JSON format so the React frontend can consume them."

express :
Our project uses a Microservices Architecture. The main backend is built in Django (Python) to handle core business logic, strict data structures, and security. However, we created a secondary microservice using Node.js and Express specifically to handle high-load tasks like Generative AI chat, OCR document scanning, and real-time notifications. By doing this, our AI processes do not slow down the main ERP system, ensuring the app remains lightning-fast for users."