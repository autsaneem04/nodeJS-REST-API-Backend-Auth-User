# คู่มือทักษะ Backend
<!-- ไฟล์นี้เป็น “คู่มือทักษะ” สำหรับงาน backend ของโปรเจ็กต์นี้: ทำอะไร ที่ไหน อย่างไร -->

## จุดประสงค์ (Purpose)
<!-- อธิบายว่าไฟล์นี้มีไว้ทำอะไร -->

ใช้คู่มือนี้เป็น checklist/template เมื่อต้องพัฒนา backend ของโปรเจ็กต์นี้ ไม่ว่าจะเป็นการเพิ่มฟีเจอร์ แก้บั๊ก หรือ refactor โค้ด

---

## รูปแบบการทำงานที่ใช้ในโปรเจ็กต์นี้ (The Patterns Used Here)
<!-- สรุปแพทเทิร์นที่ใช้ในโค้ดจริง เพื่อให้ทำตามได้ง่าย -->

- **Routing**
  Express Router อยู่ใน `server/routes/` และจะถูก mount อัตโนมัติภายใต้ `/api` โดย `server/server.js`

- **Business Logic**
  ฟังก์ชัน controller อยู่ใน `server/controllers/`

- **Authentication & Role**
  - `server/middleware/auth_check.js`
    ใช้ตรวจสอบ JWT access token จาก `Authorization: Bearer <token>`
  - `server/middleware/admin_check.js`
    ใช้ตรวจสอบสิทธิ์ admin (`is_admin = 1`)

- **Database**
  ใช้ `pool` จาก `server/config/conn.js` และใช้ parameterized queries

---

## วิธีเพิ่ม Endpoint (ขั้นตอนแนะนำ)
<!-- ขั้นตอนแนะนำเวลาจะเพิ่ม endpoint ใหม่ -->

### 1. กำหนด Contract ของ API
- Path
- Method
- Request body/query/params
- รูปแบบ response

ควรใช้รูปแบบ response เดิมของโปรเจ็กต์:

```json
{
  "success": true,
  "message": "ข้อความ",
  "data": {}
}
```

---

### 2. เพิ่มหรือแก้ไข Route
- สร้างหรือแก้ไขไฟล์ใน `server/routes/`
- Route ควรมีหน้าที่เฉพาะ:
  - wiring
  - middleware

---

### 3. เขียน Controller
- เขียน logic ใน `server/controllers/<domain>.js`
- ตรวจสอบ input ให้เร็วที่สุด
- ส่ง status code ให้เหมาะสม:
  - `400` Bad Request
  - `401` Unauthorized
  - `403` Forbidden
  - `404` Not Found

- ใช้ `try/catch`
- ส่ง `500` เมื่อเกิด error ที่ไม่คาดคิด

---

### 4. การเข้าถึงฐานข้อมูล
- ใช้ `pool.query(...)` หรือ `pool.execute(...)`
- ใช้ `?` placeholders ทุกครั้ง
- ห้ามนำ input จาก user ไปต่อ string SQL โดยตรง

---

### 5. ความปลอดภัย (Security)
- หาก endpoint ต้องล็อกอิน:
  - ใช้ `auth_check`
- หากเป็น admin-only:
  - ใช้ `admin_check` ต่อจาก `auth_check`

- หลีกเลี่ยงการส่งข้อมูลสำคัญกลับไปยัง client เช่น:
  - password hash
  - refresh token

---

### 6. ตรวจสอบการทำงานด้วยตนเอง
- ใช้ Postman / Insomnia / REST Client ตรวจสอบ:
  - status code
  - รูปแบบ JSON response

- ตรวจสอบ CORS จาก `http://localhost:3000` เมื่อเกี่ยวข้อง

---

## หมายเหตุเกี่ยวกับระบบ Auth
<!-- โน้ตเฉพาะของระบบ auth ในโปรเจ็กต์นี้ -->

- **Login**
  ส่ง access token กลับมา และตั้ง refresh token cookie (`refreshToken`)

- **Logout**
  ต้องใช้ access token ที่ถูกต้อง และจะล้าง refresh token ทั้งใน database และ cookie

- **Refresh Endpoint**
  อ่าน refresh token จาก cookie และสร้าง access token ใหม่
  (อาจมีการ rotate refresh token ตาม implementation)

เมื่อแก้ไขระบบ auth:
- กำหนดเวลา expiration ผ่าน env vars
- refresh token ต้องเป็น HTTP-only เสมอ
- ห้าม log token หรือ secret

---

## หมายเหตุเกี่ยวกับ Coding Style
<!-- ข้อควรระวังเกี่ยวกับสไตล์ของโปรเจ็กต์นี้ -->

- โปรเจ็กต์นี้ใช้ทั้ง CommonJS และ ESM ร่วมกัน
  เมื่อแก้ไขไฟล์ ให้ใช้รูปแบบ import/export เดิมของไฟล์นั้น
  เว้นแต่จะได้รับคำสั่งให้ refactor โดยตรง

- หลีกเลี่ยงการแก้ formatting จำนวนมากโดยไม่จำเป็น
  ควรให้ diff มีขนาดเล็กและตรงจุด

---

## งาน Backend ที่พบบ่อย (Templates)
<!-- เทมเพลตงานที่พบบ่อย เพื่อให้ทำงานเร็วขึ้น -->

### Create (POST)
<!-- แนวคิดสำหรับ create -->

- ตรวจสอบ required fields
- ตรวจสอบ uniqueness constraint เช่น username ซ้ำ
- เข้ารหัส password ด้วย `bcrypt` เมื่อจำเป็น
- ส่ง status `201` เมื่อสร้าง resource สำเร็จ

---

### Read (GET)
<!-- แนวคิดสำหรับ read/list -->

- รองรับ `:id`
- ส่ง `404` หากไม่พบข้อมูล
- หากเป็นรายการจำนวนมาก ควรพิจารณา pagination ในอนาคต

---

### Update (PUT/PATCH)
<!-- แนวคิดสำหรับ update -->

- ตรวจสอบ `:id`
- ตรวจสอบ payload
- ตรวจสอบว่ามี resource ก่อนอัปเดต
- ส่งข้อมูลที่อัปเดตแล้วกลับไป หรือส่งข้อความยืนยันแบบเดียวกันทั้งระบบ

---

### Delete (DELETE)
<!-- แนวคิดสำหรับ delete -->

- ตรวจสอบว่ามี resource ก่อนลบ
- ส่ง success message และ id ที่ถูกลบกลับไป

---

**อัปเดตล่าสุด:** 12 พฤษภาคม 2026
