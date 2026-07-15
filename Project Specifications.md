
PROJECT SPECIFICATION DOCUMENT
Taskly
A Project & Task Management Web Application
(Inspired by Jira)

Prepared by
M. Fabih Alam Khan
Software Engineering Intern / Developer
Document Version 1.0
fStatus: Draft — For Review

1. Project Overview
Taskly is a project and task management web application that allows users to create projects, define tasks within them, assign tasks to team members, and track progress through a structured workflow (To Do → In Progress → Done).
The project name 'Taskly' is a placeholder and may be revised prior to final delivery. The application draws conceptual inspiration from Jira but is designed and implemented as an original, independently built system rather than a direct replica.
Purpose: This project is being developed as part of a software engineering internship, with an emphasis on hands-on, from-first-principles implementation of each feature using the MERN stack.
2. Technology Stack
Frontend
Technology	Purpose
React.js (via Vite)	Core UI framework and build tooling
Tailwind CSS	Utility-first styling
Lucide React	Icon library
React Router DOM	Client-side routing
React Hook Form	Form state management and validation
Axios	HTTP client for API communication
Context API	Global state management (authentication, theme)

Backend
Technology	Purpose
Node.js	JavaScript runtime environment
Express.js	REST API framework
Mongoose	Object Data Modeling (ODM) for MongoDB
JSON Web Token (JWT)	Authentication and session management
bcrypt.js	Password hashing
dotenv	Environment variable management
cors	Cross-origin resource sharing
express-validator	Server-side input validation

Database & Tooling
Category	Tool
Database	MongoDB (local via Compass, or MongoDB Atlas)
IDE	Visual Studio Code
Version Control	Git & GitHub
API Testing	Postman
Database GUI	MongoDB Compass
 3. Project Structure
The repository is organized into two primary applications — a React client and a Node/Express server — alongside supporting documentation.
jira-clone/
│
├── client/                 React frontend (Vite)
│   └── src/
│       ├── components/    Reusable UI elements (Button, Card, Modal)
│       ├── pages/         Page-level views (Login, Dashboard, etc.)
│       ├── layouts/       Page wrappers (AuthLayout, DashboardLayout)
│       ├── hooks/         Custom React hooks
│       ├── services/     API request functions
│       ├── context/      Global state providers
│       ├── utils/        Helper functions
│       ├── assets/       Images and static assets
│       └── App.jsx
│
├── server/                 Node + Express backend
│   ├── controllers/       Business logic
│   ├── models/            Mongoose schemas
│   ├── routes/            API endpoint definitions
│   ├── middleware/        Auth guards, error handling
│   ├── config/            Database connection setup
│   └── server.js          Application entry point
│
├── database/               Schema notes / diagrams
└── README.md
4. Database Schema
User
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: "admin", "member"),
  createdAt: Date
}
Project
{
  name: String,
  description: String,
  owner: ObjectId (ref: User),
  members: [ObjectId] (ref: User),
  createdAt: Date
}
Task
{
  title: String,
  description: String,
  priority: String (enum: "Low", "Medium", "High"),
  status: String (enum: "To Do", "In Progress", "Done"),
  assignee: ObjectId (ref: User),
  project: ObjectId (ref: Project),
  dueDate: Date,
  createdAt: Date
}
 5. Feature Roadmap
Features are organized into five phases, ordered to align with a progressive learning path.
Phase 1 — Foundation
☐  User registration with hashed password storage
☐  User login with JWT issuance
☐  Protected routes (Dashboard accessible only when authenticated)
☐  Create Project
☐  View list of Projects
Phase 2 — Core Task CRUD
☐  Create Task within a Project
☐  Edit Task
☐  Delete Task
☐  Update Task Status (To Do / In Progress / Done)
Phase 3 — Usability
☐  Drag-and-drop tasks between status columns (Kanban board)
☐  Search tasks by title
☐  Filter by status and priority
☐  Set task Priority level
Phase 4 — Collaboration
☐  Add team members to a Project
☐  Assign tasks to specific members
☐  Comments on tasks
☐  Due dates with visual indicators for overdue items
Phase 5 — Polish
☐  In-app notifications for task assignment/updates
☐  Activity log (audit trail of changes)
☐  Dark mode toggle
 6. API Endpoints (Planned)
Authentication
Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Authenticate user and issue JWT
GET	/api/auth/me	Get current logged-in user (protected)

Projects
Method	Endpoint	Description
GET	/api/projects	List all projects for the logged-in user
POST	/api/projects	Create a new project
GET	/api/projects/:id	Get single project details
PUT	/api/projects/:id	Update a project
DELETE	/api/projects/:id	Delete a project

Tasks
Method	Endpoint	Description
GET	/api/tasks?project=:id	List all tasks for a given project
POST	/api/tasks	Create a new task
PUT	/api/tasks/:id	Update a task or its status
DELETE	/api/tasks/:id	Delete a task
7. Application Pages
Page	Route	Access
Login	/login	Public
Register	/register	Public
Dashboard	/dashboard	Protected
Projects List	/projects	Protected
Project Details (Kanban Board)	/projects/:id	Protected
Task Details	/projects/:id/tasks/:taskId	Protected
Profile	/profile	Protected
Settings	/settings	Protected
 8. Authentication Flow
1. User registers — password is hashed using bcrypt and stored in MongoDB.
2. User logs in — submitted password is compared against the stored hash; upon success, a JWT is generated and returned to the client.
3. The frontend stores the token (storage mechanism — in-memory vs. httpOnly cookie — to be finalized at implementation time).
4. Every protected API request includes the token in an Authorization: Bearer <token> header.
5. Backend middleware (authMiddleware.js) verifies the token before granting access to protected routes.
9. Development Approach
●	Each feature is preceded by a concept/logic walkthrough before any code is written.
●	Implementation is done hands-on by the developer, with iterative review at each step.
●	No phase is skipped; each builds on the previous phase's foundation.
●	Emphasis on understanding over copy-paste implementation.
10. Out of Scope
The following capabilities exist in the original Jira product but are intentionally excluded from this project to keep scope manageable for a learning-focused build:
●	Sprints, Epics, and Story Points
●	Advanced multi-tier permission roles
●	File attachments
●	Third-party integrations (e.g., Slack, GitHub)
●	Real-time updates via WebSockets (may be considered as a future enhancement)


Document Status: Draft — Pending Review
