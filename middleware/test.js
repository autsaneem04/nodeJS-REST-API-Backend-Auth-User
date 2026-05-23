import { pool } from '../config/conn.js';
import jwt from 'jsonwebtoken';

export const auth_check = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);

            next();

        } catch (err) {
            // ถ้า token หมดอายุ
            console.log(err.name);

            if (err.name !== 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }
            // =========================
            // Access Token หมดอายุ
            // =========================

            // decode แบบไม่ verify
            const expiredToken = jwt.decode(token);

            if (!expiredToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }

            const user_id = expiredToken.userId;
            // =========================
            // ดึง user จาก database
            // =========================
            const [rows] = await pool.query(
                'SELECT * FROM user WHERE id = ? LIMIT 1',
                [user_id]
            );

            if (rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const user = rows[0];
            // =========================
            // ตรวจ Refresh Token
            // =========================
            const refreshToken = user.refresh_token;

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

            } catch (refreshError) {

                // refresh token หมดอายุ
                return res.status(401).json({
                    success: false,
                    message: 'Session expired',
                    code: 'REFRESH_TOKEN_EXPIRED'
                });
            }
            // =========================
            // สร้าง Access Token ใหม่
            // =========================
            const newAccessToken = jwt.sign(
                {
                    userId: user.id,
                    username: user.username
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: process.env.JWT_EXPIRES_IN
                }
            );

            // // แนบ user ให้ middleware ถัดไป
            // req.user = {
            //     userId: user.id,
            //     username: user.username
            // };

            // ส่ง token ใหม่กลับ
            return res.status(200).json({
                success: true,
                message: 'New access token generated',
                token: newAccessToken
            });

        }



    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};