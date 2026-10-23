# GovEase AI

GovEase AI is a full-stack platform that helps Indian citizens discover government exams and job/scheme opportunities, maintain a reusable profile, and fill dynamically-generated application forms. It includes a citizen portal, an admin portal, and supporting backend services.

## Project Structure

```
GovEase_AI/
├── frontend/                  # Citizen React/Vite SPA (port 5173)
├── Backend_Node.js            # Citizen Express API (port 3000)
├── Admin_Frontend/            # Admin React/Vite SPA (port 5174)
├── Admin_Backend/             # Admin Express API (port 3001)
├── Backend_Python/            # Python intelligence microservice (port 8000)
├── docs/                      # Documentation (DFD Level 0, etc.)
└── README.md
```

## Four Applications

| App | Port | Purpose |
|-----|------|---------|
| `frontend` | 5173 | Citizen portal — browse exams/opportunities, apply, track applications |
| `Backend_Node.js` | 3000 | Citizen API — auth, profile, exams, opportunities, applications, documents |
| `Admin_Frontend` | 5174 | Admin portal — manage users, exams, opportunities, forms, applications |
| `Admin_Backend` | 3001 | Admin API — admin auth, content CRUD, application management |

All apps share one MongoDB database and collection names.

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas (or local MongoDB)
- Python 3.10+ (for Backend_Python)

### 1. Citizen Backend (`Backend_Node.js`)
```powershell
cd Backend_Node.js
npm install
npm run dev   # runs on port 3000
```

### 2. Citizen Frontend (`frontend`)
```powershell
cd frontend
npm install
npm run dev   # runs on port 5173
```

### 3. Admin Backend (`Admin_Backend`)
```powershell
cd Admin_Backend
npm install
npm run dev   # runs on port 3001
```

### 4. Admin Frontend (`Admin_Frontend`)
```powershell
cd Admin_Frontend
npm install
npm run dev   # runs on port 5174
```

### 5. Python Microservice (`Backend_Python`)
```powershell
cd Backend_Python
start.bat     # sets up venv, installs deps, runs on port 8000
```

## Admin Credentials

Seed an admin user (run before first login):
```powershell
cd Admin_Backend
$env:ADMIN_PASSWORD = "admin123"
node scripts/seed-admin.js
```

| Field | Value |
|-------|-------|
| Email | `admin@govease.ai` |
| Password | `admin123` |
| Note | First login requires password change |

## Features

### Citizen Portal
- Register, login, logout, password reset (JWT access + refresh tokens)
- Profile management: personal details, address, education, experience, skills, certifications, identity documents, preferences
- Document uploads stored in MongoDB GridFS (bucket: `documents`)
- Browse and search exams
- Browse and search opportunities (jobs, internships, scholarships, schemes)
- Dynamic application forms built by admins
- Profile auto-fill on application forms
- Application submission with status tracking: **APPLIED → UNDER_REVIEW → APPROVED / REJECTED**
- Application timeline view

### Admin Portal
- Admin login with JWT access/refresh tokens
- Dashboard with platform metrics
- User management (list, detail, update, reset password)
- Audit logs
- Exam CRUD with eligibility rules
- Opportunity CRUD with eligibility rules
- Dynamic form builder (create, edit, publish/archive forms)
- Image uploads for forms
- **Applications management**: view all applications, filter by status/target type, update status (APPLIED → UNDER_REVIEW → APPROVED/REJECTED), delete applications
- Dynamic forms (`/forms`, `/forms/new`, `/forms/:id/edit`)

### Backend_Python Microservice (port 8000)
- `GET /api/v1/health` — health check
- `GET /api/v1/presets` — photo/signature dimension & KB specs for SSC, UPSC, IBPS, RRB, NTA
- `GET /api/v1/presets/{id}` — single portal preset
- `POST /api/v1/eligibility/check` — candidate eligibility evaluation with age relaxation
- `GET /api/v1/notices` — recruitment notices (mock data with live scraper scaffolding)

## Application Status Flow

```
APPLIED → UNDER_REVIEW → APPROVED
                  → REJECTED
```

- Citizens can reapply after rejection (previous rejected record is reset to APPLIED)
- Duplicate active applications (APPLIED/UNDER_REVIEW/APPROVED) are blocked
- Only administrators can change application status

## Environment Variables

Create `.env` files in each backend directory:

### Backend_Node.js/.env
```
MONGO_URI=<mongodb connection string>
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
PORT=3000
FRONTEND_URL=http://localhost:5173
MONGO_DB_NAME=GovEase
```

### Admin_Backend/.env
```
MONGO_URI=<same as citizen backend>
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
ADMIN_PORT=3001
ADMIN_FRONTEND_URL=http://localhost:5174
```

## API Endpoints (Citizen Backend, port 3000)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/refresh` | No | Refresh token |
| POST | `/api/auth/logout` | Yes | Logout |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/profile/:userId` | Yes | Get profile |
| POST | `/api/profile` | Yes | Upsert profile |
| ... | education, experience, skill, identity, document, preference, certification | Yes | CRUD for each |
| GET | `/api/exams` | Yes | List exams |
| GET | `/api/exams/:id` | Yes | Exam detail |
| GET | `/api/exams/:id/form` | Yes | Get exam form |
| POST | `/api/exams/:id/apply` | Yes | Apply to exam |
| GET | `/api/opportunities` | Yes | List opportunities |
| GET | `/api/opportunities/:id` | Yes | Opportunity detail |
| GET | `/api/opportunities/:id/form` | Yes | Get opportunity form |
| POST | `/api/opportunities/:id/apply` | Yes | Apply to opportunity |
| GET | `/api/applications` | Yes | List user applications |
| GET | `/api/applications/:id` | Yes | Application detail |

## API Endpoints (Admin Backend, port 3001)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/admin/auth/login` | No | Admin login |
| POST | `/api/admin/auth/refresh` | No | Refresh token |
| POST | `/api/admin/auth/logout` | Yes | Logout |
| GET | `/api/admin/auth/me` | Yes | Current admin |
| POST | `/api/admin/auth/change-password` | Yes | Change password |
| GET | `/api/admin/dashboard/metrics` | Yes | Dashboard stats |
| GET | `/api/admin/users` | Yes | List users |
| GET | `/api/admin/users/:id` | Yes | User detail |
| PATCH | `/api/admin/users/:id` | Yes | Update user |
| POST | `/api/admin/users/:id/reset-password` | Yes | Reset password |
| GET | `/api/admin/audit-logs` | Yes | Audit logs |
| GET | `/api/admin/eligibility-rules` | Yes | List rules |
| POST | `/api/admin/eligibility-rules` | Yes | Create rule |
| ... | eligibility-rules CRUD | Yes | Full CRUD |
| GET | `/api/admin/exams` | Yes | List exams |
| POST | `/api/admin/exams` | Yes | Create exam |
| ... | exams CRUD | Yes | Full CRUD |
| ... | opportunities CRUD | Yes | Full CRUD |
| ... | forms CRUD + upload-image | Yes | Form management |
| GET | `/api/admin/applications` | Yes | List all applications |
| PATCH | `/api/admin/applications/:id/status` | Yes | Update status |
| GET | `/api/admin/applications/stats` | Yes | Status counts |
| DELETE | `/api/admin/applications/:id` | Yes | Delete application |

## Database Collections

Shared MongoDB database (`GovEase`):
- `users` — registered citizens
- `exams` — exam records
- `opportunities` — job/scholarship/scheme records
- `forms` — dynamic application forms
- `applications` — submitted applications with status
- `profiles`, `education`, `experience`, `skills`, `identity`, `documents`, `preferences`, `certifications`
- `auditLogs` — admin action logs
- `eligibilityRules` — structured eligibility rules

## Documentation

- `docs/DFD_Level0.md` — Level 0 Data Flow Diagram (as-built)

## Security Notes

- Passwords are stored in plaintext by explicit design decision — not recommended for production
- Admin authentication uses separate `/api/admin/auth` endpoints
- CORS is configured per-frontend origin
- Rate limiting is available but commented out in citizen backend