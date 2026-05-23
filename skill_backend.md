# Backend Skill Guide
<!-- ไฟล์นี้เป็น “คู่มือทักษะ” สำหรับงาน backend ของโปรเจ็กต์นี้: ทำอะไร ที่ไหน อย่างไร -->

## Purpose
<!-- อธิบายว่าไฟล์นี้มีไว้ทำอะไร -->

Use this guide as a checklist/template when implementing backend changes in this project (features, bug fixes, or refactors).

## The Patterns Used Here
<!-- สรุปแพทเทิร์นที่ใช้ในโค้ดจริง เพื่อให้ทำตามได้ง่าย -->

- **Routing**: Express routers live in `server/routes/` and are auto-mounted under `/api` by `server/server.js`.
- **Business logic**: Controller functions live in `server/controllers/`.
- **Auth & roles**:
  - `server/middleware/auth_check.js` validates the JWT access token from `Authorization: Bearer <token>`.
  - `server/middleware/admin_check.js` enforces admin-only access (`is_admin = 1`).
- **Database**: Use `pool` from `server/config/conn.js` and parameterized queries.

## How to Add an Endpoint (Recommended Steps)
<!-- ขั้นตอนแนะนำเวลาจะเพิ่ม endpoint ใหม่ -->

1. **Decide the contract**
   - Path, method, request body/query/params, and response shape.
   - Prefer the existing response pattern: `{ success, message, data }`.

2. **Add/extend route**
   - Update or create a file in `server/routes/`.
   - Keep the route module small: only wiring + middlewares.

3. **Implement controller**
   - Put logic in `server/controllers/<domain>.js`.
   - Validate inputs early and return 400/401/403/404 appropriately.
   - Use `try/catch` and return 500 for unexpected errors.

4. **DB access**
   - Use `pool.query(...)` (or `pool.execute(...)`) with `?` placeholders.
   - Never concatenate user input into SQL strings.

5. **Security**
   - If protected: add `auth_check`.
   - If admin-only: add `admin_check` after `auth_check`.
   - Avoid returning sensitive fields (password hashes, refresh tokens, etc.).

6. **Manual verification**
   - Use Postman/Insomnia/REST Client to verify status codes and JSON shape.
   - Verify CORS behavior from `http://localhost:3000` when relevant.

## Auth Implementation Notes
<!-- โน้ตเฉพาะของระบบ auth ในโปรเจ็กต์นี้ -->

- **Login** returns an access token and also sets a refresh token cookie (`refreshToken`).
- **Logout** requires a valid access token and clears the stored refresh token + cookie.
- **Refresh** endpoint reads the cookie and issues a new access token (and may rotate refresh token depending on implementation).

When touching auth:
- Keep expiration times in env vars.
- Ensure refresh token is HTTP-only (already the case).
- Do not log tokens or secrets.

## Coding Style Notes (Important)
<!-- ข้อควรระวังเกี่ยวกับสไตล์ของโปรเจ็กต์นี้ -->

- This repo currently contains a **mix of CommonJS and ESM**. When editing a file, keep the same import/export style used in that file unless you are explicitly asked to refactor.
- Avoid broad formatting-only changes; keep diffs small and purposeful.

## Common Backend Tasks (Templates)
<!-- เทมเพลตงานที่พบบ่อย เพื่อให้ทำงานเร็วขึ้น -->

### Create (POST)
<!-- แนวคิดสำหรับ create -->

- Validate required fields.
- Enforce uniqueness constraints (e.g., username).
- Hash secrets (password) with `bcrypt` when needed.
- Return 201 for created resources when appropriate.

### Read (GET)
<!-- แนวคิดสำหรับ read/list -->

- Support `:id` param and return 404 when not found.
- For large lists, consider pagination (future improvement).

### Update (PUT/PATCH)
<!-- แนวคิดสำหรับ update -->

- Validate `:id` and payload.
- Confirm resource exists before updating.
- Return the updated resource (or a minimal confirmation) consistently.

### Delete (DELETE)
<!-- แนวคิดสำหรับ delete -->

- Confirm resource exists first.
- Return a success message and the deleted id.

---

**Last Updated**: 2026-05-12
<!-- อัปเดตล่าสุด: 12 พฤษภาคม 2026 -->
