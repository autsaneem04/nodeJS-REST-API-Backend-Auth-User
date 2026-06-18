# 🚀 App CRUD Node — REST API Backend

Node.js + Express REST API พร้อมระบบ Authentication และจัดการ Users โดยใช้ MySQL

---

## 📋 Tech Stack

| Technology | Description |
|---|---|
| **Node.js + Express 5** | Web framework |
| **MySQL2** | Database |
| **JWT** | Authentication (Access + Refresh Token) |
| **bcrypt** | Password hashing |
| **nodemon** | Auto-restart server (dev) |

---

## 📁 Project Structure

```
server/
├── config/         # เชื่อมต่อ Database
├── controllers/    # Business logic (auth, users)
├── middleware/     # auth_check, admin_check
├── models/         # db.sql — Database schema
├── routes/         # API routes
├── .env            # Environment variables
└── server.js       # Entry point
```

---

## ⚙️ Setup & Installation

### 1. Clone & Install

```bash
git clone <repo-url>
cd server
npm install
```

### 2. ตั้งค่า `.env`

```env
mysql_host=localhost
mysql_user=root
mysql_password=your_password
mysql_database=app-crud-node
mysql_port=3306

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=20m

REFRESH_SECRET=your_refresh_secret
REFRESH_EXPIRES_IN=7d
```

### 3. Import Database

```bash
mysql -u root -p app-crud-node < models/db.sql
```

### 4. Start Server

```bash
npm start
# Server: http://localhost:5000
```

---

## 🔗 API Endpoints

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/register` | สมัครสมาชิก |
| `POST` | `/api/login` | เข้าสู่ระบบ → ได้รับ Access + Refresh Token |
| `POST` | `/api/logout` | ออกจากระบบ 🔒 |
| `GET` | `/api/refareshToken` | ต่ออายุ Access Token |

### Users *(ต้องมีสิทธิ์ Admin)*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users` | ดึงรายชื่อ Users ทั้งหมด 🔒👑 |
| `GET` | `/api/users/:id` | ดึง User ตาม ID 🔒👑 |
| `POST` | `/api/users` | สร้าง User ใหม่ 🔒👑 |
| `PUT` | `/api/users/:id` | แก้ไข User 🔒👑 |
| `DELETE` | `/api/users/:id` | ลบ User 🔒👑 |

> 🔒 = ต้องล็อกอิน (JWT) &nbsp;|&nbsp; 👑 = ต้องเป็น Admin

---

## 🗄️ Database Schema

```sql
CREATE TABLE `user` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `name`          VARCHAR(45),
  `lname`         VARCHAR(45),
  `enable`        TINYINT(1) DEFAULT 1,
  `is_admin`      TINYINT(1) DEFAULT 1,
  `username`      VARCHAR(45),
  `password`      VARCHAR(255),
  `refresh_token` TEXT
);
```

---

## 🔐 Authentication Flow

```
1. POST /api/login       → Access Token (20m) + Refresh Token (7d) via cookie
2. ใช้ Access Token ใน Header: Authorization: Bearer <token>
3. GET /api/refareshToken → ขอ Access Token ใหม่เมื่อหมดอายุ
4. POST /api/logout       → ล้าง Refresh Token ออกจาก DB และ cookie
```

---

## 🧪 Postman Collection

ไฟล์ทดสอบ API อยู่ที่ `postman/REST API Backend-Auth&user.postman_collection.json`

### วิธี Import

1. เปิด **Postman** → คลิก **Import**
2. ลาก-วางไฟล์ `postman/*.json` หรือ Browse ไปที่ไฟล์
3. ตั้งค่า **Environment Variable**:

| Variable | Value |
|---|---|
| `baseurl` | `http://localhost:5000/api` |

### Requests ที่มีใน Collection

**📁 auth**
| Request | Method | Endpoint |
|---|---|---|
| register | `POST` | `/api/register` |
| login | `POST` | `/api/login` |
| logout | `POST` | `/api/logout` |
| refareshToken | `GET` | `/api/refareshToken` |

**📁 users** *(ต้องใส่ Bearer Token)*
| Request | Method | Endpoint |
|---|---|---|
| Get data | `GET` | `/api/users` |
| Get data list | `GET` | `/api/users/:id` |
| Post data | `POST` | `/api/users` |
| put data | `PUT` | `/api/users/:id` |
| delete | `DELETE` | `/api/users/:id` |

---

## 📝 License

ISC
