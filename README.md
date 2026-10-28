# 🏢 Enterprise Employee Management System (API)

A robust, enterprise-grade Employee Management RESTful API built with **Node.js, Express 5, MongoDB Atlas, Mongoose 9, Zod, Nodemailer, and Vitest**. Architected with strict 3-tier separation of concerns, Role-Based Access Control (RBAC), multi-layered security shields, and real-time automated test coverage.

---

## 🌟 Key Features

* **3-Tier Clean Architecture:** Strict separation between Routes, Validators (Zod), Controllers, Services, Repositories, and Mongoose Models.
* **Role-Based Access Control (RBAC):** Strict boundaries for `ADMIN`, `HR`, and `EMPLOYEE` roles. Zero public registration.
* **Employee Lifecycle & Invitation Workflow:**
  * Admin/HR creates employees in `INVITED` state.
  * Real-time single-use cryptographic invitation tokens (24-hour expiry).
  * Responsive corporate HTML invitation email dispatch via Nodemailer (Gmail SMTP).
* **High-Security Password Reset Flow (6-Digit OTP):**
  * `crypto.randomInt` generated 6-digit numeric OTPs.
  * SHA-256 hashed storage with **5-minute expiration**.
  * **60-second cooldown / rate limit (HTTP 429)** preventing mail server spam.
  * **Anti-enumeration protection** returning generic 200 responses to prevent account scanning.
  * **Brute-Force Shield:** Maximum 5 failed OTP verification attempts before code is invalidated.
  * Temporary 15-minute `resetToken` issued upon successful verification.
  * Immediate session revocation on password change via `lastLogoutAt`.
* **Zero Trust Security Middlewares:** Helmet security headers, CORS allowlist, rate limiting (100 req/15min), 1MB payload limits, and timing-safe bcrypt password hashing (12 rounds).
* **Comprehensive Automated Test Suite:** 32 unit and integration tests powered by **Vitest & Supertest** covering validation, crypto, auth, and employee workflows.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Runtime & Framework** | Node.js (ES Modules), Express 5 |
| **Database & ODM** | MongoDB Atlas, Mongoose 9 |
| **Data Validation** | Zod v4 (Middleware & Param Guards) |
| **Authentication & Tokens** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` (12 rounds) |
| **Cryptography** | Node.js native `crypto` (SHA-256, Secure Random Bytes & Ints) |
| **Email Engine** | Nodemailer (Gmail SMTP, Custom Responsive HTML) |
| **Security Middlewares** | `helmet`, `cors`, `express-rate-limit` |
| **Testing Suite** | Vitest 4, Supertest 7 |

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js (v20+ recommended)
* npm (v10+)
* MongoDB Atlas cluster or local MongoDB instance

### 2. Installation
Clone the repository and install root and workspace dependencies:
```bash
git clone https://github.com/Antonysri/employee-management.git
cd employee-management
npm install