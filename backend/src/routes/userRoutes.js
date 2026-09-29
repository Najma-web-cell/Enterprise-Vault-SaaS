const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { authenticateTenant } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

router.use(authenticateTenant);

router.get('/', getUsers);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createUser);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), updateUser);
router.delete('/:id', authorizeRoles('ADMIN'), deleteUser);

module.exports = router;