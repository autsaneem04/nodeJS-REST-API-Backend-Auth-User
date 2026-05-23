import { pool } from '../config/conn.js';

export const admin_check = async (req, res, next) => {

    try {

        const { userId } = req.user;

        const [rows] = await pool.query(
            'SELECT * FROM user WHERE id = ? AND is_admin = ? LIMIT 1',
            [userId, 1]
        );

        if (rows.length === 0) {

            return res.status(401).json({
                success: false,
                message: 'Permission denied'
            });
        }

        return next();

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};