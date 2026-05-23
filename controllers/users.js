import { pool } from '../config/conn.js';
import bcrypt from 'bcrypt'; 

export const read = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM user');
        return res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: rows
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error retrieving users'
        });
    }

}

export const list = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM user WHERE id = ?', [id]);
        return res.status(200).json({
            success: true,
            message: 'User list retrieved successfully',
            data: rows.length > 0 ? rows[0] : null
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error retrieving user list'
        });
    }
}

export const create = async (req, res) => {
    try {
       const {
        name,
        lname,
        username,
        password
       }    = req.body;

         if (!username || !password) {
            return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบ' });
        }

        // --- เริ่มต้นขั้นตอนการ Hash ---
        const saltRounds = 10; // ความซับซ้อนในการเข้ารหัส
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // ---------------------------
        const existingUser = await pool.query('SELECT * FROM user WHERE username = ?', [username]);
        if (existingUser[0].length > 0) {
            return res.status(400).json({ success: false, message: 'Username นี้มีผู้ใช้แล้ว กรุณาเลือกชื่ออื่น' });
        }
        const [rows] = await pool.query('INSERT INTO user (name, lname, username, password) VALUES (?, ?, ?, ?)',
            [name, lname, username, hashedPassword]
        );

        return res.status(200).json({
            success: true,
            message: 'User created successfully',
            data: rows
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error creating user'
        });
    }
}

export const update = async (req, res) => {
    try {   
        const { id } = req.params;
        const { name , lname } = req.body;

        if(!id) {
            return res.status(400).json({ success: false, message: 'กรุณาระบุ ID ของผู้ใช้ที่ต้องการอัปเดต' });
        }

        if (!name || !lname) {
            return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบ' });
        }  

        const existingUser = await pool.query('SELECT * FROM user WHERE id = ?', [id]);
        if (existingUser[0].length === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้ที่ต้องการอัปเดต' });
        }

        const [rows] = await pool.query('UPDATE user SET name = ?, lname = ? WHERE id = ?',
            [name, lname, id]
        );

        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: { ...req.params, ...req.body }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error updating user'
        });
    }
}
export const remove = async (req, res) => {
    try {
        const { id } = req.params;

        if(!id) {
            return res.status(400).json({ success: false, message: 'กรุณาระบุ ID ของผู้ใช้ที่ต้องการลบ' });
        }   
        const existingUser = await pool.query('SELECT * FROM user WHERE id = ?', [id]);
        if (existingUser[0].length === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้ที่ต้องการลบ' });
        }   
        const [rows] = await pool.query('DELETE FROM user WHERE id = ?', [id]);
        return res.status(200).json({
            success: true,
            message: `User ID ${id} deleted successfully`
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting user'
        });
    }
}

