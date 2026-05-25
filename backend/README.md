# LegalConnect — Spring Boot 3 Backend

Modernized backend for a legal services marketplace. Migrated from a raw Java Servlet + JDBC codebase to Spring Boot 3, Spring Security (JWT), Spring Data JPA, and Flyway.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Spring Boot 3.3 |
| Security | Spring Security 6 + JWT (jjwt 0.12) |
| Database | MySQL 8+ via Spring Data JPA + Hibernate |
| Migrations | Flyway |
| File uploads | Spring MultipartFile → local disk |
| AI assistant | Gemini 2.0 Flash (Google AI) |
| Build | Maven |
| Java | 21 |

---

## Project Structure

```
com.legalconnect
├── config/          SecurityConfig, JwtUtil, JwtAuthFilter, FileStorageConfig
├── entity/          User, Client, Lawyer, Case, CaseTimeline, CaseMessage,
│                    Notification, LawyerReview, Complaint, AdminLog
├── repository/      Spring Data JPA interfaces (one per entity)
├── service/         AuthService, CaseService, LawyerService, MessageService,
│                    AdminService, NotificationService, AiService
├── controller/      AuthController, CaseController, LawyerController,
│                    ClientController, MessageController, NotificationController,
│                    AdminController, AiController
├── dto/             Dto.java — all request/response records
└── exception/       AppException, GlobalExceptionHandler
```

---

## Roles

| Role | Access |
|---|---|
| `client` | Submit cases, track status, chat, review lawyers, file complaints |
| `lawyer` | Browse pending cases, accept cases, manage status lifecycle, chat |
| `admin` | Verify lawyers, manage accounts, resolve complaints, view audit logs |

---

## Setup

### 1. Create the database

```sql
CREATE DATABASE legalconnect_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your DB credentials, JWT secret, and Gemini API key
```

Or set environment variables directly. The application reads:

```
DB_URL, DB_USER, DB_PASSWORD
JWT_SECRET
GEMINI_API_KEY, GEMINI_MODEL
UPLOAD_DIR
```

### 3. Run

```bash
mvn spring-boot:run
```

Flyway will run `V1__create_core_tables.sql` and `V2__create_feature_tables.sql` on startup.

---

## API Reference

### Auth — `/api/auth` (public)

```
POST /api/auth/login                 Body: { email, password }
POST /api/auth/register/client       Body: { firstName, lastName, email, phone, city, password }
POST /api/auth/register/lawyer       Body: { ...client fields, barNumber, stateLicensed, yearsExperience, specialization, hourlyRate }
POST /api/auth/change-password       Auth required. Body: { currentPassword, newPassword }
PATCH /api/auth/profile              Auth required. Body: { firstName, lastName, phone, city }
```

All authenticated endpoints require `Authorization: Bearer <token>`.

### Cases — `/api/cases`

```
POST   /api/cases                    CLIENT. Multipart: caseTitle, caseType, city, urgency, budget, caseDescription, document(file)
GET    /api/cases/my                 CLIENT. Own cases list.
GET    /api/cases/tracker            CLIENT. Detailed tracker with lawyer info + review eligibility.
GET    /api/cases/pending            LAWYER. All pending cases.
GET    /api/cases/active             LAWYER. Own active/in-progress cases.
POST   /api/cases/{id}/accept        LAWYER. Atomically accept a pending case.
PATCH  /api/cases/{id}/status        LAWYER. Body: { status, note }. Statuses: active, in_progress, resolved, closed.
GET    /api/cases/{id}/timeline      CLIENT | LAWYER | ADMIN. Full timeline for a case.
```

### Lawyers — `/api/lawyers`

```
GET    /api/lawyers/search           PUBLIC. Params: specialization, experience, hourlyRate, location.
GET    /api/lawyers/stats            LAWYER. Dashboard stats.
PATCH  /api/lawyers/profile          LAWYER. Body: { bio, primarySpecialization, hourlyRate, cityPractice, yearsExperience }
```

### Client Actions — `/api/client`

```
POST   /api/client/reviews           CLIENT. Body: { caseId, rating (1-5), reviewText }
POST   /api/client/complaints        CLIENT | LAWYER. Body: { caseId, description }
```

### Messages — `/api/messages`

```
GET    /api/messages/chats           CLIENT | LAWYER. Chat list with unread counts.
GET    /api/messages/{caseId}        CLIENT | LAWYER. Messages for a case. Marks incoming as read.
POST   /api/messages/{caseId}        CLIENT | LAWYER. Multipart: messageText (optional), file (optional).
```

### Notifications — `/api/notifications`

```
GET    /api/notifications            All roles. User's notification list.
POST   /api/notifications/read       All roles. Marks all notifications as read.
```

### Admin — `/api/admin` (ADMIN only)

```
GET    /api/admin/stats              Platform dashboard numbers.
GET    /api/admin/lawyers            All lawyers (verified and pending).
POST   /api/admin/lawyers/action     Body: { targetUserId, action }. Actions: verify, unverify, suspend, activate.
GET    /api/admin/complaints         All complaints.
PATCH  /api/admin/complaints/{id}    Body: { status, resolutionNote }. Statuses: open, in_review, resolved.
GET    /api/admin/logs               Last 100 admin actions.
```

### AI Assistant — `/api/ai` (authenticated)

```
POST   /api/ai/support               Body: { message, history: [{ role, text }] }
```

---

## Key Business Rules (Preserved from Original)

1. **Atomic case acceptance** — `UPDATE cases SET ... WHERE case_status = 'pending'` (native query). First lawyer to POST wins; all others get a 409.
2. **Lawyer verification gate** — newly registered lawyers have `is_verified = false` and `is_active = false`. Admin must verify before they can log in or accept cases.
3. **One review per case** — `lawyer_reviews.case_id` is UNIQUE. Enforced at DB and service layer.
4. **Review only after resolution** — review submission is rejected if case status is still `pending`.
5. **Complaint counterparty is computed** — client files against their case's lawyer; lawyer files against the client. Never passed in the request.
6. **Timeline is append-only** — every status change writes a new row. Nothing is updated or deleted.
7. **Notifications broadcast on case events** — new case → all verified lawyers; acceptance → client; status change → client; resolved/closed → client gets "rate your lawyer" notification.
8. **Admin actions are logged** — every verify/suspend/activate/unverify writes to `admin_logs`.

---

## Password Migration Note

The original backend used SHA-256 for passwords. Spring Boot uses BCrypt. Newly registered users get BCrypt hashes automatically. For existing users migrated from the old system:

**Option A (recommended):** Force a password reset on first login by checking for SHA-256 format and prompting the user to set a new password.

**Option B:** One-time migration script to set a temporary BCrypt password and email users.

---

## File Uploads

Uploaded files are stored under `UPLOAD_DIR` (default `./uploads`):
- Case documents → `uploads/case_documents/`
- Chat file attachments → `uploads/chat_files/`

Files are served as static resources at `/uploads/**`.

---

## Running Tests

```bash
mvn test
```
