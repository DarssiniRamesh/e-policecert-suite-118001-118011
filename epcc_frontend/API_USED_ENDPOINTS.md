# API Calls Used in epcc_frontend

This document lists all backend API calls (endpoint paths, HTTP methods, request bodies/params, and authentication requirements) used throughout the React frontend code (`epcc_frontend`). It enables cross-checking with backend API docs and helps ensure consistency.

---

## Legend:
- **[auth]**: JWT required in Authorization header
- **Params**: Request body or URL params
- **Source**: Filename/component making the call

---

### 1. Authentication & Registration

#### **POST /auth/register**
- **Source**: `src/pages/RegisterPage.js`
- **Body**: `{ name, email, password }`
- **Description**: Registers a new user. Expects a name, an email, and password.
- **Notes**: The backend expects `POST /register` with `full_name`, not `name`. JWT is expected (see code: saves token on success).

#### **POST /auth/login**
- **Source**: `src/pages/LoginPage.js`
- **Body**: `{ email, password }`
- **Description**: Login endpoint, expects user credentials and returns a JWT on success.
- **Notes**: The backend expects `POST /token` with OAuth2 form-encoded fields, not JSON.

---

### 2. Certificate Applications

#### **GET /applications/user**
- **Source**: `src/pages/UserApplications.js`
- **Auth**: [auth]
- **Description**: Fetches applications for the current user.
- **Notes**: Backend only exposes `GET /applications` for user scope; `/applications/user` does not exist.

#### **GET /applications**
- **Source**: Usage inferred in integration guide, expected in `UserApplications` for correct implementation.
- **Auth**: [auth]
- **Description**: Should fetch applications for current user.

#### **POST /applications**
- **Source**: `src/pages/ApplicationForm.js`
- **Auth**: [auth]
- **Body**: `{ type, info }`
- **Description**: Submits a new application.
- **Notes**: Backend expects `{ details }` not `{ type, info }`.

---

### 3. Admin Flows

#### **GET /admin/applications**
- **Source**: `src/pages/AdminDashboard.js`
- **Auth**: [auth, admin]
- **Description**: List all certificate applications (admin/officer only).

#### **PATCH /admin/applications/{id}**
- **Source**: `src/pages/AdminDashboard.js`
- **Body**: `{ status }`
- **Auth**: [auth, admin]
- **Description**: Approve/reject a certificate application.

#### **GET /admin/users**
- **Source**: `src/pages/AdminDashboard.js`
- **Auth**: [auth, admin]
- **Description**: Obtains a list of users (**not implemented in backend**; returns 404).

---

### 4. Notifications

#### **GET /notifications**
- **Source**: `src/pages/Notifications.js`
- **Auth**: [auth]
- **Description**: List all notifications for logged-in user.

---

### 5. Documents

#### **POST /documents/upload**
- **Source**: `src/pages/DocumentUpload.js`
- **Auth**: [auth]
- **Form fields**: (wrong!) 
  - `document` (should be: application_id, file)
- **Description**: Uploads a file; backend expects application_id and file, but frontend POSTs only the document.

---

### 6. Certificates

#### **GET /certificates**
- **Source**: `src/pages/Downloads.js`
- **Auth**: [auth]
- **Description**: Gets all owned/issued certificates.

#### **GET /certificates/{id}/download**
- **Source**: `src/pages/Downloads.js`
- **Auth**: [auth]
- **Description**: Download a certificate file.
- **Notes**: This endpoint is not implemented in backend (no download by cert id).

---

## Summary Table

| Endpoint                       | Method | Frontend Source                  | Has Auth | Matches Backend? | Notes                        |
|---------------------------------|--------|-------------------------------|----------|------------------|------------------------------|
| /auth/register                  | POST   | RegisterPage.js                | No       | NO               | Path and payload mismatch    |
| /auth/login                     | POST   | LoginPage.js                   | No       | NO               | Path and payload mismatch    |
| /applications                   | POST   | ApplicationForm.js             | Yes      | NO (payload)     | Field name mismatch          |
| /applications                   | GET    | UserApplications.js            | Yes      | YES              | Correct if fixed            |
| /applications/user              | GET    | UserApplications.js            | Yes      | NO               | Path does not exist          |
| /admin/applications             | GET    | AdminDashboard.js              | Yes      | YES              |                             |
| /admin/applications/{id}        | PATCH  | AdminDashboard.js              | Yes      | YES              |                             |
| /admin/users                    | GET    | AdminDashboard.js              | Yes      | NO               | Not implemented backend      |
| /notifications                  | GET    | Notifications.js               | Yes      | YES (if response mapped) |
| /documents/upload               | POST   | DocumentUpload.js              | Yes      | NO (params)      | No application_id            |
| /certificates                   | GET    | Downloads.js                   | Yes      | YES              |                             |
| /certificates/{id}/download     | GET    | Downloads.js                   | Yes      | NO               | Not implemented backend      |

---

## Observations and Recommendations

1. Several endpoints (`/auth/register`, `/auth/login`, `/applications/user`, `/admin/users`, `/certificates/{id}/download`) either do not map to the backend or have wrong payload shapes.
2. Registration/login in the frontend uses `/auth/register` and `/auth/login` but backend expects `/register` (with `full_name`) and `/token` (OAuth2 form), respectively.
3. Certificate applications in the frontend send `{ type, info }`, but backend expects `{ details }`.
4. Document upload in the frontend requires fixing parameters — must post both application_id and file using correct field names.
5. The `GET /certificates/{id}/download` endpoint is missing on backend.
6. Admin user listing `/admin/users` is not exposed by the backend; this API will always fail.
7. For compatibility, **frontend needs updating to align with backend route paths and payload formats**.

---

## Sources

Files scanned for API usage:
- `src/api.js`
- `src/pages/RegisterPage.js`
- `src/pages/LoginPage.js`
- `src/pages/ApplicationForm.js`
- `src/pages/UserApplications.js`
- `src/pages/AdminDashboard.js`
- `src/pages/Notifications.js`
- `src/pages/DocumentUpload.js`
- `src/pages/Downloads.js`

---

Task completed: All frontend API calls extracted for cross-checking with backend API documentation.
