const express = require('express');
const eventController = require('../controllers/eventController');
const { authMiddleware, organizerMiddleware, adminMiddleware } = require('../middleware/auth');
const validateSchema = require('../middleware/validation');
const Joi = require('joi');

const router = express.Router();

// Схемы валидации
const createEventSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  location: Joi.string().required(),
  capacity: Joi.number().min(1).required(),
  category: Joi.string().valid('conference', 'workshop', 'seminar', 'competition', 'other'),
  tags: Joi.array().items(Joi.string()),
  pointsPerAttendance: Joi.number().default(10),
  pointsPerSpeaker: Joi.number().default(20)
});

const updateEventSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  startDate: Joi.date(),
  endDate: Joi.date(),
  location: Joi.string(),
  capacity: Joi.number().min(1),
  category: Joi.string().valid('conference', 'workshop', 'seminar', 'competition', 'other'),
  tags: Joi.array().items(Joi.string()),
  status: Joi.string().valid('draft', 'published', 'ongoing', 'completed', 'cancelled')
});

// Маршруты
router.post('/', authMiddleware, organizerMiddleware, validateSchema(createEventSchema), eventController.createEvent);
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.put('/:id', authMiddleware, validateSchema(updateEventSchema), eventController.updateEvent);
router.delete('/:id', authMiddleware, eventController.deleteEvent);

module.exports = router;
