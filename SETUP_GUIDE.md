# ⚡ MEPCO Portal: Complete Installation & Deployment Guide

This guide outlines the step-by-step instructions to configure, launch, and deploy the **MEPCO Portal (IT & Operations Workspace)** either locally on your machine or hosted on the cloud (Vercel & Render).

---

## 🛠️ System Prerequisites
Before starting, ensure you have the following installed:
1. **Node.js** (v18.x or higher) -> [Download Link](https://nodejs.org/)
2. **MongoDB** (Local MongoDB Compass or free MongoDB Atlas Cloud Account) -> [Atlas Signup](https://www.mongodb.com/cloud/atlas)
3. **Git** (optional, for version control)

---

## 💻 Section 1: Local Machine Deployment

### Step 1: Clone and Clean the Repository
Extract the code files into your preferred directory:
```bash
C:\Users\NewTouch\Desktop\Mepco Copy\
```

### Step 2: Configure Server Environment Settings
1. Open the **`server`** directory.
2. Duplicate the file `.env.example` and rename the copy to **`.env`**.
3. Open `.env` and fill in your values:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/mepco  # For local Compass
   JWT_SECRET=your_jwt_secret_key
   GMAIL_USER=your_gmail@gmail.com           # Optional: for email telemetry
   GMAIL_PASS=your_gmail_app_password
   ```

### Step 3: Configure Client Environment Settings
1. Open the **`client`** directory.
2. Duplicate the file `.env.example` and rename it to **`.env`**.
3. Leave `VITE_API_URL` set to the default localhost path:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Step 4: Install Dependencies & Seed Database
In your terminal, navigate to the project subfolders and run installer steps:

1. **Setup Backend:**
   ```bash
   cd server
   npm install
   npm run seed      # Seeds database with default MEPCO grid & billing data
   ```

2. **Setup Frontend:**
   ```bash
   cd ../client
   npm install
   ```

### Step 5: Launch Local Servers
Open two terminal windows to run both services:

1. **Terminal 1 (Start Backend API Server):**
   ```bash
   cd server
   npm run dev       # Runs server on http://localhost:5000
   ```

2. **Terminal 2 (Start Frontend Client):**
   ```bash
   cd client
   npm run dev       # Runs client on http://localhost:5173
   ```
Go to `http://localhost:5173` in your browser. The app is live!

---

## 🐳 Section 2: Docker Container Deployment (DevOps Shortcut)
If you have Docker installed, you can skip all installation steps and launch the entire stack (Client, Server, and MongoDB) using a single command:

1. Open the project root folder.
2. Run:
   ```bash
   docker-compose up --build
   ```
This containerizes both frontend and backend and starts them automatically.

---

## ☁️ Section 3: Cloud Deployment (Vercel & Render)

This section explains how to host the application online for free so anyone can access it via a public link.

### Part A: Deploy Database (MongoDB Atlas)
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free Shared Cluster.
2. Create a Database User with read/write access.
3. In Network Access, add IP Address `0.0.0.0/0` (Allow Access from Anywhere - Render servers need this).
4. Get your connection string (looks like `mongodb+srv://...`).

### Part B: Deploy Backend Server (Render / Koyeb)
1. Push your repository to **GitHub**.
2. Log in to [Render](https://render.com/) and click **New ➔ Web Service**.
3. Connect your GitHub repository.
4. Set the following build options:
   *   **Root Directory:** `server`
   *   **Build Command:** `npm install`
   *   **Start Command:** `node server.js`
5. Go to the **Environment** tab on Render and add your variables:
   *   `MONGO_URI` = *(Your MongoDB Atlas connection string)*
   *   `JWT_SECRET` = *(Any secure password string)*
   *   `PORT` = `5000`
6. Click Deploy. Once active, copy the generated service URL (looks like `https://mepco-backend.onrender.com`).

### Part C: Deploy Frontend Client (Vercel)
1. Log in to [Vercel](https://vercel.com/) and click **Add New ➔ Project**.
2. Import your GitHub repository.
3. In the project configurations:
   *   **Framework Preset:** Vite
   *   **Root Directory:** `client`
4. Expand **Environment Variables** and add:
   *   Key: `VITE_API_URL`
   *   Value: `https://your-backend.onrender.com/api` *(Your Render backend URL with /api suffix)*
5. Click **Deploy**. Vercel will compile the bundle and give you a live shareable URL!

---

## 🔑 Default Accounts (Seeded Credentials)
Use these pre-configured credentials to log in and show the system workflows:

| Role | Email | Password | Allowed Dashboards & Privileges |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@mepco.com` | `password123` | Inspect user locations, provision emails, delete accounts. |
| **Project Manager** | `asif@mepco.com` | `password123` | Create MEPCO projects, assign tasks, plan Scrum sprints. |
| **Developer / Member** | `fariha@mepco.com` | `password123` | Drag-and-drop Kanban, log hours, record voice notes. |
| **Developer / Member** | `yasir@mepco.com` | `password123` | Drag-and-drop Kanban, log hours, record voice notes. |
