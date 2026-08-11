# GovEase AI – System Architecture

## 1. Architecture Overview

GovEase AI is a **full-stack web application** built with a modular, service-oriented architecture. The system is designed around a central user profile that powers AI-driven eligibility analysis, job/scheme recommendations, document management, and application tracking.

```text
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│                   (React.js  Web App)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer(Optional)              │
│              (Authentication, Rate Limiting)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Layer                            │
│              (Express.js / Node.js )                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
│  User Service   │ │  AI Service  │ │ Document Service│
│  (Profile, Auth)│ │(Eligibility, │ │ (Upload, OCR,   │
│                 │ │ Recs, Chat)  │ │  Verification)  │
└────────┬────────┘ └──────┬───────┘ └───────┬─────────┘
         │                 │                  │
         ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│         Mongo Db Atlas (User Data) + S3 (Documents)         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Integration Layer                         │
│                  (External AI LLMs API)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Frontend
- **Framework:** React.js with TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand or Redux Toolkit
- **Routing:** React Router
- **Forms:** React Hook Form with Zod validation
- **HTTP Client:** Axios or React Query (TanStack Query)
- **File Upload:** React Dropzone

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js or NestJS
- **Authentication:** JWT (Access + Refresh tokens)
- **Validation:** Zod or class-validator
- **File Upload:** Multer + AWS S3 SDK

### AI / Machine Learning
- **LLM Integration:** OpenAI GPT-4o / Anthropic Claude API
- **Orchestration:** LangChain.js
- **OCR:** Tesseract.js (client-side) or AWS Textract (server-side)
- **Embeddings:** OpenAI Embeddings / Sentence Transformers
- **Vector Database:** Pinecone or pgvector (for semantic search)

### Database
- **Primary Database:** MongoDB Atlas (NoSQL)
- **ODM:** Mongoose
- **File Storage:** AWS S3 or compatible (MinIO for self-hosted)
- **Cache:** Redis (for session management and rate limiting)

### Infrastructure
- **Hosting:** AWS / GCP / Azure or self-hosted VPS
- **Containerization:** Docker + Docker Compose
- **Reverse Proxy:** Nginx
- **CI/CD:** GitHub Actions

---

## 3. System Modules

### 3.1 User & Authentication Module
- User registration and login (email/password, OTP)
- JWT-based session management
- Profile CRUD operations
- Role-based access control (citizen, admin)

### 3.2 Profile Management Module
- One-time profile creation (Personal, Educational, Financial, Professional)
- Profile update and versioning
- Data validation and sanitization
- Secure storage of sensitive fields (Aadhaar, PAN)

### 3.3 Document Vault Module
- Secure document upload and storage
- Document categorization (Identity, Education, Certificates, Experience)
- OCR-based information extraction
- Document verification and expiry tracking
- Encryption at rest and in transit

### 3.4 AI Eligibility Engine
- Profile-to-opportunity matching
- Rule-based eligibility checking (age, education, income, category)
- LLM-powered eligibility reasoning with explainability
- Distinction between "potentially eligible" and "officially confirmed eligible"

### 3.5 Recommendation Module
- Government job recommendations based on profile
- Government scheme recommendations
- Career guidance (government + private sector)
- Skill gap analysis and development suggestions

### 3.6 Form Assistant Module
- Profile-to-form field mapping
- Pre-filling of application forms
- Form validation before submission
- User review and confirmation workflow
- Direct links to official government portals

### 3.7 Application Tracker Module
- Centralized application tracking
- Deadline management
- Status updates (Applied, Under Review, Approved, Rejected)
- Document association per application
- Calendar integration

### 3.8 Notification Module
- Deadline reminders
- Status change notifications
- Multi-channel delivery (Email, WhatsApp, Push)
- Notification preferences management

### 3.9 AI Assistant Module
- Conversational chatbot for government services
- Natural language query processing
- Retrieval-augmented generation (RAG) from government data sources
- Voice input support (future)

---

## 4. Data Models

### User
```text
- id: UUID
- email: string (unique)
- passwordHash: string
- phone: string
- emailVerified: boolean
- createdAt: timestamp
- updatedAt: timestamp
```

### Profile
```text
- id: UUID
- userId: UUID (ref: User.id)
- personalInfo: JSON { name, fatherName, motherName, dob, gender, aadhaar, pan, address }
- educationalInfo: JSON { qualification, degree, institution, marks, passingYear }
- eligibilityInfo: JSON { category, annualIncome, disabilityStatus }
- professionalInfo: JSON { experience, skills, previousEmployment }
- createdAt: timestamp
- updatedAt: timestamp
```

### Document
```text
- id: UUID
- userId: UUID (ref: User.id)
- category: enum (IDENTITY, EDUCATION, CERTIFICATE, EXPERIENCE, OTHER)
- documentType: enum (AADHAAR, PAN, MARKsheet, DEGREE, CASTE, INCOME, DISABILITY, EXPERIENCE, OTHER)
- fileName: string
- fileUrl: string (S3 path)
- fileSize: number
- mimeType: string
- ocrExtractedData: JSON
- verified: boolean
- uploadedAt: timestamp
- expiresAt: timestamp (optional)
```

### Opportunity
```text
- id: UUID
- type: enum (JOB, SCHEME)
- title: string
- description: text
- organization: string
- eligibilityCriteria: JSON
- applicationUrl: string (official link)
- deadline: timestamp
- status: enum (ACTIVE, CLOSED, EXPIRED)
- sourceUrl: string
- createdAt: timestamp
```

### Application
```text
- id: UUID
- userId: UUID (ref: User.id)
- opportunityId: UUID (ref: Opportunity.id)
- applicationNumber: string
- appliedOn: timestamp
- deadline: timestamp
- status: enum (DRAFT, APPLIED, UNDER_REVIEW, APPROVED, REJECTED)
- formData: JSON (pre-filled form data)
- documents: JSON (linked document IDs)
- officialPortalUrl: string
- notes: text
- createdAt: timestamp
- updatedAt: timestamp
```

### Notification
```text
- id: UUID
- userId: UUID (ref: User.id)
- type: enum (DEADLINE, STATUS, REMINDER, SYSTEM)
- title: string
- message: text
- channel: enum (EMAIL, WHATSAPP, PUSH, IN_APP)
- read: boolean
- scheduledAt: timestamp
- sentAt: timestamp
- createdAt: timestamp
```

---

## 5. AI / ML Architecture

### 5.1 Eligibility Engine
```text
User Profile + Opportunity Criteria
            │
            ▼
    Rule-Based Filter (hard constraints)
            │
            ▼
    LLM-Based Analysis (soft constraints, reasoning)
            │
            ▼
    Structured Output
    { eligible: boolean, confidence: number, reason: string }
```

### 5.2 Recommendation Pipeline
```text
User Profile Embedding
            │
            ▼
    Vector Search (Opportunities)
            │
            ▼
    Re-ranking with LLM (personalization)
            │
            ▼
    Filtered & Ranked Recommendations
```

### 5.3 OCR Pipeline
```text
Document Upload
       │
       ▼
Pre-processing (resize, denoise)
       │
       ▼
OCR Engine (Tesseract / Textract)
       │
       ▼
LLM-based Extraction & Validation
       │
       ▼
Structured JSON → Profile Update (user confirms)
```

### 5.4 AI Assistant (RAG)
```text
User Query
     │
     ▼
Embedding Generation
     │
     ▼
Vector Search (Government Data Corpus)
     │
     ▼
Context Assembly
     │
     ▼
LLM Response Generation
     │
     ▼
Answer with Source Citations
```

---

## 6. Security Architecture

### Authentication
- JWT with short-lived access tokens (15 min) and refresh tokens (7 days)
- HttpOnly, Secure cookies for web clients
- OTP-based email verification

### Data Protection
- End-to-end encryption for sensitive fields (Aadhaar, PAN)
- AES-256 encryption at rest for documents
- TLS 1.3 for all data in transit
- Secrets managed via environment variables or secret manager

### Access Control
- Users can only access their own data
- Admin role for content moderation
- Rate limiting on all public endpoints
- Input sanitization and validation on all inputs

### Compliance
- GDPR-style data privacy principles
- Right to data deletion
- Audit logging for sensitive operations
- Regular security audits

---

## 7. Deployment Architecture

### Development
```text
Docker Compose
├── Frontend (React Dev Server)
├── Backend (Node.js + MongoDB Atlas + Redis)
└── AI Service (Node.js + LangChain.js)
```

### Production
```text
                     ┌──────────────┐
                     │    CDN       │
                     │ (CloudFront) │
                     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │   Load       │
                     │  Balancer    │
                     └──────┬───────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │ Frontend     │ │  Backend     │ │  AI Service  │
     │ (Next.js)    │ │ (Node.js)    │ │ (Node.js)    │
     │  Replicas    │ │  Replicas    │ │  Replicas    │
     └──────────────┘ └──────┬───────┘ └──────┬───────┘
                              │                │
                              ▼                ▼
                        ┌──────────┐    ┌──────────┐
                        │MongoDB   │    │ Redis    │
                        │  Atlas   │    │(Cache)   │
                        └──────────┘    └──────────┘
                              │
                              ▼
                        ┌──────────┐
                        │   S3     │
                        │ (Files)  │
                        └──────────┘
```

### CI/CD Pipeline
1. Push to `main` branch triggers build
2. Run tests (unit, integration, lint)
3. Build Docker images
4. Deploy to staging environment
5. Run smoke tests
6. Deploy to production (manual approval)

---

## 8. API Design

### RESTful Endpoints

#### User & Auth
- `POST /api/auth/register` – User registration
- `POST /api/auth/login` – User login
- `POST /api/auth/refresh` – Refresh access token
- `POST /api/auth/logout` – User logout

#### Profile
- `GET /api/profile` – Get current user profile
- `PUT /api/profile` – Update profile
- `POST /api/profile` – Create profile

#### Documents
- `POST /api/documents` – Upload document
- `GET /api/documents` – List user documents
- `GET /api/documents/:id` – Get document details
- `DELETE /api/documents/:id` – Delete document
- `POST /api/documents/:id/ocr` – Extract text via OCR

#### Opportunities
- `GET /api/opportunities/jobs` – List government jobs
- `GET /api/opportunities/schemes` – List government schemes
- `GET /api/opportunities/:id` – Get opportunity details

#### Recommendations
- `POST /api/recommendations/jobs` – Get personalized job recommendations
- `POST /api/recommendations/schemes` – Get personalized scheme recommendations
- `POST /api/recommendations/career` – Get career guidance

#### Applications
- `POST /api/applications` – Create application
- `GET /api/applications` – List user applications
- `GET /api/applications/:id` – Get application details
- `PUT /api/applications/:id` – Update application
- `DELETE /api/applications/:id` – Delete application

#### Notifications
- `GET /api/notifications` – List notifications
- `PUT /api/notifications/:id/read` – Mark as read
- `POST /api/notifications/preferences` – Update preferences

#### AI Assistant
- `POST /api/assistant/chat` – Send message to AI assistant
- `POST /api/assistant/eligibility` – Check eligibility for specific opportunity

---

## 9. Scalability Considerations

### Horizontal Scaling
- Stateless backend services allow horizontal scaling
- Database read replicas for heavy read workloads
- AI service can scale independently based on queue depth

### Performance
- Redis caching for frequent queries (opportunities, user profiles)
- CDN for static assets and document downloads
- Database indexing on frequently queried fields (userId, opportunityId, deadlines)
- Async processing for heavy AI tasks (OCR, bulk recommendations) using message queues

### Cost Optimization
- Serverless functions for sporadic AI workloads (OCR, notifications)
- S3 Intelligent-Tiering for document storage
- Scheduled jobs for deadline reminders instead of polling

---

## 10. Future Extensions

### Planned Enhancements
- **Mobile App:** React Native or Flutter wrapper
- **Voice Assistant:** Web Speech API integration
- **Multi-language:** i18n framework with Indian language support
- **WhatsApp Bot:** WhatsApp Business API integration
- **Government Portal Integration:** Direct API integrations where available
- **Analytics Dashboard:** For admins to track platform usage and popular opportunities

---

## 11. Development Phases

### Phase 1 – Core Platform (MVP)
- User authentication and profile management
- Document vault with basic upload
- Basic job/scheme listing
- Simple eligibility checking
- Manual application tracking

### Phase 2 – AI Integration
- LLM-powered eligibility engine
- Personalized recommendations
- OCR-based document extraction
- AI assistant chatbot

### Phase 3 – Advanced Features
- Deadline tracking and notifications
- Form pre-filling assistant
- Career guidance
- Calendar integration

### Phase 4 – Scale & Extend
- Multi-language support
- Voice assistant
- WhatsApp notifications
- Government portal integrations
- Mobile application
