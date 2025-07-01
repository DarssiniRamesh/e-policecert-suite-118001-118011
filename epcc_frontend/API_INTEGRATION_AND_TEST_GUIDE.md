# E-Police Certificate Suite: Frontend-Backend API Integration & Test Guide

This guide explains how the React frontend (`epcc_frontend`) integrates with the FastAPI backend (`epcc_backend`), covering all major user and admin flows—from authentication and certificate applications to status tracking, document uploads, downloads, notifications, and admin management. It outlines how data is exchanged, typical integration pitfalls, and provides test scenarios for thorough QA coverage.

---

## 1. Overview of Integration

### Architecture

- **Frontend**: React SPA (Single-Page App) located in `epcc_frontend`.
- **Backend**: FastAPI REST API under `epcc_backend`.
- **Communication**: JSON over HTTP(S), except for file uploads/downloads (multi-part/form-data and octet-stream).
- **Authentication**: JWT (JSON Web Token) returned on login/registration, stored in `localStorage` (`epcc_token`), and sent as `Authorization: Bearer <token>` for all protected endpoints.

---

## 2. API Authentication Flow & JWT Usage

### Registration

- **Frontend Form**: `/register` page posts to backend `POST /register`.
    - Backend creates user, returns user object.
    - **Token**: Either separate login is made (`POST /token`), or backend directly provides a JWT post-registration.
- **Frontend Storage**: JWT stored in browser `localStorage`.
- **Security**: Token is required for all user-protected endpoints. Expiry is handled by the backend.

### Login

- **Frontend Form**: `/login` page posts to backend (should be `POST /token` for OAuth2-style).
    - User enters credentials, backend validates.
    - On success, frontend receives `access_token` (JWT).
- **Subsequent Requests**: All HTTP calls attach JWT in `Authorization` header.
- **Logout**: Token is cleared from `localStorage`; user is redirected to login.
- **Access Protection**: Frontend guards private/admin routes (`PrivateRoute`, `AdminRoute`). Backend denies access if JWT is invalid/expired.

### Error Cases
- **Invalid JWT**: Backend returns 401; frontend forces logout.
- **Role errors**: Backend returns 403 for forbidden roles (e.g., user accessing admin endpoint).
- **Token expiry**: User is logged out.

---

## 3. Major Frontend–Backend Flows

### 3.1 User Registration / Login

| Action            | Frontend API Call               | Backend Endpoint   |
|-------------------|---------------------------------|--------------------|
| Register          | `POST /auth/register`           | `/register`        |
| Login             | `POST /auth/login`              | `/token`           |

**Typical errors**: duplicate email, invalid password, short password, invalid credentials.

---

### 3.2 Certificate Application Submission, Status, and Downloads

- **Apply for Certificate**
    - Frontend: `/apply` posts form data to `POST /applications`
    - JWT required
    - Backend stores request; triggers notification

- **Check Application Status/History**
    - `GET /applications` (user: only their apps)
    - Table/list display on `/applications`
    - Shows `pending`, `approved`, `rejected`, `issued`, etc.

- **Download Certificate**
    - After status is `issued`, `GET /certificates` returns list of certificates (IDs and metadata).
    - For download: frontend issues `GET /certificates/{certificate_id}/download` (requires JWT).
    - Returns PDF as download (`application/octet-stream`).

**Typical errors**: Submitting invalid applications, download for non-issued certs, expired/inactive token.

---

### 3.3 Admin Dashboard – Approvals, Rejections

| Action                           | Frontend API Call                      | Backend Endpoint                    |
|-----------------------------------|----------------------------------------|-------------------------------------|
| View all applications/users/logs  | `GET /admin/applications` etc.         | `/admin/applications`               |
| Approve/Reject application        | `PATCH /admin/applications/{id}`       | `/admin/applications/{id}`          |
| Issue certificate                 | `POST /admin/applications/{id}/certificates` | `/admin/applications/{id}/certificates` |
| Revoke certificate                | `PATCH /admin/certificates/{id}/revoke`| `/admin/certificates/{id}/revoke`   |

- Only users with `admin` or `officer` role can access/admin actions.
- If a normal user tries to access, backend returns 403, UI shows permission denied.

**Typical errors**: Permission denied, app not found, not authorized, status mismatch (approve when not pending, etc).

---

### 3.4 Notifications & Language Switching

- **Notifications**
    - Frontend: `/notifications` page calls `GET /notifications` (JWT required)
    - Lists notifications (application approved/rejected, cert issued, etc.)
    - Mark-as-read: `PATCH /notifications/{id}/markread`
    - Backend restricts access to only own notifications

- **Language Toggle**
    - Frontend switches between English and Bislama (`useLang()` context).
    - Backend returns error/info messages in desired language if `Accept-Language` header is sent.
    - Frontend displays local translations for UI; API/system errors are passed through as-is.

---

### 3.5 Document Uploads & Downloads

- **Upload Document**
    - Frontend: `/upload` page posts file via multipart to `POST /documents/upload` with application_id.
    - Returns document info, triggers backend audit log.
- **Download Document**
    - GET `/documents/download/{filename}` (protected)

**Typical errors**: File too large/invalid, missing application, wrong app/user, unauthorized.

---

## 4. Typical Integration/API Errors

- **Mismatched endpoint paths**: Frontend may refer to `/auth/login` but backend expects `/token`.
- **Incorrect payload shape**: E.g. registration expects `{email, full_name, password}`; login via OAuth2 expects form fields, not JSON.
- **Missing or invalid JWT**: Returns 401; triggers forced logout.
- **CORS misconfiguration**: Requests blocked if backend CORS isn't permissive.
- **Role mismatch**: Backend 403 error for admin endpoints.
- **API versioning or schema changes**: Fields may be missing/renamed.
- **File upload/download issues**: Wrong content-type; missing headers; improper fetch logic for blobs.

---

## 5. Example Test Scenarios

### UI Scenarios

1. **User Registration/Login**
    - Register new user, verify redirected to dashboard and JWT is saved.
    - Login as new user, verify access to dashboard, notifications page, cannot reach admin.

2. **Certificate Application Flow**
    - As user, submit application. Verify it's added and status is "pending".
    - Reload page; status persists.
    - Try submitting with missing/invalid fields; ensure error message displays.

3. **Status & Download**
    - As user, check `/applications` shows application history.
    - After approval (admin flow), download certificate.
    - Try to download certificate before it is issued (should fail).

4. **Document Upload**
    - Upload a file to an application.
    - Download that file.

5. **Notifications**
    - Verify notifications are shown when application submitted/approved.
    - Mark notification as read, confirm state updates.

6. **Language Switching**
    - Toggle language; check UI, errors, and notifications switch language.

---

### Backend API Scenarios

1. **Endpoints protection**
    - Access a protected endpoint with missing, invalid, or expired JWT.
    - Try admin actions as a normal user.

2. **Application Lifecycle**
    - Submit as user → review as admin → approve/reject → issue certificate.
    - Check audit logs as admin.

3. **Rate-limiting or brute force attempts on login/registration.**

4. **Malformed payloads**: send wrong/missing fields; backend returns 422.

5. **Boundary checks**: e.g. max-length string fields, file sizes.

---

## 6. Integration Checklist

- [ ] All endpoints mapped correctly between frontend and backend (`api.js` functions and form actions).
- [ ] JWT is properly attached to every user/admin request.
- [ ] Auth guards are enforced (both frontend route and backend endpoint-level).
- [ ] Error messages are shown in correct language and format.
- [ ] File upload/download logic handles multipart and binary blobs.
- [ ] Role checks verified for admin flows.
- [ ] Test coverage exists for all major flows and edge/error cases.

---

## 7. References

- **Backend OpenAPI**: [FastAPI Swagger UI](https://vscode-internal-549484-beta.beta01.cloud.kavia.ai:3001/docs)
- **Frontend Preview**: [React App Preview](https://vscode-internal-549484-beta.beta01.cloud.kavia.ai:3000/preview.html)

---

## 8. Example API Interactions

### Login

```js
const resp = await apiRequest("/token", "POST", { username, password });
// resp.access_token
```

### Authenticated GET

```js
const data = await apiRequest("/applications", "GET", null, getAuthToken());
```

### File Upload

```js
const formData = new FormData();
formData.append("application_id", appId);
formData.append("file", fileObj);
await apiRequest("/documents/upload", "POST", null, getAuthToken(), formData);
```

### Download Certificate

```js
const resp = await fetch("/certificates/123/download", {
  headers: { "Authorization": `Bearer ${token}` }
});
const blob = await resp.blob();
// createObjectURL and download
```

---

## 9. Common Pitfalls

- Using wrong HTTP method (GET vs POST/PATCH)
- Not sending JWT, or not handling expired tokens
- Trying to access admin/user endpoints with wrong roles
- Not matching expected field names (e.g. `details` vs `info`)
- Not mapping frontend status values to backend enums
- Downloading files with improper Content-Type handling in JS

**Best practice:** Always check backend API docs and update frontend accordingly.

---

## 10. Conclusion

This guide should cover all developer and QA needs for integration, flow verification, and API troubleshooting between the E-Police Certificate React frontend and FastAPI backend.

