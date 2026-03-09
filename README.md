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
Admin
<img width="1912" height="969" alt="Screenshot_6" src="https://github.com/user-attachments/assets/e7aa6417-7d40-4334-906d-84ae4cbcde94" />
<img width="1917" height="943" alt="Screenshot_5" src="https://github.com/user-attachments/assets/627edc5b-7e87-464a-b4f0-ecda6b28534c" />
<img width="1919" height="856" alt="Screenshot_4" src="https://github.com/user-attachments/assets/d93b5196-e0b3-4f03-b937-0928ee2044d3" />
<img width="1910" height="921" alt="Screenshot_3" src="https://github.com/user-attachments/assets/36f72c53-5803-4cab-a56c-d818770e1a53" />
<img width="1912" height="853" alt="Screenshot_2" src="https://github.com/user-attachments/assets/818674ff-67c8-40a1-807d-03896632e0b2" />
<img width="1916" height="958" alt="Screenshot_1" src="https://github.com/user-attachments/assets/03899488-4bd8-4e2c-a774-cc2836915015" />
<img width="1917" height="866" alt="login" src="https://github.com/user-attachments/assets/c34aa81c-c97b-4c79-a3f2-15ef4d61195c" />
Employees
<img width="1912" height="958" alt="Screenshot_5" src="https://github.com/user-attachments/assets/d368aa8f-e685-4d85-a016-4d02d93ee2d6" />
<img width="1919" height="907" alt="Screenshot_4" src="https://github.com/user-attachments/assets/888dd622-edcb-4505-ba19-fdeff81cb50b" />
<img width="1908" height="839" alt="Screenshot_3" src="https://github.com/user-attachments/assets/6fdfdab1-cccf-40bc-a093-bcf72bd2a91e" />
<img width="1910" height="967" alt="Screenshot_1" src="https://github.com/user-attachments/assets/0ac95208-02ee-4c53-88a5-ff7f8b44ba63" />
<img width="1919" height="869" alt="login" src="https://github.com/user-attachments/assets/6f6883bb-7218-427d-8770-7c545e82da64" />

