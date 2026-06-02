const express = require('express');
const authController = require('../controllers/authController');
const validateSchema = require('../middleware/validation');
const Joi = require('joi');

const router = express.Router();

// Схемы валидации
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Маршруты
router.post('/register', validateSchema(registerSchema), authController.register);
router.post('/login', validateSchema(loginSchema), authController.login);
router.get('/me', require('../middleware/auth').authMiddleware, authController.getCurrentUser);

module.exports = router;
