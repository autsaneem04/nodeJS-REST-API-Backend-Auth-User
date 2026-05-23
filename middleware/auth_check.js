import { pool } from '../config/conn.js';
import jwt from 'jsonwebtoken';

export const auth_check = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {

            return res.status(401).json({
                success: false,
                code: 'NO_TOKEN',
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user_id = decoded.userId;

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

        if (user.enable === 0) {

            return res.status(403).json({
                success: false,
                message: 'บัญชีผู้ใช้นี้ถูกระงับการใช้งาน'
            });
        }

        req.user = decoded;

        return next();

    } catch (error) {

        console.error(error);

        if (error.name === 'TokenExpiredError') {

            return res.status(401).json({
                success: false,
                code: 'TOKEN_EXPIRED',
                message: 'Token expired'
            });
        }

        if (
            error.name === 'JsonWebTokenError' ||
            error.name === 'NotBeforeError'
        ) {

            return res.status(401).json({
                success: false,
                code: 'INVALID_TOKEN',
                message: 'Invalid token'
            });
        }

        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Internal Server Error'
        });
    }
};