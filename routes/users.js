const express = require('express');
const router = express.Router();

const { read, list, create, update, remove } = require('../controllers/users');

const { auth_check } = require('../middleware/auth_check');
const { admin_check } = require('../middleware/admin_check');


//====================users routes====================
router.get('/users', auth_check, admin_check, read);
router.get('/users/:id', auth_check,admin_check, list);
router.post('/users', auth_check,admin_check, create);
router.put('/users/:id', auth_check,admin_check, update);
router.delete('/users/:id', auth_check,admin_check, remove);









module.exports = router;