// conn.js
require('dotenv').config();
const mysqlPromise = require('mysql2/promise'); // ใช้ /promise เพื่อรองรับ async/await
const mysql = require('mysql2');

// สร้าง Pool แทน Connection เดี่ยวๆ
const pool = mysqlPromise.createPool({
    host: process.env.mysql_host,
    user: process.env.mysql_user,
    password: process.env.mysql_password,
    database: process.env.mysql_database,
    port: process.env.mysql_port,
    waitForConnections: true, // ถ้าสายเต็ม ให้รอ (เข้าคิว) แทนที่จะ Error ทันที
    connectionLimit: 10, // กำหนดว่าจะมี 'สายโทรศัพท์' เปิดรอไว้สูงสุดกี่สาย
    queueLimit: 0, // จำนวนคิวที่รอได้ (0 คือไม่จำกัด)
    authPlugins: {
        mysql_native_password: mysql.authPlugins.mysql_native_password
    }
});

// ฟังก์ชันเช็คการเชื่อมต่อ
const db = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to the database successfully');
        connection.release(); // ต้องคืน connection กลับเข้า pool
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}

module.exports = { db, pool }; // ส่งออกทั้งตัวเช็ค db และตัว pool สำหรับ Query
