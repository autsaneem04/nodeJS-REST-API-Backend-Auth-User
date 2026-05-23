# คำแนะนำสำหรับ Backend Agent

<!-- ไฟล์นี้ใช้สำหรับให้คำแนะนำแก่ Agent เมื่อพัฒนา Backend ของโปรเจกต์ CRUD Node.js -->

## ภาพรวมโปรเจกต์

โปรเจกต์นี้เป็น Backend สำหรับระบบ CRUD ที่พัฒนาด้วย Node.js โดยใช้เทคโนโลยีดังนี้:

- **Runtime**: Node.js
- **Framework**: Express.js (คาดว่าใช้งาน)
- **Database**: ฐานข้อมูลแบบ SQL (ตั้งค่าการเชื่อมต่อใน `config/conn.js`)
- **รูปแบบสถาปัตยกรรม**: MVC (Models, Views, Controllers)

## โครงสร้างโปรเจกต์

```text
server/
├── server.js              # จุดเริ่มต้นหลักของโปรเจกต์
├── config/
│   └── conn.js            # การตั้งค่าการเชื่อมต่อฐานข้อมูล
├── controllers/           # ชั้นจัดการ Business Logic
│   ├── auth.js            # Controller สำหรับ Authentication
│   └── users.js           # Controller สำหรับจัดการผู้ใช้
├── models/                # Schema และ Query ของฐานข้อมูล
│   └── db.sql             # Schema และข้อมูลเริ่มต้นของฐานข้อมูล
├── routes/                # นิยาม API Endpoints
│   ├── auth.js            # Routes สำหรับ Authentication
│   └── users.js           # Routes สำหรับจัดการผู้ใช้
├── package.json           # Dependencies ของโปรเจกต์
└── readme_dev.md          # เอกสารสำหรับนักพัฒนา
```

## สถาปัตยกรรมและรูปแบบการออกแบบ

### รูปแบบ MVC

- **Models (`models/`)**: จัดการ Schema ฐานข้อมูล, Validation และ Logic ของ Query
- **Views**: Frontend (แยกจัดการต่างหาก)
- **Controllers (`controllers/`)**: จัดการ Business Logic, Request และ Response

### การแยกหน้าที่ (Separation of Concerns)

- การทำงานกับฐานข้อมูลแยกไว้ใน `models/db.sql`
- Route ต่าง ๆ ถูกกำหนดไว้ใน `routes/`
- Business Logic อยู่ใน `controllers/`

## แนวทางการพัฒนา

### 1. การเพิ่มฟีเจอร์ใหม่

เมื่อเพิ่มฟีเจอร์ใหม่ ให้ทำตามขั้นตอนดังนี้:

1. เพิ่มหรือแก้ไข Schema ฐานข้อมูลใน `models/db.sql`
2. เพิ่ม Logic ใน `controllers/{feature}.js`
3. สร้าง Route ใน `routes/{feature}.js`
4. แก้ไข `server.js` เพื่อ Register Route ใหม่

### 2. Authentication & Authorization

- Logic การยืนยันตัวตนอยู่ใน `controllers/auth.js`
- Route ที่ต้องป้องกันต้องตรวจสอบสิทธิ์ผู้ใช้ทุกครั้ง
- ใช้ JWT หรือ Session ตามที่ระบบกำหนด

### 3. การทำงานกับฐานข้อมูล

- Query SQL ทั้งหมดควรอยู่ใน `models/db.sql`
- ใช้ Parameterized Queries เพื่อป้องกัน SQL Injection
- จัดการ Error จากฐานข้อมูลใน Controller อย่างเหมาะสม
- ห้ามแก้ไขฐานข้อมูลเองโดยพลการ หากจำเป็นต้องแก้ไขให้สอบถามและอธิบายเหตุผลก่อน

### 4. การจัดการข้อผิดพลาด

- ส่ง HTTP Status Code ให้เหมาะสม เช่น:
  - `200` สำเร็จ
  - `400` ข้อมูลไม่ถูกต้อง
  - `401` ไม่มีสิทธิ์
  - `404` ไม่พบข้อมูล
  - `500` เกิดข้อผิดพลาดภายในระบบ
- ส่งข้อความ Error กลับในรูปแบบ JSON
- บันทึก Error ลง Log เพื่อใช้ Debug

### 5. มาตรฐานการเขียนโค้ด

- ใช้ camelCase สำหรับตัวแปร
- ใช้ PascalCase สำหรับคลาส
- เพิ่ม JSDoc ให้กับฟังก์ชัน
- เขียนฟังก์ชันให้สั้นและทำงานเฉพาะด้าน
- ปฏิบัติตามแนวทาง RESTful API

## มาตรฐาน API

### การตั้งชื่อ Endpoint

- ใช้ตัวพิมพ์เล็กและเครื่องหมาย `-`
- ตัวอย่าง:
  - `/api/users`
  - `/api/auth/login`

### การใช้ HTTP Methods

- `GET` → ดึงข้อมูล
- `POST` → สร้างข้อมูล
- `PUT` → แก้ไขข้อมูล
- `DELETE` → ลบข้อมูล

### รูปแบบ Response

```javascript
// Success Response
{
  status: "success",
  data: { /* response data */ },
  message: "Operation completed successfully"
}

// Error Response
{
  status: "error",
  data: null,
  message: "Error message describing what went wrong"
}
```

## งานที่พบบ่อย

### เพิ่ม Route ใหม่สำหรับผู้ใช้

1. กำหนด Route ใน `routes/users.js`
2. เพิ่ม Logic ใน `controllers/users.js`
3. เพิ่ม Query หรือ Schema ใน `models/db.sql`
4. ทดสอบ Endpoint

### แก้ปัญหา Authentication

1. ตรวจสอบ Middleware ใน `controllers/auth.js`
2. ตรวจสอบการเชื่อมต่อฐานข้อมูลใน `config/conn.js`
3. ตรวจสอบ Logic การ Validate Token
4. ทดสอบด้วยผู้ใช้หลายรูปแบบ

### ปรับปรุงประสิทธิภาพ Query

1. ตรวจสอบ Query ใน `models/db.sql`
2. เพิ่ม Index หากจำเป็น
3. ใช้ JOIN อย่างมีประสิทธิภาพ
4. ทดสอบ Performance

## การตั้งค่า Environment

- ตั้งค่าการเชื่อมต่อฐานข้อมูลใน `config/conn.js`
- ใช้ `.env` สำหรับข้อมูลสำคัญ
- แยก Config ตาม Environment:
  - development
  - staging
  - production

## การทดสอบและ Debug

- ใช้ `console.log()` สำหรับ Debug เบื้องต้น
- ตรวจสอบ Error จาก Server Logs
- ทดสอบ API ด้วย:
  - Postman
  - REST Client
- ทดสอบ Query ฐานข้อมูลแยกต่างหาก

## แนวทางด้าน Performance

- ใช้ Pagination กับข้อมูลจำนวนมาก
- Cache ข้อมูลที่ถูกเรียกบ่อย
- ปรับ Query และใช้ Index ให้เหมาะสม
- ใช้ Middleware สำหรับ Validation และ Sanitization

## แนวทางด้าน Security

- Validate และ Sanitize Input ทุกครั้ง
- ใช้ Prepared Statements / Parameterized Queries
- เพิ่ม Rate Limiting สำหรับ Authentication
- เก็บ Password แบบ Hash พร้อม Salt
- ใช้ HTTPS ใน Production
- ตรวจสอบ JWT Token อย่างถูกต้อง

## ข้อผิดพลาดที่ควรหลีกเลี่ยง

- ❌ เก็บ Password แบบ Plain Text
- ❌ เปิดช่องโหว่ SQL Injection
- ❌ ไม่มี Error Handling
- ❌ ส่งข้อมูลสำคัญกลับไปใน API Response
- ❌ ไม่ Validate Input ผู้ใช้
- ❌ Hard-code ค่า Config

## Dependencies

ตรวจสอบ Dependencies ทั้งหมดใน `package.json`

แพ็กเกจที่มักใช้งาน:

- `express` → Web Framework
- `mysql` หรือ `pg` → Database Driver
- `dotenv` → จัดการ Environment Variables
- `jwt` → Authentication Token
- `cors` → Cross-Origin Resource Sharing

## เริ่มต้นใช้งานอย่างรวดเร็ว

```bash
# ติดตั้ง dependencies
npm install

# เริ่มเซิร์ฟเวอร์
npm start

# หรือ
node server.js
```

## การแก้ปัญหาทั่วไป

| ปัญหา | วิธีแก้ |
|---|---|
| เชื่อมต่อฐานข้อมูลไม่ได้ | ตรวจสอบ `config/conn.js` และข้อมูล Database |
| Route ไม่พบ (404) | ตรวจสอบว่า Register Route ใน `server.js` แล้ว |
| Authentication ไม่ผ่าน | ตรวจสอบ Token และวันหมดอายุ |
| เกิด CORS Error | ตั้งค่า CORS Middleware ใน `server.js` |

---

**อัปเดตล่าสุด:** พฤษภาคม 2026

สำหรับรายละเอียดเพิ่มเติม ดูได้จาก `readme_dev.md` และ Comment ภายในไฟล์ต่าง ๆ ของโปรเจกต์
