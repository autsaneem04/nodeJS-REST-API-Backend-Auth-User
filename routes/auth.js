const express = require('express');
const router = express.Router();

const {login ,logout,register, refreshToken} = require('../controllers/auth');
const { auth_check } = require('../middleware/auth_check');

//====================auth routes====================
router.post('/login', login);
router.post('/logout/',auth_check, logout);
router.post('/register', register);

router.get('/refreshToken', refreshToken);




module.exports = router;
