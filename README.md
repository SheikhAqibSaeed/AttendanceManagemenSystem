## Attendance Management System (AMS)

A modern Attendance Management Web Application for managing employee attendance, tracking working hours, and automatically calculating salaries based on actual working time.

### Tech Stack

- **Frontend**: Next.js (App Router, TypeScript), React, Tailwind CSS, Axios, Recharts
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Auth**: JWT with role-based access (Admin / Employee)

### Key Features

- **Authentication**: Login with JWT, protected routes in the frontend
- **Employee Management (Admin)**: CRUD operations for employees
- **Attendance**: Daily check-in/check-out with total working hours and late detection
- **Salary Calculation**: Based on actual total working hours for the month
- **Reports**: Daily, monthly, and salary reports with Excel export
- **Dashboards**: Summary widgets for employees, presence, absence, late, and working hours
- **Charts**: Monthly attendance and salary summaries

## Project Structure

```text
AMS/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── scripts/
│   └── server.js
├── web-ams/
│   ├── app/              # Next.js App Router (auth + protected routes)
│   ├── components/       # Reusable UI components
│   ├── context/          # Auth and other React contexts
│   ├── services/         # API client (Axios)
│   └── styles/           # Global styles (Tailwind)
└── README.md
```

## Setup

### Prerequisites

- **Node.js** 18+
- **MongoDB** (local instance or MongoDB Atlas)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

### Frontend (web-ams)

```bash
cd web-ams
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev
```

### Seed Admin User

```bash
cd backend
node scripts/seedAdmin.js
# Login: admin@ams.com | Password: admin123
```

## API Endpoints (Backend)

### Auth

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

### Employees (Admin)

- `GET /api/employees`
- `POST /api/employees`
- `GET /api/employees/:id`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`

### Attendance

- `POST /api/attendance/checkin`
- `POST /api/attendance/checkout`
- `GET /api/attendance` (Admin)
- `GET /api/attendance/:employeeId`

### Reports

- `GET /api/reports/daily?date=YYYY-MM-DD`
- `GET /api/reports/monthly?month=1&year=2026`
- `GET /api/reports/salary?month=1&year=2026&employeeId=EMP001`

## Salary Logic

The backend calculates salary based on actual working hours within the selected month:

```text
Working Days     = total business days in month (Mon–Fri, excludes weekends)
Expected Hours   = Working Days × 8
Hourly Rate      = Monthly Salary / Expected Hours
Calculated Salary = Total Working Hours × Hourly Rate
```

## Running Locally

- **Backend**: `http://localhost:5000`
- **Frontend (web-ams)**: `http://localhost:3000`

Login with the seeded admin user or with any users created via the admin panel.
