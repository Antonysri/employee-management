# 📡 Backend API Reference & Specifications

Enterprise Employee Management System RESTful API documentation.

* **Base URL:** `http://localhost:3000/api/v1`
* **Content-Type:** `application/json`
* **Authentication:** Bearer JWT Token (`Authorization: Bearer <token>`)

---

## 🔐 1. Authentication & Session Endpoints (`/api/v1/auth`)

| Method | Endpoint | Access | Rate Limit | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Standard | Authenticates credentials and issues signed JWT access token |
| `POST` | `/api/v1/auth/setup-password` | Public | Standard | Verifies 24h invitation token and sets initial password for invited employee |
| `GET` | `/api/v1/auth/me` | Authenticated | Standard | Retrieves authenticated user profile with linked employee data |
| `POST` | `/api/v1/auth/resend-invitation` | `ADMIN`, `HR` | Standard | Generates fresh 24h token and resends activation email |
| `POST` | `/api/v1/auth/logout` | Authenticated | Standard | Revokes active JWT sessions via `lastLogoutAt` and clears cookies |
| `POST` | `/api/v1/auth/forgot-password` | Public | 60s Cooldown | Generates 6-digit OTP (5-min expiry), sends email, anti-enumeration protected |
| `POST` | `/api/v1/auth/verify-reset-code`| Public | 5 Attempts | Verifies 6-digit OTP, enforces 5-attempt limit, issues 15-min `resetToken` |
| `POST` | `/api/v1/auth/reset-password` | Public | Standard | Sets new password via `resetToken` and revokes all active sessions |

---

## 👥 2. Employee Management Endpoints (`/api/v1/employees`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/employees` | `ADMIN`, `HR` | Creates employee record and starts account invitation workflow |
| `GET` | `/api/v1/employees` | `ADMIN`, `HR` | Lists employees with pagination, regex search (`?search=`), and filters |
| `GET` | `/api/v1/employees/:id` | `ADMIN`, `HR` | Retrieves single employee details by MongoDB ObjectId |
| `PATCH`| `/api/v1/employees/:id` | `ADMIN`, `HR` | Partial update of employee fields (min 1 field required) |
| `DELETE`| `/api/v1/employees/:id`| `ADMIN` Only | Soft deletes (`INACTIVE`) by default; `?permanent=true` for hard delete |

---

## 🎭 3. Role-Based Access Control (RBAC) Matrix

| Endpoint Action | `ADMIN` | `HR` | `EMPLOYEE` | Public |
| :--- | :---: | :---: | :---: | :---: |
| **Login / Forgot Password / Setup Password** | ✅ | ✅ | ✅ | ✅ |
| **View Own Profile (`GET /auth/me`)** | ✅ | ✅ | ✅ | ❌ |
| **List Employees (`GET /employees`)** | ✅ | ✅ | ❌ (403) | ❌ (401) |
| **Create Employee (`POST /employees`)** | ✅ | ✅ | ❌ (403) | ❌ (401) |
| **Resend Invitation (`POST /auth/resend-invitation`)**| ✅ | ✅ | ❌ (403) | ❌ (401) |
| **Update Employee (`PATCH /employees/:id`)** | ✅ | ✅ | ❌ (403) | ❌ (401) |
| **Soft Delete Employee (`DELETE /employees/:id`)** | ✅ | ❌ (403) | ❌ (403) | ❌ (401) |
| **Hard Delete Employee (`DELETE ?permanent=true`)** | ✅ | ❌ (403) | ❌ (403) | ❌ (401) |

---

## 🚦 4. Common HTTP Status Codes

| Code | Status | Meaning |
| :--- | :--- | :--- |
| **`200`** | OK | Request succeeded (GET, PATCH, Login, Password Reset) |
| **`201`** | Created | New resource created (POST Employee) |
| **`400`** | Bad Request | Zod validation failed / Invalid OTP / Expired Token / Attempt limit exceeded |
| **`401`** | Unauthorized | Missing, invalid, expired, or logged-out JWT token / Wrong login credentials |
| **`403`** | Forbidden | Valid user but role not authorized / Account deactivated or invited |
| **`404`** | Not Found | Route does not exist / Employee ID not found in database |
| **`409`** | Conflict | Duplicate employee email already exists |
| **`429`** | Too Many Requests | Rate limit exceeded (General 100 req/15min OR Forgot Password 60s cooldown) |
| **`500`** | Internal Server Error | Unhandled server error (Centralized via `errorHandler.js`) |