# 🔐 Enterprise Vault — Multi-Tenant SaaS Security Engine

A full-stack, multi-tenant SaaS admin dashboard with **4-tier role-based access control** (Super Admin, Company Admin, Manager, Employee), built with **React**, **Node.js/Express**, **Prisma** and **PostgreSQL**. Each company (tenant) has its own isolated data, and every role sees only the screens and actions it's allowed to use.

## ✨ Features

- **Role-Based Access Control** — Super Admin (platform/billing), Company Admin (accounts + feature toggles), Manager (tasks + leave approvals), Employee (own tasks/leaves/profile)
- **Multi-tenant isolation** — every company's data is scoped to that company only
- **User Management** — add, edit, soft-delete members with live search, role filter & pagination
- **Task Management** — managers assign tasks, employees update status (To Do → In Progress → Done)
- **Leave Management** — employees request leave, managers approve/reject
- **Team Performance Reports** — completion %, task counts, CSV export
- **Companies & Billing** (Super Admin) — onboard tenants, assign subscription plans, track monthly revenue
- **Audit Trail** — every add/edit/delete/login event logged with timestamp & actor
- **Security** — JWT authentication, role guards on every protected route, Row-Level Security at the database layer
- **Modern UI** — responsive (mobile drawer navigation), dark mode toggle, CSV export, toast notifications

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Axios |
| Backend | Node.js, Express |
| ORM / DB | Prisma, PostgreSQL |
| Auth | JWT, bcryptjs |
| Validation | express-validator |

## 👥 Roles at a Glance

| Role | Can do |
|---|---|
| **Super Admin** | Onboard companies, set subscription plans, manage billing |
| **Company Admin** | Add/edit/delete Managers & Employees, toggle feature access per role, view audit logs |
| **Manager** | Assign & track tasks, approve/reject leave requests, view team reports |
| **Employee** | Complete assigned tasks, submit leave requests, update own profile |

## 🚀 Getting Started

### Backend
```bash
cd backend
npm install
# add your DATABASE_URL and JWT_SECRET to .env
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 📁 Project Structure
```
enterprise-vault-saas/
├── backend/
│   ├── prisma/            # database schema & migrations
│   └── src/
│       ├── controllers/
│       ├── middlewares/   # auth & role guards
│       ├── routes/
│       └── config/
└── frontend/
    └── src/
```

## 📄 License

This project is available for licensing — contact for commercial use.

---

*Built as a demonstration of enterprise-grade multi-tenant SaaS architecture with proper RBAC, audit logging, and tenant data isolation.*
