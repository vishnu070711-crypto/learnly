# Learnly — Online Learning Platform (MERN Stack)

A full-featured online learning platform built with **MongoDB, Express.js, React (Vite) and Node.js**, styled with **Material‑UI**.

Students can browse and enroll in courses (free or paid), watch video lessons, read PDFs and slide decks, submit assignments and track their progress. Instructors can create courses, upload study materials, post assignments and grade submissions. Admins get a platform-wide dashboard to manage users.

---

## ✨ Features

**Backend**
- JWT authentication with role-based access control (`student`, `instructor`, `admin`)
- Course CRUD with search, category/level filters and pagination
- Enrollment system with a simulated payment/confirmation flow for paid courses
- Assignment workflow: create → submit → grade, with feedback
- Study material uploads (video up to 1.5GB, PDF/PPT up to 50MB) via Multer with strict type/size validation
- Centralized error handling, Helmet security headers, CORS, request logging

**Frontend**
- Clean, responsive Material‑UI design (custom indigo/amber theme, Poppins + Inter fonts)
- Course catalogue with search & filters
- Course detail page with tabs for Overview / Study materials / Assignments
- Embedded video player, inline PDF viewer, and slide-deck download link
- Student dashboard with per-course progress bars
- Instructor dashboard: course builder, material uploader (with progress bar), assignment creator, grading screen, enrolled-student list
- Admin dashboard: platform stats, user role management

---

## 📁 Project structure

```
online-learning-platform/
├── backend/
│   ├── config/           # MongoDB connection
│   ├── controllers/      # Route handlers
│   ├── middleware/       # auth, role checks, uploads, error handler
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routers
│   ├── uploads/           # Uploaded videos / pdfs / ppts / avatars
│   ├── utils/seed.js      # Demo data seeder
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/            # Axios instance + API service functions
    │   ├── components/     # Navbar, CourseCard, MaterialViewer, etc.
    │   ├── context/        # AuthContext
    │   ├── pages/          # Route-level pages (auth, student, instructor, admin, course)
    │   └── theme/          # MUI theme
    └── vite.config.js      # Dev server + API proxy
```

---

## 🚀 Getting started

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas connection string

### 1. Backend setup

```bash
cd backend
cp .env.example .env      # then edit MONGO_URI / JWT_SECRET as needed
npm install
npm run seed               # optional: creates demo admin/instructor/student + 3 courses
npm run dev                 # starts the API on http://localhost:5000
```

Demo accounts created by the seed script (password for all: `password123`):

| Role       | Email                |
|------------|-----------------------|
| Admin      | admin@demo.com        |
| Instructor | instructor@demo.com   |
| Student    | student@demo.com      |

### 2. Frontend setup

In a separate terminal:

```bash
cd frontend
npm install
npm run dev                 # starts the app on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` requests to `http://localhost:5000`, so no extra frontend env config is required for local development.

### 3. Open the app

Visit **http://localhost:5173** and log in with one of the demo accounts, or register a new student/instructor account.

---

## 🔧 Configuration notes

- `MAX_VIDEO_SIZE` / `MAX_DOC_SIZE` in `backend/.env` control upload limits (bytes). Defaults: 1.5GB for video, 50MB for PDF/PPT.
- Payments are **simulated** for demo purposes (`enrollmentController.confirmPayment`) — no real payment gateway is integrated. Swap in Stripe/Razorpay there for production use.
- Uploaded files are served statically from `/uploads/*` and stored on local disk under `backend/uploads/`. For production, point this at S3/Cloud Storage instead.

## 🏗️ Building for production

```bash
cd frontend
npm run build      # outputs static files to frontend/dist
```

Serve `frontend/dist` with any static host (or have Express serve it) and point the frontend's API calls at your deployed backend URL.

---

Built as a demonstration MERN application — feel free to extend it with real payments, email notifications, course reviews, or certificates.
