# Backend Agent Instructions
<!-- ไฟล์นี้ใช้สำหรับบอกแนวทางให้ Agent/ผู้ช่วยโค้ด เมื่อต้องพัฒนา backend ของโปรเจ็กต์นี้ -->

## Project Snapshot
<!-- สรุปเทคโนโลยีและภาพรวมแบบสั้น ๆ เพื่อให้เข้าใจบริบทเร็ว -->

This repository contains a Node.js CRUD backend built with:
- **Runtime**: Node.js
- **HTTP framework**: Express (see `server/package.json`)
- **Database**: MySQL via `mysql2` (pool in `server/config/conn.js`)
- **Authentication**:
  - JWT access token returned in the JSON response (`Authorization: Bearer <token>`)
  - Refresh token stored in DB and also set as an HTTP-only cookie named `refreshToken`
- **Logging**: `morgan`
- **CORS**: `cors` (configured for `http://localhost:3000` in `server/server.js`)

## Folder Layout (Server)
<!-- โครงสร้างโฟลเดอร์หลักของ backend -->

```text
server/
  server.js                 # App entrypoint; auto-loads every file in routes/ and mounts under /api
  .env                      # Environment variables (do not commit secrets)
  package.json              # Dependencies and scripts
  readme_dev.md             # Small dev notes
  config/
    conn.js                 # MySQL pool + connectivity check
  controllers/
    auth.js                 # Login/logout/register/refresh token handlers
    users.js                # User CRUD handlers
  middleware/
    auth_check.js           # Verifies JWT access token from Authorization header
    admin_check.js          # Checks is_admin = 1 for admin-only routes
  routes/
    auth.js                 # /api/login, /api/logout, /api/register, /api/refareshToken
    users.js                # /api/users CRUD (protected)
```

## How Requests Flow
<!-- อธิบาย flow การทำงาน: route -> middleware -> controller -> DB -->

1. `server/server.js` mounts all route modules found in `routes/` under `/api`.
2. Route files attach middlewares and map endpoints to controller functions.
3. Controllers talk to MySQL through `pool` from `config/conn.js`.
4. Auth uses JWT:
   - Access token is validated by `middleware/auth_check.js`.
   - Refresh token is used by the refresh endpoint in `controllers/auth.js`.

## API Surface (Current)
<!-- สรุป endpoint ที่มีอยู่ เพื่อให้ Agent เห็นภาพรวม -->

- Auth
  - `POST /api/login`
  - `POST /api/logout` (requires access token)
  - `POST /api/register`
  - `GET /api/refareshToken` (reads `refreshToken` cookie)
- Users (admin only)
  - `GET /api/users`
  - `GET /api/users/:id`
  - `POST /api/users`
  - `PUT /api/users/:id`
  - `DELETE /api/users/:id`

## Conventions to Follow
<!-- กติกา/แนวทางเวลาแก้ไขโค้ด เพื่อให้โค้ดสม่ำเสมอและปลอดภัย -->

- **Match the module style of the file you edit**: this codebase currently mixes CommonJS (`require/module.exports`) and ESM (`import/export`). Avoid refactors unless explicitly requested.
- **Do not edit `node_modules/`**.
- **Keep routes thin**: parameter parsing + middleware wiring only.
- **Keep controllers focused**: validation, business logic, response formatting.
- **Use parameterized queries** with `?` placeholders (already used throughout) to reduce SQL injection risk.
- **Return consistent JSON**: `{ success: boolean, message: string, data?: any }` (existing pattern in controllers).
- **Error handling**: use `try/catch` in async handlers; do not leak secrets to clients.

## Environment Variables
<!-- ตัวแปรสำคัญที่ควรมีใน .env และข้อควรระวัง -->

This backend expects environment variables similar to:
- `mysql_host`, `mysql_user`, `mysql_password`, `mysql_database`, `mysql_port`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `REFRESH_SECRET`, `REFRESH_EXPIRES_IN`

Keep secrets in `.env` and never commit real credentials.

## Local Development
<!-- วิธีรันโปรเจ็กต์แบบรวดเร็ว -->

From `server/`:

```bash
npm install
npm start
```

Server listens on `http://localhost:5000` by default (`server/server.js`).

## When Adding a New Feature
<!-- checklist สั้น ๆ เวลาเพิ่มฟีเจอร์ เพื่อไม่ให้หลงลืมขั้นตอน -->

- Add or extend an API route under `routes/`.
- Implement the logic in `controllers/`.
- Add middleware under `middleware/` only when it is reusable (auth/role checks, validation, etc.).
- Update docs when behavior changes (`readme_dev.md`, `agent_backend.md`, or `skill_backend.md`).

---

**Last Updated**: 2026-05-12
<!-- อัปเดตล่าสุด: 12 พฤษภาคม 2026 -->
