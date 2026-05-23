# คำแนะนำสำหรับ Backend Agent
<!-- ไฟล์นี้ใช้สำหรับบอกแนวทางให้ Agent/ผู้ช่วยโค้ด เมื่อต้องพัฒนา backend ของโปรเจ็กต์นี้ -->

## ภาพรวมโปรเจ็กต์ (Project Snapshot)
<!-- สรุปเทคโนโลยีและภาพรวมแบบสั้น ๆ เพื่อให้เข้าใจบริบทเร็ว -->

Repository นี้เป็นระบบ Backend แบบ CRUD ที่พัฒนาด้วย Node.js โดยใช้เทคโนโลยีดังนี้:

- **Runtime**: Node.js
- **HTTP Framework**: Express (ดูได้จาก `server/package.json`)
- **Database**: MySQL ผ่าน `mysql2` (ใช้ pool จาก `server/config/conn.js`)
- **Authentication**
  - Access Token แบบ JWT ถูกส่งกลับใน JSON response (`Authorization: Bearer <token>`)
  - Refresh Token ถูกเก็บทั้งในฐานข้อมูล และใน HTTP-only cookie ชื่อ `refreshToken`
- **Logging**: `morgan`
- **CORS**: `cors` (ตั้งค่าให้รองรับ `http://localhost:3000` ใน `server/server.js`)

---

## โครงสร้างโฟลเดอร์หลัก (Server)
<!-- โครงสร้างโฟลเดอร์หลักของ backend -->

```text
server/
  server.js                 # จุดเริ่มต้นของแอป; โหลดทุกไฟล์ใน routes/ อัตโนมัติและ mount ภายใต้ /api
  .env                      # ตัวแปรสภาพแวดล้อม (ห้าม commit ข้อมูลลับ)
  package.json              # Dependencies และ scripts
  readme_dev.md             # บันทึกสำหรับนักพัฒนา
  config/
    conn.js                 # MySQL pool + ตรวจสอบการเชื่อมต่อ
  controllers/
    auth.js                 # จัดการ login/logout/register/refresh token
    users.js                # จัดการ CRUD ของผู้ใช้
  middleware/
    auth_check.js           # ตรวจสอบ JWT access token จาก Authorization header
    admin_check.js          # ตรวจสอบว่า is_admin = 1 สำหรับ route ของ admin
  routes/
    auth.js                 # /api/login, /api/logout, /api/register, /api/refareshToken
    users.js                # /api/users CRUD (ต้องล็อกอินและเป็น admin)
```

---

## การทำงานของ Request (How Requests Flow)
<!-- อธิบาย flow การทำงาน: route -> middleware -> controller -> DB -->

1. `server/server.js` จะโหลด route ทุกไฟล์ใน `routes/` และ mount ภายใต้ `/api`
2. Route จะกำหนด middleware และเชื่อม endpoint เข้ากับ controller
3. Controller จะเชื่อมต่อ MySQL ผ่าน `pool` จาก `config/conn.js`
4. ระบบ Authentication ใช้ JWT:
   - Access Token ถูกตรวจสอบโดย `middleware/auth_check.js`
   - Refresh Token ถูกใช้ใน endpoint refresh token ภายใน `controllers/auth.js`

---

## API ที่มีในปัจจุบัน (Current API Surface)
<!-- สรุป endpoint ที่มีอยู่ เพื่อให้ Agent เห็นภาพรวม -->

### Auth
- `POST /api/login`
- `POST /api/logout` (ต้องมี access token)
- `POST /api/register`
- `GET /api/refareshToken` (อ่าน cookie ชื่อ `refreshToken`)

### Users (เฉพาะ Admin)
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

---

## แนวทางการเขียนโค้ด (Conventions to Follow)
<!-- กติกา/แนวทางเวลาแก้ไขโค้ด เพื่อให้โค้ดสม่ำเสมอและปลอดภัย -->

- **ใช้รูปแบบ module ให้ตรงกับไฟล์เดิม**
  โปรเจ็กต์นี้มีทั้ง CommonJS (`require/module.exports`) และ ESM (`import/export`)
  หลีกเลี่ยงการ refactor หากไม่ได้ร้องขอ

- **ห้ามแก้ไข `node_modules/`**

- **Routes ควรบาง (Thin Routes)**
  ทำเฉพาะ:
  - อ่าน parameter
  - ต่อ middleware
  - เรียก controller

- **Controllers ควรรับผิดชอบหลัก**
  เช่น:
  - validation
  - business logic
  - จัดรูปแบบ response

- **ใช้ Parameterized Queries**
  ใช้ `?` placeholder ทุกครั้งเพื่อลดความเสี่ยง SQL Injection

- **Response JSON ต้องมีรูปแบบสม่ำเสมอ**

```json
{
  "success": true,
  "message": "ข้อความ",
  "data": {}
}
```

- **จัดการ Error ด้วย try/catch**
  ใน async handler และห้ามส่งข้อมูลลับกลับไปยัง client

---

## ตัวแปร Environment (Environment Variables)
<!-- ตัวแปรสำคัญที่ควรมีใน .env และข้อควรระวัง -->

Backend นี้คาดว่าจะมี environment variables เช่น:

- `mysql_host`
- `mysql_user`
- `mysql_password`
- `mysql_database`
- `mysql_port`

- `JWT_SECRET`
- `JWT_EXPIRES_IN`

- `REFRESH_SECRET`
- `REFRESH_EXPIRES_IN`

ให้เก็บข้อมูลลับไว้ใน `.env` และห้าม commit credential จริงขึ้น Git

---

## การพัฒนาในเครื่อง (Local Development)
<!-- วิธีรันโปรเจ็กต์แบบรวดเร็ว -->

จากโฟลเดอร์ `server/`

```bash
npm install
npm start
```

Server จะทำงานที่:

```text
http://localhost:5000
```

(ตั้งค่าใน `server/server.js`)

---

## เมื่อต้องเพิ่มฟีเจอร์ใหม่ (When Adding a New Feature)
<!-- checklist สั้น ๆ เวลาเพิ่มฟีเจอร์ เพื่อไม่ให้หลงลืมขั้นตอน -->

- เพิ่มหรือแก้ไข API route ภายใต้ `routes/`
- เขียน logic ใน `controllers/`
- เพิ่ม middleware ใน `middleware/` เฉพาะกรณีที่สามารถนำกลับมาใช้ซ้ำได้
  เช่น:
  - auth
  - role check
  - validation

- อัปเดตเอกสารเมื่อมีการเปลี่ยนแปลงพฤติกรรมของระบบ
  เช่น:
  - `readme_dev.md`
  - `agent_backend.md`
  - `skill_backend.md`

---

**อัปเดตล่าสุด:** 12 พฤษภาคม 2026
