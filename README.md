# 1. UniShowcase

UniShowcase is a secure student project showcase platform that connects students with recruiters and administrators through authenticated, role-based functionality. It serves as a central hub where students can manage their project portfolios, and recruiters can discover and follow emerging talent.

## 2. Features

- **Google OIDC Authentication:** Secure identity verification using Google Sign-In.
- **Role-Based Access Control:** Differentiated access for Students, Recruiters, and Admins.
- **Student Project Management:** Create, edit, and manage visibility of academic projects.
- **Recruiter Project Discovery:** Search and discover peer and student projects.
- **Project Visibility/Approval:** Admin and Recruiter controlled public visibility for projects.
- **Likes & Following:** Engage with projects and follow top students.
- **Real-Time Notifications:** Live Socket.IO-powered updates for project approvals and likes.
- **Cloudinary Media Integration:** Secure cloud storage for project covers and screenshots.
- **Invitation-Based Registration:** Token-gated system to control access and role assignment.
- **User Profile Management:** Dedicated authenticated endpoints for managing contact details and organizations.
- **Pagination & Search:** Securely bounded pagination and sanitized regex search functions.

## 3. Technology Stack

| Layer          | Technology           |
| -------------- | -------------------- |
| Frontend       | React 19             |
| Build Tool     | Vite                 |
| Styling        | Tailwind CSS         |
| Animation      | Framer Motion        |
| Routing        | React Router v7      |
| Backend        | Node.js / Express.js |
| Database       | MongoDB              |
| ODM            | Mongoose             |
| Authentication | Google OIDC + JWT    |
| Real-time      | Socket.IO            |
| Media Storage  | Cloudinary           |

## 4. Application Architecture

UniShowcase utilizes a standard, decoupled MERN-like architecture integrating third-party OIDC and Cloud services:

Browser / React frontend
↓
Express REST API
↓
Authentication & authorization middleware
↓
Service/controller layer
↓
MongoDB/Mongoose

- **Google OIDC:** Handles initial user identity and cryptographically guarantees user emails/names via Google Identity Services.
- **Internal JWT:** Maintains the internal session and identifies the user across the Express REST API.
- **Socket.IO:** Facilitates real-time, low-latency push notifications.
- **Cloudinary:** Offloads heavy media storage from the backend Node.js server, directly serving optimized images to the frontend.

## 5. Authentication & Authorization

The authentication flow utilizes a combination of OpenID Connect (OIDC) and custom JSON Web Tokens (JWT):

1. User initiates Google Sign-In on the frontend.
2. Google authenticates the user and provides a Google OIDC ID token.
3. Frontend sends the ID token to the backend `/api/auth/google` endpoint.
4. Backend validates the token via Google's `tokeninfo` API endpoint.
5. The Google audience (`aud`) is cryptographically checked against `GOOGLE_CLIENT_ID`.
6. Invite-token validation is performed where required for new users.
7. The backend creates or resolves the application user in MongoDB.
8. The backend issues its own internal, signed JWT valid for 30 days.
9. Frontend stores this JWT and sends it using the header: `Authorization: Bearer <token>`
10. The Express `protect` middleware verifies the internal JWT signature before permitting route access.
11. The `restrictTo` middleware enforces role-based authorization for administrative routes.

_Note: Logout clears the local session cache and severs active Socket.IO connections gracefully. Browsers do not automatically attach the Bearer token to subsequent requests._

## 6. Role-Based Access Control

Authorization decisions are strictly enforced server-side using the internal JWT payload.

### Student

Students can create projects, upload media, edit/delete their own projects, view public projects, like projects, and update their own user profile (contact number and organization).

### Recruiter

Recruiters can view public projects, follow students, like projects, and update their own user profile.

### Admin

Admins possess elevated privileges allowing them to generate invite tokens, manage all users (update roles, delete accounts), override project visibility status, delete any project globally, and update their own user profile.

_Resource ownership is explicitly checked at the service layer (e.g., verifying `req.user.id === project.studentId`) ensuring users cannot maliciously mutate entities they do not own._

## 7. User Profile

An authenticated-user profile feature allows individuals to safely maintain their platform identity.

The profile provides:

- Username/email identity
- Name
- Email address
- Contact number (optional)
- Organization/business name (optional)
- Role

Updates are processed via the `GET /api/users/me` and `PATCH /api/users/me` endpoints. These endpoints strictly extract the target identity from the verified `req.user.id` token payload. The endpoints do not accept an arbitrary target user ID, mitigating Insecure Direct Object Reference (IDOR) vulnerabilities.

## 8. Security & OWASP Top 10 Mitigations

Six critical security improvements were implemented to harden the application against OWASP Top 10 vulnerabilities:

| #   | Vulnerability           | OWASP Category                           | Severity | Mitigation                                                                                                                                  |
| --- | ----------------------- | ---------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Hardcoded JWT Secret    | A07 - Identification and Auth Failures   | High     | Removed unsafe fallback secret. `JWT_SECRET` is strictly required via `.env`; the server securely crashes at startup if missing.            |
| 2   | Stored XSS via URLs     | A03 - Injection                          | High     | Enforced strict backend URL protocol validation (`http:`, `https:`), explicitly rejecting malicious `javascript:` schemes on project links. |
| 3   | NoSQL ReDoS             | A03 - Injection                          | High     | Prevented unbounded MongoDB `$regex` evaluation via a centralized `escapeRegex` utility and strict maximum string lengths (100 chars).      |
| 4   | Pagination DoS          | A05 - Security Misconfiguration          | High     | Capped unbounded pagination `limit` parameters to a maximum of 100 via a safe parsing utility to prevent memory exhaustion (OOM).           |
| 5   | CORS Misconfiguration   | A05 - Security Misconfiguration          | Moderate | Removed permissive `.vercel.app` wildcard trust. Replaced with explicit `ALLOWED_ORIGINS` string matching.                                  |
| 6   | Vulnerable Dependencies | A06 - Vulnerable and Outdated Components | High     | Safely patched DoS/CSRF vulnerabilities across 8 transitive/direct dependencies. Final `npm audit` confirms 0 vulnerabilities.              |

_Note regarding CORS: Because the application uses Bearer tokens rather than ambient authentication cookies, the CORS misconfiguration was mitigated as a cross-origin API boundary violation rather than a traditional Cross-Site Request Forgery (CSRF) exploit._

## 9. Existing Security Controls

In addition to the six remediations, the application leverages the following active controls:

- Server-side JWT verification
- Google ID-token validation
- Audience validation
- Role-based middleware
- Resource ownership checks
- Environment-based secrets
- URL validation
- Search input sanitization
- Pagination bounds
- Explicit CORS allowlisting
- Dependency auditing
- Input validation

## 10. Database

UniShowcase utilizes **MongoDB** as its data store, interfacing through the **Mongoose** ODM.

The application utilizes six primary collections: `users`, `projects`, `invitations`, `likes`, `followers`, and `notifications`.

### Database Initialization

```bash
cd Backend
npm run init-db
```

The `init-db.js` script connects via `MONGODB_URI`, explicitly initializes the required structural collections, and synchronizes critical model-defined database indexes (e.g., unique constraints for emails and tokens). It safely catches collision errors and can be run repeatedly without data loss.

### Admin Seeding

```bash
node seedAdmin.js
```

Seeds the initial administrator row-level data to bootstrap the platform. _(Note: This script performs data entry, whereas `init-db` constructs the actual database architecture)._

## 11. Prerequisites

- Node.js 18+
- MongoDB local instance or MongoDB Atlas cluster
- Google Cloud Console project (for OAuth credentials)
- Cloudinary account
- SMTP credentials (for invitation emails)

## 12. Environment Variables

Create `.env` files in both the `Backend` and `frontend` directories based on the provided `.env.example` templates. **Never commit actual `.env` files.**

### Backend `.env`

- `PORT` (Optional, defaults to 5000)
- `MONGODB_URI` (Required): `your_mongodb_connection_string`
- `JWT_SECRET` (Required): `your_secure_random_secret`
- `GOOGLE_CLIENT_ID` (Required): `your_google_client_id`
- `FRONTEND_URL` (Required): `http://localhost:5173`
- `ALLOWED_ORIGINS` (Optional): Comma-separated CORS origins.
- `SMTP_HOST` (Required)
- `SMTP_PORT` (Required)
- `SMTP_USER` (Required)
- `SMTP_PASS` (Required)
- `CLOUDINARY_CLOUD_NAME` (Required)
- `CLOUDINARY_API_KEY` (Required)
- `CLOUDINARY_API_SECRET` (Required)

### Frontend `.env`

- `VITE_BACKEND_URL` (Required): `http://localhost:5000`
- `VITE_GOOGLE_CLIENT_ID` (Required): `your_google_client_id`

## 13. Installation & Setup

Clone the repository:

```bash
git clone <repository-url>
cd <repository-directory>
```

Install Backend dependencies:

```bash
cd Backend
npm install
```

Install Frontend dependencies:

```bash
cd frontend
npm install
```

Initialize the database structure and indexes:

```bash
cd Backend
npm run init-db
```

Seed the initial administrator:

```bash
cd Backend
node seedAdmin.js
```

## 14. Running the Application

Start the backend server (runs on `http://localhost:5000` by default):

```bash
cd Backend
npm run dev
```

Start the frontend server (runs on `http://localhost:5173` by default):

```bash
cd frontend
npm run dev
```

## 15. Testing & Security Verification

The following verification steps were executed to guarantee system stability and security:

### Security Verification

- **URL Validation Tests:** Verified rejection of malicious `javascript:` schemes on project links.
- **ReDoS/Search Tests:** Confirmed regex sanitization safely escapes reserved metacharacters.
- **Pagination Boundary Tests:** Verified queries block astronomical limits and safely cap at 100 records.
- **CORS Origin Tests:** Confirmed unverified Vercel subdomain origins are rejected.
- **JWT Secret Startup Validation:** Ensured the backend crashes securely if `JWT_SECRET` is unset.

### Dependency Audit

```bash
npm audit
```

_Final result: 0 vulnerabilities found._

### Frontend Build

```bash
npm run build
```

_Confirmed Vite builds optimized production chunks successfully._

### Database Initialization

- Verified `npm run init-db` runs idempotently without crashing when existing structures are detected.

### Profile Testing

- Verified Contact Number regex appropriately rejects malformed strings.
- Confirmed users can strictly only modify their own profile data (`/api/users/me`).
- Verified updated fields persist between sessions.

## 16. Deployment

### Local Development

The application communicates over standard HTTP during local development.

### Production

The application is configured for deployment via Vercel (`vercel.json`). When deployed, Vercel edge networks natively provide robust HTTPS/TLS termination. Because the system utilizes standard Bearer tokens inside the `Authorization` header, it sidesteps the browser limitations associated with `Secure` cookie flags. Environment variables must be securely injected via the deployment provider dashboard.

## 17. Project Structure

```text
UniShowcase/
├── Backend/
│   ├── src/
│   ├── init-db.js
│   ├── seedAdmin.js
│   └── package.json
├── frontend/
│   ├── src/
│   └── package.json
└── README.md
```
