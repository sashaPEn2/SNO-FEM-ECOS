const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const validateSchema = require('../middleware/validation');
const Joi = require('joi');

const router = express.Router();

// Схемы валидации
const updateProfileSchema = Joi.object({
  firstName: Joi.string(),
  lastName: Joi.string(),
  bio: Joi.string(),
  phone: Joi.string(),
  department: Joi.string(),
  avatar: Joi.string()
});

const changeRoleSchema = Joi.object({
  userId: Joi.string().required(),
  role: Joi.string().valid('user', 'organizer', 'admin').required()
});

// Маршруты
router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers);
router.get('/profile/:userId?', authMiddleware, userController.getUserProfile);
router.put('/profile', authMiddleware, validateSchema(updateProfileSchema), userController.updateProfile);
router.put('/role', authMiddleware, adminMiddleware, validateSchema(changeRoleSchema), userController.changeUserRole);

module.exports = router;
