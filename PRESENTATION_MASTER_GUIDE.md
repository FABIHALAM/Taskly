# 🎓 TASKLY ENTERPRISE — COMPLETE MASTER PRESENTATION & ARCHITECTURE GUIDE

---

## 📌 1. Project Overview & Elevator Pitch

**Taskly** ek Enterprise-Grade Project & Task Management SaaS Platform hai jo software engineering teams ko project planning, task tracking, real-time collaboration, aur performance analytics mein help karta hai.

### **Problem Statement**:
Standard todo apps mein:
1. Team role permissions (Manager vs Member) nahi hotay.
2. Real-time email notifications missing hotay hain.
3. Complex tasks ko subtasks mein divide karna time-consuming hota hai.
4. Voice notes aur live time tracking out-of-the-box nahi milte.

### **Taskly Solution**:
Taskly in tamam problems ko solve karta hai ek ultra-modern UI, JWT Auth, Nodemailer Gmail engine, AI Subtask Generator, Live Stopwatch, Voice Comments, aur CSV Executive Reports ke sath.

---

## ⚙️ 2. Step-by-Step Technical Mechanism & Function Flow

### **A. User Authentication & Role System (JWT + Bcrypt)**
1. **Registration Flow**:
   - User Sign Up page par **Manager (👔)** ya **Member (👷)** role select karta hai.
   - Backend `authController.register` request receive karta hai.
   - Password `bcryptjs` se 10 salt rounds ke sath **encrypt/hash** hota hai (database mein plain text password kabhi save nahi hota).
   - User database mein save hota hai with `role: 'manager'` or `role: 'member'`.

2. **Login & Session Management**:
   - User login Credentials bhejta hai ➔ Backend password verify karta hai.
   - Backend 2 Tokens generate karta hai:
     - **Access Token** (Short-lived JWT token for API calls)
     - **Refresh Token** (Long-lived token for session renewal)
   - Tokens `localStorage` mein store hote hain aur har API request ke header mein `Authorization: Bearer <token>` ke sath bheje jaate hain.

---

### **B. Real-Time Gmail Email Engine (Nodemailer + SMTP)**
1. **Kaise Work Karta Hai**:
   - File: `server/utils/emailService.js`
   - Nodemailer Google ke SMTP Server (`smtp.gmail.com:587`) se connect hota hai using `EMAIL_USER` aur `EMAIL_PASS` (Google App Password).

2. **Trigger Mechanism**:
   - Jab bhi Manager `createTask` ya `updateTask` API call karke kisi Member ko task assign karta hai:
   - Backend controller async background helper `triggerTaskAssignedEmail` chala deta hai.
   - Ye function response ko block kiye bina background mein member ke **Gmail Inbox** par high-contrast HTML Email Notification deliver kar deta hai containing Task Title, Manager Name, Due Date, Priority Badge, aur direct task link!

---

### **C. ✨ AI Smart Subtask Auto-Generator**
1. **Kaise Work Karta Hai**:
   - File: `server/controllers/taskController.js` ➔ `generateAiSubtasks`
   - Jab Manager task create karte waqt `✨ AI Auto-Break Subtasks` button click karta hai:
   - API Request backend controller par bhejti hai Task Title.
   - Backend NLP Keyword Analysis algorithm inspect karta hai title (e.g., *auth*, *ui*, *api*, *database*, *bug*).
   - Algorithm automatically **3-4 relevant subtasks**, **estimated completion hours**, aur **suggested tags** generate karke frontend form populate kar deta hai.

---

### **D. ⏱️ Live Task Stopwatch & Logged Hours Tracker**
1. **Kaise Work Karta Hai**:
   - File: `client/src/pages/TaskDetail.jsx`
   - Frontend React `setInterval` (1000ms) timer run karta hai jab user "Start Timer" click karta hai.
   - "Log Hours" click karne par total elapsed seconds hours mein convert hote hain (`seconds / 3600`).
   - Frontend `updateTask(taskId, { loggedHours: newTotal })` call karta hai jo MongoDB mein `loggedHours` field permanently update kar deta hai.
   - Kanban cards par live pill dikhta hai: `⏱️ 4.5/8h`.

---

### **E. 🎙️ Voice Notes & Audio Comments Thread**
1. **Kaise Work Karta Hai**:
   - File: `client/src/pages/TaskDetail.jsx` & `server/models/Comment.js`
   - Member "Record Voice Comment" button click karta hai ➔ Native HTML5 `navigator.mediaDevices.getUserMedia({ audio: true })` active hota hai.
   - `MediaRecorder` API audio stream ko `.webm` blob mein record karta hai.
   - Recording finish hone par FileReader blob ko Base64 Data String (`data:audio/webm;base64,...`) mein convert karta hai.
   - API Comment collection mein `audioUrl` save karti hai.
   - Comments thread HTML5 `<audio controls src={c.audioUrl} />` element render karke inline playback enable karta hai.

---

### **F. 🛡️ Project Health Score Calculator**
1. **Kaise Work Karta Hai**:
   - File: `client/src/pages/ProjectDetails.jsx`
   - Dynamic Health Score Math Formula:
     $$\text{Completion Rate} = \left(\frac{\text{Done Tasks}}{\text{Total Tasks}}\right) \times 100$$
     $$\text{Overdue Penalty} = \left(\frac{\text{Overdue Tasks}}{\text{Total Tasks}}\right) \times 40$$
     $$\text{Health Score} = \text{Math.max}(0, \text{Completion Rate} - \text{Overdue Penalty} + 30)$$
   - Output Health Badges:
     - `≥ 80%`: 🟢 Optimal Pace — High Health
     - `50-79%`: 🟡 Moderate Workload Pace
     - `< 50%`: 🔴 High Overdue Risk Alert

---

### **G. 📊 One-Click CSV Executive Report Export**
1. **Kaise Work Karta Hai**:
   - File: `client/src/pages/ProjectDetails.jsx` ➔ `handleExportCsv`
   - User "Export Report" button click karta hai.
   - Function JavaScript array mapping se complete project tasks data (Title, Status, Priority, Assignee Name, Logged Hours, Estimated Hours, Due Date) ko CSV string format mein assemble karta hai.
   - Dynamic `data:text/csv;charset=utf-8` Data URI link create karke programmatically DOM click event trigger karta hai, jisse browser directly `.csv` spreadsheet file download kar leta hai.

---

## 🗄️ 3. Database Schema Blueprint

```
┌─────────────────────────────────────────────────────────────────────────┐
│                               USER SCHEMA                               │
├─────────────────────────────────────────────────────────────────────────┤
│ _id: ObjectId | name: String | email: String | password: HashedString   │
│ role: Enum ['admin', 'manager', 'member'] (default: 'member')           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                             PROJECT SCHEMA                              │
├─────────────────────────────────────────────────────────────────────────┤
│ _id: ObjectId | name: String | description: String                      │
│ owner: Ref(User) | members: [{ user: Ref(User), role: String }]        │
│ isArchived: Boolean | createdAt: Date                                   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                               TASK SCHEMA                               │
├─────────────────────────────────────────────────────────────────────────┤
│ _id: ObjectId | title: String | description: String                     │
│ status: Enum ['To Do', 'In Progress', 'Done']                            │
│ priority: Enum ['Low', 'Medium', 'High']                                │
│ project: Ref(Project) | assignee: Ref(User) | dueDate: Date             │
│ tags: [String] | subtasks: [{ title: String, isCompleted: Boolean }]    │
│ loggedHours: Number | estimatedHours: Number | isArchived: Boolean       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                             COMMENT SCHEMA                              │
├─────────────────────────────────────────────────────────────────────────┤
│ _id: ObjectId | text: String | audioUrl: String (Base64)               │
│ task: Ref(Task) | author: Ref(User) | createdAt: Date                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 4. Evaluator Q&A Defense Cheat Sheet (Important Questions)

### **Q1: User passwords ko database mein secure kaise rakha hai?**
**Answer**: "Hum `bcryptjs` salted hashing algorithm (10 salt rounds) use karte hain. Database mein encrypted hash string save hoti hai. Login ke waqt `bcrypt.compare()` function password mismatch verify karta hai without decrypting original password."

### **Q2: Real-time email sending se API response slow kyu nahi hota?**
**Answer**: "Hum Nodemailer dispatch function `triggerTaskAssignedEmail` ko asynchronous non-blocking pattern mein run karte hain. Express API client ko instant 200 HTTP response bhej deti hai, jabke email worker node event loop ke next tick par background mein execute hota hai."

### **Q3: React mein app performance aur fast loading kaise achieve ki?**
**Answer**: "Vite bundling engine, code splitting, layout caching, aur smooth CSS transitions se. Pure app production bundle size micro-optimized hai aur `npm run build` sirf 3 seconds mein complete hota hai."

### **Q4: Testing process kya tha?**
**Answer**: "Humne Jest test runner + Supertest HTTP assertions + `mongodb-memory-server` isolated database use karke **25 Integration Unit Tests** write aur pass kiye hain (`npm test`)."

---

## 🏆 Presentation Summary Checklist

1. Open `http://localhost:5173/login` in browser.
2. Open `PRESENTATION_MASTER_GUIDE.md` for reference during presentation.
3. Show **AppLoader**, **Manager Registration**, **Project Creation**, **AI Auto-Break**, **Gmail Inbox Email Alert**, **Live Stopwatch**, **Voice Comments**, aur **CSV Report Export**.
