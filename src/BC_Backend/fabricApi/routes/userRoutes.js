const express = require('express');

const userController = require('../controllers/userController');
const verifyIdentity = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', userController.getUsers);
router.get('/:id', verifyIdentity, userController.getUserDetail);
router.post('/reset-password', verifyIdentity, userController.resetPassword);
router.post('/change-password', userController.changePassword);

module.exports = router;
