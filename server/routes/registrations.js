const express = require('express');
const registrationController = require('../controllers/registrationController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const validateSchema = require('../middleware/validation');
const Joi = require('joi');

const router = express.Router();

// Схемы валидации
const registerSchema = Joi.object({
  eventId: Joi.string().required()
});

const confirmAttendanceSchema = Joi.object({
  registrationId: Joi.string().required(),
  pointsType: Joi.string().valid('attendance', 'speaker').default('attendance')
});

// Маршруты
router.post('/register', authMiddleware, validateSchema(registerSchema), registrationController.registerForEvent);
router.delete('/:eventId', authMiddleware, registrationController.cancelRegistration);
router.post('/confirm', authMiddleware, adminMiddleware, validateSchema(confirmAttendanceSchema), registrationController.confirmAttendance);
router.get('/my', authMiddleware, registrationController.getUserRegistrations);

module.exports = router;
