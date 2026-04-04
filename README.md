# 🚀 TaskPilot Pro – Full Stack Task Management System

A production-ready **Task Management System** built using modern full-stack technologies. This project demonstrates scalable architecture, secure authentication, and efficient task handling with a clean UI.

---

## 📌 Overview

TaskPilot Pro allows users to:
- Register & securely authenticate
- Manage personal tasks (CRUD operations)
- Filter, search, and paginate tasks
- Maintain sessions using Access & Refresh Tokens

---

### 🔐 Login Page
![Login](./screenshots/login.png)

### 🔐 Register Page
![Register](./screenshots/register.png)

### 🔑 Authentication Flow
![Authentication](./screenshots/authentication.png)

### 👤 Already Logged In User
![LoggedIn](./screenshots/session.png)

### 📊 Dashboard
![Dashboard](./screenshots/desktop.png)

### 📱 Responsive Design
![Mobile](./screenshots/mobile.png)

## 🌐 Advanced Project (Live Demo)

Want to explore a more advanced, enterprise-level implementation?

👉 Live Demo: https://task-pilot-css1.vercel.app

### 🚀 Advanced Features (Industry-Level)
- Real-time collaboration
- Drag & Drop Kanban Boards
- Team-based workflows
- Notifications & activity tracking
- Highly scalable architecture (millions of users)

---

## 📌 Features

### 🔐 Authentication
- User Registration & Login
- JWT-based Authentication
  - Access Token (short-lived)
  - Refresh Token (long-lived)
- Password hashing using bcrypt
- Secure logout functionality

### 📝 Task Management
- Create, Read, Update, Delete tasks
- Toggle task completion status
- User-specific task ownership

### 🔍 Advanced Functionalities
- Pagination (efficient data loading)
- Filtering (Completed / Pending)
- Search (by task title)

### 💻 Frontend
- Responsive UI (Mobile + Desktop)
- Clean dashboard interface
- Toast notifications
- Real-time UI updates

---

## 🏗️ Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Axios
- React Toastify

---

## 📂 Project Structure

```
TaskPilot-Pro/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── apicalls/
│   ├── hooks/
│   ├── utils/
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://user:password@localhost:5432/taskpilot
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
PORT=5000
```

### Frontend (.env)

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```
git clone https://github.com/your-username/taskpilot-pro.git
cd taskpilot-pro
```

---

### 2. Backend Setup

```
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

---

### 3. Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

## 📡 API Endpoints

### 🔑 Authentication

| Method | Endpoint         | Description            |
|--------|----------------|------------------------|
| POST   | /auth/register | Register a new user    |
| POST   | /auth/login    | Login user             |
| POST   | /auth/refresh  | Refresh access token   |
| POST   | /auth/logout   | Logout user            |

---

### 📝 Tasks

| Method | Endpoint              | Description                  |
|--------|----------------------|------------------------------|
| GET    | /tasks               | Get tasks (pagination/filter/search) |
| POST   | /tasks               | Create task                  |
| GET    | /tasks/:id           | Get single task              |
| PATCH  | /tasks/:id           | Update task                  |
| DELETE | /tasks/:id           | Delete task                  |
| PATCH  | /tasks/:id/toggle    | Toggle task status           |

---

## 🔐 Authentication Flow

1. User logs in → receives Access Token + Refresh Token  
2. Access Token used for API requests  
3. Refresh Token used to generate new Access Token  
4. Logout invalidates Refresh Token  

---

## ☁️ Deployment

### Backend
- AWS EC2 / Render / Railway

### Frontend
- Vercel (Recommended)

---

## 💡 Future Improvements

- WebSocket-based real-time updates
- Role-Based Access Control (RBAC)
- File attachments in tasks
- AI-based task prioritization
- Notifications system (Email + Push)

---

## 👨‍💻 Author

**Anush Khandelwal**  
Full Stack Developer (MERN + Next.js)

---

## 📜 License

This project is licensed under the MIT License.
