<div align="center">

  # 🎓 UniPortal — Enterprise University LMS

  **A modern, multi-tenant Learning Management System built for modern universities & educational institutions.**

  [![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![NestJS](https://img.shields.io/badge/NestJS-10.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

  [Key Features](#-key-features) •
  [Architecture](#-architecture) •
  [Tech Stack](#%EF%B8%8F-tech-stack) •
  [Getting Started](#-getting-started) •
  [Demo Credentials](#-demo-credentials) •
  [API Reference](#-api-reference)

</div>

---

## 🌟 Overview

**UniPortal** is a full-stack, enterprise-ready **University Learning Management System (LMS)** designed to handle multi-faculty university structures. Built with high performance, strict multi-tenancy isolation, role-based access control (RBAC), dynamic dashboards, real-time notification alerts, and modern glassmorphism aesthetics.

Whether managing admissions, enrolling in semester courses, submitting assignments, calculating cumulative GPA transcripts, tracking lecture attendance, or managing class schedules, **UniPortal** delivers a seamless experience for students, teachers, and administrators.

---

## ✨ Key Features

### 👤 Student Experience
* 📊 **Smart Student Dashboard**: Overview of enrolled courses, credit tallies, pending assignments, and attendance statistics.
* 📈 **Cumulative GPA & Transcript**: Automated 4.0-scale GPA calculator with a printable academic transcript breakdown.
* 📅 **Weekly Interactive Timetable**: Visual weekly schedule calendar rendering class times, room numbers, and course details.
* 📝 **Assignment Submissions**: View due-date badges (overdue/today/days left), submit coursework, and view instructor grades with inline feedback.
* ⏱️ **Attendance Rate Tracker**: Live attendance percentage monitoring with session status history (`PRESENT`, `ABSENT`, `LATE`).
* 🔔 **Real-Time Notification Drawer**: Top navbar notification bell dropdown with unread badge counter and instant mark-as-read controls.

### 👩‍🏫 Instructor Workspace
* 📚 **Offering Overview**: View assigned course offerings, semester schedules, and active student rosters.
* ✏️ **Assignment Creation & Grading**: Create assignments with due dates and custom max scores. Grade student submissions with inline feedback.
* 📋 **Attendance Session Management**: Create lecture attendance sessions and perform bulk student attendance marking.

### 🏛️ Administration & Admissions
* 🏢 **Multi-Faculty & Department Management**: Admin portal to manage faculties, academic departments, and staff accounts.
* 📑 **Admissions Portal & Automated Onboarding**: Public application page for prospective students. Admin review interface to accept/reject applications; accepted applicants automatically receive generated student credentials.
* 🛡️ **Strict Multi-Tenancy**: Tenant isolation using custom `TenantGuard` and `x-faculty-id` header validation against JWT claims.

---

## 🏗️ Architecture

UniPortal is engineered as a clean **Monorepo** architecture:

```text
university-lms/
├── apps/
│   ├── api/                 # NestJS Backend REST API (Port 3000)
│   │   ├── src/
│   │   │   ├── admissions/  # Public application & review workflow
│   │   │   ├── assignments/ # Assignment lifecycle & grading
│   │   │   ├── attendance/  # Lecture sessions & student records
│   │   │   ├── auth/        # JWT Authentication & Passport strategy
│   │   │   ├── common/      # Guards (JWT, Roles, Tenant), Decorators
│   │   │   ├── courses/     # Courses, Semesters, Offerings, Schedule
│   │   │   ├── departments/ # Academic department management
│   │   │   ├── faculties/   # Multi-faculty tenancy
│   │   │   ├── notifications/# Real-time notification system
│   │   │   ├── profiles/    # Role profiles (Student, Teacher, Admin)
│   │   │   ├── users/       # User management
│   │   │   └── seed.ts      # Automated database seeder
│   │   
│   └── web/                 # Next.js 15 Frontend Application (Port 3001)
│       ├── app/
│       │   ├── (admin)/     # Protected Admin Portal routes
│       │   ├── admissions/  # Public admissions application page
│       │   ├── dashboard/   # Premium Student Dashboard
│       │   ├── login/       # Multi-role authentication page
│       │   └── teacher/     # Instructor workspace & grading panel
│
└── packages/
    └── shared/              # Shared types, DTOs & utility functions
```

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
|---|---|---|
| **Frontend** | Next.js 15 (App Router) | React Framework with Server & Client Components |
| **Styling** | Vanilla CSS + TailwindCSS | Premium dark glassmorphism, responsive grid layouts |
| **Icons & UI** | Lucide React | Modern, clean UI iconography |
| **Backend** | NestJS 10 | Enterprise Node.js TypeScript Framework |
| **Database** | PostgreSQL 16 | Relational database engine |
| **ORM** | TypeORM | Entity mappings, migrations, and relations |
| **Authentication** | Passport JWT & bcrypt | Secure token authentication & password hashing |
| **Containerization** | Docker & Docker Compose | Containerized database setup |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.x or v20.x
* **npm**: v9.x or v10.x
* **Docker Desktop**: For running PostgreSQL locally

### 1️⃣ Clone Repository
```bash
git clone https://github.com/chandiohussain007/university-lms.git
cd university-lms
```

### 2️⃣ Start Database Services (Docker)
```bash
docker compose up -d
```

### 3️⃣ Setup & Seed Backend (NestJS API)
```bash
cd apps/api
npm install
npm run seed     # Seeds demo faculties, courses, users, and enrollments
npm run start:dev # Runs API on http://localhost:3000
```

### 4️⃣ Setup & Start Frontend (Next.js)
Open a new terminal window:
```bash
cd apps/web
npm install
npm run dev      # Runs Web App on http://localhost:3001
```

---

## 🔑 Demo Credentials

All test accounts use password **`secret`** (except Admin):

| Role | Email | Password | Access Level |
|---|---|---|---|
| 👨‍🎓 **Student** | `student1@university.edu` | `secret` | Full Student Dashboard & Transcript |
| 👩‍🏫 **Teacher** | `prof.smith@university.edu` | `secret` | Instructor Workspace & Grading |
| 🛡️ **Admin** | `admin@university.edu` | `admin123` | Full System & Faculty Management |
| 👔 **Staff** | `staff@university.edu` | `secret` | Admissions & Registrar Review |

---

## 📡 API Reference

### 🔐 Auth & Users
* `POST /auth/login` — Authenticate user and receive JWT bearer token
* `GET /users/me` — Retrieve current user profile and assigned roles

### 📚 Courses & Enrollments
* `GET /enrollments/my` — Get enrolled courses for logged-in student
* `GET /enrollments/gpa` — Calculate cumulative GPA and transcript breakdown
* `GET /enrollments/my-schedule` — Fetch weekly class schedule time slots

### 📝 Assignments
* `GET /assignments/student` — Get assignments & submissions for enrolled courses
* `POST /assignments/:id/submit` — Submit assignment work
* `POST /assignments/submissions/:id/grade` — Grade submission (Teachers)

### 📋 Attendance
* `GET /attendance/my-attendance` — Student attendance history
* `POST /attendance/sessions` — Create lecture session (Teachers)
* `POST /attendance/sessions/:id/records` — Bulk save student attendance

### 🔔 Notifications
* `GET /notifications` — Fetch recent user notifications
* `PATCH /notifications/:id/read` — Mark single notification as read
* `POST /notifications/read-all` — Mark all notifications as read

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ by <strong>Chandio Hussain</strong></sub>
</div>
