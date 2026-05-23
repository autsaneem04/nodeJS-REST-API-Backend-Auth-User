import { pool } from "../config/conn.js";
import bcrypt from "bcrypt";
import e from "express";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res
                .status(400)
                .json({ success: false, message: "กรุณากรอกข้อมูลให้ครบ" });
        }
        const [rows] = await pool.query(
            "SELECT * FROM user WHERE username = ? LIMIT 1",
            [username],
        );
        // console.log(rows);
        if (rows.length === 0) {
            return res
                .status(401)
                .json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
        }

        if (user.enable === 0) {
            return res
                .status(403)
                .json({ success: false, message: "บัญชีผู้ใช้นี้ถูกระงับการใช้งาน" });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN },
        );
        const refreshToken = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.REFRESH_SECRET,
            { expiresIn: process.env.REFRESH_EXPIRES_IN },
        );

        await pool.query("UPDATE user SET refresh_token = ? WHERE id = ?", [
            refreshToken,
            user.id,
        ]);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken: token,
            refreshToken,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred during login",
        });
    }
};

export const logout = async (req, res) => {
    try {
        const { userId } = req.user;

        await pool.query("UPDATE user SET refresh_token = NULL WHERE id = ?", [
            userId,
        ]);

        res.clearCookie("refreshToken");

        return res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred during logout",
        });
    }
};

export const refareshToken = async (req, res) => {
    try {
        const cookieData = req.cookies;
        const refreshToken = cookieData.refreshToken
        // =========================
        // ตรวจ Refresh Token
        // =========================
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not found'
            });
        }

        let decodedRefresh;

        try {

            decodedRefresh = jwt.verify(
                refreshToken,
                process.env.REFRESH_SECRET
            );

            // =========================
            // สร้าง Access Token ใหม่
            // =========================
            const newAccessToken = jwt.sign(
                {
                    userId: decodedRefresh.userId,
                    username: decodedRefresh.username
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: process.env.JWT_EXPIRES_IN
                }
            );

            return res.status(200).json({
                success: true,
                message: 'New access token generated',
                token: newAccessToken
            });

        } catch (refreshError) {

            // refresh token หมดอายุ
            return res.status(401).json({
                success: false,
                message: 'Session expired',
                code: 'REFRESH_TOKEN_EXPIRED'
            });
        }

        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred during token refresh",
        });
    }
};

function checkStrength(password) {
    const requirements = {
        length: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*]/.test(password),
    };

    return requirements;
}

export const register = async (req, res) => {
    try {
        const { name, lname, username, password } = req.body;
        const passwordRequirements = checkStrength(password);
        if (!passwordRequirements.length) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร",
                });
        }
        if (!passwordRequirements.hasUpper) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว",
                });
        }
        if (!passwordRequirements.hasLower) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว",
                });
        }
        if (!passwordRequirements.hasNumber) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว",
                });
        }
        if (!passwordRequirements.hasSpecial) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว",
                });
        }

        if (!name || !lname || !username || !password) {
            return res
                .status(400)
                .json({ success: false, message: "กรุณากรอกข้อมูลให้ครบ" });
        }
        const [existingUser] = await pool.query(
            "SELECT * FROM user WHERE username = ? LIMIT 1",
            [username],
        );
        if (existingUser.length > 0) {
            return res
                .status(409)
                .json({ success: false, message: "ชื่อผู้ใช้นี้มีอยู่แล้ว" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const [rows] = await pool.execute(
            "INSERT INTO user (name, lname, username, password) VALUES (?, ?, ?, ?)",
            [name, lname, username, hashedPassword],
        );
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: { id: rows.insertId, name, lname, username },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred during registration",
        });
    }
};
export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            "SELECT id, name, lname, username FROM user WHERE id = ? LIMIT 1",
            [id],
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });
        }
        const user = rows[0];
        if (user.enable === 0) {
            return res
                .status(403)
                .json({ success: false, message: "บัญชีผู้ใช้นี้ถูกระงับการใช้งาน" });
        }
        return res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: user,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while retrieving user",
        });
    }
};
